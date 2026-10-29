# Dashmesh Properties AI — Autonomous Growth Suite & Production WhatsApp Receptionist

Dashmesh Properties AI is an enterprise-grade, zero-dependency Node.js platform combining an **Autonomous Local SEO & Google Business Growth Suite** with an **Official Meta WhatsApp Business Cloud API Receptionist (Sia AI)**.

---

## 🌟 Architecture & Core Capabilities

### 1. 🤖 Official Meta WhatsApp Business Cloud API Receptionist (Sia AI)
- **Official Meta Cloud API:** Webhook challenge verification (GET) and SHA-256 HMAC signature verification (POST) compliant with Meta Graph API v20.0+.
- **Inbound Message Parser:** Safely processes text messages, interactive quick-reply buttons, interactive list selections, media attachments (images, audio, documents), location pins, and contact cards.
- **Immediate Webhook ACK & Async Brain:** Delivers immediate HTTP 200 OK responses to Meta to prevent timeout retry loops, while processing lead qualification and response dispatch asynchronously.
- **Idempotency & Deduplication:** Bounded 24-hour message ID deduplication cache prevents duplicate processing, duplicate leads, or duplicate replies.
- **Outbound WhatsApp Sender:** Exponential backoff with jitter, token-bucket rate limiting (60 req/s), Meta error code classification, and 24-hour customer service window enforcement.
- **Customer Opt-Out & Opt-In:** Supports compliance keywords (`STOP`, `UNSUBSCRIBE`, `RUKO` vs `START`, `RESUME`, `SHURU`).

### 2. 🧠 Sia AI Knowledge Brain & Zero-Hallucination Engine
- **Grounded Property Knowledge Base:** Queries 168+ verified real estate projects from `data/projects.json` covering Ambernath East, Pale Gaon, MIDC, Badlapur, and Kalyan.
- **Zero Hallucination Policy:** Does not invent unverified listings, fake RERA IDs, speculative yields, or unauthorized discounts. If an inquiry cannot be matched with verified data, Sia clarifies requirements and offers human escalation.
- **Ground-Truth Business Facts:**
  - **Business:** Dashmesh Property & Rent Agreement Services
  - **Office:** Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501
  - **Founder:** Satnam Singh Vohra (+91 84210 77613)
  - **Partners:** Sukhjyot Singh Vohra (+91 84219 40013), Kuldeep Singh Vohra (+91 84120 70183)
  - **Rent Agreement:** ₹1,750 per side / ₹3,500 total all-inclusive (Maharashtra Rent Control Act Section 55).
- **Multi-Language Detection:** Dynamically detects and converses in English, Hindi, natural Hinglish, and Marathi.
- **Sia Persona:** Warm, empathetic, respectful 24-year-old girl personality using natural feminine Hinglish grammar (*"karungi"*, *"bataungi"*, *"main hoon na 💖"*).
- **Graceful Gemini Fallback:** Automatically falls back to a deterministic, grounded knowledge engine if Google Gemini is unavailable or rate-limited.

### 3. 🗃️ Conversation Memory & Lead CRM Store (`crm_store.js`)
- **Persistent Customer Memory & Schema:** Each customer profile is durably persisted with stable identity `wa_${cleanPhone}` in `data/leads.json` and mirrored to `data/csv/leads_crm.csv`.
- **Long-Term Memory Fields:**
  - `qualification`: Intent, locality, BHK, property type, budget, timeline, financing, and preference.
  - `budgetHistory`: Automatically records every revision when a client corrects their budget (e.g. from 50 Lakhs to 70 Lakhs).
  - `propertiesDiscussed`: Tracks recent verified properties discussed to resolve follow-up questions ("What is the price?", "Is it available?").
  - `hasGreeted`: Persistent flag ensuring welcome greetings are sent at most once and never repeated.
  - `changeHistory`: Preserves audit trail for customer preference corrections.
  - `lastSummary`: Rolling context summary persisted across restarts.
