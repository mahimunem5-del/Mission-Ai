const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function inspectRange(start, count, label) {
  console.log(`=== ${label} (lines ${start}-${start + count}) ===`);
  console.log(lines.slice(start - 1, start - 1 + count).map((l, i) => `${start + i}: ${l}`).join('\n'));
}

inspectRange(13090, 25, 'getApiBaseUrl or similar');
inspectRange(25715, 30, 'apiBase around 25726');
inspectRange(26075, 30, 'upscale endpoint around 26085');
inspectRange(26285, 30, 'vectorize endpoint around 26294');
inspectRange(27095, 55, 'precise-edit endpoint around 27105');
inspectRange(28910, 25, 'apiBase around 28921');
