const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const tIdx = html.indexOf('id="mobile-template-card-modal"');
const titleIdx = html.indexOf('id="mobile-tmpl-card-title"');
console.log('tIdx:', tIdx, 'titleIdx:', titleIdx, 'diff:', titleIdx - tIdx);

const cIdx = html.indexOf('id="mobile-image-composer-container"');
const voiceIdx = html.indexOf('id="mobile-image-composer-voice-view"');
console.log('cIdx:', cIdx, 'voiceIdx:', voiceIdx, 'diff:', voiceIdx - cIdx);

console.log('object-contain idx:', html.indexOf('object-contain'));
console.log('mobile-voice-pause-btn idx:', html.indexOf('id="mobile-voice-pause-btn"'));
