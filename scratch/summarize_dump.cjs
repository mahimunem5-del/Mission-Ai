const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const sections = dump.split('===================');
sections.forEach(sec => {
  const lines = sec.trim().split('\n');
  console.log('Section header:', lines[0]);
  console.log('Length in lines:', lines.length);
});
