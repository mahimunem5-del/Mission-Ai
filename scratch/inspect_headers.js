import fs from 'fs';

console.log('Inspecting workflows images:');
const names = ['generate-image.jpeg', 'remove-bg.jpeg', 'precise-edit.jpeg', 'upscale-image.jpeg'];
for (const n of names) {
    const buf = fs.readFileSync('workflows/' + n);
    console.log(n, 'first 16 bytes:', buf.subarray(0, 16));
}
