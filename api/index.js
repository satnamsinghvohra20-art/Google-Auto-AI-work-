/**
 * ============================================================================
 * Dashmesh Properties — Serverless Entrypoint & Edge API Gateway
 * Unified delegation to server.js
 * ============================================================================
 */

'use strict';

let server;
try {
  server = require('../server.js');
} catch (e) {
  console.warn('[API/Index] Server require error:', e.message);
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Normalize path if running under Vercel rewrite
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath && req.url !== matchedPath) {
    req.url = matchedPath;
  }

  // Delegate all requests to unified server.js engine
  if (server) {
    return server.emit('request', req, res);
  }

  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Server handler not initialized' }));
};

module.exports.config = { api: { bodyParser: false } };
