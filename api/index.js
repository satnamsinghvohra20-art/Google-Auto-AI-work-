const https = require('https');
const path = require('path');
const fs = require('fs');
const security = require('../security_engine');
const OWNER_PHONE = process.env.OWNER_ALERT_PHONE || "+918421077613";

// ── Live Data Loader (always real-time, never hardcoded stale data) ─────────
const DATA_DIR = path.join(__dirname, '..', 'data');
function loadJSONFile(filename, defaultValue = []) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) { /* silent */ }
  return defaultValue;
}

let AIEngine;
try {
  const aiModule = require('../js/ai-engine.js');
  AIEngine = aiModule.AIEngine;
} catch (e) {
  console.warn('[API/Index] Could not load AIEngine:', e.message);
}

let server;
try {
  server = require('../server.js');
} catch (e) {
  console.warn('[API/Index] Server require error:', e.message);
}

function sendMetaWhatsAppMessage(to, text) {
  return new Promise((resolve) => {
    const token = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID || '';

    if (!token || !phoneId) {
      console.warn('[Meta API] Missing access token or phone ID');
      return resolve({ success: false, error: 'Missing credentials' });
    }

    const cleanTo = to.replace(/[^0-9]/g, '');
    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: { body: text }
    });

    const options = {
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

    const req = https.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        console.log(`[Meta API Outgoing to ${cleanTo}]: Status ${res.statusCode}`, resBody);
        resolve({ statusCode: res.statusCode, body: resBody });
      });
    });

    req.on('error', (err) => {
      console.error('[Meta API Request Error]:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const urlStr = req.url || '';
  const parsedUrl = new URL(urlStr, `https://${req.headers.host || 'google-auto-ai-work.onrender.com'}`);
  const pathname = parsedUrl.pathname;
  const matchedPath = req.headers['x-matched-path'] || '';
  const vercelPath = req.headers['x-vercel-matched-path'] || '';

  const isWhatsAppWebhook = [pathname, matchedPath, vercelPath]
    .some(route => route === '/api/whatsapp/webhook' || route === '/webhook');

  // Handle WhatsApp Cloud API Verification (GET)
  if (isWhatsAppWebhook && req.method === 'GET') {
    const mode = parsedUrl.searchParams.get('hub.mode');
    const token = parsedUrl.searchParams.get('hub.verify_token');
    const challenge = parsedUrl.searchParams.get('hub.challenge');

    console.log('[Webhook Verification] Request received.');

    const verifyToken = process.env.VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || '';
    if (mode === 'subscribe' && verifyToken && token === verifyToken && challenge) {
      console.log('[Webhook Verification] Succeeded.');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(challenge);
    } else {
      console.warn('[Webhook Verification] Rejected.');
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Verification token mismatch' }));
    }
  }

  // Handle WhatsApp Incoming Message (POST)
  if (isWhatsAppWebhook && req.method === 'POST') {
    if (!process.env.META_APP_SECRET) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Webhook signature verification is not configured' }));
    }
    const rawBody = await new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', chunk => {
        size += chunk.length;
        if (size > 5 * 1024 * 1024) {
          reject(new Error('Webhook payload too large'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    }).catch(() => null);
    if (!rawBody) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid webhook payload' }));
    }
    if (!security.verifyMetaWebhookSignature(rawBody, req.headers['x-hub-signature-256'])) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
    }
    let body;
    try {
      body = JSON.parse(rawBody.toString('utf8') || '{}');
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    }

    try {
      const entry = body && body.entry && body.entry[0];
      const changes = entry && entry.changes && entry.changes[0];
      const value = changes && changes.value;
      const messages = value && value.messages;

      if (messages && messages.length > 0) {
        const msg = messages[0];
        const from = msg.from;
        let incomingText = '';

        if (msg.type === 'text') {
          incomingText = (msg.text && msg.text.body) || '';
        } else if (msg.type === 'interactive' && msg.interactive) {
          if (msg.interactive.button_reply) incomingText = msg.interactive.button_reply.title || '';
          else if (msg.interactive.list_reply) incomingText = msg.interactive.list_reply.title || '';
        }

        const contact = value.contacts && value.contacts[0];
        const rawName = (contact && contact.profile && contact.profile.name) || 'Client';
        const cleanFrom = from.replace(/[^0-9]/g, '');
        const cleanOwner = OWNER_PHONE.replace(/[^0-9]/g, '');
        const isOwner = (cleanFrom === cleanOwner || cleanFrom.endsWith('8421077613'));
        const clientName = isOwner ? 'Satnam Singh (Owner / Boss)' : rawName;

        console.log(`[WhatsApp Incoming] From: ${from} (${clientName}): "${incomingText}"`);

        // Live data loaded fresh on every request (Zero Fake Data — 100% ground-truth)
        const liveLeads = loadJSONFile('leads.json', []);
        const liveReviews = loadJSONFile('reviews.json', []);
        const livePosts = loadJSONFile('posts.json', []);
        const publicUrl = process.env.PUBLIC_URL || 'https://google-auto-ai-work.onrender.com';

        // Generate AI Bot Response (Sia — authentic warm feminine 24yr personality)
        let replyText = '';
        if (isOwner) {
          if (AIEngine && typeof AIEngine.generateOwnerExecutiveResponse === 'function') {
            const autoRes = AIEngine.generateOwnerExecutiveResponse(incomingText, "Satnam Sir", {
              publicUrl,
              totalLeads: liveLeads.length,
              leads: liveLeads.slice(0, 5),
              reviewsCount: liveReviews.length,
              publishedPostsCount: livePosts.length
            });
            replyText = autoRes.reply;
          } else {
            replyText = `Satnam Sir, sab theek hai! 💪 Sia active hai 24/7.\nLive dashboard: ${publicUrl}\n\nLeads: ${liveLeads.length} | Reviews: ${liveReviews.length} | Posts: ${livePosts.length}`;
          }
        } else {
          if (AIEngine && typeof AIEngine.generateWhatsAppAutoResponse === 'function') {
            const autoRes = AIEngine.generateWhatsAppAutoResponse(incomingText, clientName, {
              isOngoing: true,
              publicUrl,
              officeAddress: 'Shop No. 24, New Floora, Pale Gaon, Ambernath (E) - 421 501',
              officeLandmark: 'Near Pale Gaon Bus Stop, 7 mins from Ambernath East Railway Station',
              officeTimings: 'Subah 10:00 AM se raat 8:30 PM (All 7 Days)',
              contactPhone: '+91 84210 77613'
            });
            replyText = autoRes.reply;
          } else {
            // Sia — authentic warm feminine Hinglish (no cold robotic greetings)
            replyText = `Arey ${clientName}! Main hoon Sia 💖 — Dashmesh Properties ki AI concierge!\n\nAap bilkul sahi jagah aaye hain 🌸 Buy, Rent, ya Section 55 Registered Rent Agreement — jo bhi chahiye, main hoon na, poori madad karungi!\n\n📍 Shop No. 24, New Floora, Pale Gaon, Ambernath (E) - 421 501\n📞 Satnam Sir: +91 84210 77613\n\nBatao — kya soch rahe ho? 😊`;
          }
        }

        // Dispatch reply back to client via Meta Cloud API v20.0
        await sendMetaWhatsAppMessage(from, replyText);
        console.log(`[WhatsApp Outgoing] Dispatched reply to ${from}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'EVENT_RECEIVED' }));
    } catch (err) {
      console.error('[Webhook Processing Error]:', err);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'PROCESSED_WITH_NOTICE', error: err.message }));
    }
  }

  // Delegate all other API requests to server.js
  if (server) {
    return server.emit('request', req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
};

module.exports.config = { api: { bodyParser: false } };
