const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function checkClasses(startId, endId, label) {
  const s = html.indexOf(`id="${startId}"`);
  const e = html.indexOf(`</div>`, s + 200);
  console.log(`=== ${label} ===`);
  console.log(html.substring(s, Math.min(s + 600, html.length)));
}

checkClasses('studio-model-dropdown', '', 'STUDIO MODEL DROPDOWN');
checkClasses('studio-ratio-dropdown', '', 'STUDIO RATIO DROPDOWN');
checkClasses('studio-count-dropdown', '', 'STUDIO COUNT DROPDOWN');
checkClasses('studio-precise-edit-weight-dropdown', '', 'STUDIO PRECISE WEIGHT DROPDOWN');
checkClasses('studio-precise-edit-count-dropdown', '', 'STUDIO PRECISE COUNT DROPDOWN');
