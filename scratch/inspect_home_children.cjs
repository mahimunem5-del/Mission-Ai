const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxHomeView = html.indexOf('id="image-home-view"');
const closingHomeView = html.indexOf('</div>', idxHomeView + 500); // we will search for its direct children

// Find where mobile-image-home-container ends
const idxMobileEnd = html.indexOf('id="mobile-image-composer-container"');
console.log('Mobile composer index:', idxMobileEnd);

// Let's print the HTML starting from mobile composer container onwards inside #image-home-view
console.log(html.substring(idxMobileEnd + 500, idxMobileEnd + 2500));
