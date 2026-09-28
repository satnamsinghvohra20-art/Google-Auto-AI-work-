const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadFile(url, dest) {
  return new Promise((resolve) => {
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
        try { fs.unlinkSync(dest); } catch(e){}
        resolve(false);
      }
    }).on('error', () => {
      try { fs.unlinkSync(dest); } catch(e){}
      resolve(false);
    });
  });
}

async function main() {
  const assetsDir = path.join(__dirname, 'public');
  const v9Dir = path.join(assetsDir, 'v9');
  if (!fs.existsSync(v9Dir)) fs.mkdirSync(v9Dir, { recursive: true });

  const files = [
    'gbp-store.svg',
    'icon-reviews.svg',
    'icon-replies.svg',
    'icon-posts.svg',
    'icon-photos.svg',
    'icon-analytics.svg',
    'result-views.png',
    'result-calls.png',
    'result-directions.png',
    'chevron.svg'
  ];

  for (let f of files) {
    const ok = await downloadFile(`https://shop.grexa.ai/v9/${f}`, path.join(v9Dir, f));
    console.log(`v9/${f}:`, ok ? 'OK' : 'MISSING');
  }

  // Client case studies
  const clients = [
    { url: 'https://website-cdn.grexa.ai/pl-media/First%20Cry.jpeg', name: 'firstcry.jpeg' },
    { url: 'https://website-cdn.grexa.ai/pl-media/Metropolis%20Healthcare.jpeg', name: 'metropolis.jpeg' },
    { url: 'https://website-cdn.grexa.ai/pl-media/Midas%20Wellness%20Hub.jpeg', name: 'midas.jpeg' },
    { url: 'https://website-cdn.grexa.ai/pl-media/Client%201.webp', name: 'client1.webp' },
    { url: 'https://website-cdn.grexa.ai/pl-media/Client%202.webp', name: 'client2.webp' },
    { url: 'https://website-cdn.grexa.ai/pl-media/Client%203.webp', name: 'client3.webp' }
  ];

  for (let c of clients) {
    const ok = await downloadFile(c.url, path.join(assetsDir, c.name));
    console.log(`${c.name}:`, ok ? 'OK' : 'MISSING');
  }
}

main();
