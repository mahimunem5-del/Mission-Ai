const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function findSnippet(phrase) {
  const idx = html.toLowerCase().indexOf(phrase.toLowerCase());
  console.log('Phrase:', phrase, 'Found:', idx);
  if (idx !== -1) {
    console.log(html.substring(Math.max(0, idx - 200), Math.min(html.length, idx + 400)));
  }
}

findSnippet('craft it');
findSnippet('describe your vision');
findSnippet('granola');
findSnippet('studio workflow');
findSnippet('create studio-grade');