- **Per-Contact Concurrency Coordination:** Asynchronous mutex lock (`acquireContactLock` / `releaseContactLock`) prevents race conditions and corrupted order when simultaneous webhooks arrive.
- **Restart & Ephemeral Resilience:** Reloads cleanly from atomic disk storage with zero data loss across process restarts.
- **Contact Memory Isolation:** Strict partition per normalized E.164 phone number. Contacts never cross-contaminate history or qualification states.
- **Human Escalation Queue:** Detects price negotiations, disputes, owner call requests, and complaints. Sets `human_pending = true`, mutes automated bot replies, and alerts the owner.

### 4. 🎯 Rule 1 & Rule 2 Intelligent Conversation Engine
- **Never Greet on Every Message:** Ongoing conversations immediately jump straight into answering the customer's question. First contacts asking direct questions receive direct answers with zero promotional greeting clutter.
- **Answer the Complete Question:** Multi-part inquiries (e.g. rent agreement charges + office location + 1 BHK availability in Pale Gaon) are decomposed, resolved against verified databases, and answered completely in a single structured response.
- **Follow-up Reference Resolution:** Resolves pronouns and contextual questions ("What is the price?", "Can I visit tomorrow?") against the previously discussed project in CRM memory.

### 4. 🚀 Local SEO & Google Business Growth Suite
- **Interactive GPS Grid Heatmap:** Leaflet.js engine tracking local ranking pack positions across Ambernath.
- **Smart Review Shield:** 5-star Google review funnel with private sentiment filtering for negative feedback.
- **AI Photo Geo-Tagger:** Canvas-based EXIF and GPS coordinate watermarking studio.
- **Printable In-Store QR Standee:** High-DPI table tent designer with custom business branding.
- **Competitor SERP Radar:** Live rank tracking across high-intent local property search terms.

---

## 🔌 API Endpoints Reference

### WhatsApp Cloud API Integration
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/whatsapp/webhook` | Meta Webhook subscription challenge verification (`hub.mode`, `hub.verify_token`, `hub.challenge`) |
| `POST` | `/api/whatsapp/webhook` | Meta Webhook event receiver with raw body HMAC-SHA256 signature verification |
| `GET` | `/api/whatsapp/health` | Safe diagnostic health check (masked keys, cache size, token rate) |
| `GET` | `/api/whatsapp/handoff-queue` | Returns contacts awaiting human owner intervention |
| `POST` | `/api/whatsapp/resolve-handoff` | Resolves human handoff and resumes AI receptionist |

### Omnichannel & Core APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leads` | CRM leads retrieval (protected by `ADMIN_SECRET_KEY`) |
| `POST` | `/api/posts/publish` | Omnichannel publisher (Google Business, Facebook, Instagram, LinkedIn) |
| `GET` | `/api/security/connections` | Read-only connection health probe |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

### Required Production Variables:
- `ADMIN_SECRET_KEY`: Bearer/header authentication key for private endpoints.
- `META_ACCESS_TOKEN`: System User access token with `whatsapp_business_messaging` permissions.
- `META_APP_SECRET`: Meta App Secret from App Dashboard -> Basic Settings (for webhook signature verification).
- `META_GRAPH_VERSION`: Graph API version (default: `v20.0`).
- `WHATSAPP_PHONE_NUMBER_ID`: Phone Number ID from WhatsApp -> API Setup.
- `WHATSAPP_VERIFY_TOKEN`: Custom secret token configured in Meta Webhooks dashboard.
- `PUBLIC_URL`: HTTPS public URL (e.g. `https://your-domain.com` or active ngrok tunnel).
- `GEMINI_API_KEY`: Google Gemini API key for conversational AI synthesis.
- `GEMINI_MODEL`: Gemini model identifier (default: `gemini-2.0-flash`).
- `OWNER_ALERT_PHONE`: WhatsApp phone number for human escalation alerts (default: `918421077613`).

---

## 💻 How to Run Locally

### 1. Start Web Server
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Start Background Autonomous Loop (Optional / Production Daemon)
```bash
node loop.js
```

