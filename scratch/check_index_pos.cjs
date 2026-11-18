const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log('indexOf studio-model-dropdown:', html.indexOf('id="studio-model-dropdown"'));
console.log('indexOf <!-- Prompt Input Card -->:', html.indexOf('<!-- Prompt Input Card -->'));
console.log('indexOf id="studio-prompt-input":', html.indexOf('id="studio-prompt-input"'));
