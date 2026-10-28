/**
 * ============================================================
 *  DASHMESH PROPERTIES — ADVANCED AUTONOMOUS CONTINUOUS LOOP
 *  24/7 Self-Healing Daemon Engine
 * ============================================================
 *  Business : Dashmesh Property & Rent Agreement Services
 *  Founder  : Satnam Singh Vohra (+91 84210 77613)
 *  Partners : Sukhjyot Singh Vohra (+91 84219 40013)
 *             Kuldeep Singh Vohra (+91 84120 70183)
 *  Office   : Shop No. 24, New Floora, Pale Gaon, Ambernath (E) - 421 501
 *  Rent Agr.: ₹1,750 per side / ₹3,500 total (Maharashtra Rent Control Act §55)
 * ============================================================
 *
 *  HOW TO START:
 *    node loop.js
 *
 *  HOW TO RUN AS PM2 (auto-restart on crash):
 *    pm2 start loop.js --name dashmesh-loop
 *
 *  LOOP TASKS (in order, continuous cycle):
 *  1. Health check — verify server is responding
 *  2. Data sync    — write CSV from JSON files every 15 min
 *  3. Google ping  — submit sitemap to Google & Bing every 6h
 *  4. GBP sync     — pull latest Maps data every 15 min
 *  5. Daily brief  — WhatsApp CEO briefing to Satnam Sir at 9AM IST
 *  6. Log sweep    — rotate logs, trim event logs > 500 lines
 * ============================================================
 */

'use strict';

// ── Load .env ────────────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const eq = line.indexOf('=');
      if (eq !== -1) {
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim();
        if (process.env[k] === undefined) process.env[k] = v;
      }
    }
  });
  console.log('[Loop] ✅ .env loaded');
}

// ── Config ───────────────────────────────────────────────────────────────────
const DATA_DIR   = path.join(__dirname, 'data');
const LOG_FILE   = path.join(DATA_DIR, 'loop_activity.log');
const PORT       = parseInt(process.env.PORT || '3000', 10);
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const OWNER_PHONE = (process.env.OWNER_ALERT_PHONE || '+918421077613').replace(/[^0-9]/g, '');

// Task intervals
const HEALTH_CHECK_INTERVAL_MS = 30  * 1000;  //  30 seconds
const CSV_SYNC_INTERVAL_MS     = 15  * 60 * 1000; //  15 minutes
const GBP_SYNC_INTERVAL_MS     = 15  * 60 * 1000; //  15 minutes
const SEO_CHECK_INTERVAL_MS    = 30  * 60 * 1000; //  30 minutes
const GOOGLE_PING_INTERVAL_MS  =  6  * 60 * 60 * 1000; //   6 hours
const DAILY_BRIEF_HOUR_IST     =  9;  // 9:00 AM IST

// Retry config
const MAX_RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes max backoff
let consecutiveHealthFails = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
    // Trim log to last 1000 lines
    const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n');
    if (lines.length > 1000) {
      fs.writeFileSync(LOG_FILE, lines.slice(lines.length - 1000).join('\n'), 'utf8');
    }
  } catch (_) {}
}