### 3. Run Test Suite
All tests run with zero external npm dependencies using native `node:test`:
```bash
npm test
# or
node --test test/*.test.js
```
- **Coverage:** Meta webhook challenge, HMAC-SHA256 signature validation, payload parsing, message deduplication, contact isolation, language handling (English, Hindi, Hinglish, Marathi), multi-question handling, zero hallucination property grounding, Gemini/API fallback resilience, opt-out/opt-in compliance, human handoff queue & silent bot guard, Meta error classification, 24-hour service window rules, admin authentication, persistent memory recovery across crashes/restarts, worker PID lock coordination, and Rule 1 regression prevention (never repeat greetings).
- **Data Safety:** All test fixtures run against isolated temporary storage; zero test data touches persistent production files.

---

## 📋 Feature Verification Matrix

| Feature / Module | Status | Verification & Testing |
|---|---|---|
| **Meta Webhook GET Challenge** | ✅ Implemented & Tested | Tested with valid & mismatched tokens |
| **Meta Webhook POST Signature (HMAC-SHA256)** | ✅ Implemented & Tested | Tested valid hash, tampered hash, missing header |
| **Inbound Message Parsing (Text, Buttons, Media, Location)** | ✅ Implemented & Tested | Validated text, button_reply, list_reply, image captions |
| **Webhook Deduplication & Idempotency** | ✅ Implemented & Tested | 24-hr cache rejects duplicate `wamid` IDs |
| **24-Hour Messaging Window & Template Rules** | ✅ Implemented & Tested | Enforces template requirement outside 24h window |
| **Outbound WhatsApp Sender with Retries & Rate Limits** | ✅ Implemented & Tested | Token bucket (60/s), exponential backoff, error codes |
| **Multi-Language Detection (EN, HI, Hinglish, MR)** | ✅ Implemented & Tested | Verified against Hindi, Marathi, Hinglish, English queries |
| **No Greeting on Every Message (Rule 1)** | ✅ Implemented & Tested | Regression test verifies consecutive messages do not repeat greeting |
| **Answer Multi-Question Inquiries (Rule 2)** | ✅ Implemented & Tested | Price + documents + locality answered completely |
| **Zero-Hallucination Verified Listings (Rule 3)** | ✅ Implemented & Tested | Grounded in `data/projects.json` & legal rates (₹1,750 / ₹3,500) |
| **Customer Memory & CRM Store (`crm_store.js`)** | ✅ Implemented & Tested | Durable atomic JSON + CSV sync with restart survival |
| **Multi-Customer Isolation** | ✅ Implemented & Tested | Independent contexts by phone; 0 cross-contamination |
| **Human Handoff & Escalation Queue** | ✅ Implemented & Tested | Auto-detects escalation, alerts owner, mutes bot |
| **Opt-Out (STOP) & Opt-In (START) Compliance** | ✅ Implemented & Tested | Strictly prevents non-essential messages after opt-out |
| **Admin Route Authentication (`ADMIN_SECRET_KEY`)** | ✅ Implemented & Tested | Rejects unauthorized requests; accepts Bearer/Header |
| **Continuous Worker Coordination (`loop.js`)** | ✅ Implemented & Tested | PID lock prevents duplicate runners or API flooding |
| **Live Meta Graph API Network Send** | ⚠️ Config-Dependent | Tested with mock responses; live delivery requires active Meta System User Token in `.env` |
| **Live Google Gemini API Calls** | ⚠️ Config-Dependent | Works live when `GEMINI_API_KEY` is present; falls back to grounded rule engine if missing |
| **Social / GBP Omnichannel Auto-Posting** | ⚠️ Config-Dependent | Implemented; live posting requires user OAuth refresh token |

---

## 🧪 Manual End-to-End Test Script

To manually test the complete workflow locally or in staging:

### Step 1: Health Diagnostic Check
```bash
curl -s http://localhost:3000/api/whatsapp/health
```
**Expected Output:** JSON object indicating `status: "READY"` (or `"DEGRADED"` if tokens are missing), showing masked credentials and cache entries.

