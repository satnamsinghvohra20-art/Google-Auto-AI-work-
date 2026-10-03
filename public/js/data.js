/**
 * Grexa AI Growth Suite - Unlocked & Fully Operational Data Models
 * Includes Multi-Branch Franchises, Keywords Radar, Standee Templates, and WhatsApp CRM
 */

const DEFAULT_REPORT = {
  _id: "6aba452ec5cdfac7806c5bda",
  googlePlaceId: "ChIJDxFBTbyV5zsRcHylJmmARG8",
  name: "Dashmesh Properties",
  ownerName: "Kuldeep Kaur & Sukhjyot Singh",
  phone: "+91 84120 70183",
  altPhone: "+91 84219 40013",
  whatsappPhone: "+91 87937 71911",
  email: "info@dashmeshproperties.com",
  status: "generated",
  createdOn: "2026-09-28T10:45:02.821Z",
  report: {
    name: "Dashmesh Properties",
    category: "Property Consultant",
    address: "New Floora, Shop No. 24, Pale Gaon, Ambernath (E) - 421 501",
    city: "Ambernath",
    state: "Maharashtra",
    country: "India",
    rating: 0,
    totalReviewCount: 0,
    overallAvgRank: 21,
    profileStrength: 23,
    contentSeoScore: 15,
    profileCompletionScore: 57,
    engagementScore: 0,
    ratingScore: 0,
    primaryKeyword: "Property Consultant",
    primaryKeywordRanking: {
      keyword: "Property Consultant",
      gridWidth: 3,
      avgPosition: 21,
      gridImage: "public/grid-ranking-dashmesh.jpeg",
      pointPositions: [
        { id: 1, position: 21, lat: 19.2016, lng: 73.1671, label: "Pale Goan" },
        { id: 2, position: 21, lat: 19.2016, lng: 73.1785, label: "Ambernath Station E" },
        { id: 3, position: 21, lat: 19.2016, lng: 73.1900, label: "MIDC Ambernath" },
        { id: 4, position: 19.1908, lng: 73.1671, label: "Shiv Mandir Rd" },
        { id: 5, position: 21, lat: 19.1908, lng: 73.1785, label: "Central Ambernath" },
        { id: 6, position: 21, lat: 19.1908, lng: 73.1900, label: "Kansai Section" },
        { id: 7, position: 21, lat: 19.1800, lng: 73.1671, label: "Morivali" },
        { id: 8, position: 21, lat: 19.1800, lng: 73.1785, label: "Badlapur Link Rd" },
        { id: 9, position: 21, lat: 19.1800, lng: 73.1900, label: "Navare Nagar" }
      ]
    },
    competitors: [
      { name: "Rudra Realty", avgRank: 1.4, reviewCount: 130, rating: 5.0, distance: "0.8 km", gbpPlaceId: "ChIJ08_LXm6V5zsRDjuU8fwtAUU", weakness: "Inactive posts & weak citation distribution" },
      { name: "GK Property Consultant", avgRank: 3.9, reviewCount: 19, rating: 4.4, distance: "1.2 km", gbpPlaceId: "ChIJMQGw9-WV5zsRvr0ZLD8PqO4", weakness: "Low review volume and slow response rate" },
      { name: "Delight Homes Real Estate", avgRank: 4.9, reviewCount: 56, rating: 4.9, distance: "1.5 km", gbpPlaceId: "ChIJveZ0BbCT5zsR0RBiGV4ly8Y", weakness: "No geo-tagged photo updates in 4 months" },
      { name: "Sherawali Property Consultancy", avgRank: 6.1, reviewCount: 60, rating: 5.0, distance: "2.1 km", gbpPlaceId: "ChIJs2c8FnaV5zsRa3duzWlx4Ck", weakness: "Generic description with 0 secondary categories" },
      { name: "Shivanya Properties", avgRank: 8.7, reviewCount: 33, rating: 5.0, distance: "2.4 km", gbpPlaceId: "ChIJDbIYSgGT5zsRLZvxkKdA7XQ", weakness: "Missing appointment link and Q&A section" }
    ],
    otherKeywords: [
      { keyword: "Residential Property Consultation", avgRank: 21, searchVolume: "1,200/mo", difficulty: "Easy" },
      { keyword: "Commercial Property Consultation", avgRank: 21, searchVolume: "850/mo", difficulty: "Medium" },
      { keyword: "Real Estate Investment Advice", avgRank: 21, searchVolume: "1,600/mo", difficulty: "Low" },
      { keyword: "Property Valuation Services", avgRank: 21, searchVolume: "950/mo", difficulty: "Low" },
      { keyword: "Flat for Sale in Ambernath", avgRank: 21, searchVolume: "3,400/mo", difficulty: "High" }
    ],
    keywordMissedIn: ["Business Title", "Additional Category", "Business Services", "Profile Description"],
    profileCompletion: [
      { name: "Business Title", completed: true, note: "Present, but needs keyword boost" },
      { name: "Primary Category", completed: true, note: "Property Consultant" },
      { name: "Additional Categories", completed: false, note: "0 added (Need at least 3)" },
      { name: "Business Services", completed: true, note: "5 services listed" },
      { name: "Profile Description", completed: true, note: "Generic text, no SEO keywords" },
      { name: "Address & Pin Code", completed: true, note: "Verified location in Ambernath" },
      { name: "Phone Number", completed: true, note: "+91 84210 77613" },
      { name: "Service Area", completed: false, note: "Not specified (Missing local suburbs)" },
      { name: "Business Hours", completed: true, note: "Updated" },
      { name: "Website Link", completed: false, note: "No URL connected" },
      { name: "Photos & Interior", completed: false, note: "0 geo-tagged photos uploaded" },
      { name: "Business Logo & Cover", completed: false, note: "Missing branded graphics" },
      { name: "Appointment Links", completed: false, note: "Missing direct booking" }
    ],
    comments: [
      "Primary keyword 'Property Consultant' not included in title.",
      "Zero additional categories added. Missing 'Real Estate Agency' and 'Commercial Real Estate Agency'.",
      "No customer reviews detected. Top competitor has 130 5-star reviews.",
      "No active Google Posts in the last 90 days. Algorithm ranks active profiles higher.",
      "Profile description missing high-intent local search terms for Ambernath & Kalyan."
    ]
  }
};

