-- Dashmesh Properties & Rent Agreement Services - Full Master SQL Dump
-- Generated on: 2026-10-03 21:53:30
-- Official Charges: Rent Agreement Rs. 1,750 per side | Rs. 3,500 Total All-Inclusive

BEGIN TRANSACTION;
CREATE TABLE google_posts (
        post_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        call_to_action TEXT,
        scheduled_time TEXT,
        status TEXT DEFAULT 'Published',
        created_at TEXT
    );
INSERT INTO "google_posts" VALUES('post_log_1790965116456','🏪 Prime Roadside Commercial Shops Available for Rent & Sale','Elevate your business footprint in Ambernath East! High-visibility commercial retail shops and office spaces available near Pale Gaon & Station Road corridor. Ideal for clinics, grocery supermarkets, salons, diagnostics, and retail franchises. Attractive rental yield and verified commercial titles. Call Dashmesh Properties at +91 84210 77613 to inspect prime spaces today.','Call +91 84210 77613','2026-10-03 16:23','Published Live on Google Maps','2026-10-03T12:53:51.352949Z');
INSERT INTO "google_posts" VALUES('post_log_1790956065911','🏡 Verified 1 BHK Ready Possession Flats in Pale Gaon, Ambernath (E)','Looking for an affordable, clear-title home near Ambernath Station? Dashmesh Properties presents ready-to-move 1 BHK apartments in Pale Gaon starting at ₹18 Lakhs. Features include lift, 24x7 water supply, power backup, and up to 90% SBI/HDFC bank loan approval. RERA verified with zero hidden charges! 📍 Visit us at Shop No. 24, New Floora, Pale Gaon, Ambernath (E) or call +91 84210 77613 for free site visits.','Call +91 84210 77613','2026-10-03 16:23','Published Live on Google Maps','2026-10-03T12:53:51.355075Z');
CREATE TABLE google_reviews (
        review_id TEXT PRIMARY KEY,
        author_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        sentiment TEXT,
        review_date TEXT,
        status TEXT DEFAULT 'Published',
        reply_text TEXT,
        created_at TEXT
    );
CREATE TABLE leads_crm (
        phone TEXT PRIMARY KEY,
        name TEXT,
        status TEXT,
        requirement TEXT,
        budget TEXT,
        location TEXT,
        language TEXT,
        last_intent TEXT,
        last_message TEXT,
        last_updated TEXT,
        created_at TEXT
    );
INSERT INTO "leads_crm" VALUES('918421077613','Satnam Singh (Owner / Boss)','Owner / Executive','','','Ambernath East','hinglish','OWNER_SYSTEM_STATUS','Sat Sri Akal Satnam Sir! 👑 Sia ready hai. Sabhi system live hain, zero fake data policy active hai, aur WhatsApp AI engine 24/7 client inquiries handle kar raha hai.','2026-10-03T12:00:00.000Z','2026-10-03T12:00:00.000Z');
INSERT INTO "leads_crm" VALUES('+918421940013','Sukhjyot Singh Vohra (Partner / Consultant)','Partner / Executive','','','Ambernath East','hinglish','PARTNER_CONNECT','Namaste Sukhjyot Singh ji! 🙏 Dashmesh Properties AI active hai. Sabhi verified inquiries directly phone aur site visits ke liye ready hain.','2026-10-03T10:18:13.457Z','2026-10-03T10:18:13.457Z');
INSERT INTO "leads_crm" VALUES('+918412070183','Kuldeep Singh Vohra (Partner / Consultant)','Partner / Executive','','','Ambernath East','hinglish','PARTNER_CONNECT','Sat Sri Akal Kuldeep Singh ji! 🙏 Rent Agreement & Doorstep Biometric Desk 100% active hai. Government stamp duty 0.25% + registration fee guidelines ke saath verified drafts ready hain.','2026-10-03T09:30:00.000Z','2026-10-03T09:30:00.000Z');
CREATE TABLE rent_agreements (
        agreement_id TEXT PRIMARY KEY,
        client_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT DEFAULT 'Owner / Tenant',
        property_address TEXT,
        monthly_rent TEXT,
        deposit_amount TEXT,
        agreement_period TEXT DEFAULT '11 Months',
        cost_per_side REAL DEFAULT 1750.0,
        total_cost REAL DEFAULT 3500.0,
        biometric_status TEXT DEFAULT 'Scheduled / Doorstep',
        biometric_slot TEXT,
        official_qr_pdf TEXT,
        status TEXT DEFAULT 'Drafting / In Progress',
        notes TEXT,
        created_at TEXT,
        updated_at TEXT
    );
INSERT INTO "rent_agreements" VALUES('AGR-2026-DASH001','Satnam Singh Vohra (Owner Desk)','+918421077613','Property Owner','Shop No. 24, New Floora, Pale Gaon, Ambernath East','₹10,000 / month','₹40,000','11 Months',1750.0,3500.0,'Official Govt Registered','Doorstep Biometric Verified','Registered_Govt_Agreement_QR.pdf','Completed & Delivered','Doorstep biometric done. 0.25% stamp duty & ₹1000 registration fee fully settled.','2026-10-01T10:00:00.000Z','2026-10-03T12:00:00.000Z');
INSERT INTO "rent_agreements" VALUES('AGR-2026-DASH002','Sukhjyot Singh (Consultant Desk)','+918421940013','Tenant Desk Inquiry','Shiv Mandir Road, Ambernath East','₹8,500 / month','₹35,000','11 Months',1750.0,3500.0,'Biometric Slot Scheduled','Tomorrow 11:30 AM (Doorstep)','In Drafting','Drafting / Scheduled','Aadhaar + PAN received. Executive scheduled for doorstep biometric.','2026-10-03T09:00:00.000Z','2026-10-03T12:30:00.000Z');
COMMIT;
