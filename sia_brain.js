/**
 * ============================================================================
 * Dashmesh Properties — Sia AI Conversation Brain & Knowledge Engine
 * Production-Ready, Grounded Real Estate AI Assistant
 * ============================================================================
 * Zero Hallucination Policy: Verified Listings Only | Multi-Language Support
 * Strictly Enforces Rule 1 (No repetitive greetings), Rule 2 (Complete answers),
 * Rule 3 (Persistent Memory), Rule 4 (Isolation), and Rule 6 (System Prompt).
 */

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const crm = require('./crm_store');

const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Cache verified projects
let verifiedProjectsCache = null;

function loadVerifiedProjects() {
  if (verifiedProjectsCache) return verifiedProjectsCache;
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, 'utf8').replace(/^\uFEFF/, '');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Clean encoding of rupee symbol
        verifiedProjectsCache = parsed.map(p => ({
          ...p,
          startingPrice: (p.startingPrice || '').replace(/Γé╣/g, '₹'),
          priceRange: (p.priceRange || '').replace(/Γé╣/g, '₹'),
          rateSqFt: (p.rateSqFt || p.ratePerSqFt || '').replace(/Γé╣/g, '₹')
        }));
        return verifiedProjectsCache;
      }
    }
  } catch (err) {
    console.warn('[Sia Brain] Notice loading projects.json:', err.message);
  }
  verifiedProjectsCache = [];
  return verifiedProjectsCache;
}

/**
 * Verified Business Profile
 */
const BUSINESS_FACTS = {
  name: 'Dashmesh Property & Rent Agreement Services',
  shortName: 'Dashmesh Properties',
  assistant: 'Sia',
  founder: 'Satnam Singh Vohra (+91 84210 77613)',
  partners: [
    'Sukhjyot Singh Vohra (+91 84219 40013)',
    'Kuldeep Singh Vohra (+91 84120 70183)'
  ],
  officeAddress: 'Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501',
  officeLandmark: 'Near Pale Gaon Bus Stop, 7 mins from Ambernath East Railway Station',
  officeTimings: '10:00 AM to 8:30 PM (All 7 Days Open)',
  officeMapUrl: 'https://maps.app.goo.gl/kba8E8rqdRiv6xL8A',
  services: [
    'Residential Property Buying & Selling (1 RK, 1 BHK, 2 BHK, 3 BHK)',
    'Commercial Shops & Office Spaces',
    'Doorstep Biometric Registered Rent Agreement (Maharashtra Rent Control Act §55)',
    '90% Bank Home Loan Assistance (SBI, HDFC, Bank of Baroda, ICICI, Axis Bank)'
  ],
  rentAgreement: {
    law: 'Section 55, Maharashtra Rent Control Act, 1999',
    costPerSide: '₹1,750 per side',
    totalCost: '₹3,500 all-inclusive (Government stamp duty, registration fee, drafting, and doorstep biometric visit included)',
    turnaround: '24 to 48 hours for Govt Registered PDF delivery on WhatsApp',
    documentsNeeded: {
      owner: 'Aadhaar Card, PAN Card, Electricity Bill / Index II copy',
      tenant: 'Aadhaar Card, PAN Card, Passport Size Photo',
      witnesses: '2 Witnesses with Aadhaar Cards'
    }
  }
};

/**
 * Detect Language from Text
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'hinglish';
  const clean = text.toLowerCase();

  // Devanagari script detection (Hindi vs Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    if (/(\u0906\u0939\u0947|\u092A\u093E\u0939\u093F\u091C\u0947|\u0915\u0941\u0920\u0947|\u0915\u093F\u0924\u0940|\u0926\u094D\u092F\u093E|\u0928\u092E\u0938\u094D\u0915\u093E\u0930)/.test(text)) {
      return 'marathi';
    }
    return 'hindi';
  }

  // Marathi specific tokens (Latin)
  if (/\b(aahe|ahet|kiti|kuthe|havay|pahije|dya|bhav|ghya|namaskar|kasa|kay)\b/.test(clean)) {
    return 'marathi';
  }

  const hasHindi = /\b(namaste|pranam|kripya|chahiye|kitna|kaise|bataiye|kahan|hai|shubh|bhaiya|aapka|karo|batao|mein|ka|ki|ke|kharcha)\b/.test(clean);
  const hasEnglish = /\b(looking|property|available|price|bedroom|flat|apartment|agreement|please|details|schedule|visit|cost|rent|bhk|budget|call)\b/.test(clean);

  if (hasHindi && hasEnglish) {
    return 'hinglish';
  }
  if (hasHindi) {
    return 'hindi';
  }
  if (hasEnglish) {
    return 'english';
  }

  return 'hinglish';
}

/**
 * Search verified properties strictly from projects.json
 */
