const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check #image-home-view structure
const idxHomeView = html.indexOf('id="image-home-view"');
if (idxHomeView !== -1) {
  console.log('--- #image-home-view snippet ---');
  console.log(html.substring(idxHomeView, idxHomeView + 1500));
}

// Check where mobile-image-home-container is and what classes it has
const idxMobileHome = html.indexOf('id="mobile-image-home-container"');
if (idxMobileHome !== -1) {
  console.log('--- #mobile-image-home-container snippet ---');
  console.log(html.substring(idxMobileHome, idxMobileHome + 1000));
}

// Check around composer for stray arrow
const idxComposer = html.indexOf('id="mobile-image-composer-shell"');
if (idxComposer !== -1) {
  console.log('--- composer snippet ---');
  console.log(html.substring(idxComposer - 200, idxComposer + 1500));
}
