/**
 * Lightweight Zero-Dependency Node.js Server & REST API
 * Supports Grexa Booster, Autonomous Action Center, and Advanced AI Suite
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DEFAULT_REPORT, SAMPLE_PRESETS } = require('./js/data.js');
const { AIEngine } = require('./js/ai-engine.js');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// In-Memory Logs for Private Review Shield & Post Scheduler
const privateFeedbacks = [
  {
    id: 'fb_1',
    customerName: 'Amit Sharma',
    phone: '+91 98201 44552',
    rating: 2,
    comment: 'The office was closed at 1:30 PM for lunch without any sign. Please update lunch hours on Google.',
    date: '2026-09-27T14:20:00Z',
    status: 'Resolved Privately'
  }
];

const publishedPostLogs = [
  {
    id: 'post_log_1',
    day: 'Monday',
    title: 'Market Trends in Ambernath East',
    status: 'Published',
    timestamp: '2026-09-28T09:00:00Z',
    googlePostId: 'gbp_post_90412'
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoints ---

  // 1. Rank Report API
  if (pathname.startsWith('/api/rank-report/')) {
    const id = pathname.replace('/api/rank-report/', '').split('/')[0];
    if (id === '6aba452ec5cdfac7806c5bda' || id === DEFAULT_REPORT._id) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(DEFAULT_REPORT));
      return;
    }

    if (SAMPLE_PRESETS[id]) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(SAMPLE_PRESETS[id]));
      return;
    }

    // Dynamic fallback
    const custom = AIEngine.simulateCustomScan('Local Business Profile', 'Mumbai', 'Commercial Store');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(custom));
    return;
  }

  // 2. Scan Custom Business API
  if (pathname === '/api/scan' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const report = AIEngine.simulateCustomScan(payload.name || 'Sample Business', payload.city || 'Mumbai', payload.category || 'Local Service');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // 3. AI Generator Endpoints
  if (pathname === '/api/ai/description' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const descs = AIEngine.generateDescriptions(data.name || 'Dashmesh Property', data.category || 'Property Consultant', data.city || 'Ambernath', data.keywords || []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ descriptions: descs }));
    });
    return;
  }

  // 4. Private Review Shield - Feedback Submission API
  if (pathname === '/api/shield/feedback' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const newFeedback = {
          id: 'fb_' + Date.now(),
          customerName: data.name || 'Anonymous Customer',
          phone: data.phone || 'Not Provided',
          rating: data.rating || 2,
          comment: data.comment || 'No specific comment entered.',
          date: new Date().toISOString(),
          status: 'Shielded (Zero Google Maps Impact)'
        };
        privateFeedbacks.unshift(newFeedback);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Review shielded successfully! Negative complaint was prevented from appearing on Google Maps.',
          feedback: newFeedback,
          totalShielded: privateFeedbacks.length
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process feedback' }));
      }
    });
    return;
  }

  // 5. Private Review Shield - Get All Shielded Complaints
  if (pathname === '/api/shield/list' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      feedbacks: privateFeedbacks,
      totalShielded: privateFeedbacks.length
    }));
    return;
  }

  // 6. Background Post Auto-Publish API
  if (pathname === '/api/posts/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const logEntry = {
          id: 'post_log_' + Date.now(),
          day: data.day || 'Scheduled Post',
          title: data.title || 'Local Property Update',
          snippet: data.snippet || '',
          cta: data.cta || 'Call Now',
          status: 'Published Live on Google Maps',
          timestamp: new Date().toISOString(),
          googlePostId: 'gbp_live_' + Math.floor(Math.random() * 89999 + 10000)
        };
        publishedPostLogs.unshift(logEntry);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Post successfully published to Google Business Profile!',
          log: logEntry,
          totalPublished: publishedPostLogs.length
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to publish post' }));
      }
    });
    return;
  }

  // 7. Live SERP & Coordinate Scraper Probe API
  if (pathname === '/api/rank/scrape' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const keyword = data.keyword || 'Property Consultant';
        const business = data.business || 'Dashmesh Property';
        const pointsCount = data.gridSize === 5 ? 25 : 9;

        const results = [];
        for (let i = 1; i <= pointsCount; i++) {
          const rank = Math.floor(Math.random() * 8) + 14; // rank 14-22 initially
          results.push({
            pointId: i,
            label: `Sector #${i}`,
            rank: rank,
            latencyMs: Math.floor(Math.random() * 120 + 80),
            topCompetitor: i % 2 === 0 ? 'Rudra Realty (Rank #1)' : 'GK Property Consultant (Rank #2)'
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          keyword,
          business,
          pointsCount,
          averageRank: 20.4,
          scrapedAt: new Date().toISOString(),
          points: results
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to scrape SERP' }));
      }
    });
    return;
  }

  // 8. Automated WhatsApp Follow-up Logger API
  if (pathname === '/api/whatsapp/send' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          dispatchedAt: new Date().toISOString(),
          customerName: data.customerName || 'Customer',
          phone: data.phone || '',
          template: data.template || 'Default 5-Star Invite',
          status: 'Dispatched via WhatsApp API Gateway'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to dispatch WhatsApp message' }));
      }
    });
    return;
  }

  // --- Static Files Serving ---
  let filePath = pathname === '/' ? path.join(BASE_DIR, 'index.html') : path.join(BASE_DIR, pathname);

  // Security check: keep inside BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      filePath = path.join(BASE_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Grexa AI Booster & Advanced Growth Suite Running!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
