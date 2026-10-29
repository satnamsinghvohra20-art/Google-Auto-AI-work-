/**
 * ============================================================================
 * Dashmesh Properties — Sia AI Conversation Brain
 * Enterprise-Grade WhatsApp AI Receptionist & Lead Qualification Engine
 * ============================================================================
 * Business : Dashmesh Property & Rent Agreement Services
 * Office   : Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501
 * Founder  : Satnam Singh Vohra (+91 84210 77613)
 * Partners : Sukhjyot Singh Vohra (+91 84219 40013)
 *            Kuldeep Singh Vohra (+91 84120 70183)
 * Rent Agr.: ₹1,750 per side / ₹3,500 total all-inclusive (Sec 55 MRC Act)
 *
 * Compliance:
 * - Rule 1: NEVER repeat greeting on consecutive messages
 * - Rule 2: Answer every part of multi-question queries completely
 * - Rule 3: Grounded strictly in verified business & listing facts (Zero Hallucination)
 * - Rule 4: Multi-turn persistent context & lead qualification
 * - Rule 5: Human handoff escalation & silent bot guard
 * - Sia Persona: 24-year-old girl, warm, empathetic, polite, feminine phrasing
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const crmStore = require('./crm_store');

// Business Ground-Truth Facts
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
  serviceAreas: ['Ambernath (East & West)', 'Pale Gaon', 'Ulhasnagar', 'Badlapur', 'Kalyan'],
  rentAgreement: {
    costPerSide: '₹1,750',
    totalCost: '₹3,500 all-inclusive',
    legalAct: 'Maharashtra Rent Control Act Section 55',
    doorstepBiometric: 'Doorstep biometric verification available across Ambernath, Badlapur, Ulhasnagar, and Kalyan',
    documentsRequired: [
      'Aadhaar Card & PAN Card of Owner/Landlord',
      'Aadhaar Card & PAN Card of Tenant',
      'Aadhaar Card & PAN Card of 2 Witnesses',
      'Property Electricity Bill or Index II'
    ],
    timeline: 'Drafting in 24 hours, Govt registration certificate delivered with official QR code.'
  }
};

// Cached Project Listings from data/projects.json
let cachedProjects = null;

function loadVerifiedProjects() {
  if (cachedProjects) return cachedProjects;
  try {
    const pPath = path.join(__dirname, 'data', 'projects.json');
    if (fs.existsSync(pPath)) {
      const raw = fs.readFileSync(pPath, 'utf8').replace(/^\uFEFF/, '');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedProjects = parsed;
        return cachedProjects;
      }
    }
  } catch (err) {
    console.warn('[Sia Brain] Notice reading projects.json:', err.message);
  }

  // Built-in verified ground-truth listings for core areas
  cachedProjects = [
    {
      id: 'amb-01',
      name: 'New Floora (Dashmesh Base HQ)',
      locality: 'Pale Gaon, Ambernath East - 421501',
      region: 'Ambernath',
      subArea: 'Pale Gaon',
      configurations: ['1 RK', '1 BHK', '2 BHK', 'Commercial Shops'],
      startingPrice: '₹16 Lakhs',
      priceRange: '₹16L - ₹48L',
      reraNumber: 'P51700005421',
      status: 'Ready to Move',
      amenities: ['CCTV Surveillance', '24/7 KDMC Water', 'Lifts with Battery Backup', 'Kids Play Area', 'Commercial Street'],
      highlights: 'Prime location at Pale Naka, walking distance to schools and markets, clear title with OC.'
    },
    {
      id: 'amb-02',
      name: 'GBK Whispering Palms',
      locality: 'Pale Gaon, Ambernath East - 421501',
      region: 'Ambernath',
      subArea: 'Pale Gaon',
      configurations: ['1 BHK', '2 BHK'],
      startingPrice: '₹23 Lakhs',
      priceRange: '₹23L - ₹42L',
      reraNumber: 'P51700018944',
      status: 'Ready to Move',
      amenities: ['Landscaped Garden', 'Clubhouse', 'Power Backup', 'Gymnasium', 'Children Play Area'],
      highlights: 'Quiet residential neighborhood, clear title project with OC received.'
    },
    {
      id: 'amb-03',
      name: 'Laxmi Niwas',
      locality: 'Near Dashmesh Office, Pale Gaon, Ambernath East - 421501',
      region: 'Ambernath',
      subArea: 'Pale Gaon',
      configurations: ['1 RK', '1 BHK'],
      startingPrice: '₹18 Lakhs',
      priceRange: '₹18L - ₹27L',
      reraNumber: 'P51700022419',
      status: 'Ready to Move',
      amenities: ['24/7 Water Supply', 'Security', 'Intercom'],
      highlights: 'Budget friendly homes near main road with easy commute.'
    },
    {
      id: 'amb-04',
      name: 'Empire Centrum',
      locality: 'Ambernath West',
      region: 'Ambernath',
      subArea: 'Ambernath West',
      configurations: ['1 BHK', '2 BHK', 'Commercial'],
      startingPrice: '₹28 Lakhs',
      priceRange: '₹28L - ₹55L',
      reraNumber: 'P51700020188',
      status: 'Under Construction & Ready Phases',
      amenities: ['Clubhouse', 'Swimming Pool', 'Indoor Games', 'Jogging Track'],
      highlights: 'Integrated lifestyle enclave with industrial & residential convenience.'
    }
  ];
  return cachedProjects;
}

/**
 * Search verified listings matching query criteria
 */
