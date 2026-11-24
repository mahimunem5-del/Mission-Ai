const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function inspectRange(start, count, label) {
  console.log(`=== ${label} (lines ${start}-${start + count}) ===`);
  console.log(lines.slice(start - 1, start - 1 + count).map((l, i) => `${start + i}: ${l}`).join('\n'));
}

inspectRange(15135, 20, '15142 compare');
inspectRange(16590, 40, '16599 history');
inspectRange(16645, 30, '16650 conversation details');
inspectRange(16690, 45, '16699 delete & list');
inspectRange(17485, 20, '17490 extract file');
inspectRange(38840, 20, '38849 health');
