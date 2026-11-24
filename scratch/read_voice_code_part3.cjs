const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startVoice = html.indexOf('function initMobileVoiceEqualizerBars()');
console.log(html.substring(startVoice + 5000, startVoice + 8000));