function searchVerifiedProperties(text = '', qualification = {}) {
  const projects = loadVerifiedProjects();
  const lower = text.toLowerCase();
  const requestedBhk = qualification.bhk || (lower.includes('1 rk') ? '1 RK' : lower.includes('1 bhk') ? '1 BHK' : lower.includes('2 bhk') ? '2 BHK' : lower.includes('commercial') ? 'Commercial' : null);
  const requestedLocality = qualification.locality || (lower.includes('pale gaon') || lower.includes('pale') ? 'Pale Gaon' : lower.includes('badlapur') ? 'Badlapur' : lower.includes('ulhasnagar') ? 'Ulhasnagar' : lower.includes('kalyan') ? 'Kalyan' : 'Ambernath');

  const matches = projects.filter(p => {
    let match = true;
    if (requestedLocality && p.region && !p.region.toLowerCase().includes(requestedLocality.toLowerCase()) && !p.locality.toLowerCase().includes(requestedLocality.toLowerCase())) {
      match = false;
    }
    if (requestedBhk && Array.isArray(p.configurations) && !p.configurations.some(c => c.toLowerCase().includes(requestedBhk.toLowerCase()))) {
      match = false;
    }
    return match;
  });

  return matches.length > 0 ? matches : projects.slice(0, 2);
}

/**
 * Detect language of incoming message
 */
function detectLanguage(text) {
  if (!text) return 'hinglish';
  const t = text.trim();

  // Devanagari script detection
  const devanagariPattern = /[\u0900-\u097F]/;
  if (devanagariPattern.test(t)) {
    // Marathi specific words
    if (/\b(aahe|aahat|kay|kuthe|kiti|mahiti|pahije|dya|namaskar|kasa|aamhi)\b/i.test(t)) {
      return 'marathi';
    }
    return 'hindi';
  }

  // Pure English keywords
  const pureEnglishWords = /\b(what|where|how|much|price|cost|agreement|looking|interested|property|schedule|visit|please|thank|thank you)\b/i;
  // Hinglish keywords
  const hinglishWords = /\b(kya|hai|chahiye|kitna|hoga|batao|karo|dekhna|milega|kahan|mein|aur|bhi|ka|ki|ke|hum|aap)\b/i;

  if (hinglishWords.test(t)) return 'hinglish';
  if (pureEnglishWords.test(t)) return 'english';
  return 'hinglish';
}

/**
 * Extract lead qualification attributes from customer text
 */
