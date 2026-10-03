const https = require('https');
const path = require('path');
const fs = require('fs');

// Built-in credentials with process.env overrides
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "DashmeshProperties2026";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "EAATN5vYyZCbMBSv3ejduJWjjJKOIensLV7ZCOFJUqg4gHZCnj1Jb1mVpmRwRH3Sd7RqTRfCKmx7xi7fhKLcPo0YG4evgZCGSrFkrzOqqrtu3uFNcYWnkzqlLJ0YqVK9tB6PNQ67Ueu5ZCFJu7GC8nGJXyQ8m4AyXeXoZBOh6NzOEqeE7huxgAUjQInT4QCuAZDZD";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1239464059243498";
const OWNER_PHONE = process.env.OWNER_ALERT_PHONE || "+918421077613";

let AIEngine;
try {
  const aiModule = require('../../js/ai-engine.js');
  AIEngine = aiModule.AIEngine;
} catch (e) {
  console.warn('[Webhook] Could not load AIEngine:', e.message);
}

function sendMetaWhatsAppMessage(to, text) {
  return new Promise((resolve, reject) => {
    const token = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || PHONE_NUMBER_ID;

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
      path: `/v18.0/${phoneId}/messages`,
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
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = new URL(req.url, `https://${req.headers.host || 'google-auto-ai-work.vercel.app'}`);

  // 1. Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log(`[Webhook Verification] mode=${mode}, token=${token}, challenge=${challenge}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook] Verified successfully by Meta Cloud API!');
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    } else {
      console.warn(`[Webhook Verification Failed] Expected token: ${VERIFY_TOKEN}, got: ${token}`);
      return res.status(403).json({ error: 'Verification token mismatch' });
    }
  }

  // 2. Incoming WhatsApp Message Handler (POST)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
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

        // Generate AI Bot Response (Sia)
        let replyText = '';
        if (isOwner) {
          if (AIEngine && typeof AIEngine.generateOwnerExecutiveResponse === 'function') {
            const autoRes = AIEngine.generateOwnerExecutiveResponse(incomingText, "Satnam Sir", {
              publicUrl: 'https://google-auto-ai-work.vercel.app',
              totalLeads: 28,
              leads: [],
              reviewsCount: 14,
              publishedPostsCount: 4
            });
            replyText = autoRes.reply;
          } else {
            replyText = `Satnam Sir, Sia is active 24/7! All systems normal. Live portal: https://google-auto-ai-work.vercel.app`;
          }
        } else {
          if (AIEngine && typeof AIEngine.generateWhatsAppAutoResponse === 'function') {
            const autoRes = AIEngine.generateWhatsAppAutoResponse(incomingText, clientName, {
              isOngoing: true,
              publicUrl: 'https://google-auto-ai-work.vercel.app',
              officeAddress: 'New Floora, Shop No. 24, Pale Gaon, Ambernath (E) - 421 501',
              officeLandmark: 'Near Pale Gaon Entry Gate',
              officeTimings: '10:00 AM - 09:30 PM (All 7 Days)',
              contactPhone: '+91 84210 77613'
            });
            replyText = autoRes.reply;
          } else {
            replyText = `Namaste ${clientName} ji! Welcome to Dashmesh Properties (Pale Gaon, Ambernath E).\n\nI am Sia, your AI Assistant. How can I help you today with Buy, Rent, or Maharashtra Registered Rent Agreement?\n\nOffice: New Floora, Shop No. 24, Pale Gaon, Ambernath (E)\nDirect Call/WhatsApp: Satnam Sir (+91 84210 77613)`;
          }
        }

        // Send reply back to user via Meta Cloud API
        await sendMetaWhatsAppMessage(from, replyText);
        console.log(`[WhatsApp Outgoing] Dispatched successfully to ${from}`);
      }

      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err) {
      console.error('[Webhook Processing Error]:', err);
      return res.status(200).json({ status: 'PROCESSED_WITH_NOTICE', error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
