/**
 * Omnichannel Social Media & SEO Keyword Guardian Engine
 * Unified Cross-Posting for Google Business Profile, Facebook, Instagram & LinkedIn
 * Dashmesh Properties (Satnam Singh Vohra, Pale Gaon, Ambernath East)
 */

const https = require('https');

// Master Local SEO Keyword Matrix for Ambernath East & Pale Gaon
const SEO_KEYWORD_MATRIX = [
  { keyword: 'Property Dealer in Pale Gaon Ambernath East', intent: 'Buy/Sell' },
  { keyword: 'Registered Rent Agreement Ambernath East ₹1,750', intent: 'Legal/Lease' },
  { keyword: 'Doorstep Biometric Rent Agreement Ambernath', intent: 'Service' },
  { keyword: 'Ready 1 BHK Flat in Pale Gaon under 25 Lakhs', intent: 'Purchase' },
  { keyword: '2 BHK Luxury Flat in Pale Gaon Ambernath', intent: 'Purchase' },
  { keyword: 'Commercial Shop for Sale Pale Gaon Anand Nagar', intent: 'Commercial' },
  { keyword: 'Real Estate Consultant Shop 24 New Floora Pale Gaon', intent: 'Direct Storefront' }
];

const SEO_HASHTAGS = [
  '#DashmeshProperties',
  '#AmbernathRealEstate',
  '#PaleGaon',
  '#RentAgreementAmbernath',
  '#AmbernathFlats',
  '#AmbernathEast',
  '#1BHKFlat',
  '#2BHKFlat',
  '#DoorstepBiometric',
  '#SatnamSinghVohra'
];

const credentialOverrides = {};

// Credentials entered in the dashboard are held only for this process lifetime.
function loadCredentials() {
  const credentials = {
    google: {
      accountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID || '',
      locationId: process.env.GOOGLE_LOCATION_ID || '',
      placeId: process.env.GOOGLE_PLACE_ID || '',
      businessName: process.env.GOOGLE_BUSINESS_NAME || '',
      accessToken: process.env.GOOGLE_ACCESS_TOKEN || '',
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || ''
    },
    facebook: {
      pageId: process.env.FACEBOOK_PAGE_ID || '',
      pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || ''
    },
    instagram: {
      accountId: process.env.INSTAGRAM_ACCOUNT_ID || '',
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || ''
    },
    linkedin: {
      organizationId: process.env.LINKEDIN_ORGANIZATION_ID || '',
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || ''
    }
  };

  for (const platform of Object.keys(credentialOverrides)) {
    Object.assign(credentials[platform], credentialOverrides[platform]);
  }

  credentials.google.hasToken = Boolean((credentials.google.accessToken || (credentials.google.clientId && credentials.google.clientSecret && credentials.google.refreshToken)) && credentials.google.accountId && credentials.google.locationId);
  credentials.facebook.hasToken = Boolean(credentials.facebook.pageAccessToken && credentials.facebook.pageId);
  credentials.instagram.hasToken = Boolean(credentials.instagram.accessToken && credentials.instagram.accountId);
  credentials.linkedin.hasToken = Boolean(credentials.linkedin.accessToken && credentials.linkedin.organizationId);
  return credentials;
}

// Do not write social tokens to JSON, logs, or deployment data files.
function saveCredentials(updates) {
  const allowedFields = {
    google: ['accountId', 'locationId', 'accessToken'],
    facebook: ['pageId', 'pageAccessToken'],
    instagram: ['accountId', 'accessToken'],
    linkedin: ['organizationId', 'accessToken']
  };

  for (const [platform, fields] of Object.entries(allowedFields)) {
    if (!updates[platform] || typeof updates[platform] !== 'object') continue;
    credentialOverrides[platform] ||= {};
    for (const field of fields) {
      const value = updates[platform][field];
      if (typeof value === 'string' && value.trim()) credentialOverrides[platform][field] = value.trim();
    }
  }
  return getConnectionStatus();
}