// Multi-Location Franchise Database
const FRANCHISE_LOCATIONS = {
  ambernath_main: {
    id: "ambernath_main",
    name: "Dashmesh Property (Ambernath East - Main Branch)",
    shortName: "Ambernath East HQ",
    address: "New Floora, Shop no.24, Pale goan, Ambernath(E), Maharashtra 421501",
    city: "Ambernath",
    phone: "+91 84210 77613",
    lat: 19.1908,
    lng: 73.1785,
    placeId: "ChIJDxFBTbyV5zsRcHylJmmARG8",
    rating: 0.0,
    reviews: 0,
    currentRank: 21
  },
  badlapur_branch: {
    id: "badlapur_branch",
    name: "Dashmesh Property (Badlapur West Branch)",
    shortName: "Badlapur West Branch",
    address: "Shop 12, Station Road, Near Gandhi Chowk, Badlapur West 421503",
    city: "Badlapur",
    phone: "+91 84210 77613",
    lat: 19.1550,
    lng: 73.2350,
    placeId: "ChIJ_badlapur_dashmesh_02",
    rating: 4.5,
    reviews: 18,
    currentRank: 8
  },
  kalyan_branch: {
    id: "kalyan_branch",
    name: "Dashmesh Property (Kalyan West Branch)",
    shortName: "Kalyan West Branch",
    address: "G-4, Silver Arcade, Shivaji Chowk, Kalyan West 421301",
    city: "Kalyan",
    phone: "+91 84210 77613",
    lat: 19.2437,
    lng: 73.1355,
    placeId: "ChIJ_kalyan_dashmesh_03",
    rating: 4.8,
    reviews: 34,
    currentRank: 4
  }
};