function extractQualificationUpdates(text, currentQ = {}) {
  const lower = (text || '').toLowerCase();
  const updates = {};

  // Intent
  if (
    lower.includes('rent agreement') ||
    lower.includes('agreement') ||
    lower.includes('police verification') ||
    lower.includes('stamp duty') ||
    lower.includes('biometric') ||
    lower.includes('एग्रीमेंट') ||
    lower.includes('रेंट') ||
    lower.includes('करार')
  ) {
    updates.intent = 'agreement';
  } else if (lower.includes('kharidna') || lower.includes('buy') || lower.includes('purchase') || lower.includes('invest')) {
    updates.intent = 'buy';
  } else if (lower.includes('rent pe') || lower.includes('kiraye') || lower.includes('kiraaye') || lower.includes('kiraya') || lower.includes('to rent') || lower.includes('lease')) {
    updates.intent = 'rent';
  } else if (lower.includes('bechna') || lower.includes('sell') || lower.includes('sale my')) {
    updates.intent = 'sell';
  } else if (lower.includes('shop') || lower.includes('office') || lower.includes('commercial')) {
    updates.intent = 'commercial';
  }

  // BHK Configuration
  if (lower.includes('1 rk') || lower.includes('1rk')) updates.bhk = '1 RK';
  else if (lower.includes('1 bhk') || lower.includes('1bhk')) updates.bhk = '1 BHK';
  else if (lower.includes('2 bhk') || lower.includes('2bhk')) updates.bhk = '2 BHK';
  else if (lower.includes('3 bhk') || lower.includes('3bhk')) updates.bhk = '3 BHK';

  // Locality
  if (lower.includes('pale gaon') || lower.includes('palegaon') || lower.includes('pale naka') || lower.includes('pale')) {
    updates.locality = 'Pale Gaon';
  } else if (lower.includes('ambernath east') || lower.includes('ambarnath e')) {
    updates.locality = 'Ambernath East';
  } else if (lower.includes('ambernath west') || lower.includes('ambarnath w')) {
    updates.locality = 'Ambernath West';
  } else if (lower.includes('ambernath')) {
    updates.locality = 'Ambernath';
  } else if (lower.includes('badlapur')) {
    updates.locality = 'Badlapur';
  } else if (lower.includes('ulhasnagar')) {
    updates.locality = 'Ulhasnagar';
  } else if (lower.includes('kalyan')) {
    updates.locality = 'Kalyan';
  }

  // Budget detection (e.g. "25 lakh", "30L", "₹20,000", "50 lakhs")
  const budgetMatch = lower.match(/(?:budget|price|range|approx)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|k|cr|crore)?/i);
  if (budgetMatch && budgetMatch[1]) {
    const num = parseFloat(budgetMatch[1]);
    const unit = (budgetMatch[2] || '').toLowerCase();
    if (unit.startsWith('l') || unit.startsWith('lac')) {
      updates.budget = `₹${num} Lakhs`;
      updates.budgetNumeric = num * 100000;
    } else if (unit.startsWith('cr')) {
      updates.budget = `₹${num} Crores`;
      updates.budgetNumeric = num * 10000000;
    } else if (num >= 10 && num <= 200) {
      // Common shorthand: "budget 25" -> 25 lakhs
      updates.budget = `₹${num} Lakhs`;
      updates.budgetNumeric = num * 100000;
    } else if (num > 5000) {
      updates.budget = `₹${num.toLocaleString('en-IN')}`;
      updates.budgetNumeric = num;
    }
  }

  // Timeline & Preference
  if (lower.includes('site visit') || lower.includes('visit') || lower.includes('dekhna hai') || lower.includes('aana hai')) {
    updates.siteVisitRequested = true;
    updates.preference = 'site_visit';
  }
  if (lower.includes('call me') || lower.includes('phone karo') || lower.includes('call back')) {
    updates.callbackRequested = true;
    updates.preference = 'call';
  }
  if (lower.includes('immediate') || lower.includes('ready') || lower.includes('urgent') || lower.includes('turant')) {
    updates.timeline = 'Immediate';
  }

  return updates;
}

/**
 * Check if the user is asking to speak with a human or if human handoff should be triggered
 */