function searchVerifiedProperties(criteria = {}) {
  const projects = loadVerifiedProjects();
  if (!projects || projects.length === 0) {
    return { count: 0, matches: [], verified: false };
  }

  const queryLocality = (criteria.locality || '').toLowerCase().trim();
  const queryBhk = (criteria.bhk || '').toLowerCase().trim();
  const queryMaxBudgetLakhs = parseFloat(criteria.maxBudgetLakhs) || 0;

  const matches = projects.filter(p => {
    // Locality match
    if (queryLocality) {
      const pRegion = (p.region || '').toLowerCase();
      const pSubArea = (p.subArea || '').toLowerCase();
      const pLocality = (p.locality || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const locMatch = pRegion.includes(queryLocality) || pSubArea.includes(queryLocality) || pLocality.includes(queryLocality) || pName.includes(queryLocality);
      if (!locMatch) return false;
    }

    // BHK / Config match
    if (queryBhk) {
      const configs = (p.configurations || []).map(c => c.toLowerCase());
      const bhkMatch = configs.some(c => c.includes(queryBhk));
      if (!bhkMatch) return false;
    }

    // Budget match
    if (queryMaxBudgetLakhs > 0) {
      const priceStr = (p.startingPrice || p.priceRange || '');
      const matchNum = priceStr.match(/(\d+(\.\d+)?)/);
      if (matchNum) {
        const startingLakhs = parseFloat(matchNum[1]);
        if (startingLakhs > queryMaxBudgetLakhs * 1.15) { // 15% margin
          return false;
        }
      }
    }

    return true;
  });

  return {
    count: matches.length,
    matches: matches.slice(0, 3), // Return top 3 verified matches
    verified: true
  };
}

/**
 * Check if the message contains human escalation triggers
 */
function checkHumanEscalationTrigger(text) {
  if (!text || typeof text !== 'string') return { shouldEscalate: false };
  const clean = text.toLowerCase();

  // 1. Explicit request to speak to a person / direct call / owner
  if (/(satnam|sukhjyot|kuldeep|owner|manager|sir)\s.*(baat|call)/i.test(clean) ||
      /(talk to human|speak to agent|call me|call karo|phone karo|real person|human agent|executive call|customer care)/i.test(clean) ||
      /(direct call|urgent call)/i.test(clean)) {
    return { shouldEscalate: true, reason: 'Customer requested direct human conversation' };
  }

  // 2. Negotiations / special discounts / price cuts
  const negKeywords = [
    'final price',
    'discount do',
    'rate kam karo',
    'kam karo na',
    'itna budget nahi hai kam karo',
    'bargain',
    'negotiation',
    'last price kitna'
  ];
  if (negKeywords.some(k => clean.includes(k))) {
    return { shouldEscalate: true, reason: 'Price negotiation or special discount requested' };
  }

  // 3. Disputes / complaints / legal issues
  const disputeKeywords = [
    'fraud',
    'complaint',
    'cheat',
    'police',
    'consumer court',
    'illegal',
    'dispute',
    'dhoka'
  ];
  if (disputeKeywords.some(k => clean.includes(k))) {
    return { shouldEscalate: true, reason: 'Dispute, complaint, or legal inquiry' };
  }

  return { shouldEscalate: false };
}

/**
 * Parse budget numeric value in Lakhs
 */
function parseBudgetNumeric(text) {
  if (!text) return null;
  const clean = text.toLowerCase();
  const m = clean.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore|k|thousand)?/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const unit = (m[2] || 'lakh').toLowerCase();

  if (unit.startsWith('cr')) return num * 100;
  if (unit === 'k' || unit === 'thousand') return num / 100;
  return num; // in Lakhs
}

/**
 * Extract volunteered lead qualification details from customer input
 */
