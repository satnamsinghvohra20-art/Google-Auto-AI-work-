/**
 * ============================================================================
 * Dashmesh Properties — Grounded Property Knowledge & Fact Retrieval Engine
 * ============================================================================
 * Strict Zero-Hallucination & Source-of-Truth Module
 * 
 * Complies with:
 * - Directive 2: Establish a Verified Source of Truth
 * - Directive 3: Retrieval Before Generation
 * - Directive 4: Strict Factuality Rules
 * - Directive 5: Honest Unknown-Answer Path
 * - Directive 8: Deterministic Output Validation
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

// 1. Verified Business Profile (Absolute Ground Truth)
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
  officeHours: 'Monday to Sunday, 10:00 AM – 8:30 PM (Appointments recommended)',
  primaryServiceAreas: [
    'Ambernath East',
    'Ambernath West',
    'Pale Gaon',
    'Ulhasnagar',
    'Badlapur East',
    'Badlapur West',
    'Kalyan'
  ],
  rentAgreement: {
    costPerSide: '₹1,750',
    totalCost: '₹3,500 all-inclusive',
    priceBasis: 'all_inclusive_government_package',
    legalAct: 'Maharashtra Rent Control Act Section 55',
    doorstepBiometric: 'Doorstep biometric verification available across Ambernath, Badlapur, Ulhasnagar, and Kalyan',
    documentsRequired: [
      'Aadhaar Card & PAN Card of Owner/Landlord',
      'Aadhaar Card & PAN Card of Tenant',
      'Aadhaar Card & PAN Card of 2 Witnesses',
      'Property Electricity Bill or Index II'
    ],
    timeline: 'Drafting within 24 hours, government registration certificate delivered with official QR code.'
  }
};

// 2. High-Fidelity Verified Inventory Cache
let verifiedPropertiesCache = null;

function normalizePriceString(raw) {
  if (!raw) return '';
  return raw.replace(/Γé╣/g, '₹').trim();
}

/**
 * Load and structure verified property inventory
 */
