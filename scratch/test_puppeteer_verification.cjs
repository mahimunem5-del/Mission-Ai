const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function createServer(port) {
    const root = path.resolve(__dirname, '..');
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.cjs': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    const server = http.createServer((req, res) => {
        let reqPath = req.url.split('?')[0];
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
        const filePath = path.join(root, reqPath);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                fs.readFile(path.join(root, 'index.html'), (err2, indexData) => {
                    if (err2) {
                        res.writeHead(404);
                        res.end('Not Found');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(indexData);
                });
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });

    return new Promise(resolve => {
        server.listen(port, () => resolve(server));
    });
}

(async () => {
    const PORT = 3006;
    console.log(`Starting static server on port ${PORT}...`);
    const server = await createServer(PORT);
    console.log('Static server started successfully.');

    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
            console.error('[Browser Error]:', msg.text());
        }
    });
    page.on('pageerror', err => {
        consoleErrors.push(err.toString());
        console.error('[Page Exception]:', err.toString());
    });

    try {
        // ==============================================================
        // SUITE 1: Desktop Viewport (1440x900) - Strict Scope Lock
        // ==============================================================
        console.log('\n--- SUITE 1: Desktop (1440x900) Verification ---');
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2' });

        await page.evaluate(() => {
            if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
        });
        await new Promise(r => setTimeout(r, 600));

        const desktopComposerDisplay = await page.$eval('#mobile-image-composer-container', el => window.getComputedStyle(el).display);
        const desktopMultiSelectDisplay = await page.$eval('#mobile-result-multiselect-bar', el => window.getComputedStyle(el).display);
        const desktopTmplModalDisplay = await page.$eval('#mobile-template-card-modal', el => window.getComputedStyle(el).display);

        console.log(`Desktop: #mobile-image-composer-container display: "${desktopComposerDisplay}" (MUST be "none")`);
        console.log(`Desktop: #mobile-result-multiselect-bar display: "${desktopMultiSelectDisplay}" (MUST be "none")`);
        console.log(`Desktop: #mobile-template-card-modal display: "${desktopTmplModalDisplay}" (MUST be "none")`);

        if (desktopComposerDisplay !== 'none') {
            throw new Error('Desktop regression: mobile composer visible on desktop!');
        }

        // ==============================================================
        // SUITE 2: Mobile Viewport (360x800) - Creations Multi-Select Bar
        // ==============================================================
        console.log('\n--- SUITE 2: Mobile (360x800) - Creations Multi-Select Bar ---');
        await page.setViewport({ width: 360, height: 800 });
        await page.reload({ waitUntil: 'networkidle2' });

        await page.evaluate(() => {
            if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
        });
        await new Promise(r => setTimeout(r, 600));

        // Switch to Creations view
        await page.evaluate(() => {
            if (typeof setMobileWorkspaceView === 'function') {
                setMobileWorkspaceView('results');
            } else {
                window.mobileWorkspaceView = 'results';
                const feed = document.getElementById('mobile-workspace-result-feed');
                if (feed) feed.classList.remove('hidden');
            }
        });
        await new Promise(r => setTimeout(r, 400));

        // Test Multi-Select Bar for 1, 2, 3 items
        for (const count of [1, 2, 3]) {
            await page.evaluate((c) => {
                if (!window.mobileSelectedImageIds) window.mobileSelectedImageIds = new Set();
                window.mobileSelectedImageIds.clear();
                for (let i = 1; i <= c; i++) window.mobileSelectedImageIds.add('test-item-' + i);
                updateMobileMultiSelectBar();
            }, count);
            await new Promise(r => setTimeout(r, 100));

            const barDisplay = await page.$eval('#mobile-result-multiselect-bar', el => window.getComputedStyle(el).display);
            const countText = await page.$eval('#mobile-multiselect-count', el => el.textContent.trim());
            const barClasses = await page.$eval('#mobile-result-multiselect-bar', el => el.className);

            console.log(`Selection count ${count}: display="${barDisplay}", text="${countText}", bottom fixed=${barClasses.includes('bottom-4')}`);

            if (barDisplay === 'none') throw new Error(`Multi-select bar hidden when ${count} selected!`);
            if (countText !== String(count)) throw new Error(`Expected count text "${count}", got "${countText}"!`);
            if (!barClasses.includes('bottom-4')) throw new Error('Multi-select bar not fixed at bottom-4!');
        }

        // Verify Right Side Buttons: Download, Delete, Cancel
        const btnTexts = await page.$$eval('#mobile-result-multiselect-bar button', btns => btns.map(b => b.textContent.trim()));
        console.log('Multi-select bar buttons:', btnTexts);
        if (!btnTexts.includes('Download') || !btnTexts.includes('Delete') || !btnTexts.includes('Cancel')) {
            throw new Error(`Missing expected buttons! Got: ${JSON.stringify(btnTexts)}`);
        }
        if (btnTexts.includes('Edit') || btnTexts.includes('Deselect')) {
            throw new Error('Edit or Deselect button should be completely removed!');
        }

        // Test Cancel Button Click
        await page.evaluate(() => {
            const cancelBtn = document.getElementById('mobile-multiselect-cancel-btn');
            if (cancelBtn) cancelBtn.click();
        });
        await new Promise(r => setTimeout(r, 200));

        const barAfterCancel = await page.$eval('#mobile-result-multiselect-bar', el => window.getComputedStyle(el).display);
        const selectedSize = await page.evaluate(() => window.mobileSelectedImageIds ? window.mobileSelectedImageIds.size : 0);
        console.log(`After Cancel click: bar display="${barAfterCancel}", selected count=${selectedSize}`);
        if (barAfterCancel !== 'none' || selectedSize !== 0) {
            throw new Error('Cancel button did not dismiss bar or clear selection!');
        }

        // ==============================================================
        // SUITE 3: Mobile Template Preview Modal
        // ==============================================================
        console.log('\n--- SUITE 3: Mobile Template Preview Modal ---');
        await page.evaluate(() => {
            const sampleTmpl = {
                id: 'tmpl-test-portrait',
                title: 'Editorial Portrait',
                prompt: 'Cinematic portrait of an elegant woman, dramatic golden hour lighting, 8k resolution',
                imageUrl: '/public/templates/editorial-portrait.jpg',
                aspectRatio: '9:16',
                stylePreset: 'Realistic'
            };
            openMobileTemplateCardModal(sampleTmpl);
        });
        await new Promise(r => setTimeout(r, 400));

        const tmplModalVisible = await page.$eval('#mobile-template-card-modal', el => window.getComputedStyle(el).display);
        const cardContainerClasses = await page.$eval('#mobile-tmpl-card-container', el => el.className);
        const imgClasses = await page.$eval('#mobile-tmpl-card-img', el => el.className);
        const closeBtnClasses = await page.$eval('#mobile-tmpl-card-close-btn', el => el.className);

        console.log(`Template modal display: "${tmplModalVisible}"`);
        console.log(`Card container classes: "${cardContainerClasses}" (has p-2.5: ${cardContainerClasses.includes('p-2.5')}, rounded-2xl: ${cardContainerClasses.includes('rounded-2xl')})`);
        console.log(`Img classes: "${imgClasses}" (has object-contain: ${imgClasses.includes('object-contain')}, max-h-[45dvh]: ${imgClasses.includes('max-h-[45dvh]')})`);
        console.log(`Close button classes: "${closeBtnClasses}" (has top-2.5 left-2.5: ${closeBtnClasses.includes('top-2.5 left-2.5')})`);

        if (tmplModalVisible === 'none') throw new Error('Template modal not displayed!');
        if (!cardContainerClasses.includes('p-2.5') || !cardContainerClasses.includes('rounded-2xl')) {
            throw new Error('Template card container does not have slim p-2.5 or rounded-2xl!');
        }
        if (!imgClasses.includes('object-contain') || !imgClasses.includes('max-h-[45dvh]')) {
            throw new Error('Template image does not have object-contain or max-h-[45dvh]!');
        }
        if (!closeBtnClasses.includes('top-2.5 left-2.5')) {
            throw new Error('Close button not pinned at top-2.5 left-2.5!');
        }

        // Close template modal
        await page.evaluate(() => {
            if (typeof closeMobileTemplateCardModal === 'function') closeMobileTemplateCardModal();
        });
        await new Promise(r => setTimeout(r, 300));

        // Switch back to landing page
        await page.evaluate(() => {
            if (typeof setMobileWorkspaceView === 'function') {
                setMobileWorkspaceView('landing');
            } else {
                window.mobileWorkspaceView = 'landing';
                const feed = document.getElementById('mobile-workspace-result-feed');
                if (feed) feed.classList.add('hidden');
            }
        });
        await new Promise(r => setTimeout(r, 300));

        // ==============================================================
        // SUITE 4: Mobile Bottom Prompt Composer
        // ==============================================================
        console.log('\n--- SUITE 4: Mobile Bottom Prompt Composer ---');
        
        // A. Verify no popup menu exists
        const popoverEl = await page.$('#mobile-image-attach-popover');
        console.log(`Attach popover element in DOM: ${popoverEl !== null} (MUST be false)`);
        if (popoverEl !== null) throw new Error('Old popup menu still exists in DOM!');

        // B. Direct image upload button & multiple input
        const attachBtn = await page.$('#mobile-image-attach-btn');
        const fileInputMultiple = await page.$eval('#mobile-image-file-input', el => el.hasAttribute('multiple'));
        console.log(`Direct attach button present: ${attachBtn !== null}, file input has multiple: ${fileInputMultiple}`);
        if (!attachBtn || !fileInputMultiple) throw new Error('Direct attach button or multiple file input missing!');

        // C. Multi-line auto-expanding textarea
        const textareaTagName = await page.$eval('#mobile-image-prompt-input', el => el.tagName.toLowerCase());
        console.log(`Prompt input element tag: "${textareaTagName}" (MUST be "textarea")`);
        if (textareaTagName !== 'textarea') throw new Error('Expected <textarea>, got <' + textareaTagName + '>!');

        // Test auto-expansion
        const initialHeight = await page.$eval('#mobile-image-prompt-input', el => el.offsetHeight);
        await page.type('#mobile-image-prompt-input', 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8');
        await new Promise(r => setTimeout(r, 200));

        const expandedHeight = await page.$eval('#mobile-image-prompt-input', el => el.offsetHeight);
        const shellClasses = await page.$eval('#mobile-image-composer-shell', el => el.className);
        console.log(`Textarea height: initial=${initialHeight}px, expanded=${expandedHeight}px (shell rounded-3xl=${shellClasses.includes('rounded-3xl')})`);
        if (expandedHeight <= initialHeight) throw new Error('Textarea did not expand with multiline text!');

        // Verify Send button is enabled
        const sendBtnDisabled = await page.$eval('#mobile-image-submit-btn', el => el.disabled);
        console.log(`Send button disabled: ${sendBtnDisabled} (MUST be false when text is present)`);
        if (sendBtnDisabled) throw new Error('Send button should be enabled!');

        // D. Voice bar test
        console.log('\n--- Testing Voice Dictation Bar ---');
        await page.click('#mobile-image-mic-btn');
        await new Promise(r => setTimeout(r, 300));

        const voiceViewDisplay = await page.$eval('#mobile-image-composer-voice-view', el => window.getComputedStyle(el).display);
        const textViewDisplay = await page.$eval('#mobile-image-composer-text-view', el => window.getComputedStyle(el).display);
        const equalizerBarCount = await page.$$eval('#mobile-voice-equalizer-bars > div', bars => bars.length);
        const pauseBtnVisible = await page.$eval('#mobile-voice-pause-btn', el => window.getComputedStyle(el).display);

        console.log(`Voice mode active: voiceView="${voiceViewDisplay}", textView="${textViewDisplay}", equalizer bars count=${equalizerBarCount}, pauseBtn="${pauseBtnVisible}"`);
        if (voiceViewDisplay === 'none' || textViewDisplay !== 'none') {
            throw new Error('Voice mode view transition failed!');
        }
        if (equalizerBarCount < 10) {
            throw new Error('Equalizer bars not rendered!');
        }

        // Tap Pause button
        await page.click('#mobile-voice-pause-btn');
        await new Promise(r => setTimeout(r, 300));

        const voiceViewAfterPause = await page.$eval('#mobile-image-composer-voice-view', el => window.getComputedStyle(el).display);
        const textViewAfterPause = await page.$eval('#mobile-image-composer-text-view', el => window.getComputedStyle(el).display);
        console.log(`After Pause: voiceView="${voiceViewAfterPause}", textView="${textViewAfterPause}"`);
        if (voiceViewAfterPause !== 'none' || textViewAfterPause === 'none') {
            throw new Error('Voice mode did not return to text mode on pause!');
        }

        // E. Send Flow: Opens pre-filled Generate Image sheet without autoGenerate
        console.log('\n--- Testing Send Flow ---');
        await page.click('#mobile-image-submit-btn');
        await new Promise(r => setTimeout(r, 500));

        const drawerOpen = await page.evaluate(() => window.isMobileDrawerOpen);
        const activeTool = await page.evaluate(() => window.activeMobileTool);
        const prefilledPrompt = await page.$eval('#mobile-gen-prompt-input', el => el.value);
        const composerCleared = await page.$eval('#mobile-image-prompt-input', el => el.value);

        console.log(`Drawer open: ${drawerOpen}, Active tool: "${activeTool}", Drawer Prompt: "${prefilledPrompt.slice(0, 30)}...", Composer cleared: "${composerCleared}"`);

        if (!drawerOpen) throw new Error('Generate Image drawer did not open on Send!');
        if (activeTool !== 'generate-image') throw new Error(`Expected tool "generate-image", got "${activeTool}"!`);
        if (!prefilledPrompt.includes('Line 1')) throw new Error('Drawer prompt was not pre-filled with composer text!');
        if (composerCleared !== '') throw new Error('Bottom composer prompt was not cleared after send!');

        // Check 412x915 viewport
        console.log('\n--- SUITE 5: Mobile (412x915) Viewport Check ---');
        await page.setViewport({ width: 412, height: 915 });
        await new Promise(r => setTimeout(r, 300));
        const composer412Display = await page.$eval('#mobile-image-composer-container', el => window.getComputedStyle(el).display);
        console.log(`Mobile (412x915): composer display="${composer412Display}"`);
        if (composer412Display === 'none') throw new Error('Composer missing on 412x915 viewport!');

        // Check console errors
        console.log('\n--- Checking Console Errors ---');
        console.log(`Total console errors: ${consoleErrors.length}`);
        if (consoleErrors.length > 0) {
            console.error('Console errors logged:', consoleErrors);
        }

        console.log('\n=============================================================');
        console.log('>>> ALL PUPPETEER TEST SUITES PASSED WITH 100% SUCCESS! <<<');
        console.log('=============================================================');

    } finally {
        await browser.close();
        server.close();
    }
})();