function getConnectionStatus() {
  const creds = loadCredentials();
  return Object.fromEntries(Object.keys(creds).map(platform => [platform, {
    configured: creds[platform].hasToken,
    accountId: creds[platform].pageId || creds[platform].accountId || creds[platform].organizationId || '',
    accountName: creds[platform].businessName || ''
  }]));
}

// Optimize Content with Google SEO Keywords & Hashtags
function optimizeContentForSEO(rawTitle, rawBody) {
  let enrichedTitle = rawTitle.trim();
  let enrichedBody = rawBody.trim();

  // If title lacks local anchor, inject high-performing local anchor
  if (!/Pale Gaon|Ambernath/i.test(enrichedTitle)) {
    enrichedTitle += ' | Pale Gaon, Ambernath (East)';
  }

  // Inject verified Local Office & Principal Contact info if missing
  const officeSignoff = '\n\n📍 Dashmesh Properties: Shop No. 24, New Floora, Pale Gaon, Ambernath (E) - 421501\n📞 Satnam Sir: +91 84210 77613 | Open All 7 Days (10 AM - 9 PM)';
  if (!enrichedBody.includes('84210 77613')) {
    enrichedBody += officeSignoff;
  }

  // Inject top trending SEO Hashtags if missing
  if (!enrichedBody.includes('#')) {
    enrichedBody += '\n\n' + SEO_HASHTAGS.slice(0, 6).join(' ');
  }
  const normalizedContent = `${enrichedTitle}\n${enrichedBody}`.toLocaleLowerCase();
  const keywordsMatched = SEO_KEYWORD_MATRIX
    .filter(item => normalizedContent.includes(item.keyword.toLocaleLowerCase()))
    .map(item => item.keyword);

  return {
    title: enrichedTitle,
    content: enrichedBody,
    keywordsMatched,
    hashtags: SEO_HASHTAGS.slice(0, 6)
  };
}

// Helper: HTTP Request Promise
function makeHttpsRequest(url, options, bodyData) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });
    req.setTimeout(15000, () => req.destroy(new Error('Social API request timed out.')));
    req.on('error', reject);
    if (bodyData) req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    req.end();
  });
}

async function getGoogleAccessToken(creds) {
  const { clientId, clientSecret, refreshToken } = creds.google;
  if (!clientId || !clientSecret || !refreshToken) return creds.google.accessToken || null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  }).toString();
  const response = await makeHttpsRequest('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, body);
  if (response.status >= 200 && response.status < 300 && response.data?.access_token) {
    process.env.GOOGLE_ACCESS_TOKEN = response.data.access_token;
    return response.data.access_token;
  }
  throw new Error(response.data?.error_description || 'Google OAuth token refresh failed.');
}

// Publish to Google Business Profile (GBP)
async function publishToGoogle(postData, creds) {
  try {
    const { accountId, locationId } = creds.google;
    const token = await getGoogleAccessToken(creds);
    if (!token || !accountId || !locationId) {
      return { success: false, configured: false, platform: 'google', error: 'Google Business Profile credentials are incomplete.' };
    }
    {
      // Real GBP API Call
      const endpoint = `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(locationId)}/localPosts`;
      const actionTypes = { CALL_NOW: 'CALL', WHATSAPP: 'LEARN_MORE', BOOK_VISIT: 'BOOK', VIEW_RATE_CARD: 'LEARN_MORE' };
      const payload = {
        languageCode: 'en-US',
        summary: `${postData.title}\n\n${postData.content}`,
        callToAction: {
          actionType: actionTypes[postData.cta] || postData.cta || 'CALL',
          url: postData.ctaUrl || 'https://maps.app.goo.gl/kba8E8rqdRiv6xL8A'
        }
      };
      const res = await makeHttpsRequest(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, payload);
      if (res.status >= 200 && res.status < 300 && res.data && res.data.name) {
        return { success: true, platform: 'google', id: res.data.name, live: true, message: 'Published on Google Business Profile.' };
      }
      return { success: false, platform: 'google', error: res.data?.error?.message || `Google API returned HTTP ${res.status}.` };
    }
  } catch (err) {
    return { success: false, platform: 'google', error: err.message };
  }
}

