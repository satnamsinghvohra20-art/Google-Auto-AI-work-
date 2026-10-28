const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');
const security = require('../security_engine');
const omnichannel = require('../omnichannel_engine');

test('Meta webhook signature requires the configured app secret and exact body', () => {
  const body = Buffer.from('{"entry":[]}');
  const secret = 'in-memory-test-secret';
  const signature = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;

  assert.equal(security.verifyMetaWebhookSignature(body, signature, secret), true);
  assert.equal(security.verifyMetaWebhookSignature(body, signature, 'wrong-secret'), false);
  assert.equal(security.verifyMetaWebhookSignature(Buffer.from('{}'), signature, secret), false);
  assert.equal(security.verifyMetaWebhookSignature(body, 'invalid', secret), false);
  assert.equal(security.verifyMetaWebhookSignature(body, signature, ''), false);
});

test('admin verification reads the configured secret at request time', () => {
  const previousSecret = process.env.ADMIN_SECRET_KEY;
  const previousAdminKey = process.env.ADMIN_KEY;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.ADMIN_SECRET_KEY = 'in-memory-admin-secret';
  process.env.NODE_ENV = 'production';
  delete process.env.ADMIN_KEY;

  const req = {
    socket: { remoteAddress: '127.0.0.1' },
    headers: {}
  };
  const parsedUrl = new URL('https://example.invalid/api/leads');

  try {
    assert.equal(security.verifyAdminAuth(req, parsedUrl).authorized, false);
    assert.equal(security.verifyAdminAuth({
      socket: { remoteAddress: '203.0.113.10' },
      headers: {}
    }, new URL('https://example.invalid/api/leads?admin_key=in-memory-admin-secret')).authorized, false);
    req.socket.remoteAddress = '203.0.113.10';
    req.headers['x-admin-key'] = process.env.ADMIN_SECRET_KEY;
    assert.equal(security.verifyAdminAuth(req, parsedUrl).authorized, true);
    delete req.headers['x-admin-key'];
    delete process.env.ADMIN_SECRET_KEY;
    assert.equal(security.verifyAdminAuth(req, parsedUrl).authorized, false);
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET_KEY;
    else process.env.ADMIN_SECRET_KEY = previousSecret;
    if (previousAdminKey === undefined) delete process.env.ADMIN_KEY;
    else process.env.ADMIN_KEY = previousAdminKey;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test('omni-publish does not claim success when real account credentials are missing', async () => {
  const keys = [
    'GOOGLE_ACCESS_TOKEN', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_BUSINESS_ACCOUNT_ID', 'GOOGLE_LOCATION_ID', 'FACEBOOK_PAGE_ID',
    'FACEBOOK_PAGE_ACCESS_TOKEN', 'META_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID',
    'INSTAGRAM_ACCESS_TOKEN', 'LINKEDIN_ORGANIZATION_ID', 'LINKEDIN_ACCESS_TOKEN'
  ];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];

  try {
    const report = await omnichannel.omniPublish({
      title: 'User supplied title',
      content: 'User supplied content',
      platforms: ['google', 'facebook', 'instagram', 'linkedin']
    });
    assert.equal(report.success, false);
    assert.equal(report.totalSuccess, 0);
    assert.equal(report.totalTargeted, 4);
    assert.ok(Object.values(report.platformReports).every(platform => platform.success === false));
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test('omni-publish requires post content rather than generating placeholder copy', async () => {
  await assert.rejects(() => omnichannel.omniPublish({ platforms: ['facebook'] }), /genuine post title and content/);
});

test('connection checks report missing accounts without making provider requests', async () => {
  const keys = [
    'GOOGLE_ACCESS_TOKEN', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_BUSINESS_ACCOUNT_ID', 'GOOGLE_LOCATION_ID', 'FACEBOOK_PAGE_ID',
    'FACEBOOK_PAGE_ACCESS_TOKEN', 'META_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID',
    'INSTAGRAM_ACCESS_TOKEN', 'LINKEDIN_ORGANIZATION_ID', 'LINKEDIN_ACCESS_TOKEN'
  ];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];

  try {
    const reports = await omnichannel.testConnections();
    assert.deepEqual(Object.keys(reports).sort(), ['facebook', 'google', 'instagram', 'linkedin']);
    assert.ok(Object.values(reports).every(report => report.configured === false && report.connected === false));
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});