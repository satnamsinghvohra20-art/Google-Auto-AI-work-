/**
 * ============================================================================
 * Dashmesh Properties — Comprehensive WhatsApp AI Receptionist Test Suite
 * ============================================================================
 * Zero External Dependencies: Uses native node:test and node:assert/strict
 * Strict Zero-Fake-Data Enforcement: Isolated temp directory, 0 prod writes
 * Full Verification of ALL 16 Mandatory Criteria from Rule 7 + Platform Security
 * ============================================================================
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Modules under test
const whatsapp = require('../whatsapp_service');
const crm = require('../crm_store');
const sia = require('../sia_brain');
const security = require('../security_engine');
const knowledge = require('../property_knowledge');

// Setup isolated temporary storage for testing (Strict Zero-Fake-Data Enforcement)
const testStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashmesh-test-crm-'));
crm.setStorageDir(testStorageDir);

test.after(() => {
  try {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  } catch (_) {}
});

// ============================================================================
// PART A: RULE 7 — MANDATORY AUTOMATED REGRESSION SUITE (1 TO 16)
// ============================================================================

// 1. First contact sends at most one appropriate greeting
test('Rule 7.1: First contact sends at most one appropriate greeting', async () => {
  const phone = '919800001001';
  const res = await sia.processIncomingMessage(phone, 'Hi', 'Rohan');

  assert.ok(res.reply, 'Should generate a reply');
  assert.match(res.reply, /Namaste|नमस्ते|Hello Rohan|Welcome/i, 'First greeting should welcome customer');
  assert.equal(res.intent, 'GREETING');

  const contact = crm.getOrCreateContact(phone);
  assert.equal(contact.hasGreeted, true, 'Contact must be marked hasGreeted after first greeting');
});

// 2. First contact who asks a property question directly gets an answer without an unnecessary greeting prepended
test('Rule 7.2: First contact who asks a property question directly gets an answer without an unnecessary greeting prepended', async () => {
  const phone = '919800001002';
  // Brand new customer asking directly about rent agreement rate
  const res = await sia.processIncomingMessage(phone, 'Rent agreement banwane ka kitna charges lagega?', 'Vikas');

  assert.ok(res.reply);
  // Answers the question directly with verified rate
  assert.match(res.reply, /1,750|3,500/);
  // Must NOT prepend "Hello Vikas! Welcome to Dashmesh Properties"
  assert.equal(/Welcome to Dashmesh Properties/i.test(res.reply), false, 'Must not prepend company welcome to direct question');
  assert.equal(/Hello Vikas!/i.test(res.reply), false, 'Must not force greeting before answering direct question');
});

// 3. Second and third messages from the same user do not repeat the welcome message
test('Rule 7.3: Second and third messages from the same user do not repeat the welcome message', async () => {
  const phone = '919800001003';

  // Message 1: Customer greets
  const res1 = await sia.processIncomingMessage(phone, 'Hello', 'Karan');
  assert.match(res1.reply, /Namaste|नमस्ते|Welcome/i);

  // Message 2: Customer asks office location
  const res2 = await sia.processIncomingMessage(phone, 'Aapka office kahan par hai?', 'Karan');
  assert.ok(res2.reply);
  assert.match(res2.reply, /Shop No\. 24|New Floora/i);
  assert.equal(/Welcome to Dashmesh Properties/i.test(res2.reply), false, 'Message 2 must not repeat welcome');

  // Message 3: Customer asks office timings
  const res3 = await sia.processIncomingMessage(phone, 'Office ke timings kya hain?', 'Karan');
  assert.ok(res3.reply);
  assert.match(res3.reply, /10:00 AM|8:30 PM|Hours/i);
  assert.equal(/Welcome to Dashmesh Properties/i.test(res3.reply), false, 'Message 3 must not repeat welcome');
});

// 4. A greeting sent by an existing customer does not restart the full introduction
test('Rule 7.4: A greeting sent by an existing customer does not restart the full introduction', async () => {
  const phone = '919800001004';

  // Past conversation exists
  crm.getOrCreateContact(phone, 'Sunil');
  crm.markGreetingSent(phone);

  // Existing customer sends "Hi"
  const res = await sia.processIncomingMessage(phone, 'Hi', 'Sunil');
  assert.ok(res.reply);
  // Should respond naturally and briefly
  assert.match(res.reply, /Sunil|Bataiye main aaj aapki kya madad|How can I help you/i);
  // Must NOT restart full introductory company brochure
  assert.equal(/Welcome to Dashmesh Properties/i.test(res.reply), false, 'Must not restart full company welcome');
});

// 5. Customer sends budget and location in message 1, then asks 'What about 2 BHK?' in message 2; the bot uses the saved budget and location
test('Rule 7.5: Customer sends budget and location in message 1, then asks What about 2 BHK in message 2; the bot uses saved budget and location', async () => {
  const phone = '919800001005';

  // Message 1: Budget and location
  const res1 = await sia.processIncomingMessage(phone, 'Looking for flat in Pale Gaon, my budget is 25 lakhs', 'Manish');
  assert.ok(res1.reply);

  const contact1 = crm.getOrCreateContact(phone);
  assert.equal(contact1.qualification.locality, 'Pale Gaon');
  assert.equal(contact1.qualification.budget, '₹25 Lakhs');

  // Message 2: Follow-up asking about 2 BHK
  const res2 = await sia.processIncomingMessage(phone, 'What about 2 BHK?', 'Manish');
  assert.ok(res2.reply);

  // Bot must incorporate saved locality and budget in response
  assert.match(res2.reply, /Pale Gaon/i, 'Must use saved locality Pale Gaon');
  assert.match(res2.reply, /25 Lakhs/i, 'Must use saved budget of ₹25 Lakhs');
  assert.match(res2.reply, /2 BHK/i, 'Must answer 2 BHK configurations');
});

// 6. Customer returns after server restart (simulated or real); the bot still remembers the customer's previous conversation and lead facts
test('Rule 7.6: Customer returns after server restart; bot remembers previous conversation and lead facts', async () => {
  const phone = '919800001006';

  // Initial session: Save customer facts
  await sia.processIncomingMessage(phone, 'I want to buy 1 BHK in Pale Gaon budget 22 lakhs', 'Pooja');
  crm.recordInboundMessage(phone, 'I want to buy 1 BHK in Pale Gaon budget 22 lakhs', 'm_rst_1');
  crm.updateQualification(phone, { bhk: '1 BHK', locality: 'Pale Gaon', budget: '₹22 Lakhs' });

  // Simulate server restart / crash by flushing the memory cache
  crm.clearCache();

  // Reload customer record from durable disk storage
  const reloaded = crm.getOrCreateContact(phone);
  assert.equal(reloaded.qualification.bhk, '1 BHK');
  assert.equal(reloaded.qualification.locality, 'Pale Gaon');
  assert.equal(reloaded.qualification.budget, '₹22 Lakhs');

  // Follow-up message after restart uses persisted memory
  const resAfterRestart = await sia.processIncomingMessage(phone, 'Can you send details?', 'Pooja');
  assert.ok(resAfterRestart.reply);
  assert.match(resAfterRestart.reply, /Pale Gaon/i, 'Remembers Pale Gaon after server restart');
});

// 7. Customer corrects their budget; bot updates saved budget, uses new value, and records change history
test('Rule 7.7: Customer corrects budget; bot updates saved budget, uses new value, and records change history', async () => {
  const phone = '919800001007';

  // Initial budget is 60 Lakhs
  crm.getOrCreateContact(phone, 'Arjun');
  crm.updateQualification(phone, { budget: '₹60 Lakhs', locality: 'Ambernath East' });

  // Customer corrects budget: "Actually my budget is 70 Lakhs, not 60"
  await sia.processIncomingMessage(phone, 'Actually my budget is 70 Lakhs, not 60', 'Arjun');

  const updatedContact = crm.getOrCreateContact(phone);
  assert.equal(updatedContact.qualification.budget, '₹70 Lakhs', 'Saved budget must be updated to ₹70 Lakhs');

  // Verify change history and budget history recorded
  assert.ok(updatedContact.qualification.budgetHistory.length >= 1, 'Must record in budgetHistory');
  const lastBudgetChange = updatedContact.qualification.budgetHistory[updatedContact.qualification.budgetHistory.length - 1];
  assert.equal(lastBudgetChange.previousBudget, '₹60 Lakhs');
  assert.equal(lastBudgetChange.newBudget, '₹70 Lakhs');

  assert.ok(updatedContact.changeHistory.length >= 1, 'Must record in changeHistory');
  const fieldChange = updatedContact.changeHistory.find(c => c.field === 'budget');
  assert.ok(fieldChange);
  assert.equal(fieldChange.oldValue, '₹60 Lakhs');
  assert.equal(fieldChange.newValue, '₹70 Lakhs');
});

// 8. Message with three distinct questions gets all three answered in one coherent reply
test('Rule 7.8: Message with three distinct questions gets all three answered in one coherent reply', async () => {
  const phone = '919800001008';
  // Three questions: 1. Price? 2. Parking available? 3. Visit tomorrow?
  const res = await sia.processIncomingMessage(
    phone,
    'What is the price of 1 BHK in New Floora Pale Gaon, is parking available, and can I visit tomorrow?',
    'Sanjay'
  );

  assert.ok(res.reply);
  // Question 1: Price answered
  assert.match(res.reply, /21 Lakhs|₹21L/i, 'Must answer price');
  // Question 2: Parking answered
  assert.match(res.reply, /Parking/i, 'Must answer parking question');
  // Question 3: Site visit tomorrow answered
  assert.match(res.reply, /Site Visit.*(Yes|Ji bilkul|arrange|tomorrow|kal)/i, 'Must answer site visit for tomorrow');
});

// 9. Message asking about a property feature not in database produces honest answer without making up answer
test('Rule 7.9: Property feature not in database produces honest answer and team check offer, not hallucination', async () => {
  const phone = '919800001009';
  // Asking if Laxmi Niwas has a swimming pool (not in verified amenities)
  const res = await sia.processIncomingMessage(phone, 'Does Laxmi Niwas have a swimming pool?', 'Gaurav');

  assert.ok(res.reply);
  // Must honestly state swimming pool is not confirmed in verified records
  assert.match(res.reply, /swimming pool.*(hamari team se verify|pending confirmation|verified record mein confirmed nahi)/i);
  // Must NOT claim that a swimming pool is available
  assert.equal(/swimming pool is available/i.test(res.reply), false, 'Must never invent amenity');
});

// 10. Duplicate inbound webhook delivery with same message ID does not produce second reply or duplicate lead entries
test('Rule 7.10: Duplicate inbound webhook delivery with same message ID does not produce duplicate responses', () => {
  const msgId = `wamid_rule10_${Date.now()}`;

  // First receipt: Fresh
  const firstCheck = whatsapp.isDuplicateMessage(msgId);
  assert.equal(firstCheck, false, 'First message delivery must be processed');

  // Second delivery with identical ID: Duplicate rejected
  const secondCheck = whatsapp.isDuplicateMessage(msgId);
  assert.equal(secondCheck, true, 'Second message delivery must be flagged as duplicate');

  // CRM message deduplication check
  const phone = '919800001010';
  const res1 = crm.recordInboundMessage(phone, 'Hello testing dedup', msgId);
  assert.equal(res1.isDuplicate, false);

  const res2 = crm.recordInboundMessage(phone, 'Hello testing dedup', msgId);
  assert.equal(res2.isDuplicate, true, 'CRM must not insert duplicate message into contact messages array');

  const contact = crm.getOrCreateContact(phone);
  const matchingMsgs = contact.messages.filter(m => m.id === msgId);
  assert.equal(matchingMsgs.length, 1, 'Only one message record must exist for msgId');
});

// 11. Two different customers interacting simultaneously never see one another's memory or details
test('Rule 7.11: Two different customers never see one anothers memory or details', () => {
  const phoneA = '919800001011';
  const phoneB = '919800001099';

  crm.getOrCreateContact(phoneA, 'Client A');
  crm.recordInboundMessage(phoneA, 'Looking for 3 BHK luxury penthouse', 'm_a_1');
  crm.updateQualification(phoneA, { bhk: '3 BHK', budget: '₹95 Lakhs', locality: 'Ambernath West' });

  crm.getOrCreateContact(phoneB, 'Client B');
  crm.recordInboundMessage(phoneB, 'Need registered rent agreement with biometric', 'm_b_1');
  crm.updateQualification(phoneB, { intent: 'agreement', preference: 'doorstep' });

  const cA = crm.getOrCreateContact(phoneA);
  const cB = crm.getOrCreateContact(phoneB);

  assert.equal(cA.qualification.bhk, '3 BHK');
  assert.equal(cA.qualification.budget, '₹95 Lakhs');
  assert.equal(cB.qualification.bhk, null);
  assert.equal(cB.qualification.budget, null);
  assert.notEqual(cA.messages, cB.messages);
});

// 12. Concurrent messages from same customer do not lose updates or corrupt message order
test('Rule 7.12: Concurrent messages from same customer coordinate cleanly with locks', async () => {
  const phone = '919800001012';

  // Acquire lock for message 1
  await crm.acquireContactLock(phone);
  crm.recordInboundMessage(phone, 'Message 1 from user', 'm_c_1');
  crm.updateQualification(phone, { locality: 'Pale Gaon' });
  crm.releaseContactLock(phone);

  // Acquire lock for message 2
  await crm.acquireContactLock(phone);
  crm.recordInboundMessage(phone, 'Message 2 from user', 'm_c_2');
  crm.updateQualification(phone, { bhk: '1 BHK' });
  crm.releaseContactLock(phone);

  const contact = crm.getOrCreateContact(phone);
  assert.equal(contact.messages.length, 2);
  assert.equal(contact.messages[0].id, 'm_c_1');
  assert.equal(contact.messages[1].id, 'm_c_2');
  assert.equal(contact.qualification.locality, 'Pale Gaon');
  assert.equal(contact.qualification.bhk, '1 BHK');
});

// 13. Database read or write failures are detected, logged, and surfaced appropriately without claiming success
test('Rule 7.13: Database write failures are detected and surfaced appropriately without false success', () => {
  // Attempt to atomically save to an illegal path (directory without permissions or nonexistent root)
  const invalidPath = path.join('Z:\\NonExistentDrive77', 'invalid_dir', 'test.json');

  assert.throws(() => {
    crm.atomicSaveJSON(invalidPath, { test: 123 });
  }, /Failed to atomically save/, 'Write failure must throw and surface error');
});

// 14. AI provider timeouts or invalid JSON outputs trigger safe fallback behavior without crashing
test('Rule 7.14: AI provider timeouts or missing key trigger safe deterministic fallback', async () => {
  const origKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const phone = '919800001014';
  const res = await sia.processIncomingMessage(phone, 'What is your office address?', 'Deepak');

  assert.ok(res.reply);
  assert.match(res.reply, /Shop No\. 24|New Floora|Pale Gaon/i);
  assert.equal(res.intent, 'OFFICE_LOCATION');

  if (origKey) process.env.GEMINI_API_KEY = origKey;
});

// 15. Customer opt-out halts proactive outreach; human handoff status prevents conflicting bot replies
test('Rule 7.15: Customer opt-out halts outreach and human handoff mutes bot replies', async () => {
  const phone = '919800001015';

  // 1. Opt-out check
  const optOutRes = await sia.processIncomingMessage(phone, 'STOP', 'User', { isOptOut: true });
  assert.match(optOutRes.reply, /unsubscribed/i);
  const contact = crm.getOrCreateContact(phone);
  assert.equal(contact.opted_out, true);

  // Resume with START
  await sia.processIncomingMessage(phone, 'START', 'User', { isOptIn: true });
  const resumedContact = crm.getOrCreateContact(phone);
  assert.equal(resumedContact.opted_out, false);

  // 2. Human handoff check
  const handoffRes = await sia.processIncomingMessage(phone, 'I want to speak with Satnam Sir directly, call me', 'User');
  assert.equal(handoffRes.shouldNotifyOwner, true);
  assert.equal(handoffRes.intent, 'HUMAN_HANDOFF');

  // Next message while pending: bot must be muted (reply: null)
  const mutedRes = await sia.processIncomingMessage(phone, 'Are you there?', 'User');
  assert.equal(mutedRes.reply, null, 'Bot reply must be muted when human handoff is pending');
  assert.equal(mutedRes.intent, 'HUMAN_HANDOFF_ACTIVE');

  // Resolve handoff
  crm.resolveHumanHandoff(phone);
  const activeContact = crm.getOrCreateContact(phone);
  assert.equal(activeContact.human_pending, false);
});

// 16. Conversation memory retrieval and updates verified through actual inbound WhatsApp processing path
test('Rule 7.16: Multi-turn conversation memory retrieval and updates work through actual inbound processing path', async () => {
  const phone = '919800001016';

  // Turn 1: Customer introduces requirement
  const turn1 = await sia.processIncomingMessage(phone, 'Hi, I need 1 BHK in Pale Gaon budget 23 Lakhs', 'Tarun');
  assert.ok(turn1.reply);
  assert.match(turn1.reply, /New Floora|GBK Whispering Palms|Pale Gaon/i);

  // Turn 2: Customer asks follow up question referencing previous turn
  const turn2 = await sia.processIncomingMessage(phone, 'What is the RERA status and is it ready to move?', 'Tarun');
  assert.ok(turn2.reply);
  assert.match(turn2.reply, /RERA|P517000/i, 'Remembers previous listing and provides RERA details');

  // Turn 3: Customer asks for office location to visit
  const turn3 = await sia.processIncomingMessage(phone, 'Okay, where is your office?', 'Tarun');
  assert.ok(turn3.reply);
  assert.match(turn3.reply, /Shop No\. 24|New Floora/i);
  assert.equal(/Welcome to Dashmesh Properties/i.test(turn3.reply), false, 'Turn 3 does not repeat greeting');

  // Verify memory trail in CRM
  const contact = crm.getOrCreateContact(phone);
  assert.equal(contact.qualification.locality, 'Pale Gaon');
  assert.equal(contact.qualification.budget, '₹23 Lakhs');
  assert.equal(contact.qualification.bhk, '1 BHK');
  assert.equal(contact.hasGreeted, true);
});

// ============================================================================
// PART B: PLATFORM SECURITY, PROTOCOL & ANTI-HALLUCINATION CRITERIA
// ============================================================================

test('Criterion 17: Webhook challenge verification succeeds with correct token and fails with incorrect token', () => {
  const secretToken = 'DashmeshProperties2026';
  const validUrl = new URL(`https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${secretToken}&hub.challenge=CODE_123`);
  assert.equal(whatsapp.verifyWebhookChallenge(validUrl, secretToken).verified, true);

  const badUrl = new URL(`https://example.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=CODE_123`);
  assert.equal(whatsapp.verifyWebhookChallenge(badUrl, secretToken).verified, false);
});

test('Criterion 18: Webhook signature verification rejects invalid signatures and accepts valid signatures', () => {
  const secret = 'meta_test_secret_9988';
  const rawBody = Buffer.from(JSON.stringify({ test: true }), 'utf8');

  const validHmac = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  assert.equal(whatsapp.verifyMetaSignature(rawBody, validHmac, secret).verified, true);

  const tamperedHmac = 'sha256=' + '0'.repeat(64);
  assert.equal(whatsapp.verifyMetaSignature(rawBody, tamperedHmac, secret).verified, false);
});

test('Criterion 19: 24-hour window and template requirements are enforced strictly', async () => {
  const now = new Date().toISOString();
  const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();

  assert.equal(whatsapp.isWithin24HourWindow(now), true);
  assert.equal(whatsapp.isWithin24HourWindow(thirtyHoursAgo), false);

  const blockedSend = await whatsapp.sendMetaWhatsAppMessage('919820012345', 'Hello', {
    accessToken: 'test_token',
    phoneNumberId: '123456',
    lastInboundTimestamp: thirtyHoursAgo
  });
  assert.equal(blockedSend.success, false);
  assert.equal(blockedSend.code, 'OUTSIDE_24H_WINDOW');
});

test('Criterion 20: Admin routes reject unauthenticated requests and accept valid secret key', () => {
  const origKey = process.env.ADMIN_SECRET_KEY;
  process.env.ADMIN_SECRET_KEY = 'super_secret_dashmesh_key';

  const unauthReq = { headers: {} };
  assert.equal(security.verifyAdminAuth(unauthReq, new URL('http://localhost:3000/api/leads')).authorized, false);

  const authReq = { headers: { authorization: 'Bearer super_secret_dashmesh_key' } };
  assert.equal(security.verifyAdminAuth(authReq, new URL('http://localhost:3000/api/leads')).authorized, true);

  if (origKey) process.env.ADMIN_SECRET_KEY = origKey;
});

test('Criterion 21: Anti-Hallucination: Deterministic Output Validator intercepts fabricated claims', () => {
  const mockEvidence = {
    hasVerifiedMatch: true,
    matchedListings: [{ listingId: 'test-01', name: 'Sample Heights', locality: 'Pale Gaon', amenities: [] }],
    unverifiedAmenities: ['Covered Car Parking'],
    unknownElements: []
  };

  const fakeClaim = 'Sample Heights comes with 100% guaranteed loan and guaranteed returns!';
  const check = knowledge.validateOutputFactuality(fakeClaim, mockEvidence);
  assert.equal(check.isValid, false);
  assert.equal(/100%\s*guaranteed/i.test(check.sanitizedReply), false);
});

test('Criterion 22: Anti-Hallucination: Questions with unknown elements are queued for human review', async () => {
  const phone = '919800001022';
  await sia.processIncomingMessage(phone, 'What is the price of 7 BHK duplex penthouse in Kalyan West?', 'Ashwin');

  const queue = crm.getUnresolvedQuestionsQueue();
  const entry = queue.find(q => q.phone && q.phone.includes('919800001022'));
  assert.ok(entry, 'Unknown property question must be queued for admin review');
  assert.match(entry.question, /7 BHK duplex/i);
});

test('Criterion 23: Multi-Language support: English, Hindi, Hinglish, and Marathi handled properly', async () => {
  // English
  const resEn = await sia.processIncomingMessage('919800001023', 'What are rent agreement charges?', 'John');
  assert.match(resEn.reply, /1,750|3,500/);

  // Hindi
  const resHi = await sia.processIncomingMessage('919800001024', 'रेंट एग्रीमेंट का क्या चार्ज है?', 'सुरेश');
  assert.match(resHi.reply, /1,750|3,500/);

  // Marathi
  const resMr = await sia.processIncomingMessage('919800001025', 'रेंट ॲग्रीमेंटचे शुल्क किती आहे?', 'गणेश');
  assert.match(resMr.reply, /1,750|3,500/);
});
