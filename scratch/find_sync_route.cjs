const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxSyncRoute = html.indexOf('function syncRoute');
if (idxSyncRoute !== -1) {
  console.log(html.substring(idxSyncRoute, idxSyncRoute + 1000));
} else {
  console.log('No syncRoute function found');
}
