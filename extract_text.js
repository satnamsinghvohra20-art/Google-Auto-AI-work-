const fs = require('fs');

const pricing = fs.readFileSync('chunk_BjRMCOM7.js', 'utf8');

// Find all string literals longer than 15 chars that look like UI text
const matches = [...pricing.matchAll(/"([^"]{15,200})"/g)].map(m => m[1]);
const cleanMatches = matches.filter(m => !m.includes(';') && !m.includes('{') && !m.includes('<path') && !m.includes('stroke') && !m.includes('class'));

console.log('Total extracted UI texts:', cleanMatches.length);
fs.writeFileSync('extracted_ui_text.json', JSON.stringify([...new Set(cleanMatches)], null, 2));
console.log('Saved extracted_ui_text.json');
