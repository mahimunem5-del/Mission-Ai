const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxInit = html.indexOf('function initApp()');
if (idxInit !== -1) {
  console.log(html.substring(idxInit, idxInit + 1000));
} else {
  // search for DOMContentLoaded
  const idxDCL = html.indexOf('DOMContentLoaded');
  console.log('DOMContentLoaded at', idxDCL);
}

// Check how URL query params or initial routing works
const idxRoute = html.indexOf('parseUrlRoute');
if (idxRoute !== -1) {
  console.log(html.substring(idxRoute, idxRoute + 600));
}