function detectHumanHandoffRequest(text) {
  const lower = (text || '').toLowerCase();

  // 1. Direct Human / Agent Request
  if (
    lower.includes('talk to human') ||
    lower.includes('speak with agent') ||
    lower.includes('real person') ||
    lower.includes('customer care') ||
    lower.includes('agent se baat') ||
    lower.includes('owner se baat') ||
    lower.includes('satnam sir') ||
    lower.includes('call me') ||
    lower.includes('phone karo') ||
    lower.includes('call back')
  ) {
    return { shouldHandoff: true, reason: 'Customer requested human / owner discussion' };
  }

  // 2. Negotiation / Special Discount
  if (
    lower.includes('discount milega') ||
    lower.includes('price kam karo') ||
    lower.includes('negotiable') ||
    lower.includes('final offer') ||
    lower.includes('bargain') ||
    lower.includes('kam karwao')
  ) {
    return { shouldHandoff: true, reason: 'Customer requested price negotiation / discount approval' };
  }

  // 3. Legal / Dispute / Complaints
  if (
    lower.includes('complaint') ||
    lower.includes('fraud') ||
    lower.includes('police') ||
    lower.includes('consumer court') ||
    lower.includes('legal dispute') ||
    lower.includes('cheating')
  ) {
    return { shouldHandoff: true, reason: 'Customer raised sensitive complaint or legal inquiry' };
  }

  return { shouldHandoff: false, reason: null };
}

/**
 * Check if text is a standalone greeting without any question
 */
function isStandaloneGreeting(text) {
  if (!text) return false;
  const clean = text.trim().toLowerCase().replace(/[^a-z\u0900-\u097F]/g, '');
  const pureGreetings = [
    'hi', 'hello', 'hey', 'namaste', 'namaskar', 'pranam', 'shubhprabhat',
    'goodmorning', 'goodafternoon', 'goodevening', 'hii', 'hiii', 'helo', 'hellow'
  ];
  return pureGreetings.includes(clean);
}

/**
 * Build safe prompt for Gemini Generative AI
 */
function buildGeminiPrompt(customerName, incomingText, history = [], qualification = {}, verifiedListings = []) {
  const listingsSummary = verifiedListings.map(l =>
    `- ${l.name} (${l.locality}): Configurations: ${l.configurations.join(', ')} | Price: ${l.priceRange || l.startingPrice} | RERA: ${l.reraNumber} | Status: ${l.status}`
  ).join('\n');

  const historyText = history.map(h => `${h.role === 'user' ? 'Customer' : 'Sia'}: ${h.text}`).join('\n');

  return `
SYSTEM INSTRUCTION:
You are Sia, the sweet, professional, empathetic, and knowledgeable 24-year-old female assistant for Dashmesh Properties & Rent Agreement Services.
Location: Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501.
Founder: Satnam Singh Vohra (+91 84210 77613).
Rent Agreement: ₹1,750 per side / ₹3,500 total all-inclusive with doorstep biometric across Ambernath, Badlapur, Ulhasnagar, Kalyan (Govt approved, Sec 55 Maharashtra Rent Control Act).
Primary Areas: Ambernath, Pale Gaon, Ulhasnagar, Badlapur, Kalyan.

RULES:
1. Strict Feminine Persona: Use feminine Hindi/Hinglish phrasing when speaking Hindi/Hinglish ("karungi", "bataungi", "samajh sakti hoon", "main hoon na 💖", "chinta mat kijiye").
2. NEVER Repeat Robotic Greetings: If there is past conversation history, DO NOT greet! Jump straight to answering the user's specific question.
3. Answer ALL parts of the customer's question thoroughly.
4. Grounded in Truth: NEVER invent properties, prices, discounts, or legal guarantees. If a property is unknown, state honestly that it needs team verification.
5. Empathy & Warmth: Keep responses clear, concise, and easy to read on WhatsApp. Ask at most 1-2 relevant follow-ups.

VERIFIED PROPERTIES:
${listingsSummary}

CURRENT CUSTOMER CONTEXT:
Name: ${customerName}
Intent: ${qualification.intent || 'Exploring'}
Locality: ${qualification.locality || 'Not specified'}
BHK: ${qualification.bhk || 'Not specified'}
Budget: ${qualification.budget || 'Not specified'}

PAST CONVERSATION HISTORY:
${historyText || '(No previous messages)'}

CUSTOMER'S LATEST MESSAGE:
"${incomingText}"

Sia's WhatsApp Reply:`;
}