function extractQualificationData(text, existingQual = {}) {
  const updates = {};
  if (!text || typeof text !== 'string') return updates;
  const clean = text.toLowerCase();

  // Intent
  if (/\b(rent agreement|agreement|biometric|police verification)\b/.test(clean)) {
    updates.intent = 'agreement';
  } else if (/\b(buy|purchase|kharidna|lena hai|khareed)\b/.test(clean)) {
    updates.intent = 'buy';
  } else if (/\b(rent pe chahiye|kiraya|bhadya|rent)\b/.test(clean)) {
    updates.intent = 'rent';
  } else if (/\b(sell|bechna|sale karni)\b/.test(clean)) {
    updates.intent = 'sell';
  } else if (/\b(commercial|shop|dukaan|office space)\b/.test(clean)) {
    updates.intent = 'commercial';
  }

  // Locality
  if (/\b(pale gaon|pale)\b/.test(clean)) updates.locality = 'Pale Gaon';
  else if (/\b(ambernath east|ambernath e)\b/.test(clean)) updates.locality = 'Ambernath East';
  else if (/\b(ambernath west|ambernath w)\b/.test(clean)) updates.locality = 'Ambernath West';
  else if (/\b(badlapur)\b/.test(clean)) updates.locality = 'Badlapur';
  else if (/\b(kalyan)\b/.test(clean)) updates.locality = 'Kalyan';
  else if (/\b(ulhasnagar)\b/.test(clean)) updates.locality = 'Ulhasnagar';

  // BHK / Size
  if (/\b1\s*rk\b/.test(clean)) updates.bhk = '1 RK';
  else if (/\b1\s*bhk\b/.test(clean)) updates.bhk = '1 BHK';
  else if (/\b2\s*bhk\b/.test(clean)) updates.bhk = '2 BHK';
  else if (/\b3\s*bhk\b/.test(clean)) updates.bhk = '3 BHK';
  else if (/\bshop|commercial\b/.test(clean)) updates.bhk = 'Commercial Shop';

  // Budget and budget correction
  const budgetMatch = clean.match(/(?:budget|under|upto|ke andar|actually|make it|ab|now)?\s*(\d{1,3}(?:\.\d+)?)\s*(lakh|lac|cr|crore|k)/i);
  if (budgetMatch) {
    const rawNum = budgetMatch[1];
    const unit = budgetMatch[2].toLowerCase();
    updates.budget = `${rawNum} ${unit.startsWith('cr') ? 'Cr' : 'Lakhs'}`;
    updates.budgetNumeric = parseBudgetNumeric(updates.budget);
  }

  // Preference (Call or Site Visit)
  if (/\b(site visit|visit|dekhne aana|aakar dekhna|visit tomorrow|kal visit)\b/.test(clean)) {
    updates.preference = 'site_visit';
    updates.siteVisitRequested = true;
  } else if (/\b(call|phone pe baat|call back)\b/.test(clean)) {
    updates.preference = 'call';
    updates.callbackRequested = true;
  }

  return updates;
}

/**
 * Decompose incoming customer query into distinct parts for complete answering (Rule 2)
 */
