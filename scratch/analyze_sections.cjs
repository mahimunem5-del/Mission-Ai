const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const sections = dump.split('===================');
for (let i = 1; i < sections.length; i += 2) {
  const name = sections[i].trim();
  const content = sections[i + 1];
  console.log(`=== ${name} === (length: ${content.length})`);
}
