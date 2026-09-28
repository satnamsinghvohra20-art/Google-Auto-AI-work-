const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ url, status: res.statusCode, data }));
    }).on('error', e => resolve({ url, error: e.message }));
  });
}

async function main() {
  const urls = [
    'https://shop.grexa.ai/api/rank-report/6aba452ec5cdfac7806c5bda',
    'https://booster.grexa.ai/api/rank-report/6aba452ec5cdfac7806c5bda',
    'https://booster.grexa.ai/grexa-shop/api/rank-report/6aba452ec5cdfac7806c5bda',
    'https://api.grexa.ai/api/rank-report/6aba452ec5cdfac7806c5bda'
  ];
  for (let u of urls) {
    const res = await fetchUrl(u);
    console.log(u, res.status, res.data?.slice(0, 300));
  }
}

main();