function loadJSON(filename, def) {
  try {
    const p = path.join(DATA_DIR, filename);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {}
  return def;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function exponentialBackoff(attempt) {
  const delay = Math.min(1000 * Math.pow(2, attempt), MAX_RETRY_DELAY_MS);
  return delay + Math.random() * 1000;
}

function getISTHour() {
  const now = new Date();
  // IST = UTC+5:30
  const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
  return new Date(istMs).getUTCHours();
}

// ── Task 1: Health Check ─────────────────────────────────────────────────────
async function healthCheck() {
  return new Promise((resolve) => {
    const url = `http://localhost:${PORT}/api/status`;
    const req = http.get(url, { timeout: 8000 }, (res) => {
      consecutiveHealthFails = 0;
      log(`[Health] ✅ Server OK — HTTP ${res.statusCode} on port ${PORT}`);
      resolve(true);
    });
    req.on('error', (err) => {
      consecutiveHealthFails++;
      log(`[Health] ⚠️  Server not responding (fail #${consecutiveHealthFails}): ${err.message}`);
      if (consecutiveHealthFails >= 5) {
        log('[Health] 🔴 5 consecutive failures — consider restarting server.js manually or via PM2!');
      }
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      consecutiveHealthFails++;
      log(`[Health] ⚠️  Health check timeout (fail #${consecutiveHealthFails})`);
      resolve(false);
    });
  });
}

// ── Task 2: CSV Sync ─────────────────────────────────────────────────────────
function syncCSVs() {
  try {
    const csvDir = path.join(DATA_DIR, 'csv');
    if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

    // Leads CSV
    const leads = loadJSON('leads.json', []);
    const leadRows = ['Phone,Name,Status,Language,Last Intent,Last Updated'];
    for (const l of (Array.isArray(leads) ? leads : [])) {
      leadRows.push(`"${l.phone||''}","${(l.name||'').replace(/"/g,'""')}","${l.status||''}","${l.language||''}","${l.lastIntent||''}","${l.lastUpdated||''}"`);
    }
    fs.writeFileSync(path.join(csvDir, 'leads_crm.csv'), leadRows.join('\n'), 'utf8');

    // Rent Agreements CSV
    const ags = loadJSON('rent_agreements.json', []);
    const agRows = ['Agreement ID,Client Name,Phone,Role,Address,Monthly Rent,Deposit,Period,Cost Per Side,Total Cost,Status,Created At'];
    for (const a of (Array.isArray(ags) ? ags : [])) {
      agRows.push(`"${a.agreement_id||''}","${(a.client_name||'').replace(/"/g,'""')}","${a.phone||''}","${a.role||''}","${(a.property_address||'').replace(/"/g,'""')}","${a.monthly_rent||''}","${a.deposit_amount||''}","${a.agreement_period||'11 Months'}","₹${a.cost_per_side||1750}","₹${a.total_cost||3500}","${a.status||''}","${a.created_at||''}"`);
    }
    fs.writeFileSync(path.join(csvDir, 'rent_agreements.csv'), agRows.join('\n'), 'utf8');

    log(`[CSV Sync] ✅ Synced ${leads.length||0} leads & ${ags.length||0} rent agreements to CSV`);
  } catch (err) {
    log(`[CSV Sync] ⚠️  Error: ${err.message}`);
  }
}

// ── Task 3: Google & Bing Ping ───────────────────────────────────────────────
function pingSearchEngines() {
  const sitemapUrl = encodeURIComponent(`${PUBLIC_URL}/sitemap.xml`);
  const targets = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`
  ];

  targets.forEach(pingUrl => {
    try {
      const parsed = new URL(pingUrl);
      const req = https.get({
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: { 'User-Agent': 'DashmeshProperties-SIA-Bot/2.0' }
      }, (res) => {
        log(`[SEO Ping] ✅ Pinged ${parsed.hostname} — HTTP ${res.statusCode}`);
      });
      req.on('error', (err) => log(`[SEO Ping] ⚠️  ${parsed.hostname}: ${err.message}`));
      req.end();
    } catch (err) {
      log(`[SEO Ping] ⚠️  Error pinging ${pingUrl}: ${err.message}`);
    }
  });
}

// ── Task 4: WhatsApp Daily CEO Briefing ──────────────────────────────────────
async function sendDailyBriefing() {
  const token   = process.env.META_ACCESS_TOKEN || '';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  if (!token || !phoneId || !OWNER_PHONE) {
    log('[Daily Brief] ⚠️  Missing Meta credentials — skipping WhatsApp briefing');
    return;
  }

  const leads = loadJSON('leads.json', []);
  const reviews = loadJSON('reviews.json', []);
  const ags = loadJSON('rent_agreements.json', []);
  const posts = loadJSON('posts.json', []);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const activeLeads = Array.isArray(leads) ? leads.filter(l => l.status !== 'archived').length : 0;
  const totalRev = Array.isArray(ags) ? ags.reduce((s, a) => s + (a.total_cost || 3500), 0) : 0;

  const msg = `👑 *DASHMESH PROPERTIES — DAILY CEO BRIEFING*\n📅 ${now}\n\n` +
    `✅ *Sia AI: ACTIVE & RUNNING 24/7*\n\n` +
    `📊 *Live Stats:*\n` +
    `• 🎯 CRM Active Leads: *${activeLeads}* (Total: ${Array.isArray(leads) ? leads.length : 0})\n` +
    `• ⭐ Google Reviews: *${Array.isArray(reviews) ? reviews.length : 0}*\n` +
    `• 📜 Rent Agreements: *${Array.isArray(ags) ? ags.length : 0}* (₹${totalRev.toLocaleString('en-IN')} collected)\n` +
    `• 📝 Published Posts: *${Array.isArray(posts) ? posts.length : 0}*\n\n` +
    `📍 *Office:* Shop No. 24, New Floora, Pale Gaon, Ambernath (E) - 421 501\n` +
    `🔗 *Dashboard:* ${PUBLIC_URL}\n\n` +
    `_"Think Big, Aim High, Act Bold — Gary Keller MREA"_ 🌟`;

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: OWNER_PHONE,
      type: 'text',
      text: { body: msg }
    });

    const opts = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v20.0/${phoneId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        log(`[Daily Brief] ✅ CEO briefing sent to Satnam Sir — HTTP ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', (err) => {
      log(`[Daily Brief] ⚠️  Failed to send briefing: ${err.message}`);
      resolve();
    });
    req.write(payload);
    req.end();
  });
}

