const fs = require('fs');
const testCode = fs.readFileSync('scratch/test_patch.cjs', 'utf8');
const applyCode = fs.readFileSync('scratch/apply_update.cjs', 'utf8');

const tM = testCode.split('const composerOldTarget = `')[1].split('`;')[0];
const aM = applyCode.split('const composerOldHtml = `')[1].split('`;')[0];

console.log('tM len:', tM.length, 'aM len:', aM.length);
console.log('tM === aM:', tM === aM);
if (tM !== aM) {
  for (let i = 0; i < Math.max(tM.length, aM.length); i++) {
    if (tM[i] !== aM[i]) {
      console.log('Diff at ' + i + ': tM=' + JSON.stringify(tM.slice(i, i+20)) + ' vs aM=' + JSON.stringify(aM.slice(i, i+20)));
      break;
    }
  }
}
const indexHtml = fs.readFileSync('index.html', 'utf8');
console.log('indexHtml has tM:', indexHtml.includes(tM));
console.log('indexHtml has aM:', indexHtml.includes(aM));
