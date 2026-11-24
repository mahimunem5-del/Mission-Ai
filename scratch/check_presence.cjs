const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

console.log('1. Checking Voice Bar elements in index.html:');
console.log('  mobile-image-composer-voice-view:', html.includes('id="mobile-image-composer-voice-view"'));
console.log('  mobile-voice-cancel-btn:', html.includes('id="mobile-voice-cancel-btn"'));
console.log('  mobile-voice-equalizer-bars:', html.includes('id="mobile-voice-equalizer-bars"'));
console.log('  mobile-voice-pause-btn:', html.includes('id="mobile-voice-pause-btn"'));
console.log('  mobile-voice-send-btn:', html.includes('id="mobile-voice-send-btn"'));

console.log('2. Checking Template Modal in index.html:');
console.log('  mobile-template-card-modal:', html.includes('id="mobile-template-card-modal"'));
console.log('  mobile-tmpl-card-container:', html.includes('id="mobile-tmpl-card-container"'));
console.log('  max-h-[45dvh]:', html.includes('max-h-[45dvh]'));
console.log('  object-contain:', html.includes('object-contain'));
console.log('  p-2.5:', html.includes('p-2.5'));

console.log('3. Checking Multi-Select Bar in index.html:');
console.log('  mobile-result-multiselect-bar:', html.includes('id="mobile-result-multiselect-bar"'));
console.log('  mobile-multiselect-count:', html.includes('id="mobile-multiselect-count"'));
console.log('  mobile-multiselect-download-btn:', html.includes('id="mobile-multiselect-download-btn"'));
console.log('  mobile-multiselect-delete-btn:', html.includes('id="mobile-multiselect-delete-btn"'));
console.log('  mobile-multiselect-cancel-btn:', html.includes('id="mobile-multiselect-cancel-btn"'));
console.log('  bottom-4 left-3.5 right-3.5:', html.includes('bottom-4 left-3.5 right-3.5'));

console.log('4. Checking Composer in index.html:');
console.log('  mobile-image-composer-shell:', html.includes('id="mobile-image-composer-shell"'));
console.log('  mobile-image-ref-chips-wrap:', html.includes('id="mobile-image-ref-chips-wrap"'));
console.log('  mobile-image-attach-btn:', html.includes('id="mobile-image-attach-btn"'));
console.log('  mobile-image-prompt-input (textarea):', html.includes('<textarea id="mobile-image-prompt-input"'));
console.log('  max-h-[156px]:', html.includes('max-h-[156px]'));
console.log('  popover removed:', !html.includes('id="mobile-image-attach-popover"'));
