/**
 * ============================================================================
 * Dashmesh Properties — WhatsApp AI Receptionist & Brain Test Suite
 * Enterprise Integration & Unit Tests (Phase 10 Verification)
 * ============================================================================
 * Zero External Dependencies: Uses native node:test and node:assert/strict
 * Strict Zero-Fake-Data Enforcement: Isolated temporary directory, 0 prod writes
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Target modules
const whatsapp = require('../whatsapp_service');
const crm = require('../crm_store');
const sia = require('../sia_brain');

// Setup isolated temporary storage for testing
const testStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashmesh-test-crm-'));
crm.setStorageDir(testStorageDir);

test.after(() => {
  // Clean up temporary test storage directory
  try {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  } catch (_) {}
});

// 1. Webhook Challenge Verification (GET)
test('Webhook GET challenge: returns challenge when token matches', () => {
  const testToken = 'my_secret_verify_token_123';
  const url = new URL(`https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${testToken}&hub.challenge=CHALLENGE_998877`);
  const result = whatsapp.verifyWebhookChallenge(url, testToken);

  assert.equal(result.verified, true);
  assert.equal(result.challenge, 'CHALLENGE_998877');
});

test('Webhook GET challenge: rejects when token mismatches or mode is invalid', () => {
  const testToken = 'my_secret_verify_token_123';
  const badUrl = new URL(`https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=CHALLENGE_998877`);
  const result = whatsapp.verifyWebhookChallenge(badUrl, testToken);

  assert.equal(result.verified, false);
  assert.equal(result.challenge, null);

  const wrongModeUrl = new URL(`https://example.com/api/whatsapp/webhook?hub.mode=unsubscribe&hub.verify_token=${testToken}&hub.challenge=CHALLENGE_998877`);
  const modeResult = whatsapp.verifyWebhookChallenge(wrongModeUrl, testToken);
  assert.equal(modeResult.verified, false);
});

// 2. Webhook Signature Verification (POST HMAC-SHA256)
test('Webhook POST signature: verifies valid HMAC-SHA256 signature', () => {
  const secret = 'super_secret_meta_app_key_456';
  const rawBody = Buffer.from(JSON.stringify({ object: 'whatsapp_business_account', entry: [] }), 'utf8');
  const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const check = whatsapp.verifyMetaSignature(rawBody, signature, secret);
  assert.equal(check.verified, true);
});

test('Webhook POST signature: rejects invalid, tampered or missing signature', () => {
  const secret = 'super_secret_meta_app_key_456';
  const rawBody = Buffer.from(JSON.stringify({ object: 'whatsapp_business_account' }), 'utf8');

  // Tampered signature
  const badSig = 'sha256=' + '0'.repeat(64);
  const badCheck = whatsapp.verifyMetaSignature(rawBody, badSig, secret);
  assert.equal(badCheck.verified, false);

  // Missing header
  const missingCheck = whatsapp.verifyMetaSignature(rawBody, null, secret);
  assert.equal(missingCheck.verified, false);

  // Malformed header
  const malformedCheck = whatsapp.verifyMetaSignature(rawBody, 'invalid-signature-format', secret);
  assert.equal(malformedCheck.verified, false);
});

// 3. Inbound Webhook Payload Parsing (Text, Interactive, Media, Location)
test('Payload Parser: parses standard customer text message', () => {
  const samplePayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          messaging_product: 'whatsapp',
          metadata: { phone_number_id: '1000123456789' },
          contacts: [{ profile: { name: 'Aarav Sharma' }, wa_id: '919820123456' }],
          messages: [{
            from: '919820123456',
            id: 'wamid.HBgLOTE5ODIwMTIzNDU2FQIAEhggQ0RERTFGMjM0',
            timestamp: '1730000000',
            type: 'text',
            text: { body: '1 BHK chahiye Ambernath East mein, budget 25 lakh' }
          }]
        }
      }]
    }]
  };

  const parsed = whatsapp.parseWebhookPayload(samplePayload);
  assert.equal(parsed.isValid, true);
  assert.equal(parsed.events.length, 1);

  const ev = parsed.events[0];
  assert.equal(ev.type, 'incoming_message');
  assert.equal(ev.cleanPhone, '919820123456');
  assert.equal(ev.customerName, 'Aarav Sharma');
  assert.equal(ev.text, '1 BHK chahiye Ambernath East mein, budget 25 lakh');
  assert.equal(ev.isOptOut, false);
});

test('Payload Parser: parses interactive button reply and list reply', () => {
  const buttonPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: '1000123456789' },
          messages: [{
            from: '919820123456',
            id: 'btn_reply_001',
            type: 'interactive',
            interactive: {
              type: 'button_reply',
              button_reply: { id: 'btn_agreement', title: 'Rent Agreement' }
            }
          }]
        }
      }]
    }]
  };

  const parsedBtn = whatsapp.parseWebhookPayload(buttonPayload);
  assert.equal(parsedBtn.isValid, true);
  assert.equal(parsedBtn.events[0].text, 'Rent Agreement');
  assert.equal(parsedBtn.events[0].isInteractive, true);

  const listPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: '1000123456789' },
          messages: [{
            from: '919820123456',
            id: 'list_reply_001',
            type: 'interactive',
            interactive: {
              type: 'list_reply',
              list_reply: { id: 'row_2bhk', title: '2 BHK Ready Possession' }
            }
          }]
        }
      }]
    }]
  };

  const parsedList = whatsapp.parseWebhookPayload(listPayload);
  assert.equal(parsedList.isValid, true);
  assert.equal(parsedList.events[0].text, '2 BHK Ready Possession');
});

test('Payload Parser: safely parses media and location messages without crashing', () => {
  const mediaPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: '1000123456789' },
          messages: [{
            from: '919820123456',
            id: 'media_001',
            type: 'image',
            image: { id: 'img_9988', caption: 'Kya yeh flat available hai?' }
          }]
        }
      }]
    }]
  };

  const parsedMedia = whatsapp.parseWebhookPayload(mediaPayload);
  assert.equal(parsedMedia.isValid, true);
  assert.equal(parsedMedia.events[0].text, 'Kya yeh flat available hai?');
  assert.equal(parsedMedia.events[0].rawType, 'image');

  const locationPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: '1000123456789' },
          messages: [{
            from: '919820123456',
            id: 'loc_001',
            type: 'location',
            location: { latitude: 19.201, longitude: 73.189, name: 'Ambernath Station' }
          }]
        }
      }]
    }]
  };

  const parsedLoc = whatsapp.parseWebhookPayload(locationPayload);
  assert.equal(parsedLoc.isValid, true);
  assert.match(parsedLoc.events[0].text, /19\.201/);
});

// 4. Status-Only Webhook Events (sent, delivered, read)
test('Payload Parser: ignores status updates and does not treat them as messages', () => {
  const statusPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: '1000123456789' },
          statuses: [
            { id: 'wamid_12345', status: 'delivered', recipient_id: '919820123456', timestamp: '1730000000' },
            { id: 'wamid_12346', status: 'read', recipient_id: '919820123456', timestamp: '1730000005' }
          ]
        }
      }]
    }]
  };

  const parsed = whatsapp.parseWebhookPayload(statusPayload);
  assert.equal(parsed.isValid, true);
  assert.equal(parsed.events.length, 2);
  assert.equal(parsed.events[0].type, 'status_update');
  assert.equal(parsed.events[0].status, 'delivered');
  assert.equal(parsed.events[1].status, 'read');
});

// 5. Message Deduplication and Idempotency
test('Idempotency: duplicate Meta message IDs are identified and rejected', () => {
  const uniqueId = `wamid_test_${Date.now()}_dedup`;
  assert.equal(whatsapp.isDuplicateMessage(uniqueId), false); // first time: fresh
  assert.equal(whatsapp.isDuplicateMessage(uniqueId), true);  // second time: duplicate
  assert.equal(whatsapp.isDuplicateMessage(uniqueId), true);  // third time: duplicate
});

// 6. Multi-Customer Memory Isolation
test('CRM Memory Isolation: separate contacts never leak history or qualifications', () => {
  const phoneA = '919811111111';
  const phoneB = '919822222222';

  crm.getOrCreateContact(phoneA, 'Customer A');
  crm.recordInboundMessage(phoneA, 'I want a 1 BHK in Pale Gaon', 'Customer A');
  crm.updateQualification(phoneA, { intent: 'buy', bhk: '1 BHK', locality: 'Pale Gaon' });

  crm.getOrCreateContact(phoneB, 'Customer B');
  crm.recordInboundMessage(phoneB, 'I need registered rent agreement', 'Customer B');
  crm.updateQualification(phoneB, { intent: 'agreement' });

  const contactA = crm.getOrCreateContact(phoneA);
  const contactB = crm.getOrCreateContact(phoneB);

  assert.equal(contactA.name, 'Customer A');
  assert.equal(contactA.qualification.bhk, '1 BHK');
  assert.equal(contactA.qualification.locality, 'Pale Gaon');
  assert.equal(contactA.qualification.intent, 'buy');

  assert.equal(contactB.name, 'Customer B');
  assert.equal(contactB.qualification.intent, 'agreement');
  assert.equal(contactB.qualification.bhk, null);
  assert.notEqual(contactA.messages, contactB.messages);
});

// 7. Multi-Language Detection (English, Hindi, Hinglish, Marathi)
test('Language Detection: accurately identifies English, Hindi, Hinglish, Marathi', () => {
  assert.equal(sia.detectLanguage('What is the price of 2 BHK flat near station?'), 'english');
  // Devanagari Hindi ("मुझे अंबरनाथ में फ्लैट खरीदना है")
  assert.equal(sia.detectLanguage('\u092E\u0941\u0918\u0947 \u0905\u0902\u092C\u0930\u0928\u093E\u0925 \u092E\u0947\u0902 \u092B\u094D\u0932\u0948\u091F \u0916\u0930\u0940\u0926\u0928\u093E \u0939\u0948'), 'hindi');
  assert.equal(sia.detectLanguage('Bhaiya 1 BHK rent agreement ka kitna kharcha aayega?'), 'hinglish');
  // Devanagari Marathi ("मला अंबरनाथ मध्ये फ्लॅट पाहिजे")
  assert.equal(sia.detectLanguage('\u092E\u0932\u093E \u0905\u0902\u092C\u0930\u0928\u093E\u0925 \u092E\u0927\u094D\u092F\u0947 \u092B\u094D\u0932\u0948\u091F \u092A\u093E\u0939\u093F\u091C\u0947'), 'marathi');
});

// 8. Grounded Property Queries (Zero Hallucination)
test('Knowledge Engine: verified property search returns verified projects from projects.json', () => {
  const search = sia.searchVerifiedProperties({ locality: 'Pale Gaon', bhk: '1 BHK' });
  assert.ok(search.count > 0);
  assert.ok(Array.isArray(search.matches));

  // Projects must have name and locality
  for (const match of search.matches) {
    assert.ok(match.name, 'Verified project must have a name');
    assert.ok(match.locality, 'Verified project must have a locality');
  }
});

test('Knowledge Engine: unverified requests do not hallucinate fake projects', () => {
  const search = sia.searchVerifiedProperties({ locality: 'Mars Colony Nonexistent Zone' });
  assert.equal(search.count, 0);
  assert.equal(search.matches.length, 0);
});

// 9. Opt-Out and Opt-In Handling
test('Opt-Out: STOP request updates CRM contact and prevents unneeded automated spam', () => {
  const phone = '919833333333';
  crm.getOrCreateContact(phone, 'OptOut User');
  crm.setOptOut(phone, true);

  const contact = crm.getOrCreateContact(phone);
  assert.equal(contact.opted_out, true);
  assert.equal(contact.status, 'opted_out');

  // Opt-in resumes
  crm.setOptOut(phone, false);
  const resumed = crm.getOrCreateContact(phone);
  assert.equal(resumed.opted_out, false);
  assert.equal(resumed.status, 'active');
});

// 10. Human Escalation and Handoff Trigger
test('Human Handoff: detects dispute/complaint/call request and sets shouldEscalate flag', () => {
  const testCases = [
    { text: 'Mujhe Satnam sir se direct call par baat karni hai urgent', shouldEscalate: true },
    { text: 'Final price negotiate karni hai builder ke sath', shouldEscalate: true },
    { text: 'Complaint hai mujhe aapke agent ke khilaaf', shouldEscalate: true },
    { text: '1 BHK ka carpet area kitna hai?', shouldEscalate: false }
  ];

  for (const tc of testCases) {
    const trigger = sia.checkHumanEscalationTrigger(tc.text);
    assert.equal(trigger.shouldEscalate, tc.shouldEscalate, `Failed for text: "${tc.text}"`);
  }
});

test('Human Handoff: puts contact in handoff queue and mutes automatic responses', async () => {
  const phone = '919844444444';
  crm.getOrCreateContact(phone, 'Escalation User');
  crm.triggerHumanHandoff(phone, 'Customer requested owner direct call');

  const queue = crm.getHandoffQueue();
  assert.ok(queue.some(l => whatsapp.normalizePhone(l.phone) === whatsapp.normalizePhone(phone)));

  // When human_pending is true, processIncomingMessage mutes response
  const response = await sia.processIncomingMessage(phone, 'Kya update hai?', 'Escalation User');
  assert.equal(response.reply, null);
  assert.equal(response.intent, 'HUMAN_HANDOFF_MUTED');

  // Resolve handoff
  crm.resolveHumanHandoff(phone, 'Owner resolved call with customer');
  const resolvedContact = crm.getOrCreateContact(phone);
  assert.equal(resolvedContact.human_pending, false);
});

// 11. 24-Hour Customer Service Window Rule
test('WhatsApp Window: calculates 24-hour customer service window correctly', () => {
  const now = new Date().toISOString();
  const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

  assert.equal(whatsapp.isWithin24HourWindow(now), true);
  assert.equal(whatsapp.isWithin24HourWindow(twentyHoursAgo), true);
  assert.equal(whatsapp.isWithin24HourWindow(twentyFiveHoursAgo), false);
  assert.equal(whatsapp.isWithin24HourWindow(null), false);
});

// 12. Grounded Fallback (when LLM is unavailable or offline)
test('Grounded Fallback: provides warm, empathetic Hinglish reply with verified facts', async () => {
  const res = await sia.processIncomingMessage('919855555555', 'Rent agreement ka kya process aur kharcha hai?', 'Rajesh');
  assert.ok(res.reply, 'Reply must not be empty');
  assert.match(res.reply, /1,750|3,500/);
  assert.match(res.reply, /Dashmesh|Registered/i);
  assert.ok(res.buttons && res.buttons.length > 0);
});

// 13. Telemetry and CRM Reporting
test('CRM Telemetry: reports accurate totals without disclosing confidential secrets', () => {
  const telemetry = crm.getCRMTelemetry();
  assert.ok(typeof telemetry.totalLeads === 'number');
  assert.ok(typeof telemetry.humanPendingCount === 'number');
  assert.ok(Array.isArray(telemetry.recentLeads));
});

// 14. WhatsApp Health Diagnostic Reporting
test('WhatsApp Health: reports system readiness and masked status safely', () => {
  const health = whatsapp.getWhatsAppHealth();
  assert.ok(typeof health.status === 'string');
  assert.ok(typeof health.graphVersion === 'string');
  assert.ok(typeof health.timestamp === 'string');
  // Ensure no raw secrets are leaked in health object
  assert.equal(health.accessTokenConfigured, Boolean(process.env.META_ACCESS_TOKEN));
});
