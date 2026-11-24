const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const endComposer = html.indexOf('</div>\n\n            <!-- Background Decorative Aurora Gradients');
if (endComposer === -1) {
  // search for "Imagine it. Craft it."
  const idxImagine = html.indexOf('Imagine it. Craft it.');
  console.log('Imagine it. Craft it. index:', idxImagine);
  console.log(html.substring(idxImagine - 400, idxImagine + 1500));
} else {
  console.log('Found end of composer, following:');
  console.log(html.substring(endComposer, endComposer + 1500));
}
