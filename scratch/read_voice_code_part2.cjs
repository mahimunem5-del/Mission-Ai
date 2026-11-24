const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startVoice = html.indexOf('function initMobileVoiceEqualizerBars()');
console.log(html.substring(startVoice + 2500, startVoice + 6000));