function decomposeCustomerQuery(text) {
  if (!text || typeof text !== 'string') {
    return {
      hasGreeting: false,
      isGreetingOnly: false,
      parts: []
    };
  }

  const clean = text.toLowerCase().trim();

  // Greeting analysis
  const greetingWords = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'pranam', 'good morning', 'good afternoon', 'good evening'];
  const hasGreeting = greetingWords.some(w => clean.startsWith(w) || clean.includes(` ${w} `) || clean === w);

  // Check if text is ONLY a greeting without substantive question
  const strippedGreeting = clean.replace(/^(hi|hello|hey|namaste|namaskar|pranam|good\s*(morning|afternoon|evening))[!.,\s]*/i, '').trim();
  const isGreetingOnly = hasGreeting && (strippedGreeting.length === 0 || strippedGreeting === 'sia' || strippedGreeting === 'sir');

  const parts = [];

  // Part: Rent Agreement
  if (/\b(rent agreement|agreement|biometric|police verification|stamp duty|drafting|agreement charges|agreement fee|agreement cost)\b/.test(clean)) {
    parts.push({
      type: 'RENT_AGREEMENT',
      question: 'Rent agreement fees, process, or documents'
    });
  }

  // Part: Property Inquiry / Search / Availability / BHK / Locality / Budget
  if (/\b(flat|property|1bhk|2bhk|3bhk|1rk|bhk|plot|shop|house|ghar|room|options|available|starting price|projects|pale gaon|ambernath)\b/.test(clean)) {
    parts.push({
      type: 'PROPERTY_SEARCH',
      question: 'Property availability, price, or configurations'
    });
  }

  // Part: Office Location / Address / Timings
  if (/\b(kahan hai|address|office|timing|timings|location|maps|pata|office kahan)\b/.test(clean)) {
    parts.push({
      type: 'OFFICE_LOCATION',
      question: 'Office location, address, or operating timings'
    });
  }

  // Part: Home Loan
  if (/\b(loan|home loan|bank loan|sbi|hdfc|sanction|finance|funding)\b/.test(clean)) {
    parts.push({
      type: 'HOME_LOAN',
      question: 'Bank loan pre-approval and funding'
    });
  }

  // Part: Site Visit / Booking / Consultation
  if (/\b(site visit|visit|kal|tomorrow|dekhna|appointment|meeting|satnam sir se baat)\b/.test(clean)) {
    parts.push({
      type: 'SITE_VISIT',
      question: 'Site visit scheduling or personal appointment'
    });
  }

  // Part: Follow-up references ("What is the price?", "Is it available?", "What about parking?", "Can I visit tomorrow?")
  if (/\b(what is the price|price kitna|is it available|available hai|parking|amenities|possession|kal dekh sakte hain|visit tomorrow)\b/.test(clean) && parts.length === 0) {
    parts.push({
      type: 'FOLLOW_UP_REFERENCE',
      question: 'Follow-up query on previously discussed property'
    });
  }

  // Part: Budget Correction
  if (/\b(actually|make it|change my budget|budget is now|ab budget|badha ke)\b/.test(clean)) {
    parts.push({
      type: 'BUDGET_CORRECTION',
      question: 'Customer updated their budget preference'
    });
  }

  return {
    hasGreeting,
    isGreetingOnly,
    parts
  };
}

/**
 * Determine the next qualification question to ask naturally (at most 1)
 */
function getNextQualificationPrompt(qualification, lang = 'hinglish') {
  if (!qualification.intent) {
    if (lang === 'english') return 'Are you looking to buy, rent, sell, or do you need a registered rent agreement?';
    if (lang === 'marathi') return 'तुम्हाला फ्लॅट खरेदी करायचा आहे, भाड्याने हवा आहे, की नोंदणीकृत भाडेकरार करायचा आहे?';
    return 'Aap property buy karna chahte hain, rent pe lena chahte hain, ya registered rent agreement karwana hai?';
  }

  if (qualification.intent === 'agreement') {
    return null; // Rent agreement has a fixed package, no lengthy sales questionnaire
  }

  if (!qualification.locality) {
    if (lang === 'english') return 'Which preferred locality in Ambernath or nearby areas (Pale Gaon, Kansai, Morivali) are you considering?';
    if (lang === 'marathi') return 'अंबरनाथमध्ये कोणती जागा (पाले गाव, कान्साई, किंवा इतर परिसर) तुम्हाला आवडेल?';
    return 'Aapka preferred area kaunsa hai — Pale Gaon, Ambernath East station side, ya koi specific location?';
  }

  if (!qualification.bhk) {
    if (lang === 'english') return 'What configuration are you planning for — 1 RK, 1 BHK, 2 BHK, or a commercial shop?';
    return 'Aap kis type ki property dekh rahe hain — 1 RK, 1 BHK, 2 BHK ya Commercial Shop?';
  }

  if (!qualification.budget) {
    if (lang === 'english') return 'What approximate budget range do you have in mind?';
    return 'Aapka approximate budget range kya hai taaki main sabse accurate options dikha sakoon?';
  }

  if (!qualification.preference) {
    if (lang === 'english') return 'Would you prefer a free doorstep site visit this weekend or a direct consultation call with Satnam Sir?';
    return 'Kya aap weekend par ek free site visit plan karna chahenge ya pehle Satnam Sir se phone call par baat karenge?';
  }

  return null;
}

/**
 * Call Google Gemini Generative AI API with official supported schema & Rule 6 Prompt
 */
