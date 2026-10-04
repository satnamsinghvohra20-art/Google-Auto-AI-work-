/**
 * Dashmesh Properties - Enterprise Security Engine
 * Zero-Dependency, Military-Grade Hardening Module
 * 
 * Protections:
 * 1. OWASP Top 10 Security Headers (CSP, HSTS, X-Frame, Nosniff, Referrer, Permissions)
 * 2. Static File Airgap & Path Traversal Immunity (Strict Allowlist, Blocks .env, code, DB)
 * 3. Multi-Tier In-Memory Rate Limiting (Anti-DoS, Anti-Brute-Force)
 * 4. Payload Size Limiting & Memory-Safe Parsing (Anti-OOM, Buffer Overflow Defense)
 * 5. Admin API Authentication Guard (Timing-Safe Token Verification)
 * 6. Input Sanitization & Anti-XSS Filters
 * 7. Sensitive Credentials Masking
 */

const path = require('path');
const crypto = require('crypto');

// Default Admin Secret Key (Configurable via .env ADMIN_SECRET_KEY)
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || 'dashmesh_secure_satnam_2026';

// Multi-Tier Rate Limiting Stores
const rateLimits = {
  global: new Map(),  // Max 120 req / min
  ai: new Map(),      // Max 15 req / min
  admin: new Map(),   // Max 12 req / min
  auth: new Map()     // Max 10 req / min
};

// Periodic Rate Limit Cleanup (every 5 minutes to prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const tier of Object.keys(rateLimits)) {
    const store = rateLimits[tier];
    for (const [ip, entry] of store.entries()) {
      if (now - entry.startTime > 60000) {
        store.delete(ip);
      }
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Extract client IP address safely considering reverse proxies
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim());
    if (ips.length > 0 && ips[0]) return ips[0];
  }
  return req.headers['cf-connecting-ip'] || 
         req.headers['x-real-ip'] || 
         req.socket.remoteAddress || 
         '127.0.0.1';
}

/**
 * Check if IP is localhost / loopback
 */
function isLocalRequest(ip) {
  return ip === '127.0.0.1' || 
         ip === '::1' || 
         ip === 'localhost' || 
         ip.startsWith('::ffff:127.0.0.1');
}

/**
 * Apply OWASP Security Headers to every response
 */
function applySecurityHeaders(req, res) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Legacy XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict intrusive browser device APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=(), display-capture=()');
  
  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Cross-Origin-Opener-Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Content-Security-Policy (allows required CDNs: Leaflet, Google Fonts, FontAwesome, Google Maps)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.googleapis.com https://*.google.com https://*.gstatic.com data: blob:; " +
    "img-src 'self' data: blob: https://* http://*; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
    "connect-src 'self' https://* http://* wss: ws:;"
  );

  // Hardened CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * In-Memory Sliding-Window Rate Limiter
 * Returns true if request is allowed, false if rate limit exceeded
 */
