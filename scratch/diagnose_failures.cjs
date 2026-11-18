const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('chat-workspace exists:', html.includes('id="chat-workspace"'));
console.log('chat-container exists:', html.includes('id="chat-container"'));
console.log('chat-input exists:', html.includes('id="chat-input"'));

// Check studio-model-dropdown
const sIdx = html.indexOf('id="studio-model-dropdown"');
const eIdx = html.indexOf('id="studio-prompt-input"');
const block = html.substring(sIdx, eIdx);
console.log('studio-model-dropdown includes Nano Banana Pro:', block.includes('Nano Banana Pro'));
console.log('studio-model-dropdown includes Nano Banana Pro (Gemini:', block.includes('Nano Banana Pro (Gemini'));
console.log('studio-model-dropdown includes Nano Banana 2:', block.includes('Nano Banana 2'));
console.log('studio-model-dropdown includes Nano Banana 2 (Gemini:', block.includes('Nano Banana 2 (Gemini'));

// Check studio-ratio-dropdown
const rIdx = html.indexOf('id="studio-ratio-dropdown"');
const reIdx = html.indexOf('id="studio-count-btn"');
const rBlock = html.substring(rIdx, reIdx);
console.log('rBlock parentheticals:');
['(AI decides)', '(Square)', '(Portrait)', '(Mobile)', '(Landscape)', '(Widescreen)'].forEach(p => {
    console.log(p, rBlock.includes(p));
});
