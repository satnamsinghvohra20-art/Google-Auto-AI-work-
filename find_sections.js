const fs = require('fs');

const node18 = fs.readFileSync('node18.js', 'utf8');

// Find all HTML tags created in node18 (e.g. m(a, "DIV", { class: ... }))
const classes = [...node18.matchAll(/class:\s*!0[^{}]*\}|class",\s*"([^"]+)"/g)].map(m => m[1]).filter(Boolean);
console.log('Sample classes in node18:', classes.slice(0, 30));

// Find sections rendered
const words = ['Overall', 'Rank', 'Competitor', 'Audit', 'Review', 'Rating', 'Keyword', 'Category', 'Photo', 'Post', 'Offer', 'Plan', 'Guarantee', 'Trust'];
for (let w of words) {
  const count = (node18.match(new RegExp(w, 'gi')) || []).length;
  console.log(`Word "${w}": ${count} occurrences`);
}
