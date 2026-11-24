const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

const regexes = [
  /http:\/\/(localhost|127\.0\.0\.1)[^\s"'`]*/gi,
  /:5001[^\s"'`]*/gi,
  /\/api\/[a-zA-Z0-9\-_/]+/gi
];

regexes.forEach((r, idx) => {
  const matches = [...new Set(content.match(r) || [])];
  console.log('Regex', idx, matches);
});