// Multi-Keyword Live SERP Radar
const MULTI_KEYWORD_RADAR = [
  {
    keyword: "Property Consultant in Ambernath",
    searchVolume: "1,800 searches/mo",
    intent: "High Commercial",
    myRank: 21,
    topCompetitor: "Rudra Realty (#1)",
    gap: "-20 positions",
    potentialCalls: "+45 calls/mo"
  },
  {
    keyword: "Flats for Sale in Ambernath East",
    searchVolume: "3,400 searches/mo",
    intent: "High Buyer",
    myRank: 21,
    topCompetitor: "Delight Homes (#1)",
    gap: "-20 positions",
    potentialCalls: "+70 calls/mo"
  },
  {
    keyword: "Real Estate Agent Near Ambernath Station",
    searchVolume: "2,100 searches/mo",
    intent: "Immediate Visit",
    myRank: 19,
    topCompetitor: "GK Property Consultant (#1)",
    gap: "-18 positions",
    potentialCalls: "+55 calls/mo"
  },
  {
    keyword: "Commercial Shop Rent Ambernath",
    searchVolume: "850 searches/mo",
    intent: "Commercial Leasing",
    myRank: 21,
    topCompetitor: "Sherawali Property Consultancy (#1)",
    gap: "-20 positions",
    potentialCalls: "+25 calls/mo"
  }
];

// Automated WhatsApp Funnel Sequences
const WHATSAPP_TEMPLATES = [
  {
    id: "immediate_thank_you",
    name: "Immediate Thank You & 5-Star Invite",
    tagline: "Sent 30 mins after client consultation",
    text: "Hello {{name}}! 👋 Thank you for visiting {{business}} today. Our team is dedicated to transparent and honest advice. Could you take 10 seconds to share your experience with a 5-star Google review? {{link}} — Thank you so much!"
  },
  {
    id: "followup_24h",
    name: "24-Hour Polite Follow-Up",
    tagline: "Sent next morning to warm clients",
    text: "Hi {{name}}! Hope your property search is going well. We wanted to check in and see if you had any questions regarding the options we discussed at {{business}}. If you enjoyed our service, leaving a quick review really helps our family business grow: {{link}} 🙏"
  },
  {
    id: "vip_discount",
    name: "VIP Voucher / Free Valuation Incentive",
    tagline: "High-converting review incentive",
    text: "Dear {{name}}, as a valued client of {{business}}, leave us a quick Google review here: {{link}} and show this message at our desk to claim your Free Legal Property Valuation & ₹500 Consulting Voucher! 🎁"
  }
];

// In-Store Standee Design Themes
const STANDEE_THEMES = {
  indigo_modern: {
    id: "indigo_modern",
    name: "Royal Indigo Modern",
    bgClass: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white",
    accentClass: "text-indigo-400",
    badgeClass: "bg-indigo-600 text-white",
    qrBorder: "border-indigo-400"
  },
  luxury_gold: {
    id: "luxury_gold",
    name: "Golden Prestige Luxury",
    bgClass: "bg-gradient-to-br from-amber-950 via-slate-900 to-black text-amber-100",
    accentClass: "text-amber-400",
    badgeClass: "bg-amber-500 text-slate-950 font-black",
    qrBorder: "border-amber-400"
  },
  emerald_trust: {
    id: "emerald_trust",
    name: "Emerald Verified Trust",
    bgClass: "bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white",
    accentClass: "text-emerald-400",
    badgeClass: "bg-emerald-500 text-white",
    qrBorder: "border-emerald-400"
  },
  classic_white: {
    id: "classic_white",
    name: "Minimalist Studio Clean",
    bgClass: "bg-white text-slate-900 border-2 border-slate-200",
    accentClass: "text-brand-primary",
    badgeClass: "bg-brand-primary text-white",
    qrBorder: "border-slate-300"
  }
};

const STANDEE_TEMPLATES = STANDEE_THEMES;

