const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function findLine(index) {
    return html.substring(0, index).split('\n').length;
}

const targets = [
    'id="mobile-composer-ref-lightbox"',
    'id="mobile-voice-pause-btn"',
    'function autoResizeMobileComposerTextarea()',
    'function renderMobileComposerRefChips()',
    'function openMobileComposerRefLightbox',
    'function initMobileVoiceEqualizerBars()',
    'function startMobileImageVoice()',
    'function stopMobileImageVoice'
];

targets.forEach(t => {
    const idx = html.indexOf(t);
    console.log(`${t} -> index: ${idx}, line: ${findLine(idx)}`);
});
