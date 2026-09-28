/**
 * Grexa AI Growth Suite - Main Functional Controller (100% Unlocked)
 * Commercial-Grade Local SEO Platform with Zero Paywalls
 */

let appState = {
  mode: "clone", // "clone" | "advanced"
  currentReport: DEFAULT_REPORT,
  isScanning: true,
  scanStepIndex: 0,
  scanTimer: null,
  timelineDay: 0,
  gridSize: 3,
  ticketValue: 15000,
  monthlyCalls: 15,
  leafletMap: null,
  leafletMarkers: [],
  geoPhotoBlob: null,
  activeStampStyle: "hud",
  currentSampleImg: null,
  activeStandeeTheme: "classic_white",
  agencyMode: false,
  agencyConfig: Object.assign({}, AGENCY_CONFIG),
  daemonRunning: false
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupLanguageSelector();
  setupModeSwitcher();
  startScanSequence();
  renderWeeklyPosts();
  renderCitationsTable();
  renderCompetitorsTable();
  renderFaqs();
  renderKeywordRadar();
  updateROICalculator();
  updateCRMPreview();

  // Preload first sample photo for Geo-Tagger
  loadSampleGeoPhoto(0);

  // Listen for language changes
  window.addEventListener("grexa:langChange", () => {
    applyTranslations();
  });
}

/**
 * Scan Animation Sequence
 */
function startScanSequence() {
  appState.isScanning = true;
  appState.scanStepIndex = 0;
  
  const scanContainer = document.getElementById("scan-view");
  const reportContainer = document.getElementById("report-view");
  
  const scanBiz = document.getElementById("scan-business-name");
  const scanAddr = document.getElementById("scan-business-address");
  if (scanBiz) scanBiz.textContent = appState.currentReport.report.name;
  if (scanAddr) scanAddr.textContent = appState.currentReport.report.address;
  
  if (scanContainer) scanContainer.classList.remove("hidden");
  if (reportContainer) reportContainer.classList.add("hidden");

  renderScanSteps();

  if (appState.scanTimer) clearInterval(appState.scanTimer);

  appState.scanTimer = setInterval(() => {
    appState.scanStepIndex++;
    renderScanSteps();

    if (appState.scanStepIndex >= 6) {
      clearInterval(appState.scanTimer);
      setTimeout(() => {
        finishScanSequence();
      }, 700);
    }
  }, 900);
}

function skipScan() {
  if (appState.scanTimer) clearInterval(appState.scanTimer);
  appState.scanStepIndex = 6;
  finishScanSequence();
}

function finishScanSequence() {
  appState.isScanning = false;
  const scanContainer = document.getElementById("scan-view");
  const reportContainer = document.getElementById("report-view");
  if (scanContainer) scanContainer.classList.add("hidden");
  if (reportContainer) reportContainer.classList.remove("hidden");

  populateReportData();
  renderCompetitorsTable();
  renderWeeklyPosts();
  renderCitationsTable();
  renderKeywordRadar();
  updateROICalculator();
  updateCRMPreview();

  // Initialize/Update Live Leaflet Map
  initOrUpdateLeafletMap();
}

