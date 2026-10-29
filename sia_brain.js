/**
 * ============================================================================
 * Dashmesh Properties — Sia AI Anti-Hallucination Conversation Brain
 * ============================================================================
 * High-Assurance, Zero-Hallucination WhatsApp AI Receptionist
 * 
 * Strict Compliance:
 * - Directive 2: Grounded in Verified Source of Truth (property_knowledge.js)
 * - Directive 3: Retrieval Before Generation
 * - Directive 4: Strict Factuality Rules (No price, status, or amenity guessing)
 * - Directive 5: Honest Unknown-Answer Path
 * - Directive 6: Zero Hallucination in Fallbacks
 * - Directive 7: Complete Multi-Question Answering
 * - Directive 8: Deterministic Output Validation
 * - Directive 9: Persistent Multi-Turn Customer Memory
 * - Directive 10: Structured Factuality Audit Logging
 * ============================================================================
 */

'use strict';

const https = require('https');
const crmStore = require('./crm_store');
const knowledge = require('./property_knowledge');

const { BUSINESS_FACTS } = knowledge;

/**
 * Detect language of incoming message
 */
function detectLanguage(text) {
  if (!text) return 'hinglish';
  const t = text.trim();

  // Devanagari script detection
  const devanagariPattern = /[\u0900-\u097F]/;
  if (devanagariPattern.test(t)) {
    // Marathi specific keywords
    if (/\b(aahe|aahat|kay|kuthe|kiti|mahiti|pahije|dya|namaskar|kasa|aamhi|भाडे|करार)\b/i.test(t)) {
      return 'marathi';
    }
    return 'hindi';
  }

  // Pure English keywords
  const pureEnglishWords = /\b(what|where|how|much|price|cost|agreement|looking|interested|property|schedule|visit|please|thank|thank you|available|covered parking)\b/i;
  // Hinglish keywords
  const hinglishWords = /\b(kya|hai|chahiye|kitna|hoga|batao|karo|dekhna|milega|kahan|mein|aur|bhi|ka|ki|ke|hum|aap|bhai)\b/i;

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

  // BHK Configuration (Dynamic 1 RK, 1 BHK, 2 BHK, 3 BHK, 4 BHK, 5 BHK, etc.)
  const bhkMatch = lower.match(/(\d+)\s*(bhk|rk)/i);
  if (bhkMatch) {
    updates.bhk = `${bhkMatch[1]} ${bhkMatch[2].toUpperCase()}`;
  }

  // Locality
  if (lower.includes('pale gaon') || lower.includes('palegaon') || lower.includes('pale naka') || lower.includes('pale')) {
    updates.locality = 'Pale Gaon';
  } else if (lower.includes('ambernath east') || lower.includes('ambarnath e')) {
    updates.locality = 'Ambernath East';
  } else if (lower.includes('ambernath west') || lower.includes('ambarnath w')) {
    updates.locality = 'Ambernath West';
  } else if (lower.includes('ambernath') || lower.includes('ambarnath')) {
    updates.locality = 'Ambernath';
  } else if (lower.includes('badlapur')) {
    updates.locality = 'Badlapur';
  } else if (lower.includes('ulhasnagar')) {
    updates.locality = 'Ulhasnagar';
  } else if (lower.includes('kalyan')) {
    updates.locality = 'Kalyan';
  }

  // Budget detection
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
      updates.budget = `₹${num} Lakhs`;
      updates.budgetNumeric = num * 100000;
    } else if (num > 5000) {
      updates.budget = `₹${num.toLocaleString('en-IN')}`;
      updates.budgetNumeric = num;
    }
  }

  // Preference / Request
  if (lower.includes('site visit') || lower.includes('visit') || lower.includes('dekhna hai') || lower.includes('aana hai')) {
    updates.siteVisitRequested = true;
    updates.preference = 'site_visit';
  }
  if (lower.includes('call me') || lower.includes('phone karo') || lower.includes('call back')) {
    updates.callbackRequested = true;
    updates.preference = 'call';
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
    return { shouldHandoff: true, reason: 'Customer requested human discussion / callback' };
  }

  // 2. Negotiation / Special Discount
  if (
    lower.includes('discount milega') ||
    lower.includes('price kam karo') ||
    lower.includes('negotiable') ||
    lower.includes('final offer') ||
    lower.includes('bargain') ||
    lower.includes('kam karwao') ||
    lower.includes('discount chahiye')
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
    return { shouldHandoff: true, reason: 'Customer raised legal dispute or formal complaint' };
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
 * Build safe prompt for Gemini with strict evidence isolation
 */
function buildGeminiEvidencePrompt(customerName, incomingText, history, qualification, evidence) {
  const retrievedFacts = [];

  if (evidence.businessFacts) {
    retrievedFacts.push(`BUSINESS PROFILE:\nName: ${BUSINESS_FACTS.name}\nOffice: ${BUSINESS_FACTS.officeAddress}\nFounder: ${BUSINESS_FACTS.founder}\nHours: ${BUSINESS_FACTS.officeHours}`);
  }

  if (evidence.rentAgreementFacts) {
    retrievedFacts.push(`RENT AGREEMENT (GOVT REGISTERED):\nRate: ${BUSINESS_FACTS.rentAgreement.costPerSide} per side (${BUSINESS_FACTS.rentAgreement.totalCost} all-inclusive)\nLegal Basis: ${BUSINESS_FACTS.rentAgreement.legalAct}\nDoorstep Biometric: Available in Ambernath, Badlapur, Ulhasnagar, Kalyan\nDocuments Required: ${BUSINESS_FACTS.rentAgreement.documentsRequired.join('; ')}`);
  }

  if (evidence.matchedListings.length > 0) {
    const listingsStr = evidence.matchedListings.map(l =>
      `- Listing ID: ${l.listingId} | Name: ${l.name} | Locality: ${l.locality} | Configurations: ${l.configurations.join(', ')} | Price Range: ${l.priceRange} (${l.priceBasis}) | RERA: ${l.reraNumber} | Status: ${l.status} | Verified Amenities: ${l.amenities.join(', ')}`
    ).join('\n');
    retrievedFacts.push(`VERIFIED PROPERTIES FOUND:\n${listingsStr}`);
  }

  const unverifiedStr = evidence.unknownElements.length > 0
    ? `UNVERIFIED / UNKNOWN ELEMENTS (DO NOT INVENT ANSWERS FOR THESE):\n- ${evidence.unknownElements.join('\n- ')}`
    : 'All queried elements matched verified records.';

  const historyStr = history.map(h => `${h.role === 'user' ? 'Customer' : 'Sia'}: ${h.text}`).join('\n');

  return `
SYSTEM INSTRUCTION:
You are Sia, the polite, empathetic, sweet, and knowledgeable 24-year-old female property assistant for Dashmesh Properties & Rent Agreement Services.
Location: Shop No. 24, New Floora, Pale Gaon, Ambernath East - 421 501.

STRICT ANTI-HALLUCINATION RULES:
1. ONLY answer using facts listed under TRUSTED RETRIEVED EVIDENCE.
2. DO NOT INVENT or guess any property name, price, RERA number, loan guarantee, or amenity.
3. If an item is listed under UNVERIFIED / UNKNOWN ELEMENTS, explicitly state: "I don't have verified current information for this yet. Would you like our property team to check and get back to you?"
4. Strict Feminine Persona in Hindi/Hinglish: Use feminine grammar ("karungi", "bataungi", "samajh sakti hoon", "main hoon na 💖").
5. DO NOT repeat greetings if past conversation exists. Jump straight to answering.

TRUSTED RETRIEVED EVIDENCE:
${retrievedFacts.join('\n\n') || '(No business facts or property listings matched)'}

${unverifiedStr}

CUSTOMER CONTEXT:
Name: ${customerName}
Locality: ${qualification.locality || 'Not specified'}
BHK: ${qualification.bhk || 'Not specified'}
Budget: ${qualification.budget || 'Not specified'}

PAST CONVERSATION:
${historyStr || '(First message)'}

CUSTOMER MESSAGE:
"${incomingText}"

Sia's Verified WhatsApp Reply:`;
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
      temperature: 0.2, // Low temperature for maximum factuality
      maxOutputTokens: 500,
      topP: 0.8
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
          timeout: 7000
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
 * Deterministic Grounded Generator (Directives 4, 5, 6, 7)
 * Guarantees zero hallucinations even if Gemini is down or unconfigured.
 */
function generateDeterministicGroundedReply(userMessage, customerName, contact, qualification, evidence, lang) {
  const isGreetingOnly = isStandaloneGreeting(userMessage);

  // RULE 1: Never repeat greeting on consecutive messages
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

  // Path 1: Out of Service Area (Honest Unknown Path)
  if (!evidence.isCoverageArea) {
    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Dashmesh Properties specializes primarily in Ambernath (East & West), Pale Gaon, Badlapur, Ulhasnagar, and Kalyan.\n\n` +
        `We do not currently have verified inventory in ${evidence.queriedLocality || 'that city'}. I can certainly ask Satnam Sir (+91 84210 77613) and our associate network if options are available for you. Would you like me to request a callback? 💖`;
    } else {
      reply = `${prefix}Dashmesh Properties ki primary expertise Ambernath (East & West), Pale Gaon, Badlapur, Ulhasnagar aur Kalyan areas mein hai.\n\n` +
        `${evidence.queriedLocality || 'Is area'} mein hamare paas abhi verified inventory active nahi hai. Main Satnam Sir (+91 84210 77613) se verify karwake pata kar sakti hoon agar hamare network mein option ho. Kya main callback schedule karun? 💖`;
    }
    return {
      reply,
      buttons: ['Call Satnam Sir', 'View Ambernath Options'],
      intent: 'OUT_OF_COVERAGE_AREA'
    };
  }

  // Path 2: Rent Agreement Inquiries (Ground Truth Rates & Checklist)
  if (evidence.rentAgreementFacts) {
    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Yes, we provide official Government-Registered Rent Agreement service with doorstep biometric verification across Ambernath, Badlapur, Ulhasnagar, and Kalyan! 📜✨\n\n` +
        `💰 *Official Rate:* ${BUSINESS_FACTS.rentAgreement.costPerSide} per side (${BUSINESS_FACTS.rentAgreement.totalCost}) under ${BUSINESS_FACTS.rentAgreement.legalAct}.\n` +
        `🏠 *Doorstep Biometric:* Our executive visits your residence/office for biometric capture.\n\n` +
        `📋 *Documents Required:*\n` +
        `• Owner & Tenant Aadhaar + PAN Cards\n` +
        `• 2 Witnesses Aadhaar + PAN Cards\n` +
        `• Property Electricity Bill or Index II\n\n` +
        `Would you like to schedule a biometric slot? I can arrange that with our desk! 💖`;
    } else if (lang === 'marathi') {
      reply = `${prefix}होय, आम्ही अंबरनाथ, बदलापूर, उल्हासनगर आणि कल्याणमध्ये डोअरस्टेप बायोमेट्रिकसह अधिकृत नोंदणीकृत रेंट ॲग्रीमेंट सेवा देतो! 📜✨\n\n` +
        `💰 *अधिकृत शुल्क:* ${BUSINESS_FACTS.rentAgreement.costPerSide} प्रत्येक बाजू (${BUSINESS_FACTS.rentAgreement.totalCost}).\n` +
        `📋 *आवश्यक कागदपत्रे:*\n` +
        `• मालक आणि भाडेकरूंचे आधार व पॅन कार्ड\n` +
        `• २ साक्षीदारांचे आधार व पॅन कार्ड\n` +
        `• लाईट बिल किंवा इंडेक्स II\n\n` +
        `आपल्याला बायोमेट्रिक स्लॉट कधी हवा आहे? मी लगेच मदत करू शकते! 💖`;
    } else {
      reply = `${prefix}Ji haan! Dashmesh Properties par Govt-Registered Rent Agreement doorstep biometric ke sath banaya jata hai! 📜✨\n\n` +
        `💰 *Official Charges:* ${BUSINESS_FACTS.rentAgreement.costPerSide} per side (${BUSINESS_FACTS.rentAgreement.totalCost} complete package, no hidden fees).\n` +
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

  // Path 3: Office Address & Contact
  if (evidence.businessFacts) {
    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Our office is located at:\n` +
        `📍 *${BUSINESS_FACTS.name}*\n` +
        `${BUSINESS_FACTS.officeAddress}\n` +
        `👤 *Founder:* ${BUSINESS_FACTS.founder}\n` +
        `🕒 *Hours:* ${BUSINESS_FACTS.officeHours}\n\n` +
        `You are always welcome to visit us! Would you like to schedule a consultation with Satnam Sir? 💖`;
    } else {
      reply = `${prefix}Hamara office yahan situated hai:\n` +
        `📍 *${BUSINESS_FACTS.name}*\n` +
        `${BUSINESS_FACTS.officeAddress}\n` +
        `👤 *Founder:* ${BUSINESS_FACTS.founder}\n` +
        `🕒 *Office Timings:* ${BUSINESS_FACTS.officeHours}\n\n` +
        `Aap jab chahe office visit kar sakte hain, main Satnam Sir ke sath aapki meeting schedule karwa sakti hoon! 💖`;
    }

    return {
      reply,
      buttons: ['Schedule Visit', 'Call Satnam Sir', 'View Properties'],
      intent: 'OFFICE_LOCATION'
    };
  }

  // Path 4: Verified Property Listings & Honest Unknown Amenity Handling
  if (evidence.hasVerifiedMatch && evidence.matchedListings.length > 0) {
    const p1 = evidence.matchedListings[0];
    const p2 = evidence.matchedListings[1];

    // Check queried amenities against verified facts
    let amenityNote = '';
    if (evidence.verifiedAmenitiesFound.length > 0) {
      amenityNote += `\n✅ *Verified Features:* ${evidence.verifiedAmenitiesFound.join(', ')} confirmed on site.`;
    }
    if (evidence.unverifiedAmenities.length > 0) {
      // Directive 5: Honest Unknown Path for specific missing amenities
      amenityNote += `\n⚠️ *Pending Confirmation:* ${evidence.unverifiedAmenities.join(', ')} hamare current verified record mein confirmed nahi hai. Main hamari team se verify karwake aapko confirm kar sakti hoon.`;
    }

    let reply = '';
    if (lang === 'english') {
      reply = `${prefix}Here are the verified ready options matching your inquiry in ${p1.locality}:\n\n` +
        `🏢 *${p1.name}*\n` +
        `📍 ${p1.locality}\n` +
        `💰 *Price:* ${p1.priceRange || p1.startingPrice} (${p1.configurations.join(', ')})\n` +
        `📜 *Status:* ${p1.status} (MahaRERA: ${p1.reraNumber})\n` +
        `✨ *Highlights:* ${p1.highlights}${amenityNote}\n\n`;

      if (p2) {
        reply += `🏢 *${p2.name}*\n` +
          `📍 ${p2.locality} | ${p2.priceRange || p2.startingPrice} (${p2.configurations.join(', ')})\n\n`;
      }
      reply += `Would you like to schedule an assisted site visit with our team? 💖`;
    } else {
      reply = `${prefix}Aapke inquiry ke anusar ${p1.locality} mein yeh hamara verified option hai:\n\n` +
        `🏢 *${p1.name}*\n` +
        `📍 ${p1.locality}\n` +
        `💰 *Price Range:* ${p1.priceRange || p1.startingPrice} (${p1.configurations.join(', ')})\n` +
        `📜 *RERA Status:* ${p1.status} (RERA: ${p1.reraNumber})\n` +
        `✨ *Key Details:* ${p1.highlights}${amenityNote}\n\n`;

      if (p2) {
        reply += `🏢 *${p2.name}*\n` +
          `📍 ${p2.locality} (Starting ${p2.startingPrice})\n\n`;
      }
      reply += `Kya aap iska site visit dekhna chahenge? Main Satnam Sir ke desk se arrange kar sakti hoon na! 💖`;
    }

    return {
      reply,
      buttons: ['Site Visit Schedule', 'Call Satnam Sir', 'Rent Agreement'],
      intent: 'PROPERTY_OPTIONS'
    };
  }

  // Path 5: Property Inquired But NO Matches Exist (Directive 2 & 5: Honest Unknown Path)
  if (evidence.unknownElements.length > 0) {
    let reply = '';
    const missingDesc = evidence.unknownElements.join(', ');

    if (lang === 'english') {
      reply = `${prefix}I can help confirm that for you! Currently, we do not have an active verified listing directly matching ${missingDesc} in our database.\n\n` +
        `Rather than giving you unverified estimates, I would be happy to have Satnam Sir (+91 84210 77613) and our property team check builder inventory and get back to you with exact verified options. Would you like a callback? 💖`;
    } else {
      reply = `${prefix}Main samajh sakti hoon! Abhi hamare verified database mein ${missingDesc} ke liye direct active option confirmed nahi hai.\n\n` +
        `Galat ya unverified details dene ke bajaye, main Satnam Sir (+91 84210 77613) se fresh builder inventory verify karwake aapko accurate update arrange karwa sakti hoon. Kya main aapke liye callback schedule karun? 💖`;
    }

    return {
      reply,
      buttons: ['Call Satnam Sir', 'View Pale Gaon Options', 'Rent Agreement'],
      intent: 'HONEST_UNKNOWN_CONFIRMATION'
    };
  }

  // Default Greeting / Clarification
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
    reply = `${prefix}At Dashmesh Properties, we specialize in verified real estate and registered rent agreements across Ambernath, Pale Gaon, and Badlapur.\n\n` +
      `Could you please share your preferred area, property type (1 BHK / 2 BHK), or budget so I can find verified options for you? 💖`;
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
 * Main WhatsApp Incoming Message Processing Flow with Strict Output Validation
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

  // 7. RETRIEVAL BEFORE GENERATION (Directive 3): Retrieve genuine verified evidence
  const updatedContact = crmStore.getOrCreateContact(cleanPhone);
  const evidence = knowledge.retrieveEvidence(userMessage, updatedContact.qualification);
  const history = crmStore.getPromptConversationHistory(cleanPhone, 8);

  // Record unresolved questions for admin review queue (Directive 10)
  if (evidence.unknownElements.length > 0) {
    for (const item of evidence.unknownElements) {
      crmStore.recordUnresolvedQuestion(cleanPhone, userMessage, item);
    }
  }

  let finalReply = null;
  let responseIntent = 'SIA_ASSISTANT_REPLY';

  // 8. Attempt Gemini Generative AI Call if API Key configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = buildGeminiEvidencePrompt(customerName, userMessage, history, updatedContact.qualification, evidence);
      const candidateGemini = await callGemini(prompt);

      if (candidateGemini) {
        // DIRECTIVE 8: Deterministic Output Factuality Validation
        const validation = knowledge.validateOutputFactuality(candidateGemini, evidence);
        if (validation.isValid) {
          finalReply = candidateGemini;
          responseIntent = 'GEMINI_AI_REPLY';
        } else {
          console.warn('[Sia Brain] Gemini candidate failed factuality check, sanitized:', validation.violations);
          finalReply = validation.sanitizedReply;
          responseIntent = 'GEMINI_AI_SANITIZED';
        }
      }
    } catch (e) {
      console.warn('[Sia Brain] Gemini call failed, falling back to deterministic engine:', e.message);
    }
  }

  // 9. Deterministic Grounded Fallback (guarantees 100% reliable, verified response)
  if (!finalReply) {
    const fallbackResult = generateDeterministicGroundedReply(userMessage, customerName, updatedContact, updatedContact.qualification, evidence, detectedLang);
    // Run validation pass on fallback as well
    const validation = knowledge.validateOutputFactuality(fallbackResult.reply, evidence);
    finalReply = validation.sanitizedReply;
    responseIntent = fallbackResult.intent;
  }

  // 10. Mark greeting sent so it is NEVER repeated (Rule 1)
  crmStore.markGreetingSent(cleanPhone);

  return {
    reply: finalReply,
    buttons: ['Rent Agreement', 'Site Visit', 'Call Satnam Sir'],
    intent: responseIntent,
    evidenceRetrieved: {
      hasVerifiedMatch: evidence.hasVerifiedMatch,
      matchedCount: evidence.matchedListings.length,
      unknownElements: evidence.unknownElements
    }
  };
}

module.exports = {
  BUSINESS_FACTS,
  detectLanguage,
  extractQualificationUpdates,
  detectHumanHandoffRequest,
  isStandaloneGreeting,
  processIncomingMessage
};
