const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function findSnippet(str, len = 400) {
  const idx = content.indexOf(str);
  if (idx === -1) {
    console.log('Not found:', str);
    return;
  }
  const line = content.slice(0, idx).split('\n').length;
  console.log(`=== Found "${str}" at line ${line} ===`);
  console.log(content.slice(idx, idx + len));
}

findSnippet('id="mobile-result-multiselect-bar"', 800);
findSnippet('function handleMobileMultiDelete', 700);
findSnippet('id="mobile-image-composer-shell"', 1000);
findSnippet('id="mobile-image-composer-voice-view"', 800);
findSnippet('function renderMobileGenRefSlots', 800);
findSnippet('function submitMobileImagePrompt', 800);
