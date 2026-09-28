const https = require('https');
const fs = require('fs');

https.get('https://shop.grexa.ai/api/rank-report/6aba452ec5cdfac7806c5bda', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    fs.writeFileSync('sample_rank_report.json', JSON.stringify(JSON.parse(data), null, 2));
    console.log('Saved sample_rank_report.json');
  });
});
