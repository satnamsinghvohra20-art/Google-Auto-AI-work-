# Grexa AI - Autonomous Google Business Profile Growth Suite (100% Free & Unlocked)

This application is a **fully functional, commercial-grade, paywall-free AI Local Growth Platform** inspired by the Grexa Booster funnel ([booster.grexa.ai/grexa-shop/531473](https://booster.grexa.ai/grexa-shop/531473)).

All money-taking paywalls, subscription pricing cards (₹6,999, ₹9,999, ₹4,999), and checkout payment gateways have been **completely eliminated**. In their place, the app is equipped with an **Autonomous AI Action Center** and **Advanced AI Suite** that actually executes all tasks for your business in real time!

---

## 🚀 Complete Feature Breakdown

### 🗺️ 1. Live Interactive Leaflet.js GPS Grid Heatmap
- **Real Geographic Map:** Replaced static map images with an interactive OpenStreetMap engine centered on Ambernath (`19.1908° N, 73.1785° E`).
- **3x3 (9 Points) & 5x5 (25 Points) Modes:** Inspect rankings across Pale Goan, Ambernath Station East, MIDC, Kansai Section, Morivali, and surrounding neighborhoods.
- **Search Radius Rings:** Visualizes the 1.2 km and 2.6 km local ranking pack radiuses.
- **Day 0 to 90 Timeline Projection Slider:** Drag slider to dynamically project rank improvements from Day 0 (Rank #21, Red) ➔ Day 30 (Top 10 Jump, Orange) ➔ Day 60 (Top 5 Surge, Yellow) ➔ Day 90 (Rank #1 Dominance, Green).
- **Interactive Pin Inspector:** Click any coordinate to view exact GPS coordinates, SERP rank, and traffic gain estimates.

### 🛡️ 2. Smart Review Shield & Sentiment Gate (Negative Review Blocker)
- **Sentiment Filter:**
  - **4 or 5 Stars:** Directly launches the Google Maps review link with pre-composed 5-star praise templates ready for one-tap copy.
  - **1 to 3 Stars:** Triggers the Negative Review Shield! The customer is presented with a private feedback form. Complaints are routed privately to the business owner and **never touch Google Maps**, keeping your public score at 5.0★!
- **Mobile Simulator:** Click *"📱 Preview Customer Mobile Experience"* to test the exact customer experience in an interactive iPhone mockup.
- **Backend Logging:** Stores shielded feedback via REST endpoint (`/api/shield/feedback`).

### 📸 3. AI Photo Geo-Tagger Studio & EXIF Stamp Generator
- **HTML5 Canvas Watermarking:** Upload any business photo or select from 3 instant presets (*Storefront*, *Consultation Desk*, *Residential Property*).
- **3 Stamp Styles:**
  - **Google Maps HUD:** Translucent dark bar with GPS coordinates, address, timestamp, and green Google Maps verified badge.
  - **Golden Prestige:** Luxury gold border with star badges.
  - **Minimalist Coordinates:** Clean monospaced corner stamp.
- **1-Click Download:** Exports the stamped JPEG file ready to upload to Google Business Profile.

### 🪧 4. Printable In-Store QR Counter Standee Designer
- **Counter Standee Studio:** Generates a ready-to-print reception standee with your business name, star rating, custom incentive, and live QR code.
- **4 Design Themes:** Minimalist Clean, Royal Indigo, Golden Prestige, Emerald Verified.
- **High-DPI Print Support:** Print directly to A5 or A4 table tents with cut and fold guides via `window.print()`.

### 🤖 5. Autonomous Background Post Scheduler Daemon (Tier 2)
- **Background Daemon Simulation:** Click *"▶️ Trigger Auto-Post Simulation"* to run automated Google Business Profile API publishing routines.
- **Live Terminal Console:** Displays real-time API dispatch logs (`/api/posts/publish`), payload details, and Google Post ID confirmations.
- **CSV Export:** Download the entire 7-day scheduled posts calendar as a CSV file.

### 📡 6. Real-Time Competitor SERP Radar & Prober (Tier 2)
- **4 High-Intent Keywords Radar:** Tracks *Property Consultant in Ambernath*, *Flats for Sale in Ambernath East*, *Real Estate Agent Near Station*, and *Commercial Shop Rent*.
- **Competitor Rank Gap:** Displays position difference and projected call gains.
- **Live SERP Probe:** Test any keyword to simulate real-time coordinate scraping across 9 to 25 points (`/api/rank/scrape`).

### 💬 7. Automated WhatsApp Review CRM & Dispatcher (Tier 3)
- **Direct WhatsApp Funnel:** Enter customer name and phone number to send personalized review invitations.
- **3 Follow-Up Templates:**
  - *Immediate Thank You & 5-Star Invite*
  - *24-Hour Polite Follow-Up*
  - *VIP Voucher & Free Valuation Incentive*
- **1-Click Launch:** Dispatches directly to WhatsApp Web/App (`wa.me`) and logs to backend (`/api/whatsapp/send`).

### 🏢 8. Agency White-Label Mode & Franchise Switcher (Tier 4)
- **Multi-Location Franchise Switcher:** Switch between Ambernath Main HQ, Badlapur West Branch, Kalyan West Branch, or create a custom branch.
- **Agency Mode Toggle:** Instantly transforms the application into a white-labeled client audit tool:
  - Custom Agency Name (e.g. *Satnam AI Growth Agency*)
  - Custom Retainer Pricing (e.g. *₹14,999 / mo*)
  - Branded PDF Export for presenting to local business clients.

### 📝 9. Profile Optimization & 40+ Citations Pack
- **Title & Categories:** Recommended primary and 3 secondary Google categories.
- **740-Character Description:** Injects high-volume search keywords with 1-click clipboard copy.
- **40+ Local Citations Pack:** NAP pack formatted for Justdial, IndiaMART, Sulekha, 99acres, MagicBricks, Housing.com, Apple Business Connect, and Bing Places.

---

## 🖥️ How to Run Locally

1. Start the server (Zero dependencies required; uses native Node.js):
   ```bash
   node server.js
   ```

2. Open in your browser:
   ```
   http://localhost:3000
   ```
   Or open [`index.html`](file:///c:/Users/satna/Downloads/Google%20work%20auto%20ai/index.html) directly in any browser.
