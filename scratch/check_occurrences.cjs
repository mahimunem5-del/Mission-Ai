const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

console.log('creative-workflows-grid:', content.includes('id="creative-workflows-grid"'));
console.log('imageHomePlaceholderPhrases:', content.includes('imageHomePlaceholderPhrases'));
console.log('Design Templates:', content.includes('Design Templates'));
console.log('Design Templates & Styles:', content.includes('Design Templates & Styles'));
console.log('studio-generate-controls:', content.includes('id="studio-generate-controls"'));
console.log('studio-remove-bg-controls:', content.includes('id="studio-remove-bg-controls"'));
console.log('studio-tool-generate:', content.includes('id="studio-tool-generate"'));
console.log('image-home-model-btn:', content.includes('id="image-home-model-btn"'));