// Preset Sample Photos for Instant Geo-Tag Watermark Testing
const SAMPLE_GEOPHOTOS = [
  {
    id: "photo_office_front",
    name: "Storefront & Signboard",
    url: "public/firstcry.jpeg",
    label: "Exterior Shop Entrance"
  },
  {
    id: "photo_consultation_desk",
    name: "Consultation Lounge",
    url: "public/metropolis.jpeg",
    label: "Client Discussion Desk"
  },
  {
    id: "photo_property_flat",
    name: "Ambernath Property Flat",
    url: "public/midas.jpeg",
    label: "Residential Project Showcase"
  }
];

// Agency White-Label Configuration Defaults
const AGENCY_CONFIG = {
  enabled: false,
  agencyName: "Satnam AI Growth Agency",
  tagline: "Autonomous Local Search Dominance for Businesses",
  supportEmail: "growth@satnamagency.com",
  supportPhone: "+91 84210 77613",
  clientRetainer: "₹14,999 / mo",
  clientName: "Dashmesh Property"
};

const SAMPLE_PRESETS = {
  dashmesh: DEFAULT_REPORT,
  apollo_dental: {
    _id: "report_apollo_dental_781",
    googlePlaceId: "ChIJ_apollo_mumbai_091",
    name: "Apollo Dental Clinic",
    ownerName: "Dr. Ananya Roy",
    phone: "+91 98201 11223",
    email: "clinic@apollodental.in",
    status: "generated",
    report: {
      name: "Apollo Dental Clinic",
      category: "Dentist",
      address: "Plot 42, Linking Road, Bandra West, Mumbai 400050",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      rating: 3.8,
      totalReviewCount: 14,
      overallAvgRank: 16.4,
      profileStrength: 46,
      contentSeoScore: 38,
      profileCompletionScore: 72,
      engagementScore: 24,
      ratingScore: 50,
      primaryKeyword: "Dentist in Bandra West",
      primaryKeywordRanking: {
        keyword: "Dentist in Bandra West",
        gridWidth: 3,
        avgPosition: 16.4,
        gridImage: "public/grid-ranking-dashmesh.jpeg",
        pointPositions: [
          { id: 1, position: 14, lat: 19.0600, lng: 72.8350, label: "Bandra Station" },
          { id: 2, position: 16, lat: 19.0600, lng: 72.8400, label: "Linking Rd" },
          { id: 3, position: 18, lat: 19.0600, lng: 72.8450, label: "Pali Hill" },
          { id: 4, position: 15, lat: 19.0550, lng: 72.8350, label: "Turner Rd" },
          { id: 5, position: 16, lat: 19.0550, lng: 72.8400, label: "Hill Road" },
          { id: 6, position: 17, lat: 19.0550, lng: 72.8450, label: "Carter Rd" },
          { id: 7, position: 18, lat: 19.0500, lng: 72.8350, label: "Mount Mary" },
          { id: 8, position: 17, lat: 19.0500, lng: 72.8400, label: "Bandstand" },
          { id: 9, position: 16, lat: 19.0500, lng: 72.8450, label: "Khar West" }
        ]
      },
      competitors: [
        { name: "Smile Studio Bandra", avgRank: 2.1, reviewCount: 284, rating: 4.9, distance: "0.4 km" },
        { name: "Dentzz Dental Hospital", avgRank: 3.4, reviewCount: 412, rating: 4.8, distance: "0.9 km" },
        { name: "The Dental Roots", avgRank: 5.2, reviewCount: 156, rating: 4.7, distance: "1.1 km" }
      ],
      otherKeywords: [
        { keyword: "Root Canal Treatment Bandra", avgRank: 14, searchVolume: "2,400/mo", difficulty: "Medium" },
        { keyword: "Teeth Whitening Near Me", avgRank: 18, searchVolume: "3,100/mo", difficulty: "High" },
        { keyword: "Invisalign Specialist Mumbai", avgRank: 19, searchVolume: "1,800/mo", difficulty: "Medium" }
      ],
      keywordMissedIn: ["Additional Category", "Business Services"],
      profileCompletion: [
        { name: "Business Title", completed: true, note: "Apollo Dental Clinic" },
        { name: "Primary Category", completed: true, note: "Dentist" },
        { name: "Additional Categories", completed: false, note: "Missing 'Cosmetic Dentist'" },
        { name: "Photos & Interior", completed: true, note: "12 photos" },
        { name: "Appointment Links", completed: true, note: "Website connected" }
      ],
      comments: [
        "Unanswered reviews detected. 4 negative reviews left without explanation.",
        "Missing 'Emergency Dental Service' attribute.",
        "No weekly medical health tips published to Google Updates."
      ]
    }
  },
  urban_salon: {
    _id: "report_urban_salon_321",
    googlePlaceId: "ChIJ_urban_delhi_882",
    name: "Urban Chic Luxury Salon",
    ownerName: "Pooja Malhotra",
    phone: "+91 99102 33445",
    email: "pooja@urbanchic.co.in",
    status: "generated",
    report: {
      name: "Urban Chic Luxury Salon",
      category: "Beauty Salon",
      address: "Block M, Connaught Place, New Delhi 110001",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      rating: 4.1,
      totalReviewCount: 42,
      overallAvgRank: 12.8,
      profileStrength: 54,
      contentSeoScore: 45,
      profileCompletionScore: 80,
      engagementScore: 35,
      ratingScore: 60,
      primaryKeyword: "Salon in Connaught Place",
      primaryKeywordRanking: {
        keyword: "Salon in Connaught Place",
        gridWidth: 3,
        avgPosition: 12.8,
        gridImage: "public/grid-ranking-dashmesh.jpeg",
        pointPositions: [
          { id: 1, position: 11, lat: 28.6328, lng: 77.2197, label: "Inner Circle" },
          { id: 2, position: 12, lat: 28.6328, lng: 77.2250, label: "Barakhamba" },
          { id: 3, position: 14, lat: 28.6328, lng: 77.2300, label: "Janpath" },
          { id: 4, position: 13, lat: 28.6280, lng: 77.2197, label: "Rajiv Chowk" },
          { id: 5, position: 12, lat: 28.6280, lng: 77.2250, label: "Middle Circle" },
          { id: 6, position: 13, lat: 28.6280, lng: 77.2300, label: "Outer Circle" },
          { id: 7, position: 14, lat: 28.6230, lng: 77.2197, label: "Sansad Marg" },
          { id: 8, position: 13, lat: 28.6230, lng: 77.2250, label: "Tolstoy Rd" },
          { id: 9, position: 13, lat: 28.6230, lng: 77.2300, label: "Kasturba Gandhi" }
        ]
      },
      competitors: [
        { name: "Geetanjali Salon CP", avgRank: 1.8, reviewCount: 680, rating: 4.8, distance: "0.2 km" },
        { name: "Looks Salon Central", avgRank: 3.1, reviewCount: 520, rating: 4.7, distance: "0.5 km" }
      ],
      otherKeywords: [
        { keyword: "Bridal Makeup Delhi CP", avgRank: 11, searchVolume: "4,200/mo", difficulty: "High" },
        { keyword: "Hair Spa Near Me", avgRank: 14, searchVolume: "5,600/mo", difficulty: "Medium" }
      ],
      keywordMissedIn: ["Profile Description", "Services"],
      profileCompletion: [
        { name: "Business Title", completed: true, note: "Urban Chic Luxury Salon" },
        { name: "Primary Category", completed: true, note: "Beauty Salon" }
      ],
      comments: [
        "Need high-res portfolio images of bridal & hair styling.",
        "Competitors post daily offers with 20% discount coupons."
      ]
    }
  }
};

