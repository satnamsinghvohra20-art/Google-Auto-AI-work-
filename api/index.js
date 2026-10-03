const server = require('../server.js');
const handleWhatsAppWebhook = require('./whatsapp/webhook.js');

module.exports = async (req, res) => {
  const urlStr = req.url || '';
  const matchedPath = req.headers['x-matched-path'] || '';
  const vercelPath = req.headers['x-vercel-matched-path'] || '';

  const isWhatsApp = 
    urlStr.includes('/api/whatsapp/webhook') ||
    urlStr.includes('hub.challenge') ||
    urlStr.includes('hub.mode') ||
    matchedPath.includes('whatsapp') ||
    vercelPath.includes('whatsapp');

  if (isWhatsApp) {
    console.log('[api/index.js] Routing directly to WhatsApp Webhook handler');
    return handleWhatsAppWebhook(req, res);
  }

  // Otherwise delegate to standard server
  server.emit('request', req, res);
};