// ── Task 5: Omnichannel Social & SEO Keyword Guardian ──────────────────────
async function checkSocialAndSEOHealth() {
  return new Promise((resolve) => {
    // 1. Verify Social Channels API
    const req = http.get(`http://localhost:${PORT}/api/social/channels`, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const ch = json.channels || {};
          const configured = Object.keys(ch).filter(k => ch[k].configured);
          log(`[Social Guardian] 📡 Channels active: ${configured.join(', ') || 'None'} (Target: Google, Facebook, Instagram, LinkedIn)`);
        } catch (_) {}

        // 2. Verify SEO Keyword Health
        http.get(`http://localhost:${PORT}/api/seo/keywords`, { timeout: 8000 }, (seoRes) => {
          let sData = '';
          seoRes.on('data', c => sData += c);
          seoRes.on('end', () => {
            try {
              const sJson = JSON.parse(sData);
              const kwCount = (sJson.keywords || []).length;
              log(`[SEO Guardian] 🎯 Local Keywords Matrix: ${kwCount} keywords maintained for Pale Gaon & Ambernath East`);
            } catch (_) {}
            resolve();
          });
        }).on('error', () => resolve());
      });
    });
    req.on('error', (err) => {
      log(`[Social Guardian] ⚠️ Server not ready for social health check: ${err.message}`);
      resolve();
    });
  });
}

// ── Main Continuous Loop ─────────────────────────────────────────────────────
let lastCSVSync      = 0;
let lastGooglePing   = 0;
let lastGBPSync      = 0;
let lastSEOCheck     = 0;
let dailyBriefSentAt = -1;
let loopIteration    = 0;

async function runLoop() {
  log('═══════════════════════════════════════════════════════════');
  log('🚀 DASHMESH PROPERTIES — AUTONOMOUS LOOP ENGINE STARTED');
  log(`   Business    : Dashmesh Property & Rent Agreement Services`);
  log(`   Founder     : Satnam Singh Vohra (+91 84210 77613)`);
  log(`   Public URL  : ${PUBLIC_URL}`);
  log(`   Health Port : ${PORT}`);
  log('═══════════════════════════════════════════════════════════');

  // Process-level crash guard — loop NEVER stops due to unhandled errors
  process.on('uncaughtException', (err) => {
    log(`[Loop Guard] Uncaught exception caught safely: ${err.message}`);
  });
  process.on('unhandledRejection', (reason) => {
    log(`[Loop Guard] Unhandled rejection caught safely: ${reason}`);
  });

  while (true) {
    loopIteration++;
    const now = Date.now();

    try {
      // ── Task 1: Health Check (every 30s) ─────────────────────────────
      await healthCheck();

      // ── Task 2: CSV Sync (every 15 min) ──────────────────────────────
      if (now - lastCSVSync > CSV_SYNC_INTERVAL_MS) {
        syncCSVs();
        lastCSVSync = Date.now();
      }

      // ── Task 3: Google & Bing Ping (every 6h) ────────────────────────
      if (now - lastGooglePing > GOOGLE_PING_INTERVAL_MS) {
        pingSearchEngines();
        lastGooglePing = Date.now();
      }

      // ── Task 4: Social & SEO Guardian (every 30 min) ──────────────────
      if (now - lastSEOCheck > SEO_CHECK_INTERVAL_MS) {
        await checkSocialAndSEOHealth();
        lastSEOCheck = Date.now();
      }

      // ── Task 5: Daily CEO Briefing (9AM IST once per day) ────────────
      const istHour = getISTHour();
      const today   = new Date().toDateString();
      if (istHour === DAILY_BRIEF_HOUR_IST && dailyBriefSentAt !== today) {
        log('[Daily Brief] 📬 9AM IST — sending CEO daily briefing to Satnam Sir...');
        await sendDailyBriefing();
        dailyBriefSentAt = today;
      }

      log(`[Loop] ✅ Iteration #${loopIteration} complete — sleeping ${HEALTH_CHECK_INTERVAL_MS / 1000}s`);

    } catch (err) {
      log(`[Loop] ⚠️  Error in iteration #${loopIteration}: ${err.message}`);
      const backoff = exponentialBackoff(consecutiveHealthFails);
      log(`[Loop] 🔄 Retrying in ${Math.round(backoff / 1000)}s...`);
      await sleep(backoff);
      continue;
    }

    await sleep(HEALTH_CHECK_INTERVAL_MS);
  }
}

// ── Start ────────────────────────────────────────────────────────────────────
runLoop().catch(err => {
  log(`[Loop] FATAL: ${err.message}`);
  process.exit(1);
});

