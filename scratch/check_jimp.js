import Jimp from '../server/node_modules/jimp/es/index.js';

async function check() {
    try {
        const img = await Jimp.read('workflows/remove-bg.jpeg');
        console.log('remove-bg.jpeg dimensions:', img.bitmap.width, 'x', img.bitmap.height);
        
        // Let's sample colors: corner vs center
        const cornerColor = img.getPixelColor(0, 0);
        const centerColor = img.getPixelColor(Math.floor(img.bitmap.width / 2), Math.floor(img.bitmap.height / 2));
        console.log('Corner RGBA:', Jimp.intToRGBA(cornerColor));
        console.log('Center RGBA:', Jimp.intToRGBA(centerColor));
    } catch (e) {
        console.error('Error:', e);
    }
}
check();
