const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  const base = 'https://shop.grexa.ai/_app/immutable/';
  const files = [
    'entry/start.Bsshe2s1.js',
    'entry/app.UgFeaZyE.js',
    'nodes/0.js', // let's see how nodes are named in app.UgFeaZyE.js
  ];

  const appJs = await fetchUrl(base + 'entry/app.UgFeaZyE.js');
  fs.writeFileSync('app.js', appJs.data);
  console.log('Saved app.js, length:', appJs.data.length);

  // find all chunks in app.js
  const chunkMatches = [...appJs.data.matchAll(/"([^"]+\.js)"/g)].map(m => m[1]);
  console.log('Found chunks in app.js:', chunkMatches.slice(0, 25));

  // Let's also check shop_v10.html content details
  const shopHtml = fs.readFileSync('shop_v10.html', 'utf8');
  console.log('shop_v10.html contains PurchasePanel?:', shopHtml.includes('PurchasePanel'));
  console.log('shop_v10.html title & heading:', shopHtml.match(/<title>(.*?)<\/title>/)?.[1]);
  
  // Find all text inside shop_v10.html
  const textClean = shopHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
  console.log('Extracted visible text sample:', textClean.slice(0, 1000));
}

main().catch(console.error);
