/**
 * Grexa AI Growth Suite - Autonomous Optimization & Generator Engine
 * Includes Photo GPS Stamping, WhatsApp Formatter, Live SERP Radar, and Agency Report Compiler
 */

const AIEngine = {
  /**
   * Generates 3 Google-compliant, keyword-injected descriptions
   */
  generateDescriptions(businessName, category, city, keywords = []) {
    const kwList = keywords.length > 0 ? keywords.slice(0, 4).join(", ") : `${category}, Residential Deals, Commercial Space, Legal Advisory`;
    
    return [
      {
        id: "desc_seo_max",
        title: "High-Intent Local SEO Formula (Recommended)",
        badge: "Highest Algorithm Boost",
        text: `Looking for the most trusted ${category} in ${city}? Welcome to ${businessName}, your premier destination for ${kwList}. Located conveniently with dedicated customer support, we specialize in providing transparent consultations, verified property documentation, and end-to-end assistance. Whether you are looking for property valuation, investment opportunities, or residential homes, our expert team ensures 100% genuine advisory. Call us today or visit our office for trusted local guidance in ${city}!`
      },
      {
        id: "desc_conversion",
        title: "Trust & Conversion Focused",
        badge: "Higher Call Rate",
        text: `${businessName} is ${city}'s premier ${category}, dedicated to helping families and investors navigate ${kwList} with ease and confidence. With years of local experience, verified documentation, and personalized customer care, we have built a reputation for integrity and transparency. Visit our office today or call our direct helpline for immediate consultation.`
      },
      {
        id: "desc_concise",
        title: "Fast-Reading & Mobile Friendly",
        badge: "Clean & Punchy",
        text: `${businessName} – Leading ${category} in ${city}. Specialists in ${kwList}. Transparent deals, verified advisory, and dedicated customer support. Contact us today for premier service in ${city} and neighboring suburbs.`
      }
    ];
  },

  /**
   * Generates smart, SEO-enhanced responses to customer reviews
   */
  generateReviewReplies(customerName, rating, reviewText, businessName, category, city) {
    if (rating >= 4) {
      return [
        {
          tone: "Warm & SEO-Injected (Recommended)",
          reply: `Thank you so much, ${customerName}, for your kind 5-star review! The team at ${businessName} is thrilled to hear that your experience with our ${category} services in ${city} was seamless and rewarding. We strive every day to provide top-tier consultation and verified solutions for our valued clients. We look forward to serving you again soon!`
        },
        {
          tone: "Professional & Corporate",
          reply: `Dear ${customerName}, thank you for taking the time to share your feedback. Delivering exceptional ${category} advisory in ${city} is our utmost priority. We appreciate your trust in ${businessName} and look forward to partnering with you on future endeavors.`
        }
      ];
    } else {
      return [
        {
          tone: "Empathetic & Resolution Focused",
          reply: `Hello ${customerName}, we sincerely apologize that your experience did not meet the high standards we set at ${businessName}. Your feedback is extremely important to us. Please connect directly with our management team at our official phone number so we can understand what occurred and make things right immediately.`
        }
      ];
    }
  },

  /**
   * Formats WhatsApp review invite message from templates
   */
  formatWhatsAppMessage(templateId, customerName, businessName, reviewLink) {
    const templates = {
      immediate_thank_you: `Hello ${customerName}! 👋 Thank you for consulting with ${businessName} today. Our team is dedicated to transparent and honest advice. Could you take 10 seconds to share your experience with a 5-star Google review? ${reviewLink} — Thank you so much!`,
      followup_24h: `Hi ${customerName}! Hope your property search is going well. We wanted to check in and see if you had any questions regarding the options we discussed at ${businessName}. If you enjoyed our service, leaving a quick review really helps our family business grow: ${reviewLink} 🙏`,
      vip_discount: `Dear ${customerName}, as a valued client of ${businessName}, leave us a quick Google review here: ${reviewLink} and show this message at our desk to claim your Free Legal Property Valuation & ₹500 Consulting Voucher! 🎁`
    };
    return templates[templateId] || templates.immediate_thank_you;
  },

  /**
   * Generates direct Google Review Link and WhatsApp sharing template
   */
  generateReviewBooster(businessName, placeId, phone) {
    const reviewUrl = placeId 
      ? `https://search.google.com/local/writereview?placeid=${placeId}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}`;
    
    const whatsappMsg = `Hello! Thank you for consulting with ${businessName}. Your feedback helps our family business grow! Could you please take 10 seconds to share your experience with a 5-star review on Google? Click here: ${reviewUrl} - Thank you so much!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

    return {
      reviewUrl,
      whatsappMsg,
      whatsappUrl
    };
  },

  /**
   * Autonomous WhatsApp Client Auto-Responder Engine
   * Matches customer intents (1/2 BHK flats, shops, prices, office location, review follow-up)
   * Formats responses in clean, polite, local Hinglish/English like the Grexa WhatsApp bot!
   */
  generateWhatsAppAutoResponse(incomingText, clientName = "Ji", context = {}) {
    const text = (incomingText || "").toLowerCase().trim();
    const name = clientName && clientName !== "Ji" ? clientName : "";
    const nameSalutation = name ? `${name} ji` : "ji";
    const reviewUrl = context.reviewUrl || "https://search.google.com/local/writereview?placeid=ChIJDxFBTbyV5zsRcHylJmmARG8";

    // 1. 1 BHK / 2 BHK / Flat / Home / Residential
    if (text.includes("1 bhk") || text.includes("2 bhk") || text.includes("3 bhk") || text.includes("flat") || text.includes("apartment") || text.includes("ghar") || text.includes("house") || text.includes("residential") || text.includes("1bhk") || text.includes("2bhk")) {
      return {
        intent: "RESIDENTIAL_INQUIRY",
        reply: `Namaste ${nameSalutation}! 🏡 Dashmesh Property mein aapka swagat hai.\n\nHamare paas Pale Gaon & Station Road (Ambernath East) mein verified ready possession aur under-construction flats available hain:\n• 1 BHK: ₹18 Lakh - ₹26 Lakh (SBI/HDFC loan approved)\n• 2 BHK: ₹32 Lakh - ₹48 Lakh (Lift, Parking & Club)\n• Clear Title, RERA Registered & 0% hidden charges.\n\nKya aap weekend par site visit plan karna chahenge? Hum aapko verified options ka brochure WhatsApp par share karein?`,
        suggestedActions: ["Schedule Site Visit", "Send Photo Brochure", "Call Advisor"]
      };
    }

    // 2. Commercial / Shop / Office / Retail
    if (text.includes("shop") || text.includes("commercial") || text.includes("office") || text.includes("dukaan") || text.includes("showroom") || text.includes("godown")) {
      return {
        intent: "COMMERCIAL_INQUIRY",
        reply: `Namaste ${nameSalutation}! 🏪 Dashmesh Property commercial desk.\n\nAmbernath East (Station Road & MIDC corridor) mein high-footfall retail shops aur office spaces available hain (Rent & Sale):\n• Commercial Shops: ₹18L se start (Rent: ₹8,000 - ₹30,000/mo)\n• Prime main road visibility with high pedestrian footfall.\n• Verified legal title & agreement assistance.\n\nAapka budget aur required carpet area kitna hai? Humein batayein, hum best listings share karenge.`,
        suggestedActions: ["View Shops on Sale", "Commercial Rentals", "Call Now"]
      };
    }

    // 3. Price / Rate / Cost / Budget / Kitna
    if (text.includes("rate") || text.includes("price") || text.includes("cost") || text.includes("budget") || text.includes("kitna") || text.includes("bhav")) {
      return {
        intent: "PRICE_INQUIRY",
        reply: `Hello ${nameSalutation}! 📊 Ambernath East Current Verified Market Rates:\n\n• 1 BHK (Pale Gaon): ₹18 Lakh - ₹25 Lakh\n• 2 BHK (Station Road / Pale Gaon): ₹32 Lakh - ₹46 Lakh\n• Commercial Shops: ₹20 Lakh onwards\n• Resale Deals: ₹15 Lakh onwards\n\nHum aapke budget ke hisaab se best verified property shortlist karke de sakte hain. Aapka comfortable budget range kya hai?`,
        suggestedActions: ["Under ₹25 Lakhs", "₹25L - ₹45 Lakhs", "Custom Budget"]
      };
    }

    // 4. Location / Address / Kahan / Office / Map
    if (text.includes("location") || text.includes("address") || text.includes("kahan") || text.includes("office") || text.includes("pata") || text.includes("map")) {
      return {
        intent: "LOCATION_INQUIRY",
        reply: `Namaste ${nameSalutation}! 📍 Dashmesh Property Office Address:\n\nShop No. 24, New Floora, Pale Gaon, Ambernath East, Maharashtra 421501.\n(Near Pale Gaon Bus Stop, 7 mins from Ambernath Railway Station East)\n\n⏰ Timings: 10:00 AM - 8:30 PM (Open All 7 Days)\n📍 Google Maps Pin: https://maps.google.com/?q=19.1908,73.1785\n\nAap kabhi bhi visit kar sakte hain, Satnam Singh Vohra ji office mein available rahenge!`,
        suggestedActions: ["Open in Google Maps", "Call Office", "Book Appointment"]
      };
    }

    // 5. Done / Review / Feedback / Rating (as shown in user's WhatsApp screenshot!)
    if (text.includes("done") || text.includes("review") || text.includes("rating") || text.includes("ho gaya") || text.includes("feed")) {
      return {
        intent: "REVIEW_COMPLETION",
        reply: `Great ${name || 'Satnam'}, thanks for the confirmation! ⭐\n\n• Aapka feedback hamari local Google ranking ko #1 par maintain karne mein bohot madad karta hai.\n• Agar abhi tak review submit nahi kiya hai to 10 seconds nikaal kar yahan tap karein:\n${reviewUrl}\n\nThank you for choosing Dashmesh Property! Hum aapke document verification aur future property deals mein hamesha madad ke liye tayyar hain. 🙏`,
        suggestedActions: ["Open Google Review", "Request Callback"]
      };
    }

    // 6. Insight & Follow-up Request (as shown in user's WhatsApp screenshot!)
    if (text.includes("insight") || text.includes("how it works") || text.includes("grexa") || text.includes("service") || text.includes("costly")) {
      return {
        intent: "INSIGHT_FOLLOWUP",
        reply: `A quick insight ⬇️\n\nPale Gaon aur Ambernath East corridor mein property prices pichle 1 saal mein 14% appreciate huye hain, aur naye station flyover se connectivity aur behtar ho rahi hai.\n\nDashmesh Property ke zariye aapko:\n✅ Direct owner/builder pricing (Zero fraud)\n✅ Complete title search & legal paper check\n✅ 90% bank loan approval support\n\nKya aap chahenge ki hum aapke liye 3 shortlisted properties ka video tour bhej dein?`,
        suggestedActions: ["Yes, send video tour", "Call Satnam ji", "Not now"]
      };
    }

    // 7. Default Greeting / Hi / Hello
    return {
      intent: "GREETING",
      reply: `Namaste ${nameSalutation}! Welcome to Dashmesh Property, Ambernath East. 🙏\n\nHum Ambernath ke verified property consultants hain with 12+ years of trusted experience.\n\nAapko kis tarah ki property ki talash hai?\n1️⃣ 1 BHK / 2 BHK Ready Flats\n2️⃣ Commercial Shops / Office Spaces\n3️⃣ Resale Deals & Rental Homes\n4️⃣ Free Legal Document Verification\n\nAap bas yahan reply karein, hum turant details aur photographs share karenge!`,
      suggestedActions: ["1 BHK / 2 BHK", "Commercial Shops", "Talk to Consultant"]
    };
  },

  /**
   * Generates a ready-to-publish Google Post with CTA
   */
  generateGooglePost(businessName, category, city) {
    return {
      title: `Looking for Trusted ${category} in ${city}?`,
      content: `🔥 Discover exceptional service with ${businessName}!\n\nWhether you're exploring new opportunities, seeking verified consultations, or looking for the best deals in ${city}, our dedicated specialists are here to guide you step-by-step.\n\n✅ 100% Verified Consultation\n✅ Local Market Expertise\n✅ Transparent & Hassle-Free Assistance\n\n📍 Visit us at our ${city} office or call us directly today!\n\n#${city.replace(/\s+/g, '')} #${category.replace(/\s+/g, '')} #${businessName.replace(/\s+/g, '')} #LocalBusiness`,
      ctaType: "Call Now",
      suggestedMedia: "public/grid-ranking-dashmesh.jpeg"
    };
  },

  /**
   * Formats comprehensive Citation NAP Pack for 40+ Directories
   */
  generateCitationsPack(rep) {
    return `=== LOCAL CITATION NAP PACK FOR ${rep.name.toUpperCase()} ===

Business Name: ${rep.name}
Primary Category: ${rep.category}
Secondary Categories: Real Estate Agency, Commercial Real Estate Agency, Real Estate Appraiser
Address: ${rep.address}
City: ${rep.city}
State: ${rep.state}
Country: India
Phone: ${rep.phone || '+91 84210 77613'}
Email: ${rep.email || 'contact@dashmeshproperty.com'}
Website: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rep.name + ' ' + rep.city)}
Working Hours: Mon-Sat: 09:30 AM - 08:30 PM, Sun: 10:00 AM - 05:00 PM

Short Tagline:
Trusted ${rep.category} in ${rep.city} - 100% Verified Deals & Legal Advisory.

SEO Description (740 Characters):
Welcome to ${rep.name}, the leading ${rep.category} in ${rep.city}, Maharashtra. We specialize in verified residential property consultation, commercial spaces, and real estate investment advisory. Serving Pale Gaon, Ambernath East, Badlapur, and MIDC. Contact us today!

Target Directories:
1. Google Business Profile & Maps (DA 100)
2. Justdial (DA 84)
3. IndiaMART (DA 88)
4. Sulekha (DA 82)
5. 99acres (DA 79)
6. MagicBricks (DA 81)
7. Housing.com (DA 78)
8. Apple Business Connect / Maps (DA 98)
9. Bing Places (DA 94)
10. TradeIndia (DA 80)
`;
  },

  /**
   * HTML5 Canvas GPS Stamp Watermarker
   */
  stampPhoto(canvas, img, meta = {}, style = "hud") {
    canvas.width = img.width || 800;
    canvas.height = img.height || 600;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const lat = meta.lat ? meta.lat.toFixed(4) : "19.1908";
    const lng = meta.lng ? meta.lng.toFixed(4) : "73.1785";
    const biz = meta.businessName || "Dashmesh Property";
    const city = meta.city || "Ambernath";
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (style === "hud") {
      // Sleek Translucent Dark HUD Bar
      const barHeight = Math.max(54, Math.round(canvas.height * 0.12));
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

      // Top cyan accent line
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, 3);

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(14, Math.round(canvas.width * 0.022))}px sans-serif`;
      ctx.fillText(`📍 ${biz} • ${city}`, 20, canvas.height - barHeight + (barHeight * 0.42));

      ctx.fillStyle = "#94a3b8";
      ctx.font = `500 ${Math.max(11, Math.round(canvas.width * 0.016))}px monospace`;
      ctx.fillText(`GPS: ${lat}° N, ${lng}° E  |  VERIFIED ON: ${timestamp}`, 20, canvas.height - (barHeight * 0.22));

      // Right-aligned Google Maps Verified Badge
      ctx.fillStyle = "#10b981";
      ctx.font = `bold ${Math.max(11, Math.round(canvas.width * 0.017))}px sans-serif`;
      ctx.fillText(`✓ GOOGLE MAPS GEO-TAGGED`, canvas.width - (Math.max(220, Math.round(canvas.width * 0.28))), canvas.height - (barHeight * 0.38));
    } else if (style === "gold") {
      // Golden Prestige Stamp
      const barHeight = Math.max(48, Math.round(canvas.height * 0.10));
      ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, 2);

      ctx.fillStyle = "#fef08a";
      ctx.font = `bold ${Math.max(14, Math.round(canvas.width * 0.022))}px serif`;
      ctx.fillText(`★ ${biz.toUpperCase()} — ${city.toUpperCase()} ★`, 20, canvas.height - barHeight + 24);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = `600 ${Math.max(11, Math.round(canvas.width * 0.016))}px monospace`;
      ctx.fillText(`COORD: ${lat}N, ${lng}E • TIMESTAMP: ${timestamp}`, 20, canvas.height - 12);
    } else {
      // Minimalist Coordinates
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(canvas.width - 280, canvas.height - 35, 270, 30);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.fillText(`📍 ${lat}° N, ${lng}° E | ${city}`, canvas.width - 265, canvas.height - 15);
    }
  },

  /**
   * Injects True Binary EXIF GPS & Business Metadata into JPEG Data URL
   */
  injectExifMetadata(jpegDataUrl, meta = {}) {
    if (typeof piexif === "undefined") {
      console.warn("piexif library not loaded, skipping binary EXIF injection");
      return jpegDataUrl;
    }
    try {
      const lat = meta.lat ? parseFloat(meta.lat) : 19.1908;
      const lng = meta.lng ? parseFloat(meta.lng) : 73.1785;
      const biz = meta.businessName || "Dashmesh Property";
      const city = meta.city || "Ambernath";
      const category = meta.category || "Property Consultant";
      const desc = `${biz} - ${category} in ${city}, Maharashtra. Verified local real estate consulting and property listings.`;

      function degToDmsRational(deg) {
        const absolute = Math.abs(deg);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = Math.round((minutesNotTruncated - minutes) * 60 * 100);
        return [
          [degrees, 1],
          [minutes, 1],
          [seconds, 100]
        ];
      }

      const d = new Date();
      const pad = (n) => (n < 10 ? '0' + n : n);
      const dateStr = `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      const dateStamp = `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())}`;

      const zeroth = {};
      zeroth[piexif.ImageIFD.Make] = "Google Auto AI Geotagger Pro";
      zeroth[piexif.ImageIFD.Model] = "GPS EXIF High-Precision Engine";
      zeroth[piexif.ImageIFD.Software] = "Grexa AI Growth Engine 2026";
      zeroth[piexif.ImageIFD.ImageDescription] = desc;
      zeroth[piexif.ImageIFD.DateTime] = dateStr;

      const gps = {};
      gps[piexif.GPSIFD.GPSLatitude] = degToDmsRational(lat);
      gps[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
      gps[piexif.GPSIFD.GPSLongitude] = degToDmsRational(lng);
      gps[piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? "E" : "W";
      gps[piexif.GPSIFD.GPSAltitude] = [35, 1]; // 35m altitude in Ambernath
      gps[piexif.GPSIFD.GPSAltitudeRef] = 0;
      gps[piexif.GPSIFD.GPSDateStamp] = dateStamp;

      const exif = {};
      exif[piexif.ExifIFD.DateTimeOriginal] = dateStr;
      exif[piexif.ExifIFD.UserComment] = `Verified Geo-Tagged for Google Maps: ${biz}, ${city}, Maharashtra`;

      const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
      const exifBytes = piexif.dump(exifObj);
      return piexif.insert(exifBytes, jpegDataUrl);
    } catch (e) {
      console.warn("Could not inject EXIF bytes:", e);
      return jpegDataUrl;
    }
  },

  /**
   * Dynamic ROI & Revenue Growth Calculator
   */
  calculateROI(ticketValue = 15000, currentCalls = 15) {
    const projectedCalls = Math.round(currentCalls * 3.2);
    const extraCalls = projectedCalls - currentCalls;
    const closingRate = 0.18;
    const currentClosedDeals = Math.max(1, Math.round(currentCalls * closingRate));
    const projectedClosedDeals = Math.round(projectedCalls * closingRate);
    const extraDeals = projectedClosedDeals - currentClosedDeals;
    const extraMonthlyRevenue = extraDeals * ticketValue;

    return {
      currentCalls,
      projectedCalls,
      extraCalls,
      extraDeals,
      ticketValue,
      extraMonthlyRevenue
    };
  },

  /**
   * Simulates dynamic scan for any custom business query
   */
  simulateCustomScan(businessName, city = "Mumbai", category = "Local Business") {
    const strengthScore = Math.floor(Math.random() * 25) + 25; // 25-50
    const avgRank = (Math.random() * 8 + 14).toFixed(1); // 14-22
    
    return {
      _id: "scan_" + Date.now().toString(36),
      name: businessName,
      ownerName: "Business Manager",
      phone: "+91 98XXX XXXXX",
      email: `contact@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      status: "generated",
      report: {
        name: businessName,
        category: category,
        address: `Commercial Hub, Near Main Rd, ${city}`,
        city: city,
        state: "India",
        country: "India",
        rating: (Math.random() * 1.5 + 3.0).toFixed(1),
        totalReviewCount: Math.floor(Math.random() * 15),
        overallAvgRank: parseFloat(avgRank),
        profileStrength: strengthScore,
        contentSeoScore: Math.floor(strengthScore * 0.75),
        profileCompletionScore: Math.floor(Math.random() * 25 + 50),
        engagementScore: Math.floor(Math.random() * 20),
        ratingScore: Math.floor(Math.random() * 30 + 20),
        primaryKeyword: `${category} in ${city}`,
        primaryKeywordRanking: {
          keyword: `${category} in ${city}`,
          gridWidth: 3,
          avgPosition: parseFloat(avgRank),
          gridImage: "public/grid-ranking-dashmesh.jpeg",
          pointPositions: Array.from({ length: 9 }, (_, i) => ({
            id: i + 1,
            position: Math.min(21, Math.round(parseFloat(avgRank) + (Math.random() * 4 - 2))),
            label: `Sector ${i + 1}, ${city}`
          }))
        },
        competitors: [
          { name: `Apex ${category} ${city}`, avgRank: 2.4, reviewCount: 180, rating: 4.9, distance: "0.6 km", weakness: "High pricing, slow customer reply" },
          { name: `Prime ${category} Center`, avgRank: 3.8, reviewCount: 124, rating: 4.8, distance: "1.1 km", weakness: "No geo-tagged photo uploads" },
          { name: `Star ${category} Hub`, avgRank: 5.1, reviewCount: 89, rating: 4.7, distance: "1.8 km", weakness: "Low post frequency" }
        ],
        otherKeywords: [
          { keyword: `Best ${category} ${city}`, avgRank: parseFloat(avgRank), searchVolume: "2,800/mo", difficulty: "Medium" },
          { keyword: `${category} Near Me`, avgRank: parseFloat(avgRank) + 1, searchVolume: "4,500/mo", difficulty: "High" },
          { keyword: `Top Rated ${category} ${city}`, avgRank: parseFloat(avgRank) + 2, searchVolume: "1,900/mo", difficulty: "Low" }
        ],
        profileCompletion: [
          { name: "Business Title", completed: true, note: businessName },
          { name: "Primary Category", completed: true, note: category },
          { name: "Additional Categories", completed: false, note: "Missing secondary categories" },
          { name: "Description", completed: true, note: "Needs keyword optimization" },
          { name: "Photos", completed: false, note: "0 geo-tagged photos uploaded" }
        ],
        comments: [
          `Primary keyword '${category} in ${city}' not optimized in profile title.`,
          `No active Google Posts detected in the last 60 days.`,
          `Competitor profiles hold an average of 140+ reviews vs your current profile.`,
          `Geo-tagged photographic proof is missing from recent uploads.`
        ]
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { AIEngine };
}
