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
  /**
   * Smart Multi-Language Detector (Marathi, English, Hinglish/Hindi)
   */
  detectLanguage(text) {
    const raw = (text || "").toLowerCase();
    const marathiKeywords = [
      "madhe", "aahe", "ahe", "kiti", "kuthe", "kay", "pahije", "bhadya", 
      "dakhva", "shodhat", "karayche", "karaycha", "aamhi", "tumche", "ghara", 
      "vikaycha", "vikaychi", "bhada", "navin", "namaskar", "gav", "gaonat"
    ];
    const englishKeywords = [
      "looking for", "price of", "interested in", "commercial space", "what is",
      "please provide", "can you share", "appointment", "cost of", "details for",
      "flat rates", "budget for", "brochure", "catalog", "properties", "available"
    ];

    let marathiMatches = 0;
    for (const kw of marathiKeywords) {
      if (raw.includes(kw)) marathiMatches++;
    }

    let englishMatches = 0;
    for (const kw of englishKeywords) {
      if (raw.includes(kw)) englishMatches++;
    }

    if (marathiMatches > 0 && marathiMatches >= englishMatches) return "marathi";
    if (englishMatches > 1) return "english";
    return "hinglish";
  },

  /**
   * Autonomous WhatsApp Client Auto-Responder Engine
   * Matches customer intents (Office Location, Timings, 1/2 BHK flats, shops, prices, review follow-up)
   * Minds the ongoing conversation: NEVER repeats 'Namaste' after first contact; keeps client warmly engaged.
   * Multi-Language: Seamlessly switches between Hinglish, Marathi, and English!
   */
  generateWhatsAppAutoResponse(incomingText, clientName = "Ji", context = {}) {
    const text = (incomingText || "").toLowerCase().trim();
    const name = clientName && clientName !== "Ji" && clientName !== "Client" ? clientName : "";
    const isOngoing = Boolean(context.isOngoing || context.messageCount > 1);
    const lang = context.language || this.detectLanguage(text);
    
    // Polite greeting on first message or explicit hello
    let greetingPrefix = "";
    if (!isOngoing) {
      if (lang === "marathi") {
        greetingPrefix = name ? `Namaskar ${name} ji! ` : "Namaskar! ";
      } else if (lang === "english") {
        greetingPrefix = name ? `Hello ${name}! ` : "Hello! ";
      } else {
        greetingPrefix = name ? `Namaste ${name} ji! ` : "Namaste! ";
      }
    } else {
      const greetingWord = text.startsWith("hi") || text.startsWith("hello") || text.startsWith("namaste") || text.startsWith("hey") ? (lang === "marathi" ? "Namaskar" : "Namaste") : "";
      if (greetingWord) greetingPrefix = `${greetingWord}! `;
    }

    const reviewUrl = context.reviewUrl || "https://search.google.com/local/writereview?placeid=ChIJDxFBTbyV5zsRcHylJmmARG8";
    const officeAddr = context.officeAddress || "New Floora, Shop No. 24, Pale Gaon, Ambernath (E) - 421 501";
    const officeLandmark = context.officeLandmark || "Near Pale Gaon Bus Stop, 7 mins from Ambernath East Railway Station";
    const officeTimings = context.officeTimings || "Subah 10:00 AM se raat 8:30 PM (All 7 Days Open)";
    const officeMap = context.officeMap || "https://maps.google.com/?q=19.1908,73.1785";
    const publicUrl = context.publicUrl || "https://plod-extrude-lumpish.ngrok-free.dev";
    const rateCardUrl = `${publicUrl}/rate-card`;

    // 1. REVIEW / RATING CONFIRMATION ("done", "review ho gaya")
    if (
      text.includes("review ho gaya") ||
      text.includes("review done") ||
      text.includes("rating de di") ||
      (text.includes("review") && text.includes("kar diya"))
    ) {
      return {
        intent: "REVIEW_COMPLETION",
        language: lang,
        reply: `Thank you so much${name ? ' ' + name : ''}! ⭐
Aapka feedback Dashmesh Properties ki local credibility ko boost karne mein bohot value rakhta hai.

• Agar abhi tak Google Review submit nahi kiya hai toh bas 10 seconds mein yahan tap karein:
${reviewUrl}

Review complete hone ke baad hum aapko Ambernath ke newly launched verified projects ki priority alert list mein add kar denge! 🙏`,
        suggestedActions: ["⭐ Google Review", "📞 Call Office", "📍 Office Map"]
      };
    }

    // 2. SELL PROPERTY / RESALE INQUIRY ("bechni hai", "sale karna hai", "resale", "kiraye par dena hai")
    if (
      text.includes("bechna") ||
      text.includes("bechni") ||
      text.includes("sell") ||
      text.includes("sale karna") ||
      text.includes("resale") ||
      text.includes("kiraye par dena") ||
      text.includes("bhadya var dene")
    ) {
      return {
        intent: "SELLER_INQUIRY",
        language: lang,
        reply: `${greetingPrefix}🤝 *Property Bechna ya Kiraye Par Dena Chahte Hain?*

Dashmesh Properties ke paas Ambernath East aur Pale Gaon mein verified active buyers aur quality tenants ki daily requirements rehti hain:

✅ Accurate Market Valuation & Genuine Buyers Matching
✅ Zero Legal Hassle & Complete Agreement Paperwork Support
✅ Quick Closure at Best Prevailing Market Price

Aapki property ka type (1 BHK / 2 BHK / Shop), society ka naam aur exact floor details bhej dijiye — Sukhjyot Singh ji (+91 84219 40013) turant review karke best deal arrange karenge!`,
        suggestedActions: ["Share Details", "📞 Call Sukhjyot"]
      };
    }

    // 3. SITE VISIT, APPOINTMENT & MEETING ("kal aa sakta hoon", "visit", "milna hai")
    if (
      text.includes("site visit") ||
      text.includes("visit") ||
      text.includes("dekhne aana") ||
      text.includes("kab aa sakta") ||
      text.includes("aa sakte") ||
      text.includes("milna") ||
      text.includes("appointment") ||
      (text.includes("kal") && (text.includes("aau") || text.includes("aana") || text.includes("time"))) ||
      (text.includes("sunday") && text.includes("visit"))
    ) {
      return {
        intent: "SITE_VISIT_BOOKING",
        language: lang,
        reply: `${greetingPrefix}Ji bilkul! Dashmesh Properties par aapka welcome hai. 🤝

Roz subah 10:00 AM se shaam 7:30 PM ke beech guided site visits rehti hain:
• Hum aapko Pale Gaon & Station Road ke actual ready-possession flats aur verified projects dikha denge.
• Direct builder/owner transparency (No hidden brokerage traps).

Aap apna convenient day aur time bata dijiye (jaise Kal 11:30 AM ya Sunday 4:00 PM), hum property keys aur executive pehle se ready rakhenge!`,
        suggestedActions: ["Morning 11 AM", "Evening 4:30 PM", "📍 Office Map"]
      };
    }

    // 4. BANK LOAN / EMI / FINANCE INQUIRY
    if (
      text.includes("loan") ||
      text.includes("finance") ||
      text.includes("sbi") ||
      text.includes("hdfc") ||
      text.includes("bank") ||
      text.includes("emi") ||
      text.includes("interest")
    ) {
      return {
        intent: "LOAN_INQUIRY",
        language: lang,
        reply: `${greetingPrefix}🏦 *Dashmesh Properties Home Loan Assistance Desk:*

Hamare paas sabhi leading nationalized & private banks (SBI, HDFC, ICICI, Bank of Baroda, Axis) se direct tie-ups hain:

• 90% tak property cost funding available
• Lowest interest rates with fast 7-day sanction
• PMAY Credit-Linked Subsidy guidance
• Complete document processing & legal search report assistance

*Estimated EMI Guideline:*
• ₹20 Lakh Loan @ 8.5% = ~₹17,350/month
• ₹35 Lakh Loan @ 8.5% = ~₹30,370/month

Kya aapko loan eligibility check karani hai ya document checklist chahiye?`,
        suggestedActions: ["Check Eligibility", "Send Checklist", "Talk to Advisor"]
      };
    }

    // 5. COMMERCIAL / RETAIL SHOPS: Dukaan, Office, Gala, Showroom
    if (
      text.includes("shop") ||
      text.includes("dukaan") ||
      text.includes("dukan") ||
      text.includes("commercial") ||
      text.includes("showroom") ||
      text.includes("godown") ||
      text.includes("gala") ||
      (text.includes("office") && (text.includes("rent") || text.includes("sale") || text.includes("buy") || text.includes("space")))
    ) {
      return {
        intent: "COMMERCIAL_INQUIRY",
        language: lang,
        reply: `${greetingPrefix}🏪 *Dashmesh Properties Commercial Desk (Ambernath East):*
*(High-footfall retail shops & business spaces for Rent & Sale)*

• *Pale Gaon Main Road Shops:*
  - Rent: ₹6,000 - ₹20,000/month | Sale: ₹18 Lakh - ₹40 Lakh
• *Station Road Prime Frontage Shops:*
  - Rent: ₹15,000 - ₹35,000/month | Sale: ₹32 Lakh - ₹85 Lakh (Heavy pedestrian footfall)
• *Industrial Galas & Godowns (MIDC / Morivali):*
  - Rent: ₹10,000 - ₹40,000/month

✅ Clear commercial title, electric meter & water connection ready
Aapko kis business ke liye space chahiye aur required carpet area kitna hai?`,
        suggestedActions: ["Shop for Rent", "Shop for Sale", "📅 Book Visit"]
      };
    }

    // 6. DIGITAL BROCHURE & PROPERTY PHOTOS DISPATCH
    if (
      text.includes("photo") ||
      text.includes("brochure") ||
      text.includes("catalog") ||
      text.includes("pdf") ||
      text.includes("pamphlet") ||
      text.includes("image") ||
      text.includes("pics")
    ) {
      return {
        intent: "BROCHURE_AND_PHOTOS",
        language: lang,
        reply: `${greetingPrefix}📑 *Dashmesh Properties — Official Digital Catalog & Rate Card:*

Aap neeche diye verified link par tap karke sabhi property rates, floor plans aur locality comparison matrix dekh sakte hain:
🔗 ${rateCardUrl}

• *Pale Gaon & Station Road:* Actual ready-possession flat options
• *90% Bank Loan Desk:* SBI / HDFC document checklist
• *High-Footfall Commercial Shops:* Direct owner inventory

Aapko 1 BHK ya 2 BHK kiske sample photos dekhne hain?`,
        suggestedActions: ["📊 View Rate Card", "📅 Book Visit", "📍 Office Map"]
      };
    }

    // 7. RENTAL / LEASE INQUIRY: Flat or Shop on Rent
    if (
      text.includes("rent") ||
      text.includes("kiraya") ||
      text.includes("kiraye") ||
      text.includes("bhaada") ||
      text.includes("bhada") ||
      text.includes("lease") ||
      text.includes("bhadya")
    ) {
      if (lang === "marathi") {
        return {
          intent: "RENTAL_INQUIRY",
          language: "marathi",
          reply: `${greetingPrefix}🔑 *Dashmesh Properties - Bhadya che Flats (Ambernath East):*

• *1 RK Flat:* ₹3,500 - ₹4,500/mahina (Deposit: ₹20,000 - ₹35,000)
• *1 BHK Flat:* ₹5,000 - ₹8,500/mahina (Deposit: ₹30,000 - ₹50,000)
• *2 BHK Flat:* ₹9,000 - ₹15,000/mahina (Deposit: ₹50,000 - ₹80,000)
• *Commercial Dukaan:* ₹6,000 - ₹30,000/mahina

✅ 100% Legal Police Verification & Registered Rent Agreement Support
Aaplyala Pale Gaon madhe pahije ki Station Road javal?`,
          suggestedActions: ["1 BHK Rent", "2 BHK Rent", "Shop on Rent"]
        };
      }

      return {
        intent: "RENTAL_INQUIRY",
        language: lang,
        reply: `${greetingPrefix}🔑 *Dashmesh Properties - Verified Rental Rates (Ambernath East):*

• *1 RK Flat Rent:* ₹3,500 - ₹4,500/month (Deposit: ₹20,000 - ₹35,000)
• *1 BHK Flat Rent:* ₹5,000 - ₹8,500/month (Deposit: ₹30,000 - ₹50,000)
• *2 BHK Flat Rent:* ₹9,000 - ₹15,000/month (Deposit: ₹50,000 - ₹80,000)
• *Commercial Shop Rent:* ₹6,000 - ₹30,000/month (Location & carpet dependent)

✅ 100% Legal Police Verification & Registered Rent Agreement Support
✅ Bachelor & Family friendly verified flats available

Aapko residential flat rent par chahiye ya commercial shop? Preferred location bata dijiye!`,
        suggestedActions: ["1 BHK Rent", "2 BHK Rent", "Commercial Shop Rent"]
      };
    }

    // 8. OFFICE LOCATION, ADDRESS & TIMINGS
    if (
      text.includes("kahan") ||
      text.includes("kidhar") ||
      text.includes("location") ||
      text.includes("address") ||
      text.includes("timing") ||
      text.includes("pata") ||
      text.includes("samay") ||
      text.includes("open") ||
      text.includes("kab") ||
      text.includes("map") ||
      text.includes("pahuch") ||
      text.includes("email") ||
      text.includes("contact") ||
      (text.includes("office") && !text.includes("rent") && !text.includes("buy") && !text.includes("commercial"))
    ) {
      return {
        intent: "LOCATION_AND_TIMINGS",
        language: lang,
        reply: `${greetingPrefix}📍 *Dashmesh Properties ka Official Registered Office:*

🏢 *Office Address:*
${officeAddr}
(${officeLandmark})

⏰ *Office Timings:* ${officeTimings}
📍 *Google Maps Pin:* ${officeMap}

📞 *Direct Team Contacts:*
• Kuldeep Kaur: +91 84120 70183 (WhatsApp: +91 87937 71911)
• Sukhjyot Singh: +91 84219 40013
✉️ Email: info@dashmeshproperties.com

Aap kis din ya kis samay visit karna chahenge? Hum desk par pehle se properties shortlist karke ready rakhenge!`,
        suggestedActions: ["📍 Google Map Pin", "📅 Confirm Time", "📞 Call Office"]
      };
    }

    // 9. SPECIFIC LOCALITY: Pale Gaon Inquiry (Dashmesh Properties Core Base)
    if (text.includes("pale gaon") || text.includes("palegaon") || text.includes("pale")) {
      if (lang === "marathi") {
        return {
          intent: "LOCALITY_PALE_GAON",
          language: "marathi",
          reply: `${greetingPrefix}🏡 *Pale Gaon (Ambernath East) Verified Property Rates:*
*(Ambernath Railway Station pasun fakt 7 mins dur, Bus Stop javal)*

• *1 RK Studio:* ₹12 Lakh - ₹16 Lakh (Budget friendly)
• *1 BHK Flat:* ₹21 Lakh - ₹28 Lakh (Ready & New, SBI/HDFC 90% Loan Manjur)
• *2 BHK Flat:* ₹34 Lakh - ₹48 Lakh (Lift, power backup, parking)
• *Bhadya sathi (Rent):* 1 BHK: ₹5,000 - ₹7,500/mo | 2 BHK: ₹9,000 - ₹13,000/mo
• *Commercial Dukaan:* Rent: ₹6,000 - ₹20,000/mo | Sale: ₹18 Lakh - ₹40 Lakh

📍 Aamche office New Floora, Shop No. 24, Pale Gaon madhech aahe.
Aaplyala Flat Kharedi, Vikri ki Bhadya sathi hawa aahe?`,
          suggestedActions: ["1 BHK Pale Gaon", "2 BHK Pale Gaon", "Rent in Pale Gaon"]
        };
      }

      if (lang === "english") {
        return {
          intent: "LOCALITY_PALE_GAON",
          language: "english",
          reply: `${greetingPrefix}🏡 *Pale Gaon (Ambernath East) Verified Property Rates:*
*(7 mins from Ambernath Railway Station, peaceful residential pocket)*

• *1 RK Studio:* ₹12 Lakh - ₹16 Lakh
• *1 BHK Flat:* ₹21 Lakh - ₹28 Lakh (90% Bank Loan Approved)
• *2 BHK Flat:* ₹34 Lakh - ₹48 Lakh (Gated with lift & parking)
• *Rental Flats:* 1 BHK: ₹5,000 - ₹7,500/mo | 2 BHK: ₹9,000 - ₹13,000/mo
• *Commercial Shops:* Rent: ₹6,000 - ₹20,000/mo | Sale: ₹18 Lakh - ₹40 Lakh

📍 Office: New Floora, Shop No. 24, Pale Gaon.
Are you looking to Buy, Rent, or Sell?`,
          suggestedActions: ["1 BHK in Pale Gaon", "2 BHK in Pale Gaon", "Rent in Pale Gaon"]
        };
      }

      return {
        intent: "LOCALITY_PALE_GAON",
        language: "hinglish",
        reply: `${greetingPrefix}🏡 *Pale Gaon (Ambernath East) Verified Property Rates:*
*(Ambernath Railway Station se sirf 7 mins dur, Pale Gaon Bus Stop connectivity)*

• *1 RK Studio:* ₹12 Lakh - ₹16 Lakh (Budget friendly)
• *1 BHK Flat:* ₹21 Lakh - ₹28 Lakh (Ready & Under Construction, SBI/HDFC 90% Loan)
• *2 BHK Flat:* ₹34 Lakh - ₹48 Lakh (Lift, power backup, parking)
• *Rental Flats:* 1 BHK Rent: ₹5,000 - ₹7,500/mo | 2 BHK: ₹9,000 - ₹13,000/mo
• *Commercial Shops:* Rent: ₹6,000 - ₹20,000/mo | Sale: ₹18 Lakh - ₹40 Lakh

📍 Hamara office New Floora, Shop No. 24, Pale Gaon mein hi sthit hai.
Aapka requirement Buy, Sale ya Rent mein se kismein hai?`,
        suggestedActions: ["1 BHK in Pale Gaon", "2 BHK in Pale Gaon", "Rent in Pale Gaon"]
      };
    }

    // 10. SPECIFIC LOCALITY: Station Road & Kansai (Prime Walkable Area)
    if (text.includes("station") || text.includes("kansai") || text.includes("shiv mandir")) {
      return {
        intent: "LOCALITY_STATION_KANSAI",
        language: lang,
        reply: `${greetingPrefix}🚉 *Ambernath East (Station Road & Kansai) Verified Property Rates:*
*(Station se walking distance & prime commercial corridor)*

• *1 BHK Flat:* ₹28 Lakh - ₹38 Lakh (Walkable to Station, lift, municipal water)
• *2 BHK Flat:* ₹44 Lakh - ₹62 Lakh (Township projects, club amenities, parking)
• *3 BHK Flat:* ₹65 Lakh - ₹90 Lakh (Premium living)
• *Commercial Retail Shops:* Rent: ₹15,000 - ₹35,000/mo | Sale: ₹32 Lakh - ₹85 Lakh (Prime footfall)
• *Rental 1 BHK:* ₹8,000 - ₹12,000/mo | 2 BHK: ₹14,000 - ₹20,000/mo

Aapko station se kitne distance ke andar flat ya shop chahiye?`,
        suggestedActions: ["Station 5min Walk", "Kansai Townships", "Station Shops"]
      };
    }

    // 11. SPECIFIC LOCALITY: Morivali, Anand Nagar & MIDC
    if (text.includes("morivali") || text.includes("midc") || text.includes("anand nagar")) {
      return {
        intent: "LOCALITY_MORIVALI_MIDC",
        language: lang,
        reply: `${greetingPrefix}🏭 *Morivali & MIDC / Anand Nagar (Ambernath East) Rates:*
*(Affordable budget corridor with continuous rental tenant demand)*

• *1 RK Flat:* ₹10 Lakh - ₹14 Lakh
• *1 BHK Flat:* ₹19 Lakh - ₹25 Lakh (Low EMI, 90% loan approved)
• *2 BHK Flat:* ₹30 Lakh - ₹42 Lakh
• *Rental Flats:* 1 BHK Rent: ₹4,500 - ₹6,500/mo (High rental yield for investors)
• *Commercial / Industrial Gala / Shop:* ₹8,000 - ₹25,000/mo

Kya aap investment/rental income ke liye dekh rahe hain ya khud rehne ke liye?`,
        suggestedActions: ["1 BHK Budget", "High Rental Yield", "Industrial Galas"]
      };
    }

    // 12. SPECIFIC LOCALITY: Ambernath West
    if (text.includes("west") || text.includes("paschim") || text.includes("navare")) {
      return {
        intent: "LOCALITY_WEST",
        language: lang,
        reply: `${greetingPrefix}🏙️ *Ambernath West Verified Property Rates:*
*(Navare Nagar, Sai Baba Temple & Station West corridor)*

• *1 BHK Flat:* ₹26 Lakh - ₹35 Lakh
• *2 BHK Flat:* ₹40 Lakh - ₹58 Lakh
• *Rental 1 BHK:* ₹6,500 - ₹9,000/mo | 2 BHK: ₹11,000 - ₹16,000/mo

Ambernath West mein aapka preferred location kaunsa hai?`,
        suggestedActions: ["Navare Nagar", "Station West", "Compare with East"]
      };
    }

    // 13. 1 BHK FLAT SPECIFIC INQUIRY
    if (text.includes("1 bhk") || text.includes("1bhk") || text.includes("one bhk")) {
      return {
        intent: "RESIDENTIAL_1BHK",
        language: lang,
        reply: `${greetingPrefix}🏡 *Ambernath East 1 BHK Flats Rate Card:*

• *Pale Gaon (Near Office):* ₹21 Lakh - ₹28 Lakh (Quiet, family environment, 7 mins to station)
• *Station Road / Kansai:* ₹28 Lakh - ₹38 Lakh (Station walking distance, lift & power backup)
• *Morivali / Anand Nagar:* ₹19 Lakh - ₹25 Lakh (Low investment & high rental demand)

✅ SBI, HDFC, ICICI se 90% tak Home Loan approved (Monthly EMI: ₹16,000 - ₹22,000)
✅ Ready possession (Immediate shifting) aur Under-construction dono available

Aapka comfortable budget kitna hai? Hum turant photos aur floor plans WhatsApp karenge!`,
        suggestedActions: ["Under ₹25L", "₹25L - ₹35L", "📅 Book Visit"]
      };
    }

    // 14. 2 BHK / 3 BHK FLAT SPECIFIC INQUIRY
    if (text.includes("2 bhk") || text.includes("2bhk") || text.includes("two bhk") || text.includes("3 bhk") || text.includes("3bhk")) {
      return {
        intent: "RESIDENTIAL_2BHK_3BHK",
        language: lang,
        reply: `${greetingPrefix}🏰 *Ambernath East 2 BHK & 3 BHK Luxury/Spacious Homes:*

• *2 BHK (Pale Gaon):* ₹34 Lakh - ₹48 Lakh (Spacious 650-750 sq.ft carpet, master bedroom, balcony)
• *2 BHK (Station Road / Kansai):* ₹44 Lakh - ₹62 Lakh (Township with clubhouse, gym, garden, parking)
• *3 BHK Township Apartments:* ₹65 Lakh - ₹90 Lakh (Premium gated communities)

✅ Bank loan approved with 90% funding & PMAY subsidy assistance
✅ Clear title, OC received & zero hidden legal costs

Aap kis weekend par family ke saath sample flat dekhne aana chahenge?`,
        suggestedActions: ["2 BHK Pale Gaon", "2 BHK Station", "📅 Book Visit"]
      };
    }

    // 15. GENERAL PROPERTY / MASTER RATE INQUIRY ("rate kya hai", "price", "budget")
    if (
      text.includes("rate") ||
      text.includes("price") ||
      text.includes("cost") ||
      text.includes("budget") ||
      text.includes("kitna") ||
      text.includes("bhav") ||
      text.includes("flat") ||
      text.includes("ghar") ||
      text.includes("house")
    ) {
      return {
        intent: "MASTER_RATE_CARD",
        language: lang,
        reply: `${greetingPrefix}📊 *Dashmesh Properties - Master Property Rate Card (Ambernath East):*

🏠 *Residential Flats:*
• *1 RK Studio:* ₹12 Lakh - ₹16 Lakh
• *1 BHK Flat:* ₹21 Lakh - ₹28 Lakh (Pale Gaon) | ₹28 Lakh - ₹38 Lakh (Station Road)
• *2 BHK Flat:* ₹34 Lakh - ₹48 Lakh (Pale Gaon) | ₹44 Lakh - ₹62 Lakh (Station Road)
• *3 BHK Flat:* ₹65 Lakh - ₹90 Lakh

🔑 *Rental Properties:*
• 1 BHK Rent: ₹5,000 - ₹8,500/month
• 2 BHK Rent: ₹9,000 - ₹15,000/month

🏪 *Commercial Retail Shops:*
• Rent: ₹6,000 - ₹35,000/month | Buy: ₹18 Lakh - ₹85 Lakh

🌐 *Digital Catalog:* ${rateCardUrl}

Aapko specific kis area ya budget mein property chahiye?`,
        suggestedActions: ["📊 Digital Catalog", "Under ₹25L", "₹25L - ₹45L"]
      };
    }

    // 16. DEFAULT INITIAL GREETING / FIRST CONTACT
    if (!isOngoing) {
      if (lang === "marathi") {
        return {
          intent: "GREETING",
          language: "marathi",
          reply: `Namaskar ${name ? name + ' ji' : ''}! Dashmesh Properties madhe aple swagat aahe. 🙏
*"Aapla Vishwas, Aamchi Baddhata — Finding Spaces, Building Relationships"*

🏢 Karyalay: New Floora, Shop No. 24, Pale Gaon, Ambernath (E) - 421 501

Aamhi Ambernath East & Pale Gaon che verified real estate consultants aahot:
1️⃣ *Residential Flats:* 1 BHK (₹21L - ₹38L) | 2 BHK (₹34L - ₹62L)
2️⃣ *Bhadya che Flats:* 1 BHK Rent (₹5,000 - ₹8,500/mahina)
3️⃣ *Commercial Dukaan:* Rent & Buy (Prime Footfall)
4️⃣ *Bank Loan Desk:* 90% SBI / HDFC Loan Approval

🌐 Digital Rate Card: ${rateCardUrl}
Aaplyala kashachi mahiti hawi aahe? Aamhi lagech verified options share karto!`,
          suggestedActions: ["1 BHK / 2 BHK", "Rental Flats", "Commercial", "Office Location"]
        };
      }

      if (lang === "english") {
        return {
          intent: "GREETING",
          language: "english",
          reply: `Hello ${name ? name : ''}! Welcome to Dashmesh Properties. 🙏
*"Your Trust, Our Commitment — Finding Spaces, Building Relationships"*

🏢 Office: New Floora, Shop No. 24, Pale Gaon, Ambernath (E) - 421 501

We specialize in verified residential & commercial properties in Ambernath:
1️⃣ *Residential Flats:* 1 BHK (₹21L - ₹38L) | 2 BHK (₹34L - ₹62L)
2️⃣ *Rental Homes:* 1 BHK Rent (₹5,000 - ₹8,500/month)
3️⃣ *Commercial Retail Shops:* Prime locations for Rent & Sale
4️⃣ *Home Loan Assistance:* Up to 90% SBI / HDFC loan sanction

🌐 Digital Catalog: ${rateCardUrl}
What type of property are you looking for today?`,
          suggestedActions: ["1 BHK / 2 BHK", "Rental Homes", "Commercial", "Office Location"]
        };
      }

      return {
        intent: "GREETING",
        language: "hinglish",
        reply: `Namaste ${name ? name + ' ji' : ''}! Dashmesh Properties mein aapka swagat hai. 🙏
*"Your Trust, Our Commitment — Finding Spaces, Building Relationships"*

🏢 Office: New Floora, Shop No. 24, Pale Gaon, Ambernath (E) - 421 501

Hum Ambernath East aur Pale Gaon ke verified real estate consultants hain for Rent, Buy & Sale:
1️⃣ *Residential Flats:* 1 BHK (₹21L - ₹38L) | 2 BHK (₹34L - ₹62L)
2️⃣ *Rental Homes:* 1 BHK Rent (₹5,000 - ₹8,500/mo)
3️⃣ *Commercial Retail Shops:* Rent & Buy (High footfall)
4️⃣ *Bank Loan Desk:* 90% SBI / HDFC loan approval

🌐 Digital Rate Card: ${rateCardUrl}
Aapko kis type ki property ki requirement hai? Hum turant verified options share karenge!`,
        suggestedActions: ["1 BHK / 2 BHK", "Rental Flats", "Commercial", "Office Location"]
      };
    }

    // 17. ONGOING CHAT FALLBACK (Respectful, helpful, no repetitive greeting)
    return {
      intent: "CONVERSATIONAL_FOLLOWUP",
      language: lang,
      reply: `Ji, main samajh gaya. Dashmesh Properties par Kuldeep Kaur ji (+91 84120 70183) aur Sukhjyot Singh ji (+91 84219 40013) har client ko personal attention dete hain.

Aap apna specific budget, preferred area (Pale Gaon ya Station Road) ya visit ka samay bata dijiye, hum turant verified options bhejte hain!`,
      suggestedActions: ["📍 Office Map", "📊 Rate Card", "📞 Call Office"]
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

    if (style === "clean" || style === "none") {
      // 100% Clean Image: No visual watermark overlay.
      return;
    }

    if (style === "hud") {
      // Sleek Translucent Dark Ribbon
      const barHeight = Math.max(54, Math.round(canvas.height * 0.12));
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

      // Top cyan accent line
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, 3);

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(14, Math.round(canvas.width * 0.022))}px sans-serif`;
      ctx.fillText(`📍 ${biz} • ${city} (East)`, 20, canvas.height - barHeight + (barHeight * 0.42));

      ctx.fillStyle = "#94a3b8";
      ctx.font = `500 ${Math.max(11, Math.round(canvas.width * 0.016))}px sans-serif`;
      ctx.fillText(`Shop No. 24, Pale Gaon | Verified Property Consultant`, 20, canvas.height - (barHeight * 0.22));

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
      ctx.fillText(`★ ${biz.toUpperCase()} — ${city.toUpperCase()} (EAST) ★`, 20, canvas.height - barHeight + 24);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = `600 ${Math.max(11, Math.round(canvas.width * 0.016))}px sans-serif`;
      ctx.fillText(`PALE GAON, AMBERNATH (EAST) • VERIFIED CONSULTANT`, 20, canvas.height - 12);
    } else {
      // Minimalist Tag
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(canvas.width - 290, canvas.height - 35, 280, 30);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 12px sans-serif";
      ctx.fillText(`📍 Pale Gaon, Ambernath (E)`, canvas.width - 275, canvas.height - 15);
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
