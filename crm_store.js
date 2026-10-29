/**
 * ============================================================================
 * Dashmesh Properties — Conversation Memory & Lead CRM Store
 * Enterprise-Grade, Atomic Persistent Storage for Real Customer Data
 * ============================================================================
 * Strict Zero-Fake-Data Enforcement: Persists ONLY genuine client inquiries
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { normalizePhone } = require('./whatsapp_service');

let dataDir = process.env.CRM_DATA_DIR || path.join(__dirname, 'data');
let leadsFile = path.join(dataDir, 'leads.json');
let csvFile = path.join(dataDir, 'csv', 'leads_crm.csv');

// In-memory cache for fast, atomic access
let conversationsCache = null;

function setStorageDir(newDir) {
  dataDir = newDir;
  leadsFile = path.join(dataDir, 'leads.json');
  csvFile = path.join(dataDir, 'csv', 'leads_crm.csv');
  conversationsCache = null;
  ensureDataDir();
}

function clearCache() {
  conversationsCache = null;
}

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const csvDir = path.join(dataDir, 'csv');
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }
}

/**
 * Atomically save JSON file to prevent corruption on crash
 */
function atomicSaveJSON(filePath, data) {
  ensureDataDir();
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    throw new Error(`Failed to atomically save ${filePath}: ${err.message}`);
  }
}

/**
 * Load conversations from disk
 */
function loadConversations() {
  if (conversationsCache) return conversationsCache;
  ensureDataDir();

  if (fs.existsSync(leadsFile)) {
    try {
      const raw = fs.readFileSync(leadsFile, 'utf8').replace(/^\uFEFF/, '');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        conversationsCache = parsed;
        return conversationsCache;
      }
    } catch (err) {
      console.warn('[CRM Store] Error loading leads file, initializing empty:', err.message);
    }
  }

  conversationsCache = [];
  return conversationsCache;
}

/**
 * Sync leads to CSV for spreadsheet interoperability
 */
function syncLeadsToCSV(leads) {
  try {
    ensureDataDir();
    const rows = [
      'Phone,Name,Status,Language,OptOut,HumanPending,Intent,Locality,Budget,BHK,Timeline,Preference,LastUpdated'
    ];

    for (const l of leads) {
      const q = l.qualification || {};
      const safeStr = (s) => `"${(s || '').toString().replace(/"/g, '""')}"`;
      rows.push([
        safeStr(l.phone),
        safeStr(l.name),
        safeStr(l.status),
        safeStr(l.language),
        safeStr(l.opted_out ? 'YES' : 'NO'),
        safeStr(l.human_pending ? 'YES' : 'NO'),
        safeStr(q.intent || l.lastIntent),
        safeStr(q.locality),
        safeStr(q.budget),
        safeStr(q.bhk),
        safeStr(q.timeline),
        safeStr(q.preference),
        safeStr(l.lastUpdated)
      ].join(','));
    }

    fs.writeFileSync(csvFile, rows.join('\n'), 'utf8');
  } catch (err) {
    console.warn('[CRM Store] CSV sync notice:', err.message);
  }
}

/**
 * Persist memory to disk & CSV
 */
function persistMemory() {
  if (!conversationsCache) return;
  atomicSaveJSON(leadsFile, conversationsCache);
  syncLeadsToCSV(conversationsCache);
}

/**
 * Find or create a conversation record by phone
 */
function getOrCreateContact(rawPhone, customerName = 'Customer') {
  const cleanPhone = normalizePhone(rawPhone);
  if (!cleanPhone) {
    throw new Error('Invalid phone number for contact retrieval');
  }

  const leads = loadConversations();
  const cleanLast10 = cleanPhone.slice(-10);

  let contact = leads.find(l => {
    const cPhone = normalizePhone(l.phone || '');
    return cPhone === cleanPhone || (cPhone.length >= 10 && cPhone.slice(-10) === cleanLast10);
  });

  if (!contact) {
    contact = {
      phone: `+${cleanPhone}`,
      name: customerName && customerName !== 'Customer' ? customerName : 'Client',
      status: 'new',
      language: 'hinglish',
      opted_out: false,
      human_pending: false,
      handoff_reason: null,
      qualification: {
        intent: null, // 'buy', 'rent', 'sell', 'commercial', 'agreement'
        locality: null,
        budget: null,
        bhk: null,
        timeline: null,
        preference: null // 'call', 'site_visit'
      },
      firstSeen: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messages: []
    };
    leads.unshift(contact);
    persistMemory();
  } else {
    if (customerName && customerName !== 'Customer' && (!contact.name || contact.name === 'Client' || contact.name === 'Customer')) {
      contact.name = customerName;
    }
  }

  return contact;
}

/**
 * Record an inbound message
 */
