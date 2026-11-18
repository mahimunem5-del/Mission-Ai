const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

function findContext(phrase) {
  let idx = 0;
  while ((idx = dump.indexOf(phrase, idx)) !== -1) {
    console.log('=== MATCH FOR ' + phrase + ' ===');
    console.log(dump.substring(Math.max(0, idx - 200), Math.min(dump.length, idx + 200)));
    idx += phrase.length;
  }
}

findContext('0/10');
findContext('Describe the change');
findContext('ideogram-ref-dropzone');
findContext('studio-precise-edit-dropzone');
findContext('remove-bg-upload-zone');
findContext('upscale-upload-zone');
