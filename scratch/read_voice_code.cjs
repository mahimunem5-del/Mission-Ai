const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- 1. Main Chat Speech Recognition ---');
console.log(html.substring(1165800, 1167500));

console.log('\n--- 2. Mobile Image Studio Voice Implementation ---');
const startVoice = html.indexOf('function initMobileVoiceEqualizerBars()');
console.log(html.substring(startVoice, startVoice + 3500));
