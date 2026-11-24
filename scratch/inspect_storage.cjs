const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function printRange(startPattern, length) {
  const idx = content.indexOf(startPattern);
  if (idx !== -1) {
    console.log(`=== ${startPattern} ===`);
    console.log(content.slice(idx, idx + length));
  }
}

printRange('function getEffectiveStudioImagesForWorkspace', 1000);
printRange('function saveStoredRecentImages', 800);
printRange('function deleteStudioImage', 800);
