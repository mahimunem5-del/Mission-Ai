const fs = require('fs');

let code = fs.readFileSync('scratch/verify_mobile_images_headless.cjs', 'utf8');

code = code.replace(
    `const hero = imgHome ? imgHome.querySelector('.max-w-\\\\[760px\\\\]') : null;`,
    `const hero = imgHome ? imgHome.querySelector('[class*="max-w-[760px]"]') : null;`
);
code = code.replace(
    `const hero = imgHome ? imgHome.querySelector('.max-w-[760px]') : null;`,
    `const hero = imgHome ? imgHome.querySelector('[class*="max-w-[760px]"]') : null;`
);

fs.writeFileSync('scratch/verify_mobile_images_headless.cjs', code, 'utf8');
console.log('Fixed selector in test script.');
