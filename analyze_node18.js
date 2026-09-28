const fs = require('fs');

const code = fs.readFileSync('node18.js', 'utf8');

// Find imports
const imports = [...code.matchAll(/from\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log('Imports in node18:', imports);

// Find all text strings / labels in node18
const textMatches = code.match(/["'`]([^"'`]{4,100})["'`]/g) || [];
// filter interesting text
const interesting = textMatches
  .map(s => s.slice(1, -1))
  .filter(s => !s.startsWith('../') && !s.startsWith('px') && !s.includes('svelte') && /[a-zA-Z]{3,}/.test(s));

console.log('Sample interesting strings:', [...new Set(interesting)].slice(0, 50));
