/**
 * Hyper-Local SEO Top-Rank Landing Pages for Dashmesh Properties
 * Optimized for Google Local 3-Pack & Organic #1 Ranking
 */

const OFFICE_INFO = {
  name: "Dashmesh Property & Rent Agreement Services",
  brand: "Dashmesh Properties",
  owner: "Satnam Singh Vohra (Satnam Sir)",
  phone: "+91 84210 77613",
  phoneRaw: "918421077613",
  teamPhones: [
    { name: "Kuldeep Kaur", phone: "+91 84120 70183", wa: "+91 87937 71911" },
    { name: "Sukhjyot Singh", phone: "+91 84219 40013" }
  ],
  address: "Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501, Maharashtra",
  geo: { lat: 19.190800, lng: 73.178500 },
  placeId: "ChIJDxFBTbyV5zsRcHylJmmARG8",
  reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJDxFBTbyV5zsRcHylJmmARG8",
  mapsPin: "https://maps.google.com/?q=19.1908,73.1785",
  rentAgreement: { perSide: "₹1,750", total: "₹3,500" },
  publicUrl: "https://google-auto-ai-work.onrender.com"
};

function getCommonHead(title, description, canonicalPath, extraSchema = "") {
  const fullUrl = `${OFFICE_INFO.publicUrl}${canonicalPath}`;
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${fullUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  
  <!-- Geo-Targeting for Google Maps & Local Pack -->
  <meta name="geo.region" content="IN-MH">
  <meta name="geo.placename" content="Ambernath East, Pale Gaon, Maharashtra">
  <meta name="geo.position" content="${OFFICE_INFO.geo.lat};${OFFICE_INFO.geo.lng}">
  <meta name="ICBM" content="${OFFICE_INFO.geo.lat}, ${OFFICE_INFO.geo.lng}">

  <!-- Open Graph -->
  <meta property="og:locale" content="en_IN">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:site_name" content="${OFFICE_INFO.name}">
  
  <!-- Google Fonts & Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --primary: #0f766e;
      --primary-dark: #115e59;
      --accent: #f59e0b;
      --bg: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #475569;
      --border: #e2e8f0;
      --card-bg: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
    }
    .header-banner {
      background: linear-gradient(135deg, #042f2e 0%, #0f766e 100%);
      color: #ffffff;
      padding: 12px 20px;
      text-align: center;
      font-size: 14px;
      font-weight: 700;
    }
    .header-banner a { color: #fef08a; text-decoration: underline; margin-left: 6px; }
    .nav-bar {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }
    .brand-title { font-size: 20px; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px; }
    .brand-sub { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .nav-links { display: flex; gap: 12px; align-items: center; }
    .btn-nav-review {
      background: #fef3c7;
      color: #92400e;
      padding: 8px 16px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      border: 1px solid #fde68a;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-nav-call {
      background: var(--primary);
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 13px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
    }
    .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px 80px; }
    .hero-box {
      background: linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%);
      border: 1px solid #ccfbf1;
      border-radius: 24px;
      padding: 48px 36px;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(15, 118, 110, 0.08);
      margin-bottom: 40px;
    }
    .badge-top {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    h1 { font-size: 38px; font-weight: 900; line-height: 1.25; color: #0f172a; margin-bottom: 16px; }
    h1 span { color: var(--primary); }
    .hero-desc { font-size: 17px; color: var(--text-muted); max-width: 780px; margin: 0 auto 28px; }
    .cta-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; }
    .btn-cta-wa {
      background: #25d366;
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 800;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
      transition: transform 0.15s;
    }
    .btn-cta-wa:hover { transform: translateY(-2px); }
    .btn-cta-review {
      background: #ffffff;
      color: #b45309;
      border: 2px solid #fde68a;
      padding: 14px 26px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-cta-review:hover { background: #fffbeb; }
    .grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 48px; }
    .card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .card-icon { font-size: 32px; margin-bottom: 12px; }
    .card h3 { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: #1e293b; }
    .card p { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
    .price-banner {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 20px;
      padding: 32px;
      text-align: center;
      margin-bottom: 48px;
    }
    .price-val { font-size: 48px; font-weight: 900; color: #92400e; margin: 8px 0; }
    .faq-section { margin-top: 50px; }
    .faq-item {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 14px;
    }
    .faq-q { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .faq-a { font-size: 14px; color: var(--text-muted); }
    .footer {
      background: #042f2e;
      color: #99f6e4;
      padding: 40px 20px;
      text-align: center;
      font-size: 13px;
      margin-top: 60px;
    }
    .footer a { color: #ffffff; text-decoration: underline; }
    @media(max-width: 640px) {
      h1 { font-size: 28px; }
      .hero-box { padding: 32px 18px; }
      .price-val { font-size: 36px; }
    }
  </style>

  <!-- Canonical Schema Markup -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent", "LegalService"],
    "name": "${OFFICE_INFO.name}",
    "image": "${OFFICE_INFO.publicUrl}/apple-touch-icon.png",
    "@id": "${OFFICE_INFO.publicUrl}/#organization",
    "url": "${fullUrl}",
    "telephone": "${OFFICE_INFO.phone}",
    "priceRange": "₹1,750 - ₹1,50,00,000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "New Floora, Shop No. 24, Pale Gaon",
      "addressLocality": "Ambernath (East)",
      "addressRegion": "Maharashtra",
      "postalCode": "421501",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${OFFICE_INFO.geo.lat},
      "longitude": ${OFFICE_INFO.geo.lng}
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "20:30"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "48",
      "bestRating": "5"
    }
  }
  </script>
  ${extraSchema}
  `;
}

// 1. RENT AGREEMENT AMBERNATH LANDING PAGE
function renderRentAgreementPage() {
  const extraFaqSchema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the cost of registered rent agreement in Ambernath East?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "At Dashmesh Properties, the official registered rent agreement costs ₹1,750 per side, totaling ₹3,500 all-inclusive covering Govt stamp duty, registration fee, draft preparation, doorstep biometric device, and police verification submission."
        }
      },
      {
        "@type": "Question",
        "name": "Is doorstep biometric verification available in Pale Gaon and Ambernath?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our certified representative visits your residence anywhere in Ambernath, Badlapur, Ulhasnagar, or Kalyan with the Govt approved biometric scanner. No need to visit the Sub-Registrar office."
        }
      },
      {
        "@type": "Question",
        "name": "How quickly is the rent agreement registered?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once biometric thumb verification and Aadhaar OTP are completed, the Govt Department of Registration & Stamps (IGR Maharashtra) issues the official signed PDF agreement within 24 to 48 hours."
        }
      }
    ]
  }
  </script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${getCommonHead(
    "Govt Registered Rent Agreement in Ambernath East ₹1,750 | Doorstep Biometric | Dashmesh Properties",
    "Official Govt registered leave and license rent agreement in Ambernath East, Pale Gaon, Badlapur & Kalyan at ₹1,750 per side (₹3,500 total). Doorstep biometric verification, police verification, stamp duty & registration. Call Satnam Sir: +91 84210 77613.",
    "/rent-agreement-ambernath",
    extraFaqSchema
  )}
</head>
<body>
  <div class="header-banner">
    ⚡ 100% Legal Govt e-Registration &bull; Doorstep Biometric &bull; ₹1,750 From One Side (₹3,500 Total)
    <a href="https://wa.me/${OFFICE_INFO.phoneRaw}?text=Namaste%20Satnam%20Sir%2C%20I%20need%20Rent%20Agreement%20Doorstep%20Biometric">Book Today &rarr;</a>
  </div>

  <nav class="nav-bar">
    <div>
      <div class="brand-title">🏢 Dashmesh Properties</div>
      <div class="brand-sub">Pale Gaon, Ambernath (E) &bull; Estd. 15+ Years</div>
    </div>
    <div class="nav-links">
      <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-nav-review">
        ⭐ Google Review
      </a>
      <a href="tel:${OFFICE_INFO.phone}" class="btn-nav-call">
        📞 ${OFFICE_INFO.phone}
      </a>
    </div>
  </nav>

  <div class="container">
    <div class="hero-box">
      <div class="badge-top">👑 #1 Govt Registered Rent Agreement Service in Ambernath East</div>
      <h1>Official <span>Registered Rent Agreement</span> at Your Doorstep</h1>
      <p class="hero-desc">
        Skip long queues at the Sub-Registrar office. Dashmesh Properties brings Govt-approved biometric e-registration directly to your home in Pale Gaon, Ambernath East, Badlapur, Ulhasnagar & Kalyan.
      </p>

      <div class="cta-row">
        <a href="https://wa.me/${OFFICE_INFO.phoneRaw}?text=Namaste%20Satnam%20Sir%2C%20I%20want%20to%20book%20a%20doorstep%20biometric%20rent%20agreement%20slot." target="_blank" class="btn-cta-wa">
          <span>💬</span>
          <span>Book Doorstep Biometric (WhatsApp)</span>
        </a>
        <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta-review">
          <span>⭐</span>
          <span>Read & Write Google 5-Star Reviews</span>
        </a>
      </div>
    </div>

    <!-- Pricing Card -->
    <div class="price-banner">
      <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 1px;">Transparent Official Pricing</div>
      <div class="price-val">₹1,750 <span style="font-size: 20px; font-weight: 600; color: #78350f;">Per Side</span></div>
      <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">Total Cost: ₹3,500 (All-Inclusive)</div>
      <p style="font-size: 14px; color: #92400e; max-width: 600px; margin: 0 auto;">
        Includes Maharashtra Govt Stamp Duty, IGR Registration Fees, Biometric Hardware at Doorstep, Draft Legal Framing, and Police Intimation Notice. Zero hidden fees.
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid-cards">
      <div class="card">
        <div class="card-icon">🏠</div>
        <h3>Doorstep Biometric Service</h3>
        <p>Our authorized executive visits your residence in Pale Gaon, Shiv Mandir Road, B-Cabin, Kansai, or nearby areas with the fingerprint device at your convenient time.</p>
      </div>

      <div class="card">
        <div class="card-icon">⚖️</div>
        <h3>100% Legal & Govt Verified</h3>
        <p>Executed directly through Maharashtra IGR portal with registered QR code, verification seal, and government document number valid for all bank, passport, and company formalities.</p>
      </div>

      <div class="card">
        <div class="card-icon">👮</div>
        <h3>Free Police Verification</h3>
        <p>Compliant tenant police verification acknowledgment included with your registered agreement for 100% peace of mind.</p>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="faq-section">
      <h2 style="font-size: 26px; font-weight: 800; margin-bottom: 20px; text-align: center;">Frequently Asked Questions (Ambernath East)</h2>
      
      <div class="faq-item">
        <div class="faq-q">1. What documents are needed for rent agreement registration?</div>
        <div class="faq-a">Both Owner and Tenant need Aadhaar Card and PAN Card. Plus, two witnesses with Aadhaar cards are required for biometric authentication.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">2. What are the office hours to visit Dashmesh Properties in Pale Gaon?</div>
        <div class="faq-a">Our office at Shop No. 24, New Floora, Pale Gaon, Ambernath East is open all 7 days from 10:00 AM to 8:30 PM. Call Satnam Sir on +91 84210 77613.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">3. Can we get the agreement registered if the owner is out of town?</div>
        <div class="faq-a">Yes! Aadhaar-linked OTP and digital signatures can be coordinated even if parties are in different cities or states.</div>
      </div>
    </div>

    <!-- Direct Review Section -->
    <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 20px; padding: 32px; text-align: center; margin-top: 48px;">
      <h3 style="font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">⭐ Help Other Tenants & Landlords Find Us on Google</h3>
      <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Your 5-star review helps local families find transparent, zero-hassle rent agreement services.</p>
      <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta-review" style="background: #ea580c; color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);">
        ⭐ Write a 5-Star Review on Google Maps
      </a>
    </div>

  </div>

  <footer class="footer">
    <p><strong>Dashmesh Property & Rent Agreement Services</strong> &bull; Shop No. 24, New Floora, Pale Gaon, Ambernath East - 421 501</p>
    <p style="margin-top: 8px;">Direct Owner Contact: <a href="tel:${OFFICE_INFO.phone}">${OFFICE_INFO.phone}</a> | <a href="${OFFICE_INFO.publicUrl}/">Return to Main Suite</a> | <a href="${OFFICE_INFO.publicUrl}/rate-card">238+ MMR Projects Directory</a></p>
  </footer>
</body>
</html>`;
}

// 2. PROPERTY CONSULTANT AMBERNATH LANDING PAGE
function renderPropertyConsultantPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${getCommonHead(
    "Best Real Estate Agent in Ambernath East & Pale Gaon | Dashmesh Properties",
    "Looking for verified flats for sale or rent in Pale Gaon, Ambernath East? Dashmesh Properties offers 238+ MMR verified projects, 0% brokerage on new builder bookings, home loan assistance, and clear title documentation. Call Satnam Sir: +91 84210 77613.",
    "/property-consultant-ambernath"
  )}
</head>
<body>
  <div class="header-banner">
    🏡 238+ Verified Real Estate Projects Across Ambernath, Badlapur, Kalyan & Surrounding MMR &bull; 
    <a href="${OFFICE_INFO.publicUrl}/rate-card">Explore Project Directory &rarr;</a>
  </div>

  <nav class="nav-bar">
    <div>
      <div class="brand-title">🏢 Dashmesh Properties</div>
      <div class="brand-sub">Pale Gaon, Ambernath (E) &bull; Verified Property Consultants</div>
    </div>
    <div class="nav-links">
      <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-nav-review">
        ⭐ Google Review
      </a>
      <a href="tel:${OFFICE_INFO.phone}" class="btn-nav-call">
        📞 ${OFFICE_INFO.phone}
      </a>
    </div>
  </nav>

  <div class="container">
    <div class="hero-box">
      <div class="badge-top">👑 Top-Rated Real Estate Advisory Pale Gaon & Ambernath East</div>
      <h1>Your Trusted <span>Real Estate Partner</span> in Ambernath</h1>
      <p class="hero-desc">
        From budget 1 BHK starter homes starting ₹19.5 Lakhs in Pale Gaon to premium residential townships on Shiv Mandir Road and Kansai Section. 100% MahaRERA verified, OC received, and clear title properties.
      </p>

      <div class="cta-row">
        <a href="https://wa.me/${OFFICE_INFO.phoneRaw}?text=Namaste%20Satnam%20Sir%2C%20I%20am%20looking%20for%20a%20property%20in%20Ambernath%20East." target="_blank" class="btn-cta-wa">
          <span>💬</span>
          <span>Talk to Satnam Sir on WhatsApp</span>
        </a>
        <a href="${OFFICE_INFO.publicUrl}/rate-card" class="btn-cta-review">
          <span>📑</span>
          <span>View 238+ Projects Rate Card</span>
        </a>
      </div>
    </div>

    <div class="grid-cards">
      <div class="card">
        <div class="card-icon">🔑</div>
        <h3>Residential Buying & Selling</h3>
        <p>1 RK, 1 BHK, and 2 BHK ready-to-move and near-possession flats with KDMC water, lift backup, and 90% bank loan approval from SBI, HDFC & ICICI.</p>
      </div>

      <div class="card">
        <div class="card-icon">🏢</div>
        <h3>Commercial Retail & Shops</h3>
        <p>High-yield commercial shops and office spaces in Pale Gaon, B-Cabin Road, and Kansai Section offering assured rental returns up to 8% p.a.</p>
      </div>

      <div class="card">
        <div class="card-icon">📜</div>
        <h3>Legal Search & Title Verification</h3>
        <p>Complete 30-year title search, 7/12 extract analysis, MahaRERA compliance verification, and registered documentation for safe property investments.</p>
      </div>
    </div>

    <!-- Micro-Areas Coverage -->
    <div class="card" style="margin-bottom: 48px;">
      <h3 style="font-size: 22px; margin-bottom: 12px;">📍 Deep Local Expertise Across All Ambernath Micro-Markets</h3>
      <p style="margin-bottom: 16px;">We operate on-ground across every prominent residential neighborhood:</p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Pale Gaon (Hub)</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Shiv Mandir Road</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">B-Cabin Road</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Kansai Section</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Morivali MIDC</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Navare Nagar</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Khojgaon</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Kailash Colony</span>
        <span style="background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">Badlapur East (Katrap / Shirgaon)</span>
      </div>
    </div>

    <!-- Direct Review Section -->
    <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 20px; padding: 32px; text-align: center;">
      <h3 style="font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">⭐ Rate Dashmesh Properties on Google</h3>
      <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Satisfied with our property consulting or site visit? Click below to leave a direct 5-star review on Google Maps.</p>
      <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta-review" style="background: #ea580c; color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);">
        ⭐ Direct Google 5-Star Review
      </a>
    </div>
  </div>

  <footer class="footer">
    <p><strong>Dashmesh Property & Rent Agreement Services</strong> &bull; Shop No. 24, New Floora, Pale Gaon, Ambernath East - 421 501</p>
    <p style="margin-top: 8px;">Direct Owner: <a href="tel:${OFFICE_INFO.phone}">${OFFICE_INFO.phone}</a> | <a href="${OFFICE_INFO.publicUrl}/">Home</a> | <a href="${OFFICE_INFO.publicUrl}/rent-agreement-ambernath">Rent Agreement ₹1,750</a></p>
  </footer>
</body>
</html>`;
}

// 3. FLATS IN AMBERNATH LANDING PAGE
function renderFlatsInAmbernathPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${getCommonHead(
    "1 BHK & 2 BHK Flats in Ambernath East & Pale Gaon | Dashmesh Properties",
    "Verified 1 BHK flats from ₹19.5 Lakhs and 2 BHK flats from ₹34 Lakhs in Pale Gaon and Ambernath East. KDMC water, near station, bank loan pre-approved. Zero brokerage on new builder inventory. Call Satnam Sir: +91 84210 77613.",
    "/flats-in-ambernath"
  )}
</head>
<body>
  <div class="header-banner">
    🏢 Ready-to-Move & Under Construction Flats in Ambernath East &bull; Direct Builder Pricing &bull; 
    <a href="https://wa.me/${OFFICE_INFO.phoneRaw}?text=Namaste%20Satnam%20Sir%2C%20send%20available%201%20BHK%20and%202%20BHK%20flats%20list">Get WhatsApp List &rarr;</a>
  </div>

  <nav class="nav-bar">
    <div>
      <div class="brand-title">🏢 Dashmesh Properties</div>
      <div class="brand-sub">Pale Gaon, Ambernath (E) &bull; Verified Flats Inventory</div>
    </div>
    <div class="nav-links">
      <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-nav-review">
        ⭐ Google Review
      </a>
      <a href="tel:${OFFICE_INFO.phone}" class="btn-nav-call">
        📞 ${OFFICE_INFO.phone}
      </a>
    </div>
  </nav>

  <div class="container">
    <div class="hero-box">
      <div class="badge-top">🔑 Verified Homes in Pale Gaon & Ambernath East</div>
      <h1>1 BHK & 2 BHK Flats in <span>Ambernath East</span></h1>
      <p class="hero-desc">
        Browse curated residential properties with verified MahaRERA certification, zero litigation, clear OC, and 90% bank loan sanction.
      </p>

      <div class="cta-row">
        <a href="https://wa.me/${OFFICE_INFO.phoneRaw}?text=Namaste%20Satnam%20Sir%2C%20I%20want%20to%20schedule%20a%20site%20visit%20for%20flats%20in%20Ambernath%20East." target="_blank" class="btn-cta-wa">
          <span>🚗</span>
          <span>Schedule Free Site Visit (WhatsApp)</span>
        </a>
        <a href="${OFFICE_INFO.publicUrl}/rate-card" class="btn-cta-review">
          <span>📊</span>
          <span>Full 238+ Projects Directory</span>
        </a>
      </div>
    </div>

    <!-- Typical Configurations -->
    <div class="grid-cards">
      <div class="card">
        <div class="card-icon">🛋️</div>
        <h3>1 RK & Compact 1 BHK</h3>
        <p style="font-size: 22px; font-weight: 900; color: #0f766e; margin: 8px 0;">₹14.5L – ₹22L</p>
        <p>Carpet: 280 – 380 sq.ft. Ideal for first-time buyers and rental income investors. 5–8 mins from Ambernath East railway station.</p>
      </div>

      <div class="card">
        <div class="card-icon">🏡</div>
        <h3>Standard 1 BHK Flats</h3>
        <p style="font-size: 22px; font-weight: 900; color: #0f766e; margin: 8px 0;">₹23L – ₹32L</p>
        <p>Carpet: 410 – 495 sq.ft. Gated communities with lift, security, children play area, and 24-hr water supply.</p>
      </div>

      <div class="card">
        <div class="card-icon">🏰</div>
        <h3>Spacious 2 BHK Homes</h3>
        <p style="font-size: 22px; font-weight: 900; color: #0f766e; margin: 8px 0;">₹34L – ₹52L</p>
        <p>Carpet: 550 – 720 sq.ft. Master bedroom with attached balcony, modular kitchen provision, covered parking, and club amenities.</p>
      </div>
    </div>

    <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 20px; padding: 32px; text-align: center; margin-top: 30px;">
      <h3 style="font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">⭐ Give Feedback on Google</h3>
      <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Your rating on Google helps other families find verified, trusted properties in Pale Gaon.</p>
      <a href="${OFFICE_INFO.reviewUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta-review" style="background: #ea580c; color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);">
        ⭐ Write a 5-Star Google Review
      </a>
    </div>
  </div>

  <footer class="footer">
    <p><strong>Dashmesh Property & Rent Agreement Services</strong> &bull; Shop No. 24, New Floora, Pale Gaon, Ambernath East - 421 501</p>
    <p style="margin-top: 8px;">Direct Owner: <a href="tel:${OFFICE_INFO.phone}">${OFFICE_INFO.phone}</a> | <a href="${OFFICE_INFO.publicUrl}/">Main Suite</a></p>
  </footer>
</body>
</html>`;
}

module.exports = {
  renderRentAgreementPage,
  renderPropertyConsultantPage,
  renderFlatsInAmbernathPage,
  OFFICE_INFO
};