### Step 2: Webhook Challenge Handshake (GET)
```bash
curl -i "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=DashmeshProperties2026&hub.challenge=TEST_CHALLENGE_123"
```
**Expected Output:** HTTP 200 with raw body `TEST_CHALLENGE_123`.

### Step 3: Send Inbound Customer Message (POST)
Send a test message simulating a new customer asking about rent agreement:
```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": { "phone_number_id": "123456789" },
          "contacts": [{ "profile": { "name": "Rahul" }, "wa_id": "919820099999" }],
          "messages": [{
            "from": "919820099999",
            "id": "wamid_test_manual_01",
            "timestamp": "1730000000",
            "type": "text",
            "text": { "body": "Rent agreement ka price aur process kya hai?" }
          }]
        }
      }]
    }]
  }'
```
**Expected Output:** Immediate `{"status":"EVENT_RECEIVED"}`.

### Step 4: Verify CRM Record and Outbound Answer
Check that the customer profile and outbound reply were persisted in CRM:
```bash
curl -s http://localhost:3000/api/whatsapp/conversations \
  -H "Authorization: Bearer your_strong_admin_secret_key_here"
```
**Expected Output:** Conversation shows the incoming message, the qualified intent `agreement`, and Sia's verified response stating the legal fee: `₹1,750 per side (₹3,500 total)`.

### Step 5: Test Consecutive Message (Verify Rule 1 - No Repeated Greeting)
Send a follow-up message from the same phone number:
```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": { "phone_number_id": "123456789" },
          "contacts": [{ "profile": { "name": "Rahul" }, "wa_id": "919820099999" }],
          "messages": [{
            "from": "919820099999",
            "id": "wamid_test_manual_02",
            "timestamp": "1730000010",
            "type": "text",
            "text": { "body": "Office kahan par hai?" }
          }]
        }
      }]
    }]
  }'
```
**Expected Output:** Sia directly answers with the office address (`Shop No. 24, New Floora, Pale Gaon`) with **NO greeting or welcome brochure prepended**.

### Step 6: Test Human Escalation & Bot Muting (Phase 5)
Send a negotiation / escalation request:
```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": { "phone_number_id": "123456789" },
          "contacts": [{ "profile": { "name": "Rahul" }, "wa_id": "919820099999" }],
          "messages": [{
            "from": "919820099999",
            "id": "wamid_test_manual_03",
            "timestamp": "1730000020",
            "type": "text",
            "text": { "body": "Can I get a discount? Talk to owner please" }
          }]
        }
      }]
    }]
  }'
```
**Expected Output:**
1. Conversation is marked `human_pending: true`.
2. Handoff notice sent confirming escalation to Satnam Sir (+91 84210 77613).
3. The contact appears in `/api/whatsapp/handoff-queue`.
4. Subsequent messages from this customer are muted (`reply: null`) so the bot does not conflict with human negotiation.
5. Once resolved by calling `/api/whatsapp/resolve-handoff`, AI reception resumes.

---

## 🚀 Production Deployment (Render)

The project is configured for seamless deployment on Render:
- **Build Command:** `npm install` (or no-op since zero external dependencies)
- **Start Command:** `node server.js`
- **Environment Variables:** Set in Render Dashboard -> Environment:
  - `PORT`: `10000` (Render sets automatically)
  - `PUBLIC_URL`: `https://google-auto-ai-work.onrender.com`
  - `META_ACCESS_TOKEN`, `META_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`
  - `GEMINI_API_KEY`, `ADMIN_SECRET_KEY`

Meta Webhook Callback URL:
`https://google-auto-ai-work.onrender.com/api/whatsapp/webhook`

---

## 🔒 Security & Data Integrity Directives

- **Zero Fake Data Policy:** Test routines and diagnostic scripts MUST NEVER insert mock records or synthetic numbers into `data/leads.json`, CSVs, or databases.
- **Zero Hallucination Policy:** Property prices and configurations are strictly bound to verified records in `data/projects.json`.
- **Secret Isolation:** API keys, access tokens, and passwords are never logged, returned via health checks, or exposed in client bundles.
