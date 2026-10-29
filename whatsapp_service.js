/**
 * ============================================================================
 * Dashmesh Properties — Meta WhatsApp Business Cloud API Engine
 * Enterprise-Grade, Zero-Dependency WhatsApp Integration Module
 * ============================================================================
 * Compliant with Meta Graph API v20.0+, ISO 27001 Security, and OWASP Standards
 */

'use strict';

const https = require('https');
const crypto = require('crypto');

// Message deduplication cache with bounded capacity
const PROCESSED_MESSAGE_CACHE = new Map();
const MAX_CACHE_SIZE = 2000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Outbound rate limiting: token bucket (max 60 msg/sec to stay safely under Meta tier limits)
let rateTokens = 60;
let lastRefill = Date.now();
const MAX_TOKENS = 60;
const REFILL_INTERVAL_MS = 1000;

function refillTokens() {
  const now = Date.now();
  const elapsed = now - lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    rateTokens = MAX_TOKENS;
    lastRefill = now;
  }
}

/**
 * Validate required and optional environment configuration
 */
function validateConfig(env = process.env) {
  const missingRequired = [];
  const warnings = [];

  const requiredInProd = [
    'META_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID'
  ];

  for (const key of requiredInProd) {
    if (!env[key] || typeof env[key] !== 'string' || !env[key].trim()) {
      missingRequired.push(key);
    }
  }

  const verifyToken = env.WHATSAPP_VERIFY_TOKEN || env.VERIFY_TOKEN;
  if (!verifyToken || typeof verifyToken !== 'string' || !verifyToken.trim()) {
    missingRequired.push('WHATSAPP_VERIFY_TOKEN');
  }

  if (!env.META_APP_SECRET) {
    warnings.push('META_APP_SECRET is not configured; webhook signature verification is bypassed for local development.');
  }

  if (!env.PUBLIC_URL) {
    warnings.push('PUBLIC_URL is not set; falling back to localhost or ngrok detection.');
  }

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    warnings,
    graphVersion: env.META_GRAPH_VERSION || 'v20.0',
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || '',
    hasAccessToken: Boolean(env.META_ACCESS_TOKEN),
    hasAppSecret: Boolean(env.META_APP_SECRET),
    verifyTokenConfigured: Boolean(env.WHATSAPP_VERIFY_TOKEN || env.VERIFY_TOKEN)
  };
}

/**
 * Mask sensitive credentials for diagnostics and safe logging
 */
function maskSecret(val) {
  if (!val || typeof val !== 'string') return '[NOT_CONFIGURED]';
  const trimmed = val.trim();
  if (trimmed.length <= 8) return '********';
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

/**
 * Verify Meta Webhook Challenge (GET Request)
 */
function verifyWebhookChallenge(parsedUrl, configuredVerifyToken) {
  const mode = parsedUrl.searchParams.get('hub.mode');
  const token = parsedUrl.searchParams.get('hub.verify_token');
  const challenge = parsedUrl.searchParams.get('hub.challenge');

  const expectedToken = (configuredVerifyToken || process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || '').trim();

  if (mode === 'subscribe' && expectedToken && token === expectedToken && challenge) {
    return { verified: true, challenge };
  }

  return { verified: false, challenge: null, reason: 'Token mismatch or invalid subscription mode' };
}

/**
 * Verify Meta Webhook HMAC-SHA256 Signature (POST Request)
 */
function verifyMetaSignature(rawBody, signatureHeader, appSecret = process.env.META_APP_SECRET) {
  if (!appSecret) {
    // Development fallback when secret is not yet provided by Meta App Dashboard
    return { verified: true, warning: 'Bypassed because META_APP_SECRET is not set' };
  }

  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return { verified: false, reason: 'Missing X-Hub-Signature-256 header' };
  }

  const match = /^sha256=([a-f0-9]{64})$/i.exec(signatureHeader.trim());
  if (!match) {
    return { verified: false, reason: 'Malformed X-Hub-Signature-256 format' };
  }

  try {
    const expectedHash = crypto.createHmac('sha256', appSecret).update(rawBody).digest();
    const providedHash = Buffer.from(match[1], 'hex');

    if (expectedHash.length !== providedHash.length || !crypto.timingSafeEqual(expectedHash, providedHash)) {
      return { verified: false, reason: 'Signature mismatch' };
    }

    return { verified: true };
  } catch (err) {
    return { verified: false, reason: `Crypto verification error: ${err.message}` };
  }
}