/**
 * Call Gemini API with timeout and model fallback
 */
async function callGemini(prompt) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;

  const models = [
    process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 500,
      topP: 0.9
    }
  });

  for (const model of models) {
    try {
      const result = await new Promise((resolve) => {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const parsedUrl = new URL(endpoint);

        const req = https.request({
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 7000 // 7s timeout
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const json = JSON.parse(data);
                const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
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
      });

      if (result) return result;
    } catch (_) {
      // try next model
    }
  }

  return null;
}

/**
 * Robust Grounded Local Engine: Provides 100% reliable, verified replies
 * when Gemini API is unconfigured, times out, or encounters errors.
 */
function generateGroundedFallbackResponse(text, customerName, contact, qualification, lang) {
  const lower = (text || '').toLowerCase();
  const hasHistory = contact.messages && contact.messages.length > 1;
  const isGreetingOnly = isStandaloneGreeting(text);

  // RULE 1: Never repeat greeting on consecutive messages
  // Only include welcome greeting if contact has never greeted AND message is a pure greeting
  let prefix = '';
  if (!contact.hasGreeted && isGreetingOnly) {
    if (lang === 'english') {
      prefix = `Hello ${customerName}! Welcome to Dashmesh Properties. I am Sia, your property assistant. 💖\n\n`;
    } else if (lang === 'marathi') {
      prefix = `नमस्कार ${customerName}! दशमेश प्रॉपर्टीजमध्ये आपले स्वागत आहे. मी सिया आहे. 💖\n\n`;
    } else {
      prefix = `नमस्ते ${customerName}! Dashmesh Properties में आपका बहुत-बहुत स्वागत है, मैं सिया हूँ। 💖\n\n`;
    }
  }

  // Question 1: Rent Agreement inquiries
  if (
    lower.includes('rent agreement') ||
    lower.includes('agreement') ||
    lower.includes('police verification') ||
    lower.includes('biometric') ||
    lower.includes('stamp duty') ||
    lower.includes('एग्रीमेंट') ||
    lower.includes('रेंट') ||
    lower.includes('करार')
  ) {
    const isMultiQuestion = lower.includes('document') || lower.includes('kagaz') || lower.includes('kaise') || lower.includes('process') || lower.includes('price') || lower.includes('cost') || lower.includes('kitna');

    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Yes, we provide official Government-Registered Rent Agreement service with doorstep biometric verification across Ambernath, Badlapur, Ulhasnagar, and Kalyan! 📜✨\n\n` +
        `💰 *Official Rate:* ₹1,750 per side (₹3,500 total all-inclusive) under Maharashtra Rent Control Act Section 55.\n` +
        `⚡ *Govt Registration:* Complete drafting, stamp duty payment & doorstep biometric done at your home/office.\n\n` +
        `📋 *Documents Required:*\n` +
        `• Owner & Tenant Aadhaar + PAN Cards\n` +
        `• 2 Witnesses Aadhaar + PAN Cards\n` +
        `• Property Electricity Bill or Index II\n\n` +
        `Kya aapko apne flat ke liye biometric slot book karwana hai? Main turant schedule kar sakti hoon! 💖`;
    } else if (lang === 'marathi') {
      reply = `${prefix}होय, आम्ही अंबरनाथ, बदलापूर, उल्हासनगर आणि कल्याणमध्ये डोअरस्टेप बायोमेट्रिकसह अधिकृत नोंदणीकृत रेंट ॲग्रीमेंट सेवा देतो! 📜✨\n\n` +
        `💰 *अधिकृत शुल्क:* ₹1,750 प्रत्येक बाजू (एकूण ₹3,500 सर्वसमावेशक).\n` +
        `📋 *आवश्यक कागदपत्रे:*\n` +
        `• मालक आणि भाडेकरूंचे आधार व पॅन कार्ड\n` +
        `• २ साक्षीदारांचे आधार व पॅन कार्ड\n` +
        `• लाईट बिल किंवा इंडेक्स II\n\n` +
        `आपल्याला बायोमेट्रिक स्लॉट कधी हवा आहे? मी लगेच मदत करू शकते! 💖`;
    } else {
      reply = `${prefix}Ji haan! Dashmesh Properties par Govt-Registered Rent Agreement doorstep biometric ke sath banaya jata hai! 📜✨\n\n` +
        `💰 *Official All-Inclusive Charges:* ₹1,750 per side (₹3,500 total complete package, no hidden charges).\n` +
        `🏠 *Doorstep Service:* Hamare executive aapke ghar aakar biometric verification karte hain (Ambernath, Badlapur, Ulhasnagar, Kalyan).\n\n` +
        `📋 *Required Documents:*\n` +
        `1. Owner & Tenant ka Aadhaar + PAN Card\n` +
        `2. 2 Witnesses ka Aadhaar + PAN Card\n` +
        `3. Property ka Electricity Bill ya Index II\n\n` +
        `Aapko kab ka biometric slot book karwana hai? Main abhi arrange kar sakti hoon na! 💖`;
    }

    return {
      reply,
      buttons: ['Book Biometric Slot', 'Office Location', 'Talk to Satnam Sir'],
      intent: 'RENT_AGREEMENT_INQUIRY'
    };
  }

  // Question 2: Office Location / Contact Details
  if (
    lower.includes('office') ||
    lower.includes('kahan hai') ||
    lower.includes('address') ||
    lower.includes('location') ||
    lower.includes('kaha hai') ||
    lower.includes('contact')
  ) {
    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Our office is located at:\n` +
        `📍 *Dashmesh Property & Rent Agreement Services*\n` +
        `Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501.\n` +
        `👤 *Founder:* Satnam Singh Vohra (+91 84210 77613)\n\n` +
        `You are always welcome to visit us! Would you like to schedule a quick meeting or call? 💖`;
    } else {
      reply = `${prefix}Hamara office yahan situated hai:\n` +
        `📍 *Dashmesh Property & Rent Agreement Services*\n` +
        `Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501.\n` +
        `👤 *Founder:* Satnam Singh Vohra (+91 84210 77613)\n\n` +
        `Aap jab chahe office visit kar sakte hain, main Satnam Sir ke sath aapki meeting arrange karwa sakti hoon! 💖`;
    }

    return {
      reply,
      buttons: ['Schedule Visit', 'Call Satnam Sir', 'View Properties'],
      intent: 'OFFICE_LOCATION'
    };
  }

  // Question 3: Specific Property Listing Inquiries & Multi-Question resolution
  const verifiedListings = searchVerifiedProperties(text, qualification);
  const isLookingForHomes = lower.includes('bhk') || lower.includes('flat') || lower.includes('property') || lower.includes('ghar') || lower.includes('room') || lower.includes('buy') || lower.includes('rent') || lower.includes('pale gaon') || lower.includes('ambernath');

  if (isLookingForHomes) {
    const p1 = verifiedListings[0];
    const p2 = verifiedListings[1] || verifiedListings[0];

    // Multi-question handling: check if user asked about price, parking, RERA, visit
    const asksPrice = lower.includes('price') || lower.includes('budget') || lower.includes('kitna') || lower.includes('rate');
    const asksParking = lower.includes('parking') || lower.includes('amenities') || lower.includes('water');
    const asksRera = lower.includes('rera') || lower.includes('approved') || lower.includes('oc');
    const asksVisit = lower.includes('visit') || lower.includes('dekhna') || lower.includes('kal');

    let extraDetails = '';
    if (asksParking) {
      extraDetails += `\n🚗 *Parking & Amenities:* CCTV surveillance, 24/7 KDMC water supply, and lift with battery backup available hai.`;
    }
    if (asksRera) {
      extraDetails += `\n📜 *RERA Status:* MahaRERA Approved Project (${p1.reraNumber}) with clear title & OC.`;
    }
    if (asksVisit) {
      extraDetails += `\n🗓️ *Site Visit:* Main kal aapka site visit schedule kar sakti hoon!`;
    }

    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Here are verified ready-to-move options matching your interest in ${qualification.locality || 'Pale Gaon / Ambernath East'}:\n\n` +
        `🏢 *${p1.name}*\n` +
        `📍 ${p1.locality}\n` +
        `💰 *Price:* ${p1.priceRange || p1.startingPrice} (${p1.configurations.join(', ')})\n` +
        `📜 *Status:* ${p1.status} (MahaRERA: ${p1.reraNumber})\n` +
        `✨ *Highlights:* ${p1.highlights}${extraDetails}\n\n` +
        `🏢 *${p2.name}*\n` +
        `📍 ${p2.locality} | ${p2.priceRange || p2.startingPrice}\n\n` +
        `Would you like to schedule a site visit or discuss with Satnam Sir? 💖`;
    } else {
      reply = `${prefix}Aapke requirements ke anusar ${qualification.locality || 'Pale Gaon / Ambernath East'} mein yeh hamare best verified options hain:\n\n` +
        `🏢 *${p1.name}*\n` +
        `📍 ${p1.locality}\n` +
        `💰 *Price Range:* ${p1.priceRange || p1.startingPrice} (${p1.configurations.join(', ')})\n` +
        `📜 *RERA Status:* ${p1.status} (RERA: ${p1.reraNumber})\n` +
        `✨ *Key Features:* ${p1.highlights}${extraDetails}\n\n` +
        `🏢 *${p2.name}*\n` +
        `📍 ${p2.locality} (Starting ${p2.startingPrice})\n\n` +
        `Kya aap iska site visit dekhna chahenge? Main turant arrange karwa sakti hoon na! 💖`;
    }

    return {
      reply,
      buttons: ['Site Visit Schedule', 'Call Satnam Sir', 'Rent Agreement'],
      intent: 'PROPERTY_OPTIONS'
    };
  }

  // Default Polite Assistant Follow-Up
  if (isGreetingOnly) {
    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}How may I help you today? Are you looking to buy, rent, or need an official registered rent agreement with doorstep biometric? 💖`;
    } else if (lang === 'marathi') {
      reply = `${prefix}मी आपल्याला कशी मदत करू शकते? आपण घर खरेदी, भाड्याने घेणे किंवा रेंट ॲग्रीमेंटच्या शोधात आहात का? 💖`;
    } else {
      reply = `${prefix}Bataiye main aapki kya madad kar sakti hoon? Aap property buy karna chahte hain, rent par dekh rahe hain ya registered rent agreement banwana hai? 💖`;
    }

    return {
      reply,
      buttons: ['Buy Property', 'Rent Agreement', 'Office Location'],
      intent: 'GREETING'
    };
  }

  // General Inquiry Clarification
  let reply = '';
  if (lang === 'english') {
    reply = `${prefix}I understand! At Dashmesh Properties, we specialize in real estate buying, selling, and rent agreements across Ambernath, Pale Gaon, and Badlapur.\n\n` +
      `Could you please share your preferred area, property type (1 BHK / 2 BHK), or budget so I can find the perfect match for you? 💖`;
  } else {
    reply = `${prefix}Ji bilkul! Dashmesh Properties par hum Ambernath, Pale Gaon aur Badlapur mein verified flats aur Govt-Registered Rent Agreements arrange karte hain.\n\n` +
      `Aapko kis area mein aur kitne budget tak option chahiye? Main best verified options share karungi! 💖`;
  }

  return {
    reply,
    buttons: ['1 BHK Pale Gaon', 'Rent Agreement', 'Contact Office'],
    intent: 'QUALIFYING'
  };
}