// Publish to Facebook Page
async function publishToFacebook(postData, creds) {
  try {
    const { pageAccessToken: token, pageId } = creds.facebook;
    if (!token || !pageId) {
      return { success: false, configured: false, platform: 'facebook', error: 'Facebook Page credentials are incomplete. Please configure FACEBOOK_PAGE_ID and Page Access Token.' };
    }

    const endpoint = `https://graph.facebook.com/v20.0/${encodeURIComponent(pageId)}/feed`;
    const params = new URLSearchParams({ message: `${postData.title}\n\n${postData.content}` });
    if (postData.ctaUrl) params.append('link', postData.ctaUrl);
    const res = await makeHttpsRequest(`${endpoint}?${params.toString()}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status >= 200 && res.status < 300 && res.data?.id) {
      return { success: true, platform: 'facebook', id: res.data.id, live: true, liveUrl: `https://www.facebook.com/${res.data.id}` };
    }
    return { success: false, platform: 'facebook', error: res.data?.error?.message || `Facebook API returned HTTP ${res.status}.` };
  } catch (err) {
    return { success: false, platform: 'facebook', error: err.message };
  }
}

// Publish to Instagram Business
async function publishToInstagram(postData, creds) {
  try {
    const { accessToken: token, accountId: igId } = creds.instagram;
    if (!token || !igId) {
      return { success: false, configured: false, platform: 'instagram', error: 'Instagram Business credentials are incomplete. Please configure INSTAGRAM_ACCOUNT_ID and Access Token.' };
    }
    if (!postData.imageUrl || !/^https:\/\//i.test(postData.imageUrl)) {
      return { success: false, configured: true, platform: 'instagram', error: 'Instagram image posts require a public HTTPS image URL.' };
    }

    const baseUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(igId)}`;
    const containerParams = new URLSearchParams({
      caption: `${postData.title}\n\n${postData.content}`,
      image_url: postData.imageUrl
    });
    const auth = { method: 'POST', headers: { Authorization: `Bearer ${token}` } };
    const container = await makeHttpsRequest(`${baseUrl}/media?${containerParams.toString()}`, auth);
    if (container.status < 200 || container.status >= 300 || !container.data?.id) {
      return { success: false, platform: 'instagram', error: container.data?.error?.message || `Instagram container API returned HTTP ${container.status}.` };
    }

    const publishParams = new URLSearchParams({ creation_id: container.data.id });
    const published = await makeHttpsRequest(`${baseUrl}/media_publish?${publishParams.toString()}`, auth);
    if (published.status >= 200 && published.status < 300 && published.data?.id) {
      return { success: true, platform: 'instagram', id: published.data.id, live: true, liveUrl: `https://www.instagram.com/p/${published.data.id}/` };
    }
    return { success: false, platform: 'instagram', error: published.data?.error?.message || `Instagram publish API returned HTTP ${published.status}.` };
  } catch (err) {
    return { success: false, platform: 'instagram', error: err.message };
  }
}

