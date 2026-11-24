const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = 'file:///' + path.join(rootDir, 'index.html').replace(/\\/g, '/');

const capture = (width, height, name) => {
    const screenshotPath = path.join(rootDir, 'scratch', `${name}.png`);
    console.log(`Capturing ${width}x${height} -> ${name}.png...`);

    try {
        execFileSync(chromePath, [
            '--headless=new',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            `--window-size=${width},${height}`,
            `--screenshot=${screenshotPath}`,
            fileUrl
        ], { timeout: 25000 });
        const stats = fs.statSync(screenshotPath);
        console.log(`[OK] Screenshot captured: ${name}.png (${stats.size} bytes)`);
    } catch (err) {
        console.error(`Error capturing screenshot ${name}:`, err.message);
    }
};

// 1. Desktop 1440x900
capture(1440, 900, 'desktop_precise_edit_1440x900');

// 2. Mobile 360x800
capture(360, 800, 'mobile_precise_edit_360x800');
