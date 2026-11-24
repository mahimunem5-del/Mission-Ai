const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- 1. Search for composer auto-resize ---');
['autoResizeMobileComposerTextarea', 'composer-stacked', 'mobile-image-prompt-input'].forEach(term => {
    let pos = 0, count = 0;
    while ((pos = html.indexOf(term, pos)) !== -1) {
        if (count < 3) {
            console.log(`[${term}] at ${pos}:`, html.substring(Math.max(0, pos - 40), Math.min(html.length, pos + 120)).replace(/\s+/g, ' '));
        }
        count++;
        pos += term.length;
    }
    console.log(`[${term}] total occurrences:`, count);
});

console.log('\n--- 2. Search for attached thumbnail & lightbox ---');
['mobile-composer-ref-lightbox', 'renderMobileComposerRefChips', 'mobile-image-ref-chips-wrap'].forEach(term => {
    let pos = 0, count = 0;
    while ((pos = html.indexOf(term, pos)) !== -1) {
        if (count < 3) {
            console.log(`[${term}] at ${pos}:`, html.substring(Math.max(0, pos - 40), Math.min(html.length, pos + 120)).replace(/\s+/g, ' '));
        }
        count++;
        pos += term.length;
    }
    console.log(`[${term}] total occurrences:`, count);
});

console.log('\n--- 3. Search for voice dictation & transcribe ---');
['startMobileImageVoice', 'stopMobileImageVoice', 'initMobileVoiceEqualizerBars', '/api/transcribe'].forEach(term => {
    let pos = 0, count = 0;
    while ((pos = html.indexOf(term, pos)) !== -1) {
        if (count < 3) {
            console.log(`[${term}] at ${pos}:`, html.substring(Math.max(0, pos - 40), Math.min(html.length, pos + 120)).replace(/\s+/g, ' '));
        }
        count++;
        pos += term.length;
    }
    console.log(`[${term}] total occurrences:`, count);
});