async function callGemini(promptText, customerName, conversationHistory, context = {}) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    return null; // Fallback to local grounded knowledge engine
  }

  // Exact prompt mandated by Rule 6 with ground-truth facts
  const systemPrompt = `You are Sia AI, the helpful WhatsApp assistant for Dashmesh Properties. Do not greet customers repeatedly. Read the latest message and the relevant stored conversation context before responding. Answer the customer's actual questions directly and completely using verified knowledge. Remember relevant customer preferences and lead details across conversations through the persistent memory system. Never invent facts. If information is missing, explain that clearly and ask a useful question or offer human follow-up. Do not ask for information the customer already provided. Never claim an action or database update succeeded unless it actually succeeded.

GROUND-TRUTH BUSINESS FACTS:
- Business: Dashmesh Property & Rent Agreement Services
- Office: Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501
- Founder: Satnam Singh Vohra (+91 84210 77613)
- Timings: 10:00 AM to 8:30 PM (All 7 Days Open)
- Maps Link: https://maps.app.goo.gl/kba8E8rqdRiv6xL8A
- Rent Agreement: ₹1,750 per side / ₹3,500 total all-inclusive (Maharashtra Rent Control Act Section 55). Includes Govt stamp duty, registration fee, drafting, and doorstep biometric visit.
- Home Loans: Up to 90% pre-sanction from SBI, HDFC, Bank of Baroda.

CONVERSATION & GREETING RULES:
1. GREETING RULE: If this is an ongoing chat (messages exist), DO NOT say Hello, Hi, Namaste, or introduce the company. Jump directly into answering the question.
2. If the user asked a question directly on their first message, answer the question directly. Do not waste space on promotional welcomes.
3. MULTI-PART QUESTIONS: If the customer asks multiple questions (e.g. rent agreement AND property prices AND office address), answer EVERY PART clearly using bullet points.
4. FOLLOW-UP REFERENCES: If the customer asks "What is the price?", "Is it available?", or "Can I visit tomorrow?", interpret "it" using the previously discussed property in the conversation memory.
5. If budget was updated by the customer, acknowledge the updated budget and use the new budget.`;

  const contents = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  // Structured lead memory injected as context
  let memoryHeader = '';
  if (context.qualification) {
    const q = context.qualification;
    memoryHeader += `[CUSTOMER MEMORY & SAVED FACTS]:\n`;
    if (q.intent) memoryHeader += `- Intent: ${q.intent}\n`;
    if (q.locality) memoryHeader += `- Preferred Locality: ${q.locality}\n`;
    if (q.bhk) memoryHeader += `- Preferred BHK: ${q.bhk}\n`;
    if (q.budget) memoryHeader += `- Current Budget: ${q.budget}\n`;
    if (q.budgetHistory && q.budgetHistory.length > 0) {
      memoryHeader += `- Budget Revisions: ${q.budgetHistory.map(b => `${b.previousBudget} -> ${b.newBudget}`).join(', ')}\n`;
    }
    if (context.propertiesDiscussed && context.propertiesDiscussed.length > 0) {
      memoryHeader += `- Previously Discussed Properties: ${context.propertiesDiscussed.map(p => p.name).join(', ')}\n`;
    }
    if (context.isOngoing) {
      memoryHeader += `- Status: ONGOING CONVERSATION. DO NOT REPEAT GREETING OR INTRODUCTION.\n`;
    }
  }

  // Add verified property database matches
  if (context.propertyMatches && context.propertyMatches.length > 0) {
    const listSnippet = context.propertyMatches.map((p, i) =>
      `${i + 1}. ${p.name} (${p.subArea || p.region}) — ${p.configurations?.join(', ')} | Starts: ${p.startingPrice} | RERA: ${p.reraNumber} | Status: ${p.status}`
    ).join('\n');
    memoryHeader += `\n[VERIFIED SYSTEM PROPERTY DATABASE MATCHES]:\n${listSnippet}\n`;
  }

  const finalUserPrompt = memoryHeader ? `${memoryHeader}\n[LATEST CUSTOMER MESSAGE]:\n${promptText}` : promptText;

  contents.push({
    role: 'user',
    parts: [{ text: finalUserPrompt }]
  });

  const payload = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 800,
      topP: 0.85
    }
  });

  return new Promise((resolve) => {
    try {
      const endpoint = `/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 9000 // 9s timeout
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const parsed = JSON.parse(body);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text && text.trim().length > 5) {
                return resolve(text.trim());
              }
            }
            resolve(null);
          } catch (_) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.write(payload);
      req.end();
    } catch (_) {
      resolve(null);
    }
  });
}

/**
 * Generate a Grounded Complete Response answering EVERY question asked (Rules 1 & 2)
 */
function generateGroundedFallback(text, customerName, contact, lang = 'hinglish') {
  const queryDecomp = decomposeCustomerQuery(text);
  const q = contact.qualification || {};
  const isOngoing = Boolean(contact.hasGreeted || (contact.messages && contact.messages.length > 1));
  const nameSal = customerName && customerName !== 'Client' && customerName !== 'Customer' ? `${customerName} ji` : '';

  // Rule 1: First contact says ONLY a greeting
  if (!isOngoing && queryDecomp.isGreetingOnly) {
    if (lang === 'english') {
      return `Hello ${nameSal}! Welcome to Dashmesh Properties. I am Sia, your real estate assistant. 💖\n\nHow can I help you today? Are you looking to buy, rent, or do you need a registered rent agreement?`;
    }
    return `Namaste ${nameSal}! Dashmesh Properties mein aapka swagat hai. Main Sia hoon, aapki real estate assistant. 💖\n\nMain aapki kya madad kar sakti hoon? Aap property buy karna chahte hain, rent pe lena chahte hain, ya registered rent agreement karwana hai?`;
  }

  // Answer accumulator to answer ALL parts of the customer's query (Rule 2)
  const answers = [];

  // Prefix greeting handling (Rule 1)
  if (isOngoing && queryDecomp.hasGreeting) {
    // Existing customer said "Hi" / "Namaste" - respond with brief polite recognition, NO company intro
    if (lang === 'english') answers.push(`Hello ${nameSal}!`);
    else answers.push(`Ji ${nameSal}!`);
  }

  // Part: Budget correction acknowledgment
  if (queryDecomp.parts.some(p => p.type === 'BUDGET_CORRECTION') && q.budget) {
    answers.push(`Noted! Maine aapka updated budget *${q.budget}* record kar liya hai. 🎯`);
  }

  // Part: Rent Agreement
  if (queryDecomp.parts.some(p => p.type === 'RENT_AGREEMENT')) {
    if (lang === 'english') {
      answers.push(
        `📜 *Official Registered Rent Agreement Service:*\n` +
        `• *Pricing:* ₹1,750 per side (₹3,500 all-inclusive package)\n` +
        `• *Service:* Doorstep Biometric visit at your convenient time\n` +
        `• *Govt Compliance:* Section 55 Maharashtra Rent Control Act with police verification\n` +
        `• *Documents:* Owner & Tenant Aadhaar, PAN card, plus 2 witnesses\n` +
        `• *Delivery:* Govt registered PDF on WhatsApp within 24-48 hours`
      );
    } else {
      answers.push(
        `📜 *Dashmesh Properties Registered Rent Agreement:*\n` +
        `• *Fees:* ₹1,750 per side / ₹3,500 total all-inclusive (Stamp duty, drafting aur doorstep biometric visit included)\n` +
        `• *Documents:* Owner aur Tenant ka Aadhaar + PAN card aur 2 witnesses\n` +
        `• *Process:* Hamari team biometric scanner leke aapke ghar aati hai\n` +
        `• *Delivery:* 24-48 ghante mein verified Govt registered PDF WhatsApp par!`
      );
    }
  }

  // Part: Property Inquiry / Search / Follow-up Reference
  const needsPropertyAnswer = queryDecomp.parts.some(p => p.type === 'PROPERTY_SEARCH' || p.type === 'FOLLOW_UP_REFERENCE');
  if (needsPropertyAnswer) {
    const searchLocality = q.locality || 'Pale Gaon';
    const searchBhk = q.bhk;
    const searchBudgetNum = q.budgetNumeric;

    const propertySearch = searchVerifiedProperties({
      locality: searchLocality,
      bhk: searchBhk,
      maxBudgetLakhs: searchBudgetNum
    });

    if (propertySearch.count > 0) {
      const topProjects = propertySearch.matches;
      const projectLines = topProjects.map(p =>
        `• *${p.name}* (${p.subArea || p.region}): ${(p.configurations || []).join(', ')} | Starts: *${p.startingPrice}* | RERA: ${p.reraNumber}`
      ).join('\n');

      answers.push(
        `🏡 *Hamare Verified Property Options (${searchLocality}${searchBhk ? ' - ' + searchBhk : ''}):*\n` +
        `${projectLines}\n` +
        `• 90% SBI / HDFC Bank loan pre-approved tie-up`
      );
    } else {
      // Explain what is unknown and offer confirmation from Satnam Sir (Rule 2.5 & 2.6)
      answers.push(
        `🏡 *Property Inquiry:* Hamare paas ${searchLocality} ke liye fresh verified listings Satnam Sir confirm kar rahe hain. Team aapse verified options share karegi.`
      );
    }
  }

  // Part: Office Location
  if (queryDecomp.parts.some(p => p.type === 'OFFICE_LOCATION')) {
    answers.push(
      `🏢 *Dashmesh Properties Office Details:*\n` +
      `• *Pata:* Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501\n` +
      `• *Samay:* Subah 10:00 AM se raat 8:30 PM (All 7 Days Open)\n` +
      `• *Landmark:* Near Pale Gaon Bus Stop (Station se 7 min)\n` +
      `• *Google Maps:* https://maps.app.goo.gl/kba8E8rqdRiv6xL8A\n` +
      `• *Contact:* Satnam Singh Vohra (+91 84210 77613)`
    );
  }

  // Part: Home Loan
  if (queryDecomp.parts.some(p => p.type === 'HOME_LOAN')) {
    answers.push(
      `🏦 *Home Loan Desk:* Hamara SBI, HDFC, Bank of Baroda aur ICICI ke saath direct tie-up hai. Up to 90% in-principle loan sanction assistance provide karte hain.`
    );
  }

  // Part: Site Visit / Booking
  if (queryDecomp.parts.some(p => p.type === 'SITE_VISIT')) {
    answers.push(
      `📅 *Site Visit:* Ji bilkul! Main aapka site visit schedule kar sakti hoon. Aap kis samay aana chahenge — subah ya shaam?`
    );
  }

  // If specific parts were identified and answered, join them and return!
  if (answers.length > 0) {
    // If qualification still has an open question and we haven't asked yet, append AT MOST 1 question
    const nextQ = getNextQualificationPrompt(q, lang);
    if (nextQ && !queryDecomp.parts.some(p => p.type === 'SITE_VISIT')) {
      answers.push(nextQ);
    }
    return answers.join('\n\n');
  }

  // Fallback: If no specific question was parsed, ask for clarification without greeting
  const nextQ = getNextQualificationPrompt(q, lang);
  if (nextQ) {
    return isOngoing ? nextQ : `Dashmesh Properties mein aapka swagat hai. 💖\n\n${nextQ}`;
  }

  return `Main aapki property buying, selling, renting ya registered rent agreement (₹1,750 per side) mein poori madad kar sakti hoon. Aapko kis baare mein jankari chahiye?`;
}

