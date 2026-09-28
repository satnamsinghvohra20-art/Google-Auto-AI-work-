const fs = require('fs');

const node18 = fs.readFileSync('node18.js', 'utf8');

// Find all text blocks in node18 that are longer than 30 characters
const matches = [...node18.matchAll(/"([^"]{30,300})"/g)].map(m => m[1]);
const clean = matches.filter(m => !m.includes(';') && !m.includes('{') && !m.includes('<path'));

fs.writeFileSync('node18_text_dump.json', JSON.stringify([...new Set(clean)], null, 2));
console.log('Saved node18_text_dump.json, count:', clean.length);
