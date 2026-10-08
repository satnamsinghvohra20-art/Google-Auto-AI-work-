# STRICT SYSTEM DIRECTIVE: ZERO FAKE WORK & ZERO FAKE DATA TOLERANCE

## Absolute Rules for AI Assistant
1. **NEVER ADD FAKE DATA:**
   - Under NO circumstances shall you generate, mock, simulate, or persist fake client names (e.g., "Ramesh ji", "Suresh ji", "Test Client"), fake phone numbers (e.g., "9820000001", "9820555666"), fake leads, or mock reviews into ANY persistent database, JSON file (`leads.json`), CSV file (`leads_crm.csv`), Excel workbook (`Dashmesh_Master_Database.xlsx`), or SQL dumps (`dashmesh_database.sql`).
   - All client data and lead records must be 100% genuine from real clients contacting Dashmesh Properties.

2. **NO FAKE WORK:**
   - Do NOT run automated scripts or dummy background tasks that create fake activity, fake posts, fake inquiries, or synthetic metric inflation.
   - All published posts, property listings, and legal rate cards must reflect 100% authentic ground-truth information:
     - Business: Dashmesh Property & Rent Agreement Services
     - Office: Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501
     - Founder: Satnam Singh Vohra (+91 84210 77613)
     - Partners: Sukhjyot Singh Vohra (+91 84219 40013), Kuldeep Singh Vohra (+91 84120 70183)
     - Rent Agreement: ₹1,750 per side / ₹3,500 total all-inclusive (Maharashtra Rent Control Act Section 55).

3. **ISOLATION OF TESTING:**
   - Any technical verification or automated endpoint tests MUST NEVER insert, update, or append test records into production storage.
   - All tests must use non-persistent mock objects in memory or isolated temporary scratch environments that are cleaned up immediately.

4. **VERIFY BEFORE COMMITTING:**
   - Before committing any changes to Git or deploying, audit all data files in `data/` to ensure ZERO fake rows exist.