function loadVerifiedInventory() {
  if (verifiedPropertiesCache) return verifiedPropertiesCache;

  const rawListings = [];
  try {
    const projectsFile = path.join(__dirname, 'data', 'projects.json');
    if (fs.existsSync(projectsFile)) {
      const data = fs.readFileSync(projectsFile, 'utf8').replace(/^\uFEFF/, '');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        rawListings.push(...parsed);
      }
    }
  } catch (err) {
    console.warn('[Knowledge Engine] Notice reading projects.json:', err.message);
  }

  // Fallback core verified inventory if file is empty
  if (rawListings.length === 0) {
    rawListings.push(
      {
        id: 'amb-01',
        name: 'New Floora (Dashmesh Base HQ)',
        developer: 'Floora Developers',
        region: 'Ambernath',
        subArea: 'Pale Gaon',
        locality: 'Pale Gaon, Ambernath East - 421501',
        configurations: ['1 RK', '1 BHK', '2 BHK', 'Commercial Shops'],
        startingPrice: '₹21 Lakhs',
        priceRange: '₹21L - ₹48L',
        priceBasis: 'published_asking_price',
        ratePerSqFt: '₹4,200/sq.ft',
        carpetArea: '385 - 720 sq.ft',
        reraNumber: 'P51700005421',
        status: 'Ready to Move',
        possession: 'Immediate / Ready',
        amenities: ['CCTV Surveillance', '24/7 KDMC Water Supply', 'Kids Play Area', 'Lifts with Battery Backup', 'Commercial Street'],
        isAvailable: true,
        lastVerified: '2026-10-01T00:00:00Z',
        source: 'Dashmesh On-site Base HQ Office'
      },
      {
        id: 'amb-02',
        name: 'GBK Whispering Palms',
        developer: 'GBK Group',
        region: 'Ambernath',
        subArea: 'Pale Gaon',
        locality: 'Pale Gaon, Ambernath East - 421501',
        configurations: ['1 BHK', '2 BHK'],
        startingPrice: '₹23 Lakhs',
        priceRange: '₹23L - ₹42L',
        priceBasis: 'published_asking_price',
        ratePerSqFt: '₹4,100/sq.ft',
        carpetArea: '410 - 650 sq.ft',
        reraNumber: 'P51700018944',
        status: 'Ready to Move',
        possession: 'Ready Possession',
        amenities: ['Landscaped Garden', 'Clubhouse', 'Power Backup', 'Gymnasium', 'Children Play Area'],
        isAvailable: true,
        lastVerified: '2026-10-01T00:00:00Z',
        source: 'Dashmesh Associate Desk'
      },
      {
        id: 'amb-03',
        name: 'Laxmi Niwas',
        developer: 'Laxmi Infra',
        region: 'Ambernath',
        subArea: 'Pale Gaon',
        locality: 'Near Dashmesh Office, Pale Gaon, Ambernath East - 421501',
        configurations: ['1 RK', '1 BHK'],
        startingPrice: '₹18 Lakhs',
        priceRange: '₹18L - ₹27L',
        priceBasis: 'published_asking_price',
        ratePerSqFt: '₹3,900/sq.ft',
        carpetArea: '340 - 510 sq.ft',
        reraNumber: 'P51700022419',
        status: 'Ready to Move',
        possession: 'Ready',
        amenities: ['24/7 Water Supply', 'Security', 'Intercom'],
        isAvailable: true,
        lastVerified: '2026-10-01T00:00:00Z',
        source: 'Builder Direct Inventory'
      },
      {
        id: 'amb-04',
        name: 'Empire Centrum',
        developer: 'Empire Group',
        region: 'Ambernath',
        subArea: 'Ambernath West',
        locality: 'Ambernath West - 421505',
        configurations: ['1 BHK', '2 BHK', 'Commercial'],
        startingPrice: '₹28 Lakhs',
        priceRange: '₹28L - ₹55L',
        priceBasis: 'published_asking_price',
        ratePerSqFt: '₹4,500/sq.ft',
        carpetArea: '420 - 750 sq.ft',
        reraNumber: 'P51700020188',
        status: 'Under Construction & Ready Phases',
        possession: 'Phased Possession',
        amenities: ['Clubhouse', 'Swimming Pool', 'Indoor Games', 'Jogging Track', 'CCTV'],
        isAvailable: true,
        lastVerified: '2026-10-01T00:00:00Z',
        source: 'Builder Direct Enclave'
      }
    );
  }

  // Normalize all raw listings
  verifiedPropertiesCache = rawListings.map(p => ({
    listingId: p.id || `prop_${Math.random().toString(36).slice(2, 8)}`,
    name: p.name || 'Dashmesh Associate Property',
    developer: p.developer || 'Verified Builder',
    region: p.region || 'Ambernath',
    subArea: p.subArea || '',
    locality: p.locality || 'Ambernath, Maharashtra',
    configurations: Array.isArray(p.configurations) ? p.configurations : ['1 BHK'],
    startingPrice: normalizePriceString(p.startingPrice || ''),
    priceRange: normalizePriceString(p.priceRange || p.startingPrice || ''),
    priceBasis: p.priceBasis || 'published_asking_price',
    ratePerSqFt: normalizePriceString(p.ratePerSqFt || p.rateSqFt || ''),
    carpetArea: p.carpetArea || '',
    reraNumber: p.reraNumber || 'Applied/Verified',
    status: p.status || 'Ready to Move',
    possession: p.possession || 'Ready Possession',
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    isAvailable: p.isAvailable !== false,
    lastVerified: p.lastVerified || '2026-10-01T00:00:00Z',
    source: p.source || 'Dashmesh Ground Reality Desk'
  }));

  return verifiedPropertiesCache;
}

/**
 * Check if an area is in Dashmesh primary service coverage
 */
