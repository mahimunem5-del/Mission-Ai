const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxMobileComp = html.indexOf('id="mobile-image-composer-container"');
// Let's find next div that doesn't belong to composer
const nextSection = html.indexOf('<!-- Background Decorative Aurora', idxMobileComp);
if (nextSection !== -1) {
  console.log('Found next section at', nextSection);
  console.log(html.substring(nextSection, nextSection + 1500));
} else {
  console.log('Searching for Aurora:');
  const auroraIdx = html.indexOf('Aurora');
  console.log('Aurora at', auroraIdx);
  if (auroraIdx !== -1) {
    console.log(html.substring(auroraIdx - 200, auroraIdx + 500));
  }
}