// 7-Day Pre-Generated AI Google Posts
const WEEKLY_POSTS = [
  {
    day: "Monday",
    title: "Market Highlights: Top Residential Properties in Ambernath",
    snippet: "Looking to invest in Ambernath? Whether it's 1BHK, 2BHK, or prime commercial space near the station, Dashmesh Property provides verified listings with complete legal checks. Call today for a free consultation!",
    tag: "#AmbernathRealEstate #PropertyConsultant #FlatForSale",
    cta: "Call Now",
    media: "public/grid-ranking-dashmesh.jpeg"
  },
  {
    day: "Wednesday",
    title: "Why Legal Verification is Crucial Before Buying Property",
    snippet: "Avoid title disputes and unauthorized constructions. At Dashmesh Property, every property is vetted for clear titles, RERA registration, and occupancy certificates. Contact Satnam Singh Vohra for trusted advisory.",
    tag: "#LegalAdvisory #RERA #PropertyConsultantAmbernath",
    cta: "Learn More",
    media: "public/firstcry.jpeg"
  },
  {
    day: "Friday",
    title: "Weekend Special: Exclusive Commercial Office Space Deals",
    snippet: "Prime commercial shops and office spaces available on Badlapur Link Road & MIDC Ambernath. High footfall, excellent appreciation potential. Visit our office at New Floora, Shop no.24.",
    tag: "#CommercialRealEstate #ShopForSale #AmbernathEast",
    cta: "Book Appointment",
    media: "public/metropolis.jpeg"
  },
  {
    day: "Sunday",
    title: "Customer Spotlight: Finding the Perfect Dream Home",
    snippet: "Helping families settle into their dream homes in Ambernath with transparent pricing and zero hidden fees. Thank you for your continued trust in Dashmesh Property!",
    tag: "#DreamHome #ClientSuccess #DashmeshProperty",
    cta: "Call Now",
    media: "public/midas.jpeg"
  }
];

