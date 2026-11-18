const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const fnIdx = content.indexOf('function renderImageHomeTemplates()');
const cardIdx = content.indexOf('card.innerHTML = `', fnIdx);
console.log(content.slice(cardIdx, cardIdx + 2500));
