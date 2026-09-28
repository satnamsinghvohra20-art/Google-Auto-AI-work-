const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'css');
if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });

const cssParts = [
  'asset_0.DxaccxP_.css',
  'asset_PurchasePanel.O_w358A9.css',
  'asset_ProductWalkthroughCarousel.Ymg5FZa7.css',
  'asset_grid-image.BlpMrvD-.css',
  'asset_18.DsSMgW8m.css'
];

let merged = `/* Grexa Booster Core Stylesheet */\n`;
for (let p of cssParts) {
  if (fs.existsSync(p)) {
    merged += `\n/* --- ${p} --- */\n` + fs.readFileSync(p, 'utf8') + '\n';
  }
}

fs.writeFileSync(path.join(cssDir, 'grexa-core.css'), merged);
console.log('Assembled css/grexa-core.css, total length:', merged.length);
