const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const modelBtnIdx = html.indexOf('id="mobile-gen-model-btn"');
console.log('modelBtn:\n', html.substring(modelBtnIdx, modelBtnIdx + 800));
