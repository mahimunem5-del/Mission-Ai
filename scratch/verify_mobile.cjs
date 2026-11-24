const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');

// 1. Check all scripts syntax
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  try {
    new vm.Script(code);
  } catch (err) {
    console.error('Syntax error in script tag ' + count + ':', err.message);
    process.exit(1);
  }
}
console.log('PASS: All ' + count + ' script tags compiled with 0 errors.');

// 2. Check Item 1: Multi-select bar, popover, cancel icon
if (!html.includes('id="mobile-result-delete-confirm-popover"')) throw new Error('Missing delete confirm popover');
if (!html.includes('id="mobile-delete-confirm-text"')) throw new Error('Missing popover text');
if (!html.includes('id="mobile-delete-confirm-ok"')) throw new Error('Missing popover ok btn');
if (!html.includes('id="mobile-delete-confirm-cancel"')) throw new Error('Missing popover cancel btn');
if (!html.includes('window.deleteStudioImageByIds = function')) throw new Error('Missing deleteStudioImageByIds');
console.log('PASS: Item 1 verified.');

// 3. Check Item 2 & 3: Composer alignment and auto-lift
if (!html.includes('id="mobile-image-composer-text-view" class="w-full flex items-center gap-2"')) throw new Error('Missing flex items-center gap-2 on composer text view');
if (!html.includes('id="mobile-image-prompt-wrapper" class="flex-1 min-w-0 flex items-center"')) throw new Error('Missing prompt wrapper');
if (!html.includes('composer-stacked')) throw new Error('Missing composer-stacked CSS or JS');
console.log('PASS: Items 2 & 3 verified.');

// 4. Check Item 4: Black voice equalizer and circular stop with loader
if (!html.includes('bg-slate-900 transition-[height] duration-75')) throw new Error('Missing bg-slate-900 on equalizer bars');
if (!html.includes('id="mobile-voice-stop-icon"')) throw new Error('Missing stop icon');
if (!html.includes('id="mobile-voice-stop-spinner"')) throw new Error('Missing stop spinner');
console.log('PASS: Item 4 verified.');

// 5. Check Item 5: Reference thumbnail card and lightbox
if (!html.includes('w-20 h-24 rounded-2xl overflow-hidden border border-slate-200/85')) throw new Error('Missing thumbnail card styling');
if (!html.includes('id="mobile-composer-ref-lightbox"')) throw new Error('Missing mobile-composer-ref-lightbox');
if (!html.includes('id="mobile-ref-lightbox-img"')) throw new Error('Missing lightbox img');
if (!html.includes('id="mobile-ref-lightbox-close"')) throw new Error('Missing lightbox close');
console.log('PASS: Item 5 verified.');

// 6. Check Item 6: Pre-filled reference image removal
if (!html.includes('removeStudioReferenceImage(idx)')) throw new Error('Missing removeStudioReferenceImage in mobile gen ref slot');
console.log('PASS: Item 6 verified.');

console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