/**
 * Clean and normalize phone numbers to E.164 without '+' or spaces
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`; // Default to India (+91) for standard 10-digit mobile
  }
  return digits;
}

/**
 * Check if a message has already been processed (Idempotency)
 */
function isDuplicateMessage(msgId) {
  if (!msgId || typeof msgId !== 'string') return false;

  const now = Date.now();
  // Periodic cleanup
  if (PROCESSED_MESSAGE_CACHE.size > MAX_CACHE_SIZE) {
    for (const [id, timestamp] of PROCESSED_MESSAGE_CACHE.entries()) {
      if (now - timestamp > CACHE_TTL_MS) {
        PROCESSED_MESSAGE_CACHE.delete(id);
      }
    }
  }

  if (PROCESSED_MESSAGE_CACHE.has(msgId)) {
    return true;
  }

  PROCESSED_MESSAGE_CACHE.set(msgId, now);
  return false;
}

/**
 * Detect customer opt-out keywords (STOP, UNSUBSCRIBE, CANCEL, HALT, OPT OUT)
 */
function isOptOutRequest(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();
  const optOutKeywords = [
    'stop',
    'unsubscribe',
    'cancel',
    'halt',
    'optout',
    'opt out',
    'mat bhejo',
    'don\'t message',
    'dont message',
    'stop messages'
  ];
  return optOutKeywords.includes(clean);
}

/**
 * Detect customer opt-in / resume keywords (START, RESUME, UNSTOP, CONTINUE)
 */
function isOptInRequest(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();
  const optInKeywords = [
    'start',
    'resume',
    'unstop',
    'shuru karo',
    'chalu karo',
    'continue'
  ];
  return optInKeywords.includes(clean);
}

/**
 * Parse incoming Meta Webhook Payload into structured event
 */
