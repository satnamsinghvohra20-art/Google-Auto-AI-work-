const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlinkSync(dest);
        resolve(false);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const assetsDir = path.join(__dirname, 'public');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const urls = [
    { url: 'https://shop.grexa.ai/grexa-logo.svg', name: 'grexa-logo.svg' },
    { url: 'https://shop.grexa.ai/live-mesh-gradient.gif', name: 'live-mesh-gradient.gif' },
    { url: 'https://shop.grexa.ai/favicon.png', name: 'favicon.png' },
    { url: 'https://rankreports.grexa.ai/rankingImages/90257a59-e23f-4ce9-b763-d5987ac9f669.jpeg', name: 'grid-ranking-dashmesh.jpeg' }
  ];

  for (let item of urls) {
    const dest = path.join(assetsDir, item.name);
    const ok = await downloadFile(item.url, dest);
    console.log(item.name, ok ? 'SUCCESS' : 'FAILED');
  }
}

main();