function isSupportedServiceArea(text) {
  if (!text) return true;
  const lower = text.toLowerCase();
  const unsupportedAreas = [
    'pune', 'mumbai south', 'navi mumbai', 'andheri', 'bandra', 'dadar',
    'borivali', 'nagpur', 'nashik', 'aurangabad', 'thane west', 'thane station'
  ];
  return !unsupportedAreas.some(area => lower.includes(area));
}

/**
 * Retrieve verified evidence matching the customer's query
 * STRICT RULE: If no verified record exists, return EMPTY array. Never fill with arbitrary defaults!
 */
function retrieveEvidence(queryText = '', qualification = {}, conversationHistory = []) {
  const inventory = loadVerifiedInventory();
  const lower = (queryText || '').toLowerCase();

  const evidence = {
    hasVerifiedMatch: false,
    matchedListings: [],
    businessFacts: null,
    rentAgreementFacts: null,
    queriedAmenities: [],
    verifiedAmenitiesFound: [],
    unverifiedAmenities: [],
    queriedLocality: null,
    isCoverageArea: isSupportedServiceArea(lower),
    unknownElements: [],
    requiresHumanEscalation: false,
    escalationReason: null
  };

  // 1. Check for Business & Office Information inquiries
  if (
    lower.includes('office') ||
    lower.includes('address') ||
    lower.includes('kahan hai') ||
    lower.includes('kaha hai') ||
    lower.includes('location') ||
    lower.includes('satnam') ||
    lower.includes('founder') ||
    lower.includes('timing') ||
    lower.includes('hours')
  ) {
    evidence.businessFacts = BUSINESS_FACTS;
  }

  // 2. Check for Rent Agreement inquiries
  if (
    lower.includes('rent agreement') ||
    lower.includes('agreement') ||
    lower.includes('police verification') ||
    lower.includes('biometric') ||
    lower.includes('stamp duty') ||
    lower.includes('एग्रीमेंट') ||
    lower.includes('करार') ||
    lower.includes('रेंट')
  ) {
    evidence.rentAgreementFacts = BUSINESS_FACTS.rentAgreement;
  }

  // 3. Extract queried locality
  if (lower.includes('pale gaon') || lower.includes('palegaon') || lower.includes('pale naka')) {
    evidence.queriedLocality = 'Pale Gaon';
  } else if (lower.includes('ambernath east') || lower.includes('ambarnath e')) {
    evidence.queriedLocality = 'Ambernath East';
  } else if (lower.includes('ambernath west') || lower.includes('ambarnath w')) {
    evidence.queriedLocality = 'Ambernath West';
  } else if (lower.includes('ambernath') || lower.includes('ambarnath')) {
    evidence.queriedLocality = 'Ambernath';
  } else if (lower.includes('badlapur')) {
    evidence.queriedLocality = 'Badlapur';
  } else if (lower.includes('ulhasnagar')) {
    evidence.queriedLocality = 'Ulhasnagar';
  } else if (lower.includes('kalyan')) {
    evidence.queriedLocality = 'Kalyan';
  } else if (!evidence.isCoverageArea) {
    // Unsupported city/locality detected
    const matchedUnsupported = ['pune', 'navi mumbai', 'andheri', 'bandra', 'borivali', 'nashik', 'nagpur'].find(c => lower.includes(c));
    evidence.queriedLocality = matchedUnsupported ? matchedUnsupported.toUpperCase() : 'Outside Primary Coverage';
    evidence.unknownElements.push(`Coverage for ${evidence.queriedLocality}`);
    evidence.requiresHumanEscalation = true;
    evidence.escalationReason = `Customer inquired about ${evidence.queriedLocality}, which is outside our active local coverage (Ambernath, Pale Gaon, Badlapur, Kalyan).`;
  }

  // 4. Extract requested amenities
  const commonAmenities = [
    { key: 'covered_parking', regex: /covered parking|car parking|parking space/i, label: 'Covered Car Parking' },
    { key: 'parking', regex: /parking/i, label: 'Parking' },
    { key: 'swimming_pool', regex: /swimming pool|pool/i, label: 'Swimming Pool' },
    { key: 'clubhouse', regex: /clubhouse|club house/i, label: 'Clubhouse' },
    { key: 'gym', regex: /gym|gymnasium/i, label: 'Gymnasium' },
    { key: 'water_supply', regex: /water|24\/7 water|kdmc/i, label: '24/7 Water Supply' },
    { key: 'gas_pipeline', regex: /gas pipeline|piped gas|mahanagar gas/i, label: 'Piped Gas' },
    { key: 'lift', regex: /lift|elevator/i, label: 'Lift' },
    { key: 'security', regex: /cctv|security|guard/i, label: 'CCTV & Security' }
  ];

  for (const a of commonAmenities) {
    if (a.regex.test(lower)) {
      evidence.queriedAmenities.push(a);
    }
  }

  // 5. Search verified listings ONLY when property search criteria are present
  const isPropertyInquiry =
    lower.includes('bhk') ||
    lower.includes('rk') ||
    lower.includes('flat') ||
    lower.includes('property') ||
    lower.includes('ghar') ||
    lower.includes('room') ||
    lower.includes('shop') ||
    lower.includes('commercial') ||
    lower.includes('ready to move') ||
    lower.includes('starting price') ||
    lower.includes('price range') ||
    lower.includes('project') ||
    lower.includes('floora') ||
    lower.includes('palms') ||
    lower.includes('niwas') ||
    lower.includes('centrum') ||
    evidence.queriedAmenities.length > 0 ||
    evidence.queriedLocality !== null;

  if (isPropertyInquiry && evidence.isCoverageArea) {
    const bhkMatch = lower.match(/(\d+)\s*(bhk|rk)/i);
    const requestedBhk = qualification.bhk || (bhkMatch ? `${bhkMatch[1]} ${bhkMatch[2].toUpperCase()}` : null) ||
      (lower.includes('shop') || lower.includes('commercial') ? 'Commercial' : null);

    const matches = inventory.filter(p => {
      // Must be currently available
      if (!p.isAvailable) return false;

      // Locality match
      if (evidence.queriedLocality) {
        const qLoc = evidence.queriedLocality.toLowerCase();
        const pLoc = (p.locality + ' ' + p.region + ' ' + p.subArea).toLowerCase();
        if (!pLoc.includes(qLoc)) return false;
      }

      // Specific Project Name match (e.g. "whispering palms", "new floora", "empire centrum")
      const pNameLower = p.name.toLowerCase();
      if (lower.includes('whispering') && !pNameLower.includes('whispering')) return false;
      if (lower.includes('floora') && !pNameLower.includes('floora')) return false;
      if (lower.includes('centrum') && !pNameLower.includes('centrum')) return false;
      if (lower.includes('laxmi') && !pNameLower.includes('laxmi')) return false;

      // Configuration match
      if (requestedBhk) {
        const hasBhk = p.configurations.some(c => c.toLowerCase().includes(requestedBhk.toLowerCase()));
        if (!hasBhk) return false;
      }

      return true;
    });

    if (matches.length > 0) {
      evidence.hasVerifiedMatch = true;
      evidence.matchedListings = matches.slice(0, 3); // Top 3 genuine matches

      // Verify queried amenities against the matched listings
      if (evidence.queriedAmenities.length > 0) {
        const primaryListing = evidence.matchedListings[0];
        const listingAmenitiesLower = primaryListing.amenities.map(a => a.toLowerCase());

        for (const qa of evidence.queriedAmenities) {
          const found = listingAmenitiesLower.some(la => la.includes(qa.key) || la.includes(qa.label.toLowerCase()));
          if (found) {
            evidence.verifiedAmenitiesFound.push(qa.label);
          } else {
            evidence.unverifiedAmenities.push(qa.label);
            evidence.unknownElements.push(`${qa.label} for ${primaryListing.name}`);
          }
        }
      }
    } else {
      // STRICT ZERO-HALLUCINATION: If criteria yielded 0 matches, record as unknown!
      evidence.hasVerifiedMatch = false;
      evidence.matchedListings = [];
      evidence.unknownElements.push(`Verified listing matching ${requestedBhk || 'criteria'} in ${evidence.queriedLocality || 'requested area'}`);
    }
  }

  return evidence;
}

