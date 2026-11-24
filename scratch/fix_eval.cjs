const fs = require('fs');

let code = fs.readFileSync('scratch/verify_mobile_images_headless.cjs', 'utf8');

code = code.replace(
  `const desktopImagesState = (await client.send('Runtime.evaluate', {`,
  `const evalRaw = await client.send('Runtime.evaluate', {
            awaitPromise: true,`
);

code = code.replace(
  `})).result.value;`,
  `});
        if (evalRaw.exceptionDetails) {
            console.error('Expression exception:', evalRaw.exceptionDetails);
        }
        const desktopImagesState = evalRaw.result.value || {};`
);

fs.writeFileSync('scratch/verify_mobile_images_headless.cjs', code, 'utf8');