// Publish to LinkedIn Page
async function publishToLinkedIn(postData, creds) {
  try {
    let { accessToken: token, organizationId: authorUrn } = creds.linkedin;
    if (!token || !authorUrn) {
      return { success: false, configured: false, platform: 'linkedin', error: 'LinkedIn organization credentials are incomplete. Please configure LINKEDIN_ORGANIZATION_ID and Access Token.' };
    }
    
    // Normalize URN if user only provided raw numeric ID
    if (/^\d+$/.test(authorUrn)) {
      authorUrn = `urn:li:organization:${authorUrn}`;
    }
    
    if (!/^urn:li:(organization|person):\d+$/.test(authorUrn)) {
      return { success: false, configured: true, platform: 'linkedin', error: 'LinkedIn publishing requires an organization URN (e.g. urn:li:organization:12345678).' };
    }
    {
      const endpoint = 'https://api.linkedin.com/v2/ugcPosts';
      const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: `🏢 ${postData.title}\n\n${postData.content}`
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const res = await makeHttpsRequest(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'x-restli-protocol-version': '2.0.0',
          'Content-Type': 'application/json'
        }
      }, payload);

      const postId = res.data?.id || res.headers?.['x-restli-id'];
      if (res.status >= 200 && res.status < 300 && postId) {
        return { success: true, platform: 'linkedin', id: postId, live: true, liveUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}/` };
      }
      return { success: false, platform: 'linkedin', error: res.data?.message || `LinkedIn API returned HTTP ${res.status}.` };
    }
  } catch (err) {
    return { success: false, platform: 'linkedin', error: err.message };
  }
}

function connectionConfigured(platform, creds) {
  return Boolean(creds[platform]?.hasToken);
}

async function testConnections() {
  const creds = loadCredentials();
  const checks = {
    google: async () => {
      const { accountId, locationId } = creds.google;
      const accessToken = await getGoogleAccessToken(creds);
      if (!accessToken || !accountId || !locationId) return { connected: false, error: 'Set Google OAuth credentials, account ID, and location ID.' };
      const accountResource = accountId.startsWith('accounts/') ? accountId : `accounts/${accountId}`;
      const query = new URLSearchParams({ readMask: 'name,title' });
      const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountResource}/locations?${query.toString()}`;
      const res = await makeHttpsRequest(url, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } });
      if (res.status < 200 || res.status >= 300) {
        return { connected: false, error: res.data?.error?.message || `Google Business Information API returned HTTP ${res.status}.` };
      }
      const locations = Array.isArray(res.data?.locations) ? res.data.locations : [];
      const configuredLocation = locationId.startsWith('locations/') ? locationId : `locations/${locationId}`;
      const matchedLocation = locations.find(location => location.name === configuredLocation || location.name?.endsWith(`/${configuredLocation}`)) ||
        locations.find(location => creds.google.businessName && location.title?.toLocaleLowerCase() === creds.google.businessName.toLocaleLowerCase());
      if (!matchedLocation) {
        return { connected: false, error: 'Google account is reachable, but its configured location was not found. Set the actual location resource ID.' };
      }
      return { connected: true, account: matchedLocation.title || creds.google.businessName || 'Google Business Profile', locationId: matchedLocation.name };
    },
    facebook: async () => {
      const { pageAccessToken, pageId } = creds.facebook;
      if (!pageAccessToken || !pageId) return { connected: false, error: 'Set a Facebook Page ID and Page access token.' };
      const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(pageId)}?fields=id,name`;
      const res = await makeHttpsRequest(url, { method: 'GET', headers: { Authorization: `Bearer ${pageAccessToken}` } });
      return res.status >= 200 && res.status < 300 && res.data?.id
        ? { connected: true, account: res.data.name || res.data.id }
        : { connected: false, error: res.data?.error?.message || `Facebook API returned HTTP ${res.status}.` };
    },
    instagram: async () => {
      const { accessToken, accountId } = creds.instagram;
      if (!accessToken || !accountId) return { connected: false, error: 'Set an Instagram professional account ID and access token.' };
      const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(accountId)}?fields=id,username`;
      const res = await makeHttpsRequest(url, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } });
      return res.status >= 200 && res.status < 300 && res.data?.id
        ? { connected: true, account: res.data.username || res.data.id }
        : { connected: false, error: res.data?.error?.message || `Instagram API returned HTTP ${res.status}.` };
    },
    linkedin: async () => {
      let { accessToken, organizationId } = creds.linkedin;
      if (!accessToken || !organizationId) return { connected: false, error: 'Set a LinkedIn organization URN and access token.' };
      if (/^\d+$/.test(organizationId)) {
        organizationId = `urn:li:organization:${organizationId}`;
      }
      if (!/^urn:li:(organization|person):\d+$/.test(organizationId)) return { connected: false, error: 'LinkedIn account must be an organization URN (e.g. urn:li:organization:12345678).' };
      const id = organizationId.split(':').pop();
      const url = `https://api.linkedin.com/v2/organizations/${encodeURIComponent(id)}?projection=(id,localizedName)`;
      const res = await makeHttpsRequest(url, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' } });
      return res.status >= 200 && res.status < 300 && res.data?.id
        ? { connected: true, account: res.data.localizedName || organizationId }
        : { connected: false, error: res.data?.message || `LinkedIn API returned HTTP ${res.status}.` };
    }
  };

  const reports = {};
  await Promise.all(Object.keys(checks).map(async platform => {
    if (!connectionConfigured(platform, creds)) {
      reports[platform] = { connected: false, configured: false, error: 'Credentials are not configured.' };
      return;
    }
    try {
      reports[platform] = { configured: true, ...await checks[platform]() };
    } catch (error) {
      reports[platform] = { configured: true, connected: false, error: error.message };
    }
  }));
  return reports;
}

