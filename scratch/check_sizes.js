import fs from 'fs';

console.log('generate-image.jpeg size:', fs.statSync('workflows/generate-image.jpeg').size);
console.log('remove-bg.jpeg size:', fs.statSync('workflows/remove-bg.jpeg').size);
console.log('precise-edit.jpeg size:', fs.statSync('workflows/precise-edit.jpeg').size);
console.log('upscale-image.jpeg size:', fs.statSync('workflows/upscale-image.jpeg').size);
