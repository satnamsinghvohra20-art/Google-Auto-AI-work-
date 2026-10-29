/**
 * ============================================================================
 * Dashmesh Properties — Conversation Memory & Lead CRM Store
 * Enterprise-Grade, Atomic Persistent Storage for Real Customer Data
 * ============================================================================
 * Strict Zero-Fake-Data Enforcement: Persists ONLY genuine client inquiries
 * Compliant with Rule 3 (Persistent Customer Memory) & Rule 4 (Isolation)
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

// Per-contact processing locks to prevent concurrent race conditions
const contactLocks = new Map();

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
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) { }
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
 * Per-contact concurrency coordination lock
 * Prevents race conditions when multiple webhooks arrive for the same customer
 */
async function acquireContactLock(rawPhone, timeoutMs = 10000) {
  const cleanPhone = normalizePhone(rawPhone);
  const startTime = Date.now();

  while (contactLocks.has(cleanPhone)) {
    if (Date.now() - startTime > timeoutMs) {
      // Force break stale lock
      contactLocks.delete(cleanPhone);
      break;
    }
    await new Promise(r => setTimeout(r, 50));
  }

  contactLocks.set(cleanPhone, Date.now());
  return true;
}

function releaseContactLock(rawPhone) {
  const cleanPhone = normalizePhone(rawPhone);
  contactLocks.delete(cleanPhone);
}

/**
 * Find or create a conversation record by phone with isolated identity
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

  const now = new Date().toISOString();

  if (!contact) {
    contact = {
      id: `wa_${cleanPhone}`,
      phone: `+${cleanPhone}`,
      name: customerName && customerName !== 'Customer' && customerName !== 'Client' ? customerName : 'Client',
      status: 'new',
      priority: 'normal',
      assigned_owner: 'Satnam Singh Vohra',
      language: 'hinglish',
      opted_out: false,
      human_pending: false,
      handoff_reason: null,
      hasGreeted: false,
      qualification: {
        intent: null, // 'buy', 'rent', 'sell', 'commercial', 'investment', 'agreement'
        locality: null,
        propertyType: null,
        budget: null,
        budgetNumeric: null,
        budgetHistory: [],
        bhk: null,
        timeline: null,
        financing: null,
        siteVisitRequested: false,
        callbackRequested: false,
        preference: null // 'call', 'site_visit'
      },
      propertiesDiscussed: [],
      unresolvedQuestions: [],
      commitmentsMade: [],
      lastSummary: '',
      changeHistory: [],
      firstSeen: now,
      lastSeen: now,
      lastUpdated: now,
      messages: []
    };
    leads.unshift(contact);
    persistMemory();
  } else {
    // Migration safety: Ensure all expected fields exist on existing contacts
    if (!contact.qualification) contact.qualification = {};
    if (!Array.isArray(contact.qualification.budgetHistory)) contact.qualification.budgetHistory = [];
    if (!Array.isArray(contact.propertiesDiscussed)) contact.propertiesDiscussed = [];
    if (!Array.isArray(contact.unresolvedQuestions)) contact.unresolvedQuestions = [];
    if (!Array.isArray(contact.commitmentsMade)) contact.commitmentsMade = [];
    if (!Array.isArray(contact.changeHistory)) contact.changeHistory = [];
    if (contact.hasGreeted === undefined) {
      contact.hasGreeted = Boolean(contact.messages && contact.messages.length > 0);
    }
    if (contact.assigned_owner === undefined) contact.assigned_owner = 'Satnam Singh Vohra';

    if (customerName && customerName !== 'Customer' && customerName !== 'Client' && (!contact.name || contact.name === 'Client' || contact.name === 'Customer')) {
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
  if (messageId) {
    const existing = contact.messages.find(m => m.id === messageId);
    if (existing) {
      return { contact, isDuplicate: true };
    }
  } else {
    const recent = contact.messages[contact.messages.length - 1];
    if (recent && recent.sender === 'customer' && recent.text === text && (Date.now() - new Date(recent.timestamp).getTime() < 3000)) {
      return { contact, isDuplicate: true };
    }
  }

  contact.messages.push({
    id: messageId || `in_${Date.now()}`,
    sender: 'customer',
    text: text || '',
    type: meta.rawType || 'text',
    timestamp: now
  });

  // Bounded message history (keep up to 100 in durable storage)
  if (contact.messages.length > 100) {
    contact.messages = contact.messages.slice(-100);
  }

  contact.lastSeen = now;
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

  if (options.messageId) {
    const existing = contact.messages.find(m => m.id === options.messageId);
    if (existing) return contact;
  } else {
    const recent = contact.messages[contact.messages.length - 1];
    if (recent && recent.sender === 'bot' && recent.text === text && (Date.now() - new Date(recent.timestamp).getTime() < 3000)) {
      return contact;
    }
  }

  contact.messages.push({
    id: options.messageId || `out_${Date.now()}`,
    sender: 'bot',
    text: text || '',
    intent,
    timestamp: now,
    deliveryStatus: options.deliveryStatus || 'dispatched'
  });

  if (contact.messages.length > 100) {
    contact.messages = contact.messages.slice(-100);
  }

  contact.lastUpdated = now;
  contact.lastIntent = intent;

  persistMemory();
  return contact;
}

/**
 * Update contact qualification fields with change history preservation
 */