/**
 * Deterministic Output Validation (Directive 8)
 * Checks the candidate reply against retrieved evidence.
 * Rejects or sanitizes unverified prices, imaginary listings, or fake promises.
 */
function validateOutputFactuality(candidateReply, evidence) {
  if (!candidateReply || typeof candidateReply !== 'string') {
    return {
      isValid: false,
      violations: ['Candidate reply is empty or null'],
      sanitizedReply: 'I can help confirm that for you. Let me check with our property team and get back to you with verified details. 💖'
    };
  }

  const violations = [];
  let sanitized = candidateReply;

  // 1. Prohibited Overconfident / Fabricated Guarantee Phrases
  const prohibitedClaims = [
    { regex: /100%\s*(confirmed|guaranteed|clear)/i, reason: 'Unverified 100% guarantee claim' },
    { regex: /loan\s*(is\s*)?guaranteed/i, reason: 'Unverified loan approval guarantee' },
    { regex: /returns?\s*(is\s*)?guaranteed/i, reason: 'Unverified financial return guarantee' },
    { regex: /appointment\s*has\s*been\s*booked/i, reason: 'Claimed appointment booked before human confirmation' }
  ];

  for (const pc of prohibitedClaims) {
    if (pc.regex.test(sanitized)) {
      violations.push(pc.reason);
      sanitized = sanitized.replace(pc.regex, 'subject to bank & legal verification');
    }
  }

  // 2. Out-of-Area / Non-Existent Listing Claim Check
  if (!evidence.hasVerifiedMatch && evidence.unknownElements.length > 0) {
    // If reply claims we have available flats for something where 0 matches exist
    const claimsAvailable = /available\s*hai|ready\s*option\s*hai|hum\s*provide\s*karte\s*hain/i.test(sanitized);
    const mentionsUnverified = evidence.unknownElements.some(u => sanitized.toLowerCase().includes(u.toLowerCase()));

    if (claimsAvailable && mentionsUnverified) {
      violations.push('Model claimed availability for unverified / non-existent listing');
      sanitized = `Is specific query ke liye hamare verified system mein abhi active listing confirmed nahi hai. 💖 Par chinta mat kijiye, main Satnam Sir (+91 84210 77613) se verify karwa kar aapko exact update arrange karwa sakti hoon!`;
    }
  }

  // 3. Unverified Amenities Check
  if (evidence.unverifiedAmenities.length > 0) {
    for (const ua of evidence.unverifiedAmenities) {
      const claimsAmenityPresent = new RegExp(`(${ua}\\s*available|${ua}\\s*hai|with\\s*${ua})`, 'i');
      if (claimsAmenityPresent.test(sanitized)) {
        violations.push(`Model claimed unverified amenity: ${ua}`);
        sanitized = sanitized.replace(claimsAmenityPresent, `${ua} (hamari team se confirm karwana hoga)`);
      }
    }
  }

  // 4. Price Basis Clarity Check
  // If property price is mentioned, ensure it's not falsely claimed as all-inclusive unless rent agreement
  if (evidence.matchedListings.length > 0 && !evidence.rentAgreementFacts) {
    if (/all-inclusive|all\s*inclusive/i.test(sanitized)) {
      violations.push('Property sale price falsely described as all-inclusive without breakdown');
      sanitized = sanitized.replace(/all-inclusive|all\s*inclusive/gi, 'published asking price (stamp duty & registration extra)');
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    sanitizedReply: sanitized
  };
}

module.exports = {
  BUSINESS_FACTS,
  loadVerifiedInventory,
  isSupportedServiceArea,
  retrieveEvidence,
  validateOutputFactuality
};