// 40+ Citations Directories Pack for India
const DIRECTORY_CITATIONS = [
  { name: "Google Business Profile", authority: "DA 100", status: "Needs Optimization", category: "Maps & Local" },
  { name: "Justdial", authority: "DA 84", status: "Ready to Submit", category: "Local Directory" },
  { name: "IndiaMART", authority: "DA 88", status: "Ready to Submit", category: "B2B & Services" },
  { name: "Sulekha", authority: "DA 82", status: "Ready to Submit", category: "Services" },
  { name: "99acres", authority: "DA 79", status: "Ready to Submit", category: "Real Estate Portal" },
  { name: "MagicBricks", authority: "DA 81", status: "Ready to Submit", category: "Real Estate Portal" },
  { name: "Housing.com", authority: "DA 78", status: "Ready to Submit", category: "Real Estate Portal" },
  { name: "TradeIndia", authority: "DA 80", status: "Ready to Submit", category: "B2B Directory" },
  { name: "Apple Maps (Apple Business Connect)", authority: "DA 98", status: "Ready to Submit", category: "Navigation" },
  { name: "Bing Places for Business", authority: "DA 94", status: "Ready to Submit", category: "Search Engine" },
  { name: "YellowPages India", authority: "DA 72", status: "Ready to Submit", category: "Directory" },
  { name: "AskLaila", authority: "DA 68", status: "Ready to Submit", category: "City Guide" }
];

const FAQS = [
  {
    q: "How does this unlocked AI growth engine work?",
    a: "This suite connects all the tools needed to dominate Google Maps: keyword density optimization, automated 5-star review request links, ready-to-publish Google posts, and 40+ directory citation templates—completely unlocked without paywalls."
  },
  {
    q: "How fast will my Google ranking improve?",
    a: "Applying the recommended title, categories, and description typically triggers an initial index update in 3 to 7 days. Sustained daily posts and 15+ new Google reviews move profiles into the Top 3 within 30 to 60 days."
  },
  {
    q: "Can I use this for any business or multiple branches?",
    a: "Yes! Use the Universal Profile Scanner in the top bar to enter any business name, category, and city. The system dynamically generates custom audits, geo-grids, review replies, and post schedules for any business."
  },
  {
    q: "Can I copy the pre-made posts and descriptions directly into Google?",
    a: "Absolutely! Every asset has a 1-click 'Copy' button formatted specifically to comply with Google Business Profile policies and character limits."
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DEFAULT_REPORT,
    SAMPLE_PRESETS,
    WEEKLY_POSTS,
    DIRECTORY_CITATIONS,
    FAQS,
    FRANCHISE_LOCATIONS,
    MULTI_KEYWORD_RADAR,
    WHATSAPP_TEMPLATES,
    STANDEE_TEMPLATES,
    SAMPLE_GEOPHOTOS,
    AGENCY_CONFIG
  };
}
