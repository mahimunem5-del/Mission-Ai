import fs from 'fs';

console.log('Workflows dir:', fs.readdirSync('workflows'));
if (fs.existsSync('public/workflows')) {
    console.log('Public workflows dir:', fs.readdirSync('public/workflows'));
}
if (fs.existsSync('public/templates')) {
    console.log('Public templates dir:', fs.readdirSync('public/templates'));
}
