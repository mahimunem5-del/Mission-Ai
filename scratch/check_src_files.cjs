const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
appTsx.forEach((l, i) => {
  if (l.includes('5001')) console.log(`src/App.tsx:${i+1}: ${l.trim()}`);
});

const imgWs = fs.readFileSync('src/components/ImageWorkspace.tsx', 'utf8').split('\n');
imgWs.forEach((l, i) => {
  if (l.includes('5001')) console.log(`src/components/ImageWorkspace.tsx:${i+1}: ${l.trim()}`);
});