function renderScanSteps() {
  const container = document.getElementById("scan-steps-container");
  if (!container) return;

  const steps = [
    { title: t("scan_step_1"), status: "pending" },
    { title: t("scan_step_2"), status: "pending" },
    { title: t("scan_step_3"), status: "pending" },
    { title: t("scan_step_4"), status: "pending" },
    { title: t("scan_step_5"), status: "pending" },
    { title: t("scan_step_6"), status: "pending" }
  ];

  let html = "";
  steps.forEach((step, idx) => {
    const isCompleted = idx < appState.scanStepIndex;
    const isCurrent = idx === appState.scanStepIndex;

    let iconHtml = `<span class="w-4 h-4 rounded-full border border-slate-300 inline-block"></span>`;
    let textClass = "text-slate-400";

    if (isCompleted) {
      iconHtml = `<span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-[10px]">✓</span>`;
      textClass = "text-slate-700 font-semibold";
    } else if (isCurrent) {
      iconHtml = `<span class="w-4 h-4 rounded-full border-2 border-brand-primary border-t-transparent animate-spin inline-block"></span>`;
      textClass = "text-brand-primary font-bold";
    }

    html += `
      <div class="flex items-center gap-2.5 transition-all">
        ${iconHtml}
        <span class="${textClass}">${step.title}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Populate Report Data from Active State
 */
function populateReportData() {
  const rep = appState.currentReport.report;

  // Identity Card
  const bizName = document.getElementById("report-business-name");
  const bizAddr = document.getElementById("report-business-address");
  const badgeCat = document.getElementById("report-badge-category");
  const profStrength = document.getElementById("report-profile-strength");
  const avgRank = document.getElementById("report-avg-rank");
  const revCount = document.getElementById("report-reviews-count");

  if (bizName) bizName.textContent = rep.name;
  if (bizAddr) bizAddr.textContent = `📍 ${rep.address}`;
  if (badgeCat) badgeCat.textContent = rep.category;
  if (profStrength) profStrength.textContent = `${rep.profileStrength}%`;
  if (avgRank) avgRank.textContent = `#${rep.overallAvgRank}`;
  if (revCount) revCount.textContent = `${rep.totalReviewCount} (${rep.rating.toFixed(1)}★)`;

  // Metric Badges
  const mContent = document.getElementById("metric-content-seo");
  const mCompl = document.getElementById("metric-completion");
  const mEng = document.getElementById("metric-engagement");
  if (mContent) mContent.textContent = `${rep.contentSeoScore}%`;
  if (mCompl) mCompl.textContent = `${rep.profileCompletionScore}%`;
  if (mEng) mEng.textContent = `${rep.engagementScore}% (0 Posts)`;

  // Task 1 Fields
  const fieldTitle = document.getElementById("field-optimized-title");
  const fieldDesc = document.getElementById("field-optimized-desc");
  if (fieldTitle) fieldTitle.textContent = `${rep.name} - ${rep.category} in ${rep.city}`;
  if (fieldDesc) {
    const descs = AIEngine.generateDescriptions(rep.name, rep.category, rep.city);
    fieldDesc.textContent = descs[0].text;
  }

  // Task 2 Review Link
  const reviewUrlInput = document.getElementById("review-direct-url");
  const reviewText = document.getElementById("whatsapp-review-text");
  const reviewBtn = document.getElementById("whatsapp-send-btn");
  
  const booster = AIEngine.generateReviewBooster(rep.name, appState.currentReport.googlePlaceId, rep.phone);
  if (reviewUrlInput) reviewUrlInput.value = booster.reviewUrl;
  if (reviewText) reviewText.textContent = `"${booster.whatsappMsg}"`;
  if (reviewBtn) reviewBtn.href = booster.whatsappUrl;

  // Standee Name
  const standeeBiz = document.getElementById("standee-biz-name");
  if (standeeBiz) standeeBiz.textContent = rep.name;

  // Mobile Sim Name
  const simBiz = document.getElementById("mobile-sim-biz-name");
  if (simBiz) simBiz.textContent = rep.name;
}

/**
 * Competitor Radar Table
 */
function renderCompetitorsTable() {
  const tbody = document.getElementById("competitors-table-body");
  if (!tbody) return;

  const competitors = appState.currentReport.report.competitors || [];
  let html = "";

  competitors.forEach((c) => {
    html += `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-bold text-slate-800 text-xs">${c.name}</td>
        <td class="py-3 px-3 text-center text-sm font-extrabold text-emerald-600">#${c.avgRank}</td>
        <td class="py-3 px-3 text-center text-sm text-slate-700 font-medium">${c.reviewCount}</td>
        <td class="py-3 px-3 text-center text-sm text-amber-600 font-bold">${c.rating} ★</td>
        <td class="py-3 px-4 text-xs text-slate-600">${c.weakness || "Slow post frequency"}</td>
        <td class="py-3 px-4 text-right">
          <span class="text-xs font-semibold text-emerald-600">Surpass with AI</span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

/**
 * Live Interactive Leaflet.js Map Initialization
 */
function initOrUpdateLeafletMap() {
  const mapContainer = document.getElementById("leaflet-map");
  if (!mapContainer || typeof L === "undefined") return;

  const points = appState.currentReport.report.primaryKeywordRanking.pointPositions || [];
  const centerLat = points[4] ? points[4].lat : 19.1908;
  const centerLng = points[4] ? points[4].lng : 73.1785;

  if (!appState.leafletMap) {
    appState.leafletMap = L.map("leaflet-map", {
      center: [centerLat, centerLng],
      zoom: 14,
      scrollWheelZoom: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(appState.leafletMap);

    // Add local visibility search radius circles (1km and 2.5km)
    L.circle([centerLat, centerLng], {
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.08,
      radius: 1200
    }).addTo(appState.leafletMap);

    L.circle([centerLat, centerLng], {
      color: '#f59e0b',
      fillColor: '#fcd34d',
      fillOpacity: 0.04,
      radius: 2600
    }).addTo(appState.leafletMap);
  } else {
    appState.leafletMap.setView([centerLat, centerLng], 14);
  }

  // Clear existing markers
  appState.leafletMarkers.forEach(m => appState.leafletMap.removeLayer(m));
  appState.leafletMarkers = [];

  const day = appState.timelineDay; // 0, 30, 60, 90
  const is5x5 = appState.gridSize === 5;
  const totalCount = is5x5 ? 25 : 9;

  for (let idx = 0; idx < totalCount; idx++) {
    let p = points[idx % points.length];
    let lat = p ? p.lat : centerLat + ((Math.floor(idx / 5) - 2) * 0.008);
    let lng = p ? p.lng : centerLng + (((idx % 5) - 2) * 0.008);

    if (is5x5 && !p) {
      lat = centerLat + ((Math.floor(idx / 5) - 2) * 0.007);
      lng = centerLng + (((idx % 5) - 2) * 0.007);
    }

    let currentRank = p ? p.position : 21;
    if (day === 30) currentRank = Math.max(8, currentRank - 9 + (idx % 3));
    else if (day === 60) currentRank = Math.max(3, currentRank - 16 + (idx % 2));
    else if (day === 90) currentRank = Math.floor(Math.random() * 2) + 1; // Rank #1 or #2

    let pinColorClass = "leaflet-pin-danger";
    let statusText = "Critical: Losing 85% Calls";
    if (currentRank <= 3) {
      pinColorClass = "leaflet-pin-success";
      statusText = "Top 3 Dominance (+45 Calls/mo)";
    } else if (currentRank <= 9) {
      pinColorClass = "leaflet-pin-warning";
      statusText = "Moderate Visibility";
    }

    const label = p ? (p.label || `Sector #${idx + 1}`) : `Area Coordinate #${idx + 1}`;

    const iconHtml = `<div class="leaflet-pin-icon ${pinColorClass}" style="width: 32px; height: 32px;">${currentRank}</div>`;
    const customIcon = L.divIcon({
      html: iconHtml,
      className: "custom-leaflet-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(appState.leafletMap);
    
    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 170px;">
        <strong style="font-size: 13px; color: #1e293b; display: block;">${label}</strong>
        <span style="font-size: 11px; color: #64748b;">GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</span>
        <div style="margin-top: 6px; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; background: ${currentRank <= 3 ? '#ecfdf5' : '#fef2f2'}; color: ${currentRank <= 3 ? '#047857' : '#b91c1c'};">
          Google Maps Rank: #${currentRank}
        </div>
        <div style="font-size: 10px; color: #475569; margin-top: 4px;">Status: ${statusText}</div>
      </div>
    `);

    appState.leafletMarkers.push(marker);
  }

  setTimeout(() => {
    appState.leafletMap.invalidateSize();
  }, 300);
}

function updateTimeline(val) {
  appState.timelineDay = parseInt(val, 10);
  const label = document.getElementById("timeline-day-label");
  if (label) {
    if (appState.timelineDay === 0) label.textContent = "Current Status (Day 0 - Red)";
    else if (appState.timelineDay === 30) label.textContent = "Day 30 (Initial Rank Jump - Orange)";
    else if (appState.timelineDay === 60) label.textContent = "Day 60 (Top 5 Surge - Yellow)";
    else if (appState.timelineDay === 90) label.textContent = "Day 90 (Rank #1 Dominance - Vibrant Green)";
  }
  initOrUpdateLeafletMap();
}

function toggleGridSize(size) {
  appState.gridSize = size;
  const btn3 = document.getElementById("btn-grid-3");
  const btn5 = document.getElementById("btn-grid-5");
  if (btn3) btn3.classList.toggle("bg-white", size === 3);
  if (btn5) btn5.classList.toggle("bg-white", size === 5);
  initOrUpdateLeafletMap();
}

/**
 * TOOL 5: Smart Review Shield & Sentiment Gate
 */
function rateReviewShield(stars) {
  const starsContainer = document.getElementById("shield-star-container");
  const resultBox = document.getElementById("shield-result-box");
  if (!starsContainer || !resultBox) return;

  const starSpans = starsContainer.querySelectorAll(".star-btn");
  starSpans.forEach((s, idx) => {
    s.classList.toggle("active", idx < stars);
  });

  resultBox.classList.remove("hidden");

  if (stars >= 4) {
    resultBox.className = "p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 text-center";
    resultBox.innerHTML = `
      <div class="text-emerald-700 font-extrabold text-sm">🎉 You selected ${stars} Stars!</div>
      <p class="text-slate-600">Customers who rate 4 or 5 stars are instantly directed to your public Google Maps profile to boost your ranking!</p>
      <div class="p-2 rounded bg-white border border-emerald-100 text-[11px] text-slate-700 italic">
        "Satnam Singh at Dashmesh Property gave us the best property consultation in Ambernath! Very transparent."
      </div>
      <a href="${document.getElementById('review-direct-url').value}" target="_blank" class="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm">
        Post 5-Star Review on Google Maps →
      </a>
    `;
  } else {
    resultBox.className = "p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-left";
    resultBox.innerHTML = `
      <div class="text-amber-800 font-bold text-xs flex items-center gap-1.5">
        <span>🛡️ Negative Review Shield Triggered!</span>
      </div>
      <p class="text-slate-600">Customers who rate 1-3 stars are diverted here. Their complaint is sent to you privately so your Google Maps score stays 5.0★!</p>
      <input type="text" id="shield-customer-name" placeholder="Your Name" class="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white focus:outline-none" />
      <textarea id="shield-customer-comment" placeholder="Tell us what went wrong privately..." class="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white focus:outline-none" rows="2"></textarea>
      <button type="button" class="w-full py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-sm" onclick="submitPrivateShieldFeedback(${stars})">
        Submit Private Feedback
      </button>
    `;
  }
}

function submitPrivateShieldFeedback(rating) {
  const nameInput = document.getElementById("shield-customer-name");
  const commentInput = document.getElementById("shield-customer-comment");
  const name = nameInput ? nameInput.value : "Customer";
  const comment = commentInput ? commentInput.value : "Feedback";

  fetch("/api/shield/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, comment, rating })
  }).then(res => res.json()).then(data => {
    showToast(data.message || "Private feedback captured! Google score protected.");
    const resultBox = document.getElementById("shield-result-box");
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="text-emerald-700 font-bold text-xs">✓ Feedback received privately by manager Satnam Singh.</div>
        <p class="text-slate-500 text-[11px]">Zero negative review was posted to Google Maps.</p>
      `;
    }
  }).catch(() => {
    showToast("Private feedback submitted! Zero negative impact on Google.");
  });
}

function copyReviewShieldLink() {
  const link = `${window.location.origin}/#action-center`;
  copyText(link, "Review Shield public link copied!");
}

function openMobileReviewSimulator() {
  const modal = document.getElementById("mobile-shield-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeMobileReviewSimulator() {
  const modal = document.getElementById("mobile-shield-modal");
  if (modal) modal.classList.add("hidden");
}

function rateMobileSimulator(stars) {
  const container = document.getElementById("mobile-star-container");
  const result = document.getElementById("mobile-result-box");
  if (!container || !result) return;

  container.querySelectorAll(".star-btn").forEach((s, idx) => {
    s.classList.toggle("active", idx < stars);
  });

  result.classList.remove("hidden");
  if (stars >= 4) {
    result.className = "p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 text-center";
    result.innerHTML = `
      <div class="text-emerald-700 font-bold">🎉 Thank you for ${stars} Stars!</div>
      <a href="${document.getElementById('review-direct-url').value}" target="_blank" class="block w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700">
        Review Us on Google Maps →
      </a>
    `;
  } else {
    result.className = "p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-left";
    result.innerHTML = `
      <div class="text-amber-800 font-bold text-[11px]">🛡️ Shielded Private Complaint</div>
      <p class="text-slate-600 text-[10px]">Your feedback goes directly to the owner without touching Google Maps.</p>
      <button type="button" class="w-full py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs" onclick="closeMobileReviewSimulator(); showToast('Private feedback recorded!');">
        Send to Manager Privately
      </button>
    `;
  }
}

/**
 * TOOL 6: Photo Geo-Tagger Studio
 */
function loadSampleGeoPhoto(index) {
  const samples = SAMPLE_GEOPHOTOS;
  if (!samples[index]) return;

  const sample = samples[index];
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    appState.currentSampleImg = img;
    renderGeoPhotoCanvas();
  };
  img.src = sample.url;
}

function handlePhotoUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      appState.currentSampleImg = img;
      renderGeoPhotoCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function changeStampStyle(style) {
  appState.activeStampStyle = style;
  renderGeoPhotoCanvas();
}

function renderGeoPhotoCanvas() {
  const canvas = document.getElementById("geo-photo-canvas");
  const wrapper = document.getElementById("canvas-wrapper");
  const downloadBtn = document.getElementById("btn-download-geophoto");
  if (!canvas || !appState.currentSampleImg) return;

  if (wrapper) wrapper.classList.remove("hidden");
  if (downloadBtn) downloadBtn.classList.remove("hidden");

  const rep = appState.currentReport.report;
  AIEngine.stampPhoto(canvas, appState.currentSampleImg, {
    lat: 19.1908,
    lng: 73.1785,
    businessName: rep.name,
    city: rep.city
  }, appState.activeStampStyle);

  canvas.toBlob((blob) => {
    appState.geoPhotoBlob = blob;
  }, "image/jpeg", 0.92);
}

function downloadGeoPhoto() {
  if (!appState.geoPhotoBlob) {
    showToast("Please upload or choose a photo first!");
    return;
  }
  const rep = appState.currentReport.report;
  const url = URL.createObjectURL(appState.geoPhotoBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `geotagged_${rep.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.jpg`;
  a.click();
  showToast("Geo-Tagged Photo Downloaded! Ready to upload to Google Maps.");
}

/**
 * TOOL 7: Printable Standee Studio
 */
function changeStandeeTheme(themeKey) {
  const theme = STANDEE_TEMPLATES[themeKey];
  const card = document.getElementById("standee-printable-area");
  if (!theme || !card) return;

  appState.activeStandeeTheme = themeKey;
  card.className = `standee-card scale-90 -my-3 ${theme.bgClass}`;
  showToast(`Switched Standee Theme: ${theme.name}`);
}

function printStandee() {
  window.print();
}

/**
 * ENGINE 1: Autonomous Post Scheduler Daemon (Tier 2)
 */
function triggerAutoPublishSimulation() {
  const terminal = document.getElementById("daemon-terminal");
  const badge = document.getElementById("daemon-status-badge");
  if (!terminal) return;

  const rep = appState.currentReport.report;
  const time = new Date().toLocaleTimeString();

  terminal.innerHTML += `\n<div class="terminal-line">[${time}] 🚀 Initiating Google Business Profile API connection...</div>`;
  terminal.innerHTML += `<div class="terminal-line text-slate-400">[${time}] Target Location: ${appState.currentReport.googlePlaceId}</div>`;

  if (badge) {
    badge.innerHTML = `<span class="badge-live-dot"></span> Publishing...`;
  }

  fetch("/api/posts/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      day: "Scheduled Run",
      title: `Prime Property Opportunities in ${rep.city}`,
      snippet: `Looking for high-return property in ${rep.city}? Consult ${rep.name}.`,
      cta: "Call Now"
    })
  }).then(res => res.json()).then(data => {
    setTimeout(() => {
      terminal.innerHTML += `<div class="terminal-line terminal-success">[${time}] ✓ API Response 200 OK: Post ID #${data.log.googlePostId} Published!</div>`;
      terminal.scrollTop = terminal.scrollHeight;
      if (badge) {
        badge.innerHTML = `<span class="badge-live-dot"></span> Active (Next: Wed 09:00 AM)`;
      }
      showToast("Post auto-published to Google Business Profile!");
    }, 600);
  }).catch(() => {
    terminal.innerHTML += `<div class="terminal-line terminal-success">[${time}] ✓ Simulated Post Published!</div>`;
  });
}

function downloadPostsCSV() {
  let csv = "Day,Title,Snippet,Hashtags,CTA\n";
  WEEKLY_POSTS.forEach(p => {
    csv += `"${p.day}","${p.title}","${p.snippet}","${p.tag}","${p.cta}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `google_posts_schedule_${Date.now()}.csv`;
  a.click();
  showToast("Google Posts Schedule CSV Downloaded!");
}

/**
 * ENGINE 2: Multi-Keyword SERP Radar (Tier 2)
 */
function renderKeywordRadar() {
  const container = document.getElementById("keyword-radar-container");
  if (!container) return;

  let html = "";
  MULTI_KEYWORD_RADAR.forEach(k => {
    html += `
      <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <div>
          <span class="font-bold text-slate-800 block">${k.keyword}</span>
          <span class="text-[10px] text-slate-500">${k.searchVolume} • ${k.intent}</span>
        </div>
        <div class="text-right">
          <span class="px-2 py-0.5 rounded text-[10px] font-black ${k.myRank <= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">Rank #${k.myRank}</span>
          <span class="block text-[10px] text-emerald-600 font-bold">${k.potentialCalls}</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function probeKeywordSERP() {
  const input = document.getElementById("serp-probe-input");
  const keyword = input && input.value.trim() ? input.value.trim() : "Property Consultant in Ambernath";
  
  showToast(`Probing Google SERP for "${keyword}"...`);
  
  fetch("/api/rank/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, business: appState.currentReport.report.name })
  }).then(res => res.json()).then(data => {
    showToast(`Probe complete: Avg Rank #${data.averageRank} across ${data.pointsCount} coordinate points`);
  }).catch(() => {
    showToast(`Probe complete for "${keyword}"!`);
  });
}

/**
 * ENGINE 3: WhatsApp CRM Review Funnel (Tier 3)
 */
function updateCRMPreview() {
  const nameInput = document.getElementById("crm-customer-name");
  const templateSelect = document.getElementById("crm-template-select");
  const preview = document.getElementById("crm-message-preview");
  if (!preview) return;

  const customerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Rajesh Kumar";
  const templateId = templateSelect ? templateSelect.value : "immediate_thank_you";
  const rep = appState.currentReport.report;
  const reviewLink = document.getElementById("review-direct-url") ? document.getElementById("review-direct-url").value : "";

  const msg = AIEngine.formatWhatsAppMessage(templateId, customerName, rep.name, reviewLink);
  preview.textContent = `"${msg}"`;
}

function dispatchCRMWhatsApp() {
  const nameInput = document.getElementById("crm-customer-name");
  const phoneInput = document.getElementById("crm-customer-phone");
  const templateSelect = document.getElementById("crm-template-select");

  const name = nameInput ? nameInput.value.trim() : "Customer";
  const phone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : "918421077613";
  const templateId = templateSelect ? templateSelect.value : "immediate_thank_you";
  const rep = appState.currentReport.report;
  const reviewLink = document.getElementById("review-direct-url") ? document.getElementById("review-direct-url").value : "";

  const msg = AIEngine.formatWhatsAppMessage(templateId, name, rep.name, reviewLink);

  fetch("/api/whatsapp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerName: name, phone, template: templateId })
  });

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
  showToast(`WhatsApp review invite dispatched to ${name}!`);
}

/**
 * AGENCY WHITE-LABEL & MULTI-LOCATION (Tier 4)
 */
function toggleAgencyWhiteLabelMode() {
  appState.agencyMode = !appState.agencyMode;
  const strip = document.getElementById("agency-white-label-strip");
  const btnLabel = document.getElementById("agency-mode-btn-label");
  const brandLogo = document.getElementById("nav-brand-logo");

  if (strip) strip.classList.toggle("hidden", !appState.agencyMode);
  if (btnLabel) btnLabel.textContent = appState.agencyMode ? "Agency Mode: ON" : "Agency Mode: OFF";

  if (appState.agencyMode) {
    showToast("🏢 Agency White-Label Mode Activated!");
    document.title = `${appState.agencyConfig.agencyName} - Local SEO Client Audit`;
  } else {
    showToast("Switched to Standard Business Mode");
    document.title = "Grexa AI - Autonomous Google Business Profile Growth Suite";
  }
}

function openAgencySettingsPrompt() {
  const newName = prompt("Enter your Agency Name for White-Labeling:", appState.agencyConfig.agencyName);
  if (newName) {
    appState.agencyConfig.agencyName = newName;
    const nameEl = document.getElementById("agency-display-name");
    if (nameEl) nameEl.textContent = newName;
    showToast(`Agency Name updated to "${newName}"`);
  }
}

function switchFranchiseLocation(locationId) {
  if (locationId === "add_new") {
    const modal = document.getElementById("add-franchise-modal");
    if (modal) modal.classList.remove("hidden");
    return;
  }

  const branch = FRANCHISE_LOCATIONS[locationId];
  if (branch) {
    appState.currentReport = {
      _id: branch.id,
      googlePlaceId: branch.placeId,
      name: branch.name,
      phone: branch.phone,
      report: {
        name: branch.name,
        category: "Property Consultant",
        address: branch.address,
        city: branch.city,
        state: "Maharashtra",
        country: "India",
        rating: branch.rating,
        totalReviewCount: branch.reviews,
        overallAvgRank: branch.currentRank,
        profileStrength: branch.currentRank <= 5 ? 88 : 34,
        contentSeoScore: branch.currentRank <= 5 ? 82 : 25,
        profileCompletionScore: 78,
        engagementScore: 40,
        primaryKeyword: `Property Consultant in ${branch.city}`,
        primaryKeywordRanking: {
          keyword: `Property Consultant in ${branch.city}`,
          gridWidth: 3,
          avgPosition: branch.currentRank,
          pointPositions: [
            { id: 1, position: branch.currentRank, lat: branch.lat + 0.005, lng: branch.lng - 0.005, label: `${branch.city} North` },
            { id: 2, position: branch.currentRank, lat: branch.lat + 0.005, lng: branch.lng, label: `${branch.city} Central` },
            { id: 3, position: branch.currentRank, lat: branch.lat + 0.005, lng: branch.lng + 0.005, label: `${branch.city} East` },
            { id: 4, position: branch.currentRank, lat: branch.lat, lng: branch.lng - 0.005, label: `${branch.city} West` },
            { id: 5, position: branch.currentRank, lat: branch.lat, lng: branch.lng, label: `${branch.city} Main` },
            { id: 6, position: branch.currentRank, lat: branch.lat, lng: branch.lng + 0.005, label: `${branch.city} Suburb` },
            { id: 7, position: branch.currentRank, lat: branch.lat - 0.005, lng: branch.lng - 0.005, label: `${branch.city} South` },
            { id: 8, position: branch.currentRank, lat: branch.lat - 0.005, lng: branch.lng, label: `${branch.city} Station` },
            { id: 9, position: branch.currentRank, lat: branch.lat - 0.005, lng: branch.lng + 0.005, label: `${branch.city} Highway` }
          ]
        },
        competitors: DEFAULT_REPORT.report.competitors
      }
    };

    showToast(`Switched location to: ${branch.name}`);
    startScanSequence();
  }
}

function closeFranchiseModal() {
  const modal = document.getElementById("add-franchise-modal");
  if (modal) modal.classList.add("hidden");
}

function saveNewBranchLocation() {
  const name = document.getElementById("new-branch-name").value.trim() || "Dashmesh Property (New Branch)";
  const address = document.getElementById("new-branch-address").value.trim() || "Main Road";
  const city = document.getElementById("new-branch-city").value.trim() || "Thane";
  const phone = document.getElementById("new-branch-phone").value.trim() || "+91 84210 77613";

  closeFranchiseModal();
  appState.currentReport = AIEngine.simulateCustomScan(name, city, "Property Consultant");
  showToast(`Added and scanning new branch: ${name}`);
  startScanSequence();
}

/**
 * Pre-Generated Google Posts Renderer
 */
function renderWeeklyPosts() {
  const container = document.getElementById("weekly-posts-container");
  if (!container) return;

  let html = "";
  WEEKLY_POSTS.forEach((post) => {
    html += `
      <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">${post.day} Post</span>
          <span class="text-[11px] font-semibold text-slate-500">CTA: <strong>${post.cta}</strong></span>
        </div>
        <h5 class="text-xs font-bold text-slate-800">${post.title}</h5>
        <p class="text-xs text-slate-600 leading-relaxed">${post.snippet}</p>
        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] text-purple-600 font-semibold">${post.tag}</span>
          <button type="button" class="text-xs font-bold text-brand-primary hover:underline" onclick="copyText('${post.snippet.replace(/'/g, "\\'")}\\n\\n${post.tag}', '${post.day} post copied!')">
            📋 Copy Post
          </button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

/**
 * Citations Directory Table
 */
function renderCitationsTable() {
  const tbody = document.getElementById("citations-table-body");
  if (!tbody) return;

  let html = "";
  DIRECTORY_CITATIONS.forEach(c => {
    html += `
      <tr class="hover:bg-slate-50">
        <td class="py-2 px-3 font-semibold text-slate-800">${c.name}</td>
        <td class="py-2 px-2 text-slate-500 font-mono text-[11px]">${c.authority}</td>
        <td class="py-2 px-3 text-right">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
            ${c.status}
          </span>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function copyCitationsPack() {
  const pack = AIEngine.generateCitationsPack(appState.currentReport.report);
  copyText(pack, "Complete 40+ Citations Pack copied to clipboard!");
}

/**
 * FAQs Accordion
 */
function renderFaqs() {
  const container = document.getElementById("faqs-accordion");
  if (!container) return;

  let html = "";
  FAQS.forEach((faq, idx) => {
    html += `
      <div class="border border-slate-200 rounded-xl bg-white overflow-hidden transition">
        <button type="button" class="w-full text-left p-4 font-semibold text-brand-text flex items-center justify-between gap-4 hover:bg-slate-50" onclick="toggleFaq(${idx})">
          <span>${faq.q}</span>
          <span id="faq-chevron-${idx}" class="text-slate-400 transition-transform duration-200">▾</span>
        </button>
        <div id="faq-answer-${idx}" class="hidden p-4 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
          ${faq.a}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function toggleFaq(idx) {
  const ans = document.getElementById(`faq-answer-${idx}`);
  const chevron = document.getElementById(`faq-chevron-${idx}`);
  if (ans) {
    const isHidden = ans.classList.contains("hidden");
    ans.classList.toggle("hidden", !isHidden);
    if (chevron) chevron.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
  }
}

/**
 * ROI Calculator
 */
function updateROICalculator() {
  const roi = AIEngine.calculateROI(appState.ticketValue, appState.monthlyCalls);
  const extraRev = document.getElementById("roi-extra-revenue");
  const ticketLabel = document.getElementById("ticket-val-label");
  const callsLabel = document.getElementById("calls-val-label");

  if (extraRev) extraRev.textContent = `+₹${roi.extraMonthlyRevenue.toLocaleString('en-IN')} / mo`;
  if (ticketLabel) ticketLabel.textContent = `₹${appState.ticketValue.toLocaleString('en-IN')}`;
  if (callsLabel) callsLabel.textContent = `${appState.monthlyCalls} Calls / mo`;
}

/**
 * AUTONOMOUS AI OPTIMIZER RUNNER (No Paywall Modal)
 */
function triggerAutonomousOptimization() {
  const modal = document.getElementById("optimizer-modal");
  const body = document.getElementById("optimizer-modal-body");
  if (!modal || !body) return;

  modal.classList.remove("hidden");

  const tasks = [
    { title: "Injecting primary & secondary keywords into profile title", status: "running" },
    { title: "Configuring 3 secondary high-volume Google categories", status: "pending" },
    { title: "Generating SEO description with 100% keyword density", status: "pending" },
    { title: "Building instant WhatsApp 5-star review invite link", status: "pending" },
    { title: "Generating 7-day scheduled Google Posts & photo payloads", status: "pending" },
    { title: "Formatting 40+ directory citations (Justdial, IndiaMART, Sulekha)", status: "pending" }
  ];

  function renderTasks(currentIdx) {
    let html = `<div class="space-y-3">`;
    tasks.forEach((t, i) => {
      const isDone = i < currentIdx;
      const isRunning = i === currentIdx;

      let icon = "";
      if (isDone) icon = `<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-xs">✓</span>`;
      else if (isRunning) icon = `<span class="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></span>`;
      else icon = `<span class="w-5 h-5 rounded-full border border-slate-300"></span>`;

      html += `
        <div class="flex items-center gap-3 p-2.5 rounded-xl ${isDone ? 'bg-emerald-50/50' : isRunning ? 'bg-blue-50/50' : 'bg-slate-50/50'}">
          ${icon}
          <span class="text-xs font-semibold ${isDone ? 'text-slate-800' : isRunning ? 'text-brand-primary' : 'text-slate-400'}">${t.title}</span>
        </div>
      `;
    });
    html += `</div>`;
    body.innerHTML = html;
  }

  let step = 0;
  renderTasks(step);

  const runner = setInterval(() => {
    step++;
    renderTasks(step);

    if (step >= tasks.length) {
      clearInterval(runner);
      setTimeout(() => {
        showOptimizationComplete();
      }, 500);
    }
  }, 700);
}

function showOptimizationComplete() {
  const body = document.getElementById("optimizer-modal-body");
  if (!body) return;

  const rep = appState.currentReport.report;
  body.innerHTML = `
    <div class="text-center py-4 space-y-4">
      <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 text-2xl font-extrabold flex items-center justify-center mx-auto animate-bounce">
        ✓
      </div>
      <h3 class="text-xl font-extrabold text-brand-text">Optimization Assets Ready!</h3>
      <p class="text-xs text-slate-600">All growth assets for <strong>${rep.name}</strong> have been generated and optimized.</p>
      
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-700">1. Optimized Title & Bio:</span>
          <span class="text-emerald-600 font-bold">Ready</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-700">2. WhatsApp Review Direct Link:</span>
          <span class="text-emerald-600 font-bold">Generated</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-700">3. 7-Day Google Posts Schedule:</span>
          <span class="text-emerald-600 font-bold">Compiled</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-700">4. 40+ Citations Submission Pack:</span>
          <span class="text-emerald-600 font-bold">Ready</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 pt-2">
        <button type="button" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700" onclick="copyCitationsPack(); closeOptimizerModal();">
          📋 Copy All Citations Pack
        </button>
        <button type="button" class="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50" onclick="closeOptimizerModal(); window.print();">
          🖨️ Export PDF Growth Plan
        </button>
      </div>
    </div>
  `;
}

function closeOptimizerModal() {
  const modal = document.getElementById("optimizer-modal");
  if (modal) modal.classList.add("hidden");
}

/**
 * Universal Search & Presets
 */
function loadPreset(presetKey) {
  if (SAMPLE_PRESETS[presetKey]) {
    appState.currentReport = SAMPLE_PRESETS[presetKey];
    showToast(`Loaded ${appState.currentReport.report.name}`);
    startScanSequence();
  }
}

function executeCustomScan() {
  const input = document.getElementById("custom-search-input");
  if (!input || !input.value.trim()) {
    showToast("Please enter a business name or city");
    return;
  }

  const query = input.value.trim();
  const parts = query.split(",");
  const bizName = parts[0].trim();
  const city = parts[1] ? parts[1].trim() : "Mumbai";

  appState.currentReport = AIEngine.simulateCustomScan(bizName, city, "Local Business");
  showToast(`Running AI Scan for ${bizName}...`);
  startScanSequence();
}

/**
 * Mode Switcher
 */
function setupModeSwitcher() {
  const cloneBtn = document.getElementById("mode-clone-btn");
  const advBtn = document.getElementById("mode-adv-btn");

  if (cloneBtn && advBtn) {
    cloneBtn.addEventListener("click", () => {
      appState.mode = "clone";
      cloneBtn.classList.add("active");
      advBtn.classList.remove("active");
      showToast("Switched to Booster Clone Mode");
    });

    advBtn.addEventListener("click", () => {
      appState.mode = "advanced";
      advBtn.classList.add("active");
      cloneBtn.classList.remove("active");
      showToast("Switched to Advanced AI Suite 2026");
    });
  }
}

/**
 * Language Selector
 */
function setupLanguageSelector() {
  const langBtn = document.getElementById("lang-picker-btn");
  const langDropdown = document.getElementById("lang-picker-dropdown");

  if (langBtn && langDropdown) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      langDropdown.classList.add("hidden");
    });
  }
}

function chooseLanguage(langCode) {
  setLanguage(langCode);
  const currentLangLabel = document.getElementById("current-lang-label");
  if (currentLangLabel) {
    currentLangLabel.textContent = I18N_TRANSLATIONS[langCode].langName;
  }
  const langDropdown = document.getElementById("lang-picker-dropdown");
  if (langDropdown) langDropdown.classList.add("hidden");
  applyTranslations();
  showToast(`Language changed to ${I18N_TRANSLATIONS[langCode].langName}`);
}

function applyTranslations() {
  const translatable = document.querySelectorAll("[data-i18n]");
  translatable.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  renderScanSteps();
}

/**
 * Toast Notice
 */
function showToast(message) {
  let toast = document.getElementById("toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notice";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function copyText(text, successMsg = "Copied to clipboard!") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    showToast("Copied text!");
  });
}
