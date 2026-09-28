const https = require('https');
const fs = require('fs');

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
  const chunks = [
    'CPbHmm-G.js', // grid-image / ranking
    'DEox2HPP.js', // purchase panel or actions
    'BjRMCOM7.js', // pricing
    'Ch0FAH6S.js', // solutions
    'BEfJ-pLX.js', // audit / competitors
    'C-HXCqqD.js', // reviews
    'DkRj7w17.js', // faq / testimonials
    'BcsI4hXj.js'  // walkthrough carousel
  ];

  for (let c of chunks) {
    const res = await fetchUrl(`https://shop.grexa.ai/_app/immutable/chunks/${c}`);
    if (res.status === 200) {
      fs.writeFileSync(`chunk_${c}`, res.data);
      console.log(`Saved chunk_${c}, length: ${res.data.length}`);
    } else {
      console.log(`Failed chunk_${c}, status: ${res.status}`);
    }
  }
}

main();
