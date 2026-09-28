const fs = require('fs');

const code = fs.readFileSync('node18.js', 'utf8');

// Find all properties accessed on report
const reportProps = [...code.matchAll(/report\.([a-zA-Z0-9_]+)/g)].map(m => m[1]);
console.log('Report properties:', [...new Set(reportProps)]);

// Find all fetch/http calls or URLs
const urls = [...code.matchAll(/https?:\/\/[^\s"'`)]+/g)].map(m => m[0]);
console.log('URLs in node18:', [...new Set(urls)]);

// Find all occurrences of text like "score", "audit", "plan", "rank", "competitor", "review"
const sections = [...code.matchAll(/"([^"]*(?:score|audit|plan|rank|competitor|review|rating|growth|pricing|discount|guarantee|boost)[^"]*)"/gi)].map(m => m[1]);
console.log('Section phrases:', [...new Set(sections)].slice(0, 40));