function recordInboundMessage(rawPhone, text, messageId, meta = {}) {
  const contact = getOrCreateContact(rawPhone, meta.customerName);
  const now = new Date().toISOString();

  // Deduplicate within the conversation's own messages
  const existing = contact.messages.find(m => m.id === messageId);
  if (existing) {
    return { contact, isDuplicate: true };
  }

  contact.messages.push({
    id: messageId || `in_${Date.now()}`,
    sender: 'customer',
    text: text || '',
    type: meta.rawType || 'text',
    timestamp: now
  });

  // Bounded history: keep last 30 messages in storage
  if (contact.messages.length > 30) {
    contact.messages = contact.messages.slice(-30);
  }

  contact.lastUpdated = now;
  if (meta.language) contact.language = meta.language;

  persistMemory();
  return { contact, isDuplicate: false };
}

/**
 * Record an outbound bot/assistant reply
 */
function recordOutboundMessage(rawPhone, text, intent = 'ASSISTANT_REPLY', options = {}) {
  const contact = getOrCreateContact(rawPhone);
  const now = new Date().toISOString();

  contact.messages.push({
    id: options.messageId || `out_${Date.now()}`,
    sender: 'bot',
    text: text || '',
    intent,
    timestamp: now,
    deliveryStatus: options.deliveryStatus || 'dispatched'
  });

  if (contact.messages.length > 30) {
    contact.messages = contact.messages.slice(-30);
  }

  contact.lastUpdated = now;
  contact.lastIntent = intent;

  persistMemory();
  return contact;
}

/**
 * Update contact qualification fields
 */
function updateQualification(rawPhone, updates = {}) {
  const contact = getOrCreateContact(rawPhone);
  contact.qualification = contact.qualification || {};

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined && val !== null && val !== '') {
      contact.qualification[key] = val;
    }
  }

  // Update overall lead status if sufficiently qualified
  const q = contact.qualification;
  if (q.intent && (q.locality || q.bhk || q.budget)) {
    if (contact.status === 'new') {
      contact.status = 'qualifying';
    }
  }
  if (q.intent && q.budget && (q.preference || q.timeline)) {
    contact.status = 'qualified';
  }

  contact.lastUpdated = new Date().toISOString();
  persistMemory();
  return contact;
}

/**
 * Mark contact as opted out
 */
function setOptOut(rawPhone, isOptedOut = true) {
  const contact = getOrCreateContact(rawPhone);
  contact.opted_out = Boolean(isOptedOut);
  if (contact.opted_out) {
    contact.status = 'opted_out';
  } else if (contact.status === 'opted_out') {
    contact.status = 'active';
  }
  contact.lastUpdated = new Date().toISOString();
  persistMemory();
  return contact;
}

/**
 * Escalate to human handoff
 */
function triggerHumanHandoff(rawPhone, reason = 'Customer requested human assistance') {
  const contact = getOrCreateContact(rawPhone);
  contact.human_pending = true;
  contact.handoff_reason = reason;
  contact.status = 'human_pending';
  contact.lastUpdated = new Date().toISOString();
  persistMemory();
  return contact;
}

/**
 * Resolve human handoff & resume AI receptionist
 */
function resolveHumanHandoff(rawPhone) {
  const contact = getOrCreateContact(rawPhone);
  contact.human_pending = false;
  contact.handoff_reason = null;
  contact.status = 'active';
  contact.lastUpdated = new Date().toISOString();
  persistMemory();
  return contact;
}

/**
 * Get active human handoff queue
 */
function getHandoffQueue() {
  const leads = loadConversations();
  return leads.filter(l => l.human_pending || l.status === 'human_pending');
}

/**
 * Get bounded conversation history for LLM prompt (multi-turn memory)
 */
function getPromptConversationHistory(rawPhone, limit = 10) {
  const contact = getOrCreateContact(rawPhone);
  const msgs = (contact.messages || []).slice(-limit);

  return msgs.map(m => ({
    role: m.sender === 'customer' ? 'user' : 'model',
    text: m.text,
    timestamp: m.timestamp
  }));
}

/**
 * CRM Telemetry for dashboard & health checks
 */
function getCRMTelemetry() {
  const leads = loadConversations();
  const total = leads.length;
  const humanPending = leads.filter(l => l.human_pending).length;
  const optedOut = leads.filter(l => l.opted_out).length;
  const qualified = leads.filter(l => l.status === 'qualified').length;

  return {
    totalLeads: total,
    humanPendingCount: humanPending,
    optedOutCount: optedOut,
    qualifiedCount: qualified,
    recentLeads: leads.slice(0, 10).map(l => ({
      phone: l.phone,
      name: l.name,
      status: l.status,
      lastIntent: l.lastIntent,
      lastUpdated: l.lastUpdated,
      opted_out: Boolean(l.opted_out),
      human_pending: Boolean(l.human_pending)
    }))
  };
}

module.exports = {
  loadConversations,
  getOrCreateContact,
  recordInboundMessage,
  recordOutboundMessage,
  updateQualification,
  setOptOut,
  triggerHumanHandoff,
  resolveHumanHandoff,
  getHandoffQueue,
  getPromptConversationHistory,
  getCRMTelemetry,
  setStorageDir,
  clearCache
};
