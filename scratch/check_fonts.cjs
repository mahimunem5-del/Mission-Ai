const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const head = html.substring(0, html.indexOf('</head>'));
const lines = head.split('\n');
lines.forEach(l => {
  if (l.includes('font') || l.includes('Plus+Jakarta') || l.includes('Jakarta') || l.includes('Google') || l.includes('stylesheet')) {
    console.log(l.trim());
  }
});