// Main: 1-Click Omni-Publish to All Selected Channels with SEO Optimization
async function omniPublish(rawPost) {
  if (!rawPost || typeof rawPost.title !== 'string' || !rawPost.title.trim() || typeof rawPost.content !== 'string' || !rawPost.content.trim()) {
    throw new Error('Provide the genuine post title and content before publishing.');
  }
  const creds = loadCredentials();
  const selectedPlatforms = Array.isArray(rawPost.platforms) && rawPost.platforms.length > 0
    ? rawPost.platforms
    : ['google', 'facebook', 'instagram', 'linkedin'];
  const supportedPlatforms = new Set(['google', 'facebook', 'instagram', 'linkedin']);
  if (selectedPlatforms.some(platform => !supportedPlatforms.has(platform))) {
    throw new Error('One or more selected platforms are not supported.');
  }

  // Step 1: SEO Keyword & Geo Enrichment
  const optimized = optimizeContentForSEO(
    rawPost.title,
    rawPost.content
  );

  const postPayload = {
    ...rawPost,
    title: optimized.title,
    content: optimized.content,
    cta: rawPost.cta || 'CALL_NOW',
    ctaUrl: rawPost.ctaUrl || ''
  };

  // Step 2: Concurrent Multi-Platform Broadcast
  const tasks = [];
  if (selectedPlatforms.includes('google')) tasks.push(publishToGoogle(postPayload, creds));
  if (selectedPlatforms.includes('facebook')) tasks.push(publishToFacebook(postPayload, creds));
  if (selectedPlatforms.includes('instagram')) tasks.push(publishToInstagram(postPayload, creds));
  if (selectedPlatforms.includes('linkedin')) tasks.push(publishToLinkedIn(postPayload, creds));

  const results = await Promise.allSettled(tasks);
  const platformReports = {};
  results.forEach(res => {
    if (res.status === 'fulfilled' && res.value) {
      platformReports[res.value.platform] = res.value;
    }
  });

  const successfulCount = Object.values(platformReports).filter(report => report.success).length;
  const allSucceeded = successfulCount === selectedPlatforms.length;

  // Keep the audit trail in memory here; persistence belongs to the API boundary.
  const auditEntry = {
    id: 'omni_broadcast_' + Date.now(),
    title: postPayload.title,
    snippet: postPayload.content.slice(0, 240) + '...',
    fullContent: postPayload.content,
    cta: postPayload.cta,
    timestamp: new Date().toISOString(),
    platformsBroadcast: selectedPlatforms,
    platformReports: platformReports,
    seoEnriched: true,
    keywordsMatched: optimized.keywordsMatched,
    hashtags: optimized.hashtags,
    status: `${allSucceeded ? 'Published' : 'Partial or failed'} (${successfulCount}/${selectedPlatforms.length} channels)`
  };

  return {
    success: allSucceeded,
    partialSuccess: successfulCount > 0 && !allSucceeded,
    message: `${successfulCount} of ${selectedPlatforms.length} selected platforms confirmed publication.`,
    broadcastId: auditEntry.id,
    seoEnrichment: optimized,
    platformReports: platformReports,
    totalSuccess: successfulCount,
    totalTargeted: selectedPlatforms.length,
    auditEntry
  };
}

module.exports = {
  SEO_KEYWORD_MATRIX,
  SEO_HASHTAGS,
  loadCredentials,
  saveCredentials,
  getConnectionStatus,
  optimizeContentForSEO,
  testConnections,
  omniPublish
};
