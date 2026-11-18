import * as jimpPkg from '../server/node_modules/jimp/es/index.js';
const Jimp = jimpPkg.default.default || jimpPkg.default;
async function run() {
    const img = await Jimp.read('workflows/remove-bg.jpeg');
    console.log('remove-bg.jpeg channels:');
    // Let's create an image where the checkerboard and gradient are transparent
    // What is the checkerboard colors on the right half?
    // Let's check pixels at x=550, y from 10 to 100:
    for (let y = 10; y <= 50; y += 10) {
        console.log(`y=${y}:`, Jimp.intToRGBA(img.getPixelColor(550, y)));
    }
}
run();
