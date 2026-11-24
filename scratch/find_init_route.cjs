const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('window.addEventListener(\'load\'');
if (idx !== -1) {
  console.log(html.substring(idx, idx + 1000));
}

// search for location.search or URLSearchParams
const idxParams = html.indexOf('URLSearchParams');
if (idxParams !== -1) {
  console.log('URLSearchParams at', idxParams);
  console.log(html.substring(idxParams - 100, idxParams + 500));
}