/**
 * Main Sia Decision Engine (Rule 5 Compliant)
 */
async function processIncomingMessage(incomingPhone, incomingText, customerName = 'Customer', meta = {}) {
  const cleanPhone = incomingPhone.replace(/[^0-9]/g, '');
  const ownerPhone = (process.env.OWNER_ALERT_PHONE || '918421077613').replace(/[^0-9]/g, '');
  const isOwner = cleanPhone === ownerPhone || cleanPhone.endsWith('8421077613');

  // 1. Check for Opt-Out (Rule 5.8)
  if (meta.isOptOut) {
    crm.setOptOut(cleanPhone, true);
    return {
      reply: 'Aapka opt-out request process ho gaya hai. Ab aapko automated messages nahi bheje jayenge. Agar aap dobara start karna chahein, toh "START" message bhejein. Dashmesh Properties.',
      intent: 'OPT_OUT_PROCESSED',
      buttons: ['START']
    };
  }

  // 2. Check for Opt-In / Resume
  if (meta.isOptIn) {
    crm.setOptOut(cleanPhone, false);
    return {
      reply: 'Aapka message receive ho gaya hai! Dashmesh Properties AI assistant Sia online hai. Kahiye, main aapki kya madad kar sakti hoon?',
      intent: 'OPT_IN_PROCESSED',
      buttons: ['🏡 Property Options', '📜 Rent Agreement', '🏢 Office Location']
    };
  }

  // 3. Human Handoff Check (Rule 5.8)
  const escalation = checkHumanEscalationTrigger(incomingText);
  if (escalation.shouldEscalate && !isOwner) {
    crm.triggerHumanHandoff(cleanPhone, escalation.reason);
    return {
      reply: `Ji bilkul! Maine aapka request Satnam Sir (+91 84210 77613) aur hamari executive team ko forward kar diya hai. 📞\n\nTeam jald hi aapse direct contact karegi. Aap chahein toh unhe direct WhatsApp call bhi kar sakte hain.`,
      intent: 'HUMAN_HANDOFF_TRIGGERED',
      shouldNotifyOwner: true,
      handoffReason: escalation.reason,
      buttons: ['📞 Direct Call', '📍 Office Map']
    };
  }

  // 4. If conversation is currently owned by human, do NOT send automated replies
  const contact = crm.getOrCreateContact(cleanPhone, customerName);
  if (contact.human_pending && !isOwner) {
    return {
      reply: null, // Muted while human handles
      intent: 'HUMAN_HANDOFF_MUTED',
      shouldNotifyOwner: false
    };
  }

  // Record inbound customer message in CRM memory (Rule 3)
  const lang = detectLanguage(incomingText);
  crm.recordInboundMessage(cleanPhone, incomingText, meta.messageId, {
    customerName,
    rawType: meta.rawType || 'text',
    language: lang
  });

  // 5. Extract lead qualification data and update CRM (Rule 3)
  const qualUpdates = extractQualificationData(incomingText, contact.qualification);
  crm.updateQualification(cleanPhone, qualUpdates);

  // 6. Grounded Property Search using current or updated criteria
  const currentLocality = qualUpdates.locality || contact.qualification?.locality;
  const currentBhk = qualUpdates.bhk || contact.qualification?.bhk;
  const currentBudgetNum = qualUpdates.budgetNumeric || contact.qualification?.budgetNumeric;

  const propertySearch = searchVerifiedProperties({
    locality: currentLocality,
    bhk: currentBhk,
    maxBudgetLakhs: currentBudgetNum
  });

  // Record discussed properties in durable CRM memory
  if (propertySearch.matches && propertySearch.matches.length > 0) {
    const topP = propertySearch.matches[0];
    crm.recordPropertyDiscussed(cleanPhone, topP.name, topP.reraNumber, topP.startingPrice);
  }

  // 8. Multi-turn history from CRM (bounded to 10 messages)
  const conversationHistory = crm.getPromptConversationHistory(cleanPhone, 10);
  const isOngoing = Boolean(contact.hasGreeted || (contact.messages && contact.messages.length > 1));

  // 9. Try Gemini LLM first with verified ground-truth context & Rule 6 prompt
  let finalReply = await callGemini(incomingText, customerName, conversationHistory, {
    propertyMatches: propertySearch.matches,
    qualification: contact.qualification,
    propertiesDiscussed: contact.propertiesDiscussed,
    isOngoing
  });

  // 10. Fallback to grounded local knowledge engine (strictly adhering to Rules 1, 2, 3)
  if (!finalReply) {
    finalReply = generateGroundedFallback(incomingText, customerName, contact, lang);
  }

  // Mark greeting completed so it is never repeated in subsequent turns (Rule 1)
  crm.markGreetingSent(cleanPhone);

  // Update summary
  const summarySnippet = `Intent: ${contact.qualification?.intent || 'general'}, Locality: ${currentLocality || 'unspecified'}, Budget: ${contact.qualification?.budget || 'unspecified'}`;
  crm.updateConversationSummary(cleanPhone, summarySnippet);

  const replyIntent = qualUpdates.intent ? `LEAD_${qualUpdates.intent.toUpperCase()}` : 'SIA_CONVERSATIONAL_REPLY';

  // Record outbound message in CRM memory (Rule 3)
  if (finalReply) {
    crm.recordOutboundMessage(cleanPhone, finalReply, replyIntent, {
      messageId: meta.outboundMessageId,
      deliveryStatus: 'dispatched'
    });
  }

  // Interactive suggested action buttons
  let buttons = ['🏡 Properties', '📜 Rent Agreement', '📍 Office Location'];
  if (qualUpdates.intent === 'agreement' || contact.qualification?.intent === 'agreement') {
    buttons = ['📅 Schedule Biometric', '📋 Documents List', '📞 Call Satnam Sir'];
  } else if (propertySearch.count > 0) {
    buttons = ['📸 Send Photos', '📅 Book Site Visit', '📍 Office Map'];
  }

  return {
    reply: finalReply,
    intent: qualUpdates.intent ? `LEAD_${qualUpdates.intent.toUpperCase()}` : 'SIA_CONVERSATIONAL_REPLY',
    buttons,
    language: lang
  };
}

module.exports = {
  detectLanguage,
  searchVerifiedProperties,
  checkHumanEscalationTrigger,
  extractQualificationData,
  decomposeCustomerQuery,
  getNextQualificationPrompt,
  processIncomingMessage,
  generateGroundedFallback,
  BUSINESS_FACTS
};
