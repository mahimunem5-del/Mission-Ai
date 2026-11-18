const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  '<div id="ideogram-header-generate"',
  '<button type="button" id="workspace-tool-switcher-btn"',
  '<div id="ideogram-header-edit"',
  '<button type="button" id="ideogram-reset-composer-btn"',
  '<div id="ideogram-generate-controls"',
  '<div id="ideogram-precise-edit-controls"',
  '<div id="ideogram-remove-bg-controls"',
  '<div id="ideogram-upscale-controls"',
  'function renderStudioAssetsGallery()'
];

checks.forEach(c => {
  console.log(`${c}: ${html.includes(c) ? 'FOUND' : 'MISSING'}`);
});
