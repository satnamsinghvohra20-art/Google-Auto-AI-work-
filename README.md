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

### 2. Run Test Suite
All tests run with zero external npm dependencies using native `node:test`:
```bash
node --test test/*.test.js
```
- **Total Test Cases:** 41 passing tests (including all 16 critical regression test scenarios).
- **Coverage:** Meta webhook verification, HMAC signature validation, payload parsing, deduplication, contact isolation, language detection, grounded property queries, opt-out/opt-in, human handoff queue, 24-hour service window rules, anti-greeting logic, complete multi-part question answering, persistent memory recovery across restarts, budget correction tracking, and concurrent race-condition prevention.
- **Data Safety:** All test fixtures run against isolated temporary storage; zero test data touches `data/`.

---

## 🔒 Security & Data Integrity Directives

- **Zero Fake Data Policy:** Test routines and diagnostic scripts MUST NEVER insert mock records or synthetic numbers into `data/leads.json`, CSVs, or databases.
- **Zero Hallucination Policy:** Property prices and configurations are strictly bound to verified records in `data/projects.json`.
- **Secret Isolation:** API keys, access tokens, and passwords are never logged, returned via health checks, or exposed in client bundles.