function parseWebhookPayload(rawPayload) {
  let payload = rawPayload;
  if (typeof payload === 'string' || Buffer.isBuffer(payload)) {
    try {
      payload = JSON.parse(payload.toString('utf8'));
    } catch (e) {
      return { isValid: false, reason: 'Invalid JSON payload' };
    }
  }

  if (!payload || payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
    return { isValid: false, reason: 'Not a WhatsApp Business Account webhook payload' };
  }

  const events = [];

  for (const entry of payload.entry) {
    if (!Array.isArray(entry.changes)) continue;

    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;
      const value = change.value;
      if (!value) continue;

      const metadata = value.metadata || {};
      const businessPhoneNumberId = metadata.phone_number_id || '';
      const displayPhoneNumber = metadata.display_phone_number || '';

      // 1. Status Updates (sent, delivered, read, failed)
      if (Array.isArray(value.statuses) && value.statuses.length > 0) {
        for (const statusObj of value.statuses) {
          events.push({
            type: 'status_update',
            msgId: statusObj.id,
            status: statusObj.status, // 'sent', 'delivered', 'read', 'failed'
            recipientId: statusObj.recipient_id,
            timestamp: statusObj.timestamp ? new Date(parseInt(statusObj.timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
            errors: statusObj.errors || null,
            businessPhoneNumberId
          });
        }
      }

      // 2. Incoming Customer Messages
      if (Array.isArray(value.messages) && value.messages.length > 0) {
        const contactMap = {};
        if (Array.isArray(value.contacts)) {
          for (const c of value.contacts) {
            contactMap[c.wa_id] = (c.profile && c.profile.name) || 'Customer';
          }
        }

        for (const msg of value.messages) {
          const rawFrom = msg.from || '';
          const cleanPhone = normalizePhone(rawFrom);
          const customerName = contactMap[rawFrom] || 'Customer';
          const msgId = msg.id || `msg_${Date.now()}`;
          const timestamp = msg.timestamp ? new Date(parseInt(msg.timestamp, 10) * 1000).toISOString() : new Date().toISOString();

          let extractedText = '';
          let isInteractive = false;
          let interactiveData = null;
          let mediaData = null;
          let messageType = msg.type || 'unknown';

          if (msg.type === 'text' && msg.text) {
            extractedText = (msg.text.body || '').trim();
          } else if (msg.type === 'interactive' && msg.interactive) {
            isInteractive = true;
            interactiveData = msg.interactive;
            if (msg.interactive.type === 'button_reply' && msg.interactive.button_reply) {
              extractedText = (msg.interactive.button_reply.title || '').trim();
            } else if (msg.interactive.type === 'list_reply' && msg.interactive.list_reply) {
              extractedText = (msg.interactive.list_reply.title || '').trim();
            }
          } else if (['image', 'audio', 'document', 'video', 'sticker'].includes(msg.type)) {
            mediaData = msg[msg.type];
            extractedText = (mediaData && mediaData.caption) ? mediaData.caption.trim() : `[Customer sent ${msg.type}]`;
          } else if (msg.type === 'location' && msg.location) {
            extractedText = `[Customer shared location: ${msg.location.latitude}, ${msg.location.longitude} (${msg.location.name || msg.location.address || ''})]`;
          } else if (msg.type === 'contacts') {
            extractedText = '[Customer shared contact card]';
          }

          events.push({
            type: 'incoming_message',
            msgId,
            cleanPhone,
            customerName,
            text: extractedText,
            rawType: messageType,
            isInteractive,
            interactiveData,
            mediaData,
            timestamp,
            businessPhoneNumberId,
            displayPhoneNumber,
            isOptOut: isOptOutRequest(extractedText),
            isOptIn: isOptInRequest(extractedText)
          });
        }
      }
    }
  }

  return { isValid: true, events };
}

/**
 * Check if customer is within the Meta 24-hour Customer Service Window
 */
function isWithin24HourWindow(lastInboundIso) {
  if (!lastInboundIso) return false;
  const lastTime = new Date(lastInboundIso).getTime();
  if (isNaN(lastTime)) return false;
  const elapsed = Date.now() - lastTime;
  return elapsed <= 24 * 60 * 60 * 1000;
}

/**
 * Sleep helper with jitter
 */
function sleepWithJitter(baseMs, attempt) {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return new Promise(resolve => setTimeout(resolve, exponential + jitter));
}

/**
 * Dispatches an outbound WhatsApp message via Meta Cloud API with retries,
 * rate limiting, timeouts, and error classification.
 */
async function sendMetaWhatsAppMessage(toPhone, messageText, options = {}) {
  const config = {
    accessToken: options.accessToken || process.env.META_ACCESS_TOKEN || '',
    phoneNumberId: options.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    graphVersion: options.graphVersion || process.env.META_GRAPH_VERSION || 'v20.0',
    buttons: options.buttons || null,
    template: options.template || null,
    lastInboundTimestamp: options.lastInboundTimestamp || null,
    maxRetries: options.maxRetries !== undefined ? options.maxRetries : 2
  };

  if (!config.accessToken || !config.phoneNumberId) {
    return {
      success: false,
      error: 'Missing Meta WhatsApp credentials (META_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID)',
      code: 'CONFIG_MISSING'
    };
  }

  const cleanPhone = normalizePhone(toPhone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return {
      success: false,
      error: `Invalid destination phone number: ${toPhone}`,
      code: 'INVALID_PHONE'
    };
  }

  // Enforce Meta 24-Hour Customer Service Messaging Window
  if (config.lastInboundTimestamp && !config.template) {
    const isInsideWindow = isWithin24HourWindow(config.lastInboundTimestamp);
    if (!isInsideWindow) {
      return {
        success: false,
        error: 'Customer service 24-hour messaging window has elapsed. An approved Meta Template is required for business-initiated contact.',
        code: 'OUTSIDE_24H_WINDOW'
      };
    }
  }

  // Construct Meta Graph API payload
  let payload;
  const buttons = config.buttons;

  if (config.template) {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: config.template
    };
  } else if (buttons && Array.isArray(buttons) && buttons.length > 0 && messageText.length <= 1000) {
    const formattedButtons = buttons.slice(0, 3).map((btn, idx) => {
      const title = typeof btn === 'string' ? btn.slice(0, 20) : (btn.title || 'Option').slice(0, 20);
      const id = typeof btn === 'string' ? `btn_${idx}_${Date.now()}` : (btn.id || `btn_${idx}`);
      return {
        type: 'reply',
        reply: { id: id.slice(0, 256), title }
      };
    });

    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: messageText },
        action: { buttons: formattedButtons }
      }
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: { preview_url: true, body: messageText }
    };
  }

  const postData = JSON.stringify(payload);

  // Rate Limiting check
  refillTokens();
  if (rateTokens <= 0) {
    await sleepWithJitter(200, 0);
  }
  rateTokens = Math.max(0, rateTokens - 1);

  // Send request with bounded exponential backoff
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await new Promise((resolve, reject) => {
        const reqOptions = {
          hostname: 'graph.facebook.com',
          port: 443,
          path: `/${config.graphVersion}/${config.phoneNumberId}/messages`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 10000 // 10s socket timeout
        };

        const req = https.request(reqOptions, (res) => {
          let responseBody = '';
          res.on('data', chunk => responseBody += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, body: responseBody }));
        });

        req.on('error', err => reject(new Error(`HTTPS connection error: ${err.message}`)));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Meta Graph API request timed out (10s)'));
        });

        req.write(postData);
        req.end();
      });

      let jsonRes = {};
      try {
        jsonRes = JSON.parse(response.body);
      } catch (_) {}

      // Success (HTTP 200/201)
      if (response.statusCode >= 200 && response.statusCode < 300) {
        const messageId = jsonRes.messages && jsonRes.messages[0] && jsonRes.messages[0].id;
        return {
          success: true,
          messageId: messageId || `meta_${Date.now()}`,
          recipient: cleanPhone,
          statusCode: response.statusCode,
          type: payload.type
        };
      }

      // Classify error response
      const metaError = jsonRes.error || {};
      const errorCode = metaError.code || response.statusCode;
      const errorMsg = metaError.message || response.body || 'Unknown Meta API error';

      // Non-retryable client errors
      if (response.statusCode === 400 || response.statusCode === 401 || response.statusCode === 403) {
        if (errorCode === 131047 || errorMsg.includes('24 hour')) {
          return { success: false, error: '24-hour window closed', code: 'OUTSIDE_24H_WINDOW' };
        }
        if (response.statusCode === 401) {
          return { success: false, error: 'Authentication failed (Invalid access token)', code: 'AUTH_ERROR' };
        }
        return { success: false, error: errorMsg, code: `META_CLIENT_ERROR_${errorCode}` };
      }

      // Retryable errors: Rate Limit (429) or Server Error (5xx)
      if (attempt < config.maxRetries) {
        await sleepWithJitter(1000, attempt);
        continue;
      }

      return {
        success: false,
        error: `Meta API returned HTTP ${response.statusCode}: ${errorMsg}`,
        code: `META_SERVER_ERROR_${response.statusCode}`
      };

    } catch (err) {
      if (attempt < config.maxRetries) {
        await sleepWithJitter(1000, attempt);
        continue;
      }
      return {
        success: false,
        error: `Network/transport failure: ${err.message}`,
        code: 'NETWORK_FAILURE'
      };
    }
  }
}

/**
 * Diagnostic Health Check Object (No sensitive data exposed)
 */
function getWhatsAppHealth() {
  const config = validateConfig();
  return {
    service: 'Meta WhatsApp Business Cloud API',
    status: config.valid ? 'READY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    graphVersion: config.graphVersion,
    phoneNumberIdConfigured: Boolean(config.phoneNumberId),
    phoneNumberIdMasked: maskSecret(config.phoneNumberId),
    accessTokenConfigured: config.hasAccessToken,
    appSecretConfigured: config.hasAppSecret,
    verifyTokenConfigured: config.verifyTokenConfigured,
    cacheEntries: PROCESSED_MESSAGE_CACHE.size,
    rateTokensAvailable: rateTokens,
    missingConfiguration: config.missingRequired
  };
}

module.exports = {
  validateConfig,
  maskSecret,
  verifyWebhookChallenge,
  verifyMetaSignature,
  normalizePhone,
  isDuplicateMessage,
  isOptOutRequest,
  isOptInRequest,
  parseWebhookPayload,
  isWithin24HourWindow,
  sendMetaWhatsAppMessage,
  getWhatsAppHealth
};