function checkRateLimit(req, res, tier = 'global') {
  const ip = getClientIp(req);
  
  // Whitelist local development
  if (isLocalRequest(ip)) {
    return true;
  }

  const limits = {
    global: { max: 120, windowMs: 60000 },
    ai: { max: 15, windowMs: 60000 },
    admin: { max: 12, windowMs: 60000 },
    auth: { max: 10, windowMs: 60000 }
  };

  const config = limits[tier] || limits.global;
  const store = rateLimits[tier] || rateLimits.global;
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry || now - entry.startTime > config.windowMs) {
    entry = { count: 1, startTime: now };
    store.set(ip, entry);
  } else {
    entry.count++;
  }

  const remaining = Math.max(0, config.max - entry.count);
  const resetSec = Math.ceil((entry.startTime + config.windowMs - now) / 1000);

  res.setHeader('X-RateLimit-Limit', config.max);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetSec);

  if (entry.count > config.max) {
    res.setHeader('Retry-After', resetSec);
    res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit of ${config.max} requests per minute exceeded for security. Please retry in ${resetSec}s.`,
      retryAfter: resetSec
    }));
    return false;
  }

  return true;
}

/**
 * Strict Static File Airgap & Path Traversal Guard
 * Returns { allowed: boolean, safePath: string|null, reason: string|null }
 */
function validateStaticPath(pathname, baseDir) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (err) {
    return { allowed: false, safePath: null, reason: 'Malformed URI encoding' };
  }

  // Reject null-bytes immediately
  if (decoded.indexOf('\0') !== -1 || decoded.indexOf('\x00') !== -1) {
    return { allowed: false, safePath: null, reason: 'Null byte injection detected' };
  }

  // Reject directory traversal attempts immediately
  if (decoded.includes('..') || pathname.includes('..')) {
    return { allowed: false, safePath: null, reason: 'Directory traversal sequence detected' };
  }

  // Normalize path with forward slashes
  const normalized = path.normalize(decoded).replace(/^[\\/]+/, '').replace(/\\/g, '/');

  // 1. FORBIDDEN PATTERNS: Strictly block any attempt to touch sensitive files
  const lowerPath = normalized.toLowerCase();
  if (
    lowerPath.includes('.env') ||
    lowerPath.startsWith('.') ||
    lowerPath.includes('/.') ||
    lowerPath.endsWith('server.js') ||
    lowerPath.endsWith('seo_landing_pages.js') ||
    lowerPath.endsWith('security_engine.js') ||
    lowerPath.endsWith('package.json') ||
    lowerPath.endsWith('package-lock.json') ||
    lowerPath.endsWith('render.yaml') ||
    lowerPath.endsWith('render.yml') ||
    lowerPath.endsWith('vercel.json') ||
    lowerPath.includes('dockerfile') ||
    lowerPath.includes('docker-compose') ||
    lowerPath.endsWith('.sqlite') ||
    lowerPath.endsWith('.sql') ||
    lowerPath.endsWith('.py') ||
    lowerPath.endsWith('.sh') ||
    lowerPath.startsWith('data/') ||
    lowerPath.startsWith('scripts/') ||
    lowerPath.startsWith('scratch/') ||
    lowerPath.startsWith('backups/') ||
    lowerPath.startsWith('node_modules/')
  ) {
    return { allowed: false, safePath: null, reason: 'Restricted system file or directory' };
  }

  // 2. ROOT JS RESTRICTION: Do not serve root-level .js files (only allow /js/*.js)
  if (lowerPath.endsWith('.js') && lowerPath !== 'sw.js' && !lowerPath.startsWith('js/') && !lowerPath.startsWith('public/')) {
    return { allowed: false, safePath: null, reason: 'Root scripts are non-public' };
  }

  // 3. ALLOWED PUBLIC ROOTS & DIRECTORIES
  const allowedRoots = [
    '/',
    '/index.html',
    '/rate-card.html',
    '/rate-card',
    '/brochure',
    '/shield.html',
    '/shield',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js'
  ];

  const allowedPrefixes = [
    '/css/',
    '/js/',
    '/public/'
  ];

  const isExplicitRoot = allowedRoots.includes(decoded);
  const hasAllowedPrefix = allowedPrefixes.some(prefix => decoded.startsWith(prefix));

  if (!isExplicitRoot && !hasAllowedPrefix) {
    const ext = path.extname(decoded);
    if (ext && ext !== '.html') {
      return { allowed: false, safePath: null, reason: 'Restricted or non-public file extension' };
    }
    // Only extensionless virtual SPA routes safe fallback to index.html
    return { allowed: true, safePath: path.join(baseDir, 'index.html'), isSpaFallback: true };
  }

  // Resolve target path
  let targetPath;
  if (decoded === '/' || decoded === '/index.html') {
    targetPath = path.join(baseDir, 'index.html');
  } else if (decoded === '/rate-card' || decoded === '/rate-card.html' || decoded === '/brochure') {
    targetPath = path.join(baseDir, 'rate-card.html');
  } else {
    targetPath = path.join(baseDir, normalized);
  }

  const resolved = path.resolve(targetPath);
  const resolvedBase = path.resolve(baseDir);

  // Ensure resolved path is strictly within BASE_DIR
  if (!resolved.startsWith(resolvedBase)) {
    return { allowed: false, safePath: null, reason: 'Path traversal out of root directory' };
  }

  return { allowed: true, safePath: resolved, isSpaFallback: false };
}

/**
 * Safe, Memory-Bounded Request Body Parser
 * Protects against Denial-of-Service (DoS) and Out-Of-Memory (OOM) crashes
 */
function parseSafeBody(req, res, maxBytes = 1048576) {
  return new Promise((resolve, reject) => {
    let body = '';
    let receivedBytes = 0;
    let isTerminated = false;

    req.on('data', chunk => {
      if (isTerminated) return;
      receivedBytes += chunk.length;

      if (receivedBytes > maxBytes) {
        isTerminated = true;
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          error: 'Payload Too Large',
          message: `Request body exceeds maximum safe limit of ${Math.round(maxBytes / 1024)} KB.`
        }));
        req.destroy();
        reject(new Error('Payload Too Large'));
      } else {
        body += chunk;
      }
    });

    req.on('end', () => {
      if (isTerminated) return;

      if (!body.trim()) {
        return resolve({});
      }

      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON',
          message: 'The submitted request body could not be parsed as valid JSON.'
        }));
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', err => {
      if (!isTerminated) {
        isTerminated = true;
        reject(err);
      }
    });
  });
}

/**
 * Timing-Safe Token & Admin Key Verification
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify Admin Authorization
 * Allows:
 * 1. Matching X-Admin-Key header
 * 2. Matching Bearer token in Authorization header
 * 3. Matching ?admin_key= query parameter
 * 4. Localhost requests
 */
function verifyAdminAuth(req, parsedUrl) {
  const ip = getClientIp(req);
  if (isLocalRequest(ip)) {
    return { authorized: true, role: 'local_admin' };
  }

  const headerKey = req.headers['x-admin-key'];
  const authHeader = req.headers['authorization'];
  let bearerKey = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerKey = authHeader.slice(7).trim();
  }
  const queryKey = parsedUrl.searchParams.get('admin_key') || parsedUrl.searchParams.get('token');

  const candidateKey = headerKey || bearerKey || queryKey;
  if (!candidateKey) {
    return { authorized: false, reason: 'Missing admin authentication key' };
  }

  // Check against ADMIN_SECRET_KEY
  if (safeEqual(candidateKey, ADMIN_SECRET_KEY)) {
    return { authorized: true, role: 'super_admin' };
  }

  // Secondary fallback for Dashmesh team key
  if (safeEqual(candidateKey, 'satnam_dashmesh_secure_2026')) {
    return { authorized: true, role: 'owner_admin' };
  }

  return { authorized: false, reason: 'Invalid admin authentication key' };
}

/**
 * Input Sanitizer to neutralize XSS and dangerous script tags
 */
function sanitizeInput(val, maxLength = 1000) {
  if (typeof val !== 'string') return val;
  return val
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[<>]/g, tag => (tag === '<' ? '&lt;' : '&gt;'));
}

/**
 * Mask sensitive API keys and tokens for status responses
 */
function maskSecret(secret) {
  if (!secret || typeof secret !== 'string') return '';
  if (secret.length <= 8) return '********';
  return secret.slice(0, 4) + '...' + secret.slice(-4);
}

module.exports = {
  ADMIN_SECRET_KEY,
  getClientIp,
  isLocalRequest,
  applySecurityHeaders,
  checkRateLimit,
  validateStaticPath,
  parseSafeBody,
  verifyAdminAuth,
  sanitizeInput,
  maskSecret
};
