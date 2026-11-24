const fs = require('fs');

const imgWs = fs.readFileSync('src/components/ImageWorkspace.tsx', 'utf8').split('\n');
imgWs.forEach((l, i) => {
  if (l.includes('fetch(') || l.includes('/api/')) console.log(`src/components/ImageWorkspace.tsx:${i+1}: ${l.trim()}`);
});