function updateQualification(rawPhone, updates = {}) {
  const contact = getOrCreateContact(rawPhone);
  contact.qualification = contact.qualification || {};
  const q = contact.qualification;
  const now = new Date().toISOString();

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined && val !== null && val !== '') {
      const oldVal = q[key];

      // Special handling for budget corrections
      if (key === 'budget' && oldVal && oldVal !== val) {
        if (!Array.isArray(q.budgetHistory)) q.budgetHistory = [];
        q.budgetHistory.push({
          previousBudget: oldVal,
          newBudget: val,
          changedAt: now
        });
        if (!Array.isArray(contact.changeHistory)) contact.changeHistory = [];
        contact.changeHistory.push({
          field: 'budget',
          oldValue: oldVal,
          newValue: val,
          changedAt: now
        });
      }

      q[key] = val;
    }
  }

  // Update overall lead status if sufficiently qualified
  if (q.intent && (q.locality || q.bhk || q.budget)) {
    if (contact.status === 'new') {
      contact.status = 'qualifying';
    }
  }
  if (q.intent && q.budget && (q.preference || q.timeline || q.siteVisitRequested)) {
    contact.status = 'qualified';
  }

  contact.lastUpdated = now;
  persistMemory();
  return contact;
}

/**
 * Record a discussed property so follow-up queries know the subject
 */
function recordPropertyDiscussed(rawPhone, propertyName, reraNumber = '', price = '') {
  const contact = getOrCreateContact(rawPhone);
  if (!Array.isArray(contact.propertiesDiscussed)) contact.propertiesDiscussed = [];

  const existingIdx = contact.propertiesDiscussed.findIndex(p => p.name === propertyName);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    contact.propertiesDiscussed[existingIdx].discussedAt = now;
  } else {
    contact.propertiesDiscussed.unshift({
      name: propertyName,
      reraNumber,
      price,
      discussedAt: now
    });
    if (contact.propertiesDiscussed.length > 5) {
      contact.propertiesDiscussed = contact.propertiesDiscussed.slice(0, 5);
    }
  }

  contact.lastUpdated = now;
  persistMemory();
  return contact;
}

/**
 * Update the durable conversation summary
 */
function updateConversationSummary(rawPhone, summaryText) {
  const contact = getOrCreateContact(rawPhone);
  contact.lastSummary = summaryText || '';
  contact.lastUpdated = new Date().toISOString();
  persistMemory();
  return contact;
}

/**
 * Mark that greeting was completed so it is never repeated
 */
function markGreetingSent(rawPhone) {
  const contact = getOrCreateContact(rawPhone);
  contact.hasGreeted = true;
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
  recordPropertyDiscussed,
  updateConversationSummary,
  markGreetingSent,
  acquireContactLock,
  releaseContactLock,
  setOptOut,
  triggerHumanHandoff,
  resolveHumanHandoff,
  getHandoffQueue,
  getPromptConversationHistory,
  getCRMTelemetry,
  setStorageDir,
  clearCache
};
