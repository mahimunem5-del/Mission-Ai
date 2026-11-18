const { execSync } = require('child_process');
const content = execSync('git show 89fe089:index.html', { maxBuffer: 20 * 1024 * 1024 }).toString();
const idx = content.indexOf('window.downloadFileArtifact = function');
console.log(content.slice(idx, idx + 2000));