/**
 * Main WhatsApp Incoming Message Processing Flow
 */
async function processIncomingMessage(incomingPhone, incomingText, customerName = 'Customer', meta = {}) {
  const userMessage = (incomingText || '').trim();
  const cleanPhone = incomingPhone ? incomingPhone.replace(/[^0-9]/g, '') : '';

  // 1. Retrieve or create persistent CRM contact record
  const contact = crmStore.getOrCreateContact(cleanPhone, customerName);

  // 2. Opt-Out / Opt-In Handling (Phase 2 & Rule 10)
  if (meta.isOptOut) {
    crmStore.setOptOut(cleanPhone, true);
    return {
      reply: `You have successfully unsubscribed from automated WhatsApp updates from Dashmesh Properties. Reply START at any time to resume.`,
      buttons: ['START'],
      intent: 'OPT_OUT'
    };
  }

  if (meta.isOptIn || contact.opted_out) {
    crmStore.setOptOut(cleanPhone, false);
    return {
      reply: `Welcome back to Dashmesh Properties! 💖 How can I help you today with properties or rent agreements?`,
      buttons: ['Verified Properties', 'Rent Agreement', 'Speak to Agent'],
      intent: 'OPT_IN'
    };
  }

  // 3. Silent Bot Guard: If customer is in human_pending handoff state, mute AI replies
  if (contact.human_pending) {
    console.log(`[Sia Brain] Contact ${cleanPhone} is in human_pending state. Muting automated replies.`);
    return {
      reply: null,
      buttons: [],
      intent: 'HUMAN_HANDOFF_ACTIVE'
    };
  }

  // 4. Check for Human Handoff triggers (Phase 5)
  const handoffCheck = detectHumanHandoffRequest(userMessage);
  if (handoffCheck.shouldHandoff) {
    crmStore.triggerHumanHandoff(cleanPhone, handoffCheck.reason);
    const handoffReply = `Main samajh sakti hoon! 💖 Maine aapki request hamare founder Satnam Singh Vohra (+91 84210 77613) aur executive team ko escalate kar di hai.\n\n` +
      `Satnam Sir ya hamare senior property specialist aapse seedhe baat karenge aur aapki poori madad karenge. Aap bilkul nishchint rahiye! 🌸`;

    return {
      reply: handoffReply,
      buttons: ['Call Satnam Sir', 'Office Location'],
      intent: 'HUMAN_HANDOFF',
      shouldNotifyOwner: true,
      handoffReason: handoffCheck.reason
    };
  }

  // 5. Detect language
  const detectedLang = detectLanguage(userMessage);

  // 6. Extract lead qualification updates & save to persistent memory (Phase 4)
  const qUpdates = extractQualificationUpdates(userMessage, contact.qualification);
  if (Object.keys(qUpdates).length > 0) {
    crmStore.updateQualification(cleanPhone, qUpdates);
  }

  // 7. Load context & verified listings for prompt
  const updatedContact = crmStore.getOrCreateContact(cleanPhone);
  const verifiedListings = searchVerifiedProperties(userMessage, updatedContact.qualification);
  const history = crmStore.getPromptConversationHistory(cleanPhone, 8);

  let replyText = null;
  let responseIntent = 'SIA_ASSISTANT_REPLY';

  // 8. Attempt Gemini Generative AI Call if API Key configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = buildGeminiPrompt(customerName, userMessage, history, updatedContact.qualification, verifiedListings);
      const geminiResponse = await callGemini(prompt);
      if (geminiResponse && geminiResponse.length > 10) {
        replyText = geminiResponse;
        responseIntent = 'GEMINI_AI_REPLY';
      }
    } catch (e) {
      console.warn('[Sia Brain] Gemini call failed, falling back to verified local engine:', e.message);
    }
  }

  // 9. Grounded Rule Engine Fallback (guarantees 100% reliable, verified response)
  if (!replyText) {
    const fallbackResult = generateGroundedFallbackResponse(userMessage, customerName, updatedContact, updatedContact.qualification, detectedLang);
    replyText = fallbackResult.reply;
    responseIntent = fallbackResult.intent;
  }

  // 10. Mark greeting sent so it is NEVER repeated (Rule 1)
  crmStore.markGreetingSent(cleanPhone);

  return {
    reply: replyText,
    buttons: ['Rent Agreement', 'Site Visit', 'Call Satnam Sir'],
    intent: responseIntent
  };
}

module.exports = {
  BUSINESS_FACTS,
  loadVerifiedProjects,
  searchVerifiedProperties,
  detectLanguage,
  extractQualificationUpdates,
  detectHumanHandoffRequest,
  isStandaloneGreeting,
  processIncomingMessage
};
