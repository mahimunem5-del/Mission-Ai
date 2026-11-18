const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const targetWords = [
  'Model', 'Reference images', 'Style Presets', 'Prompt', 'Source image', 'What should change?', 'Target Scale', 'Quality', 'Variations', 'Advanced settings',
  '0/10', 'Upload or choose', 'Auto', 'General', 'Realistic', 'Design', '3D Render', 'Anime', 'Cinematic', 'Illustration', 'Typography', '1:1', 'Medium', '2x', '4x', '+ Add',
  'Describe the image', 'Describe the change', 'Generate', 'Apply edit', 'Remove background', 'Upscale'
];

targetWords.forEach(word => {
  let idx = 0;
  const matches = [];
  while ((idx = dump.indexOf(word, idx)) !== -1) {
    const start = Math.max(0, dump.lastIndexOf('\n', idx));
    const end = dump.indexOf('\n', idx);
    matches.push(dump.substring(start, end).trim());
    idx += word.length;
  }
  console.log(`Word: "${word}" -> found ${matches.length} times`);
  if (matches.length > 0 && matches.length <= 5) {
    matches.forEach(m => console.log('   ' + m));
  } else if (matches.length > 5) {
    matches.slice(0, 3).forEach(m => console.log('   ' + m));
    console.log(`   ... and ${matches.length - 3} more`);
  }
});
