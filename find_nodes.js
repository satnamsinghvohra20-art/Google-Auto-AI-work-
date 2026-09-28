const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');

// Print how nodes are registered in app.js
const nodePattern = /(\d+):\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g;
let m;
while ((m = nodePattern.exec(app)) !== null) {
  console.log(`Node ${m[1]}: ${m[2]}`);
}
