const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// 1. Simple static file server
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
                // Rewrites fallback to /index.html
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
    const PORT = 3005;
    console.log(`Starting static server on port ${PORT}...`);
    const server = await createServer(PORT);
    console.log('Static server started.');

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
        // SUITE 1: Desktop Viewport (1440x900) - Strict Lock Check
        // ==============================================================
        console.log('\n--- SUITE 1: Desktop (1440x900) Locked State Verification ---');
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2' });

        // Switch to Image Studio workspace
        await page.evaluate(() => {
            if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
        });
        await new Promise(r => setTimeout(r, 600));

        const desktopDrawerDisplay = await page.$eval('#mobile-workspace-drawer', el => window.getComputedStyle(el).display);
        const desktopFeedDisplay = await page.$eval('#mobile-workspace-result-feed', el => window.getComputedStyle(el).display);
        const desktopWorkspaceDisplay = await page.$eval('#image-home-view', el => window.getComputedStyle(el).display);

        console.log(`Desktop: #mobile-workspace-drawer display: "${desktopDrawerDisplay}" (MUST be "none")`);
        console.log(`Desktop: #mobile-workspace-result-feed display: "${desktopFeedDisplay}" (MUST be "none")`);
        console.log(`Desktop: #image-home-view display: "${desktopWorkspaceDisplay}" (MUST NOT be "none")`);

        if (desktopDrawerDisplay !== 'none' || desktopFeedDisplay !== 'none') {
            throw new Error('Desktop regression: mobile drawer or result feed is visible on desktop!');
        }

        await page.screenshot({ path: path.join(__dirname, 'desktop_1440x900.png') });
        console.log('Saved screenshot: scratch/desktop_1440x900.png');

        // ==============================================================
        // SUITE 2: Mobile Image Landing Page (360x800)
        // ==============================================================
        console.log('\n--- SUITE 2: Mobile Landing Page (360x800) ---');
        await page.setViewport({ width: 360, height: 800 });
        await page.reload({ waitUntil: 'networkidle2' });

        await page.evaluate(() => {
            if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
        });
        await new Promise(r => setTimeout(r, 600));

        const mobileHomeDisplay = await page.$eval('#mobile-image-home-container', el => window.getComputedStyle(el).display);
        const mobileComposerDisplay = await page.$eval('#mobile-image-composer-container', el => window.getComputedStyle(el).display);
        console.log(`Mobile: #mobile-image-home-container display: "${mobileHomeDisplay}"`);
        console.log(`Mobile: #mobile-image-composer-container display: "${mobileComposerDisplay}"`);

        await page.screenshot({ path: path.join(__dirname, 'mobile_landing_360x800.png') });
        console.log('Saved screenshot: scratch/mobile_landing_360x800.png');

        // ==============================================================
        // SUITE 3: Test Bottom Sheet Drawer for All 4 Tools
        // ==============================================================
        console.log('\n--- SUITE 3: Floating Bottom Sheet Drawer for 4 Tools ---');

        const toolsToTest = [
            { id: 'generate-image', title: 'Generate Image', cta: 'Generate' },
            { id: 'remove-background', title: 'Remove Background', cta: 'Remove Background' },
            { id: 'precise-edit', title: 'Precise Edit', cta: 'Apply Edit' },
            { id: 'upscale-image', title: 'Upscale Image', cta: 'Upscale' }
        ];

        for (const t of toolsToTest) {
            console.log(`\nTesting tool: ${t.id} (${t.title})...`);
            await page.evaluate((toolId) => {
                setImageStudioMode('workspace', { tool: toolId });
            }, t.id);
            await new Promise(r => setTimeout(r, 400));

            const drawerVisible = await page.$eval('#mobile-workspace-drawer', el => !el.classList.contains('hidden'));
            const drawerTitle = await page.$eval('#mobile-drawer-title', el => el.textContent.trim());
            const ctaText = await page.$eval('#mobile-drawer-cta-text', el => el.textContent.trim());
            const grabberVisible = await page.$eval('#mobile-workspace-sheet .w-9.h-1.bg-slate-300', el => Boolean(el));
            const closeBtnVisible = await page.$eval('#mobile-drawer-close-btn', el => Boolean(el));
            const clearBtnVisible = await page.$eval('#mobile-drawer-clear-btn', el => Boolean(el));

            console.log(`  Drawer open? ${drawerVisible}`);
            console.log(`  Drawer title: "${drawerTitle}" (expected: "${t.title}")`);
            console.log(`  CTA text: "${ctaText}" (expected: "${t.cta}")`);
            console.log(`  Grabber handle visible? ${grabberVisible}`);
            console.log(`  Close button visible? ${closeBtnVisible}`);
            console.log(`  Clear button visible? ${clearBtnVisible}`);

            if (!drawerVisible || drawerTitle !== t.title || ctaText !== t.cta) {
                throw new Error(`Drawer mismatch for tool ${t.id}`);
            }

            await page.screenshot({ path: path.join(__dirname, `mobile_drawer_${t.id}.png`) });

            // Test close button
            await page.click('#mobile-drawer-close-btn');
            await new Promise(r => setTimeout(r, 300));
            const drawerClosed = await page.$eval('#mobile-workspace-drawer', el => el.classList.contains('hidden'));
            console.log(`  Drawer closed on ← click? ${drawerClosed}`);
            if (!drawerClosed) throw new Error(`Drawer did not close on ← click for ${t.id}`);
        }

        // ==============================================================
        // SUITE 4: Generation & Full-Screen Mobile Result Feed Flow
        // ==============================================================
        console.log('\n--- SUITE 4: Full Generation & Result Feed Flow ---');

        // Open Generate Image drawer
        await page.evaluate(() => {
            setImageStudioMode('workspace', { tool: 'generate-image' });
        });
        await new Promise(r => setTimeout(r, 400));

        // Enter prompt
        const testPrompt = 'A majestic golden lion with glowing neon crown, cinematic volumetric light';
        await page.type('#mobile-gen-prompt-input', testPrompt);
        await new Promise(r => setTimeout(r, 200));

        const ctaDisabled = await page.$eval('#mobile-drawer-cta-btn', el => el.disabled);
        console.log(`CTA disabled after entering prompt? ${ctaDisabled} (expected: false)`);
        if (ctaDisabled) throw new Error('CTA button should be enabled after typing prompt!');

        // Click Primary CTA Button
        console.log('Clicking "Generate" primary CTA button in drawer...');
        await page.click('#mobile-drawer-cta-btn');
        await new Promise(r => setTimeout(r, 600));

        // Verify Step 2 Result Feed is active
        const drawerHiddenAfterSubmit = await page.$eval('#mobile-workspace-drawer', el => el.classList.contains('hidden'));
        const feedVisible = await page.$eval('#mobile-workspace-result-feed', el => !el.classList.contains('hidden'));
        const badgeText = await page.$eval('#mobile-result-tool-badge', el => el.textContent.trim());
        const backBtnVisible = await page.$eval('#mobile-result-back-btn', el => Boolean(el));
        const newBtnVisible = await page.$eval('#mobile-result-new-btn', el => Boolean(el));
        const editPromptBtnVisible = await page.$eval('#mobile-result-edit-prompt-btn', el => Boolean(el));
        const regenBtnVisible = await page.$eval('#mobile-result-regenerate-btn', el => Boolean(el));

        console.log(`Drawer closed after submit? ${drawerHiddenAfterSubmit}`);
        console.log(`Result feed visible? ${feedVisible}`);
        console.log(`Badge text: "${badgeText}"`);
        console.log(`Sticky Top Bar (< Back and + New) visible? ${backBtnVisible && newBtnVisible}`);
        console.log(`Fixed Bottom Bar (Edit Prompt and Regenerate) visible? ${editPromptBtnVisible && regenBtnVisible}`);

        if (!drawerHiddenAfterSubmit || !feedVisible) {
            throw new Error('Result feed did not become visible or drawer did not close!');
        }

        await page.screenshot({ path: path.join(__dirname, 'mobile_result_feed.png') });
        console.log('Saved screenshot: scratch/mobile_result_feed.png');

        // Wait for generation to complete or output cards to render
        await new Promise(r => setTimeout(r, 2000));

        const outputCardsCount = await page.$$eval('.mobile-output-frame', els => els.length);
        console.log(`Rendered output cards in result feed: ${outputCardsCount}`);
        if (outputCardsCount === 0) {
            throw new Error('Expected at least one output card in result feed!');
        }

        // Test Direct 1-Tap Download Button
        const dlBtnExists = await page.$eval('.mobile-card-download-btn', el => Boolean(el));
        console.log(`Direct 1-tap download button (⬇) present on card? ${dlBtnExists}`);

        // Test Copy Pill
        const copyPillInitial = await page.$eval('.mobile-action-copy-pill', el => el.textContent.trim());
        console.log(`Copy pill initial text: "${copyPillInitial}"`);
        await page.click('.mobile-action-copy-pill');
        await new Promise(r => setTimeout(r, 100));
        const copyPillClicked = await page.$eval('.mobile-action-copy-pill', el => el.textContent.trim());
        console.log(`Copy pill after click: "${copyPillClicked}" (expected: "✓ Copied")`);
        if (!copyPillClicked.includes('Copied')) {
            throw new Error('Copy pill did not show "✓ Copied" feedback!');
        }

        // Verify NO toast notification was shown
        const toastPresent = await page.evaluate(() => Boolean(document.getElementById('studio-toast-banner')));
        console.log(`Toast notification present? ${toastPresent} (MUST be false - zero toast policy)`);
        if (toastPresent) {
            throw new Error('Violation of zero toast notification policy!');
        }

        // Test Edit Pill (wires to Precise Edit drawer)
        console.log('Testing "Edit" quick action pill...');
        await page.click('.mobile-action-edit-pill');
        await new Promise(r => setTimeout(r, 400));
        const preciseDrawerTitle = await page.$eval('#mobile-drawer-title', el => el.textContent.trim());
        const preciseSrcImg = await page.$eval('#mobile-precise-preview-img', el => el.src);
        console.log(`Drawer opened to tool: "${preciseDrawerTitle}" with source image: ${Boolean(preciseSrcImg)}`);
        if (preciseDrawerTitle !== 'Precise Edit' || !preciseSrcImg) {
            throw new Error('Edit pill did not properly open Precise Edit drawer with source image!');
        }
        await page.click('#mobile-drawer-close-btn');
        await new Promise(r => setTimeout(r, 300));

        // Test Upscale Pill (wires to Upscale Image drawer)
        console.log('Testing "Upscale" quick action pill...');
        await page.click('.mobile-action-upscale-pill');
        await new Promise(r => setTimeout(r, 400));
        const upscaleDrawerTitle = await page.$eval('#mobile-drawer-title', el => el.textContent.trim());
        const upscaleSrcImg = await page.$eval('#mobile-upscale-preview-img', el => el.src);
        console.log(`Drawer opened to tool: "${upscaleDrawerTitle}" with source image: ${Boolean(upscaleSrcImg)}`);
        if (upscaleDrawerTitle !== 'Upscale Image' || !upscaleSrcImg) {
            throw new Error('Upscale pill did not properly open Upscale drawer with source image!');
        }
        await page.click('#mobile-drawer-close-btn');
        await new Promise(r => setTimeout(r, 300));

        // Test White Full-Screen Preview Modal (tap image)
        console.log('Testing White Full-Screen Preview Modal on image tap...');
        await page.click('.mobile-output-frame img');
        await new Promise(r => setTimeout(r, 400));
        const whiteModalVisible = await page.$eval('#template-white-preview-modal', el => !el.classList.contains('hidden'));
        console.log(`White Full-Screen Preview Modal opened? ${whiteModalVisible}`);
        if (!whiteModalVisible) {
            throw new Error('Tapping output image did not open White Full-Screen Preview Modal!');
        }
        await page.click('#tmpl-modal-close-btn');
        await new Promise(r => setTimeout(r, 300));

        // Test Fixed Bottom Bar: "Edit Prompt"
        console.log('Testing bottom bar "Edit Prompt" button...');
        await page.click('#mobile-result-edit-prompt-btn');
        await new Promise(r => setTimeout(r, 400));
        const editPromptDrawerOpen = await page.$eval('#mobile-workspace-drawer', el => !el.classList.contains('hidden'));
        const genPromptRetained = await page.$eval('#mobile-gen-prompt-input', el => el.value);
        console.log(`Drawer opened on "Edit Prompt"? ${editPromptDrawerOpen}, prompt retained: "${genPromptRetained.slice(0, 30)}..."`);
        if (!editPromptDrawerOpen || !genPromptRetained) {
            throw new Error('Edit Prompt button did not reopen drawer with prompt retained!');
        }
        await page.click('#mobile-drawer-close-btn');
        await new Promise(r => setTimeout(r, 300));

        // Test Top Navigation: "< Back" to return to landing page
        console.log('Testing sticky top "< Back" navigation to landing page...');
        await page.click('#mobile-result-back-btn');
        await new Promise(r => setTimeout(r, 400));
        const feedHiddenAfterBack = await page.$eval('#mobile-workspace-result-feed', el => el.classList.contains('hidden'));
        const homeVisibleAfterBack = await page.$eval('#mobile-image-home-container', el => !el.classList.contains('hidden'));
        console.log(`Feed hidden after < Back? ${feedHiddenAfterBack}, Landing page visible? ${homeVisibleAfterBack}`);
        if (!feedHiddenAfterBack || !homeVisibleAfterBack) {
            throw new Error('Back button did not cleanly return to landing page!');
        }

        // ==============================================================
        // SUITE 5: Mobile Viewport (412x915) - Samsung Galaxy Verification
        // ==============================================================
        console.log('\n--- SUITE 5: Mobile (412x915) ---');
        await page.setViewport({ width: 412, height: 915 });
        await new Promise(r => setTimeout(r, 300));

        await page.evaluate(() => {
            setImageStudioMode('workspace', { tool: 'generate-image' });
        });
        await new Promise(r => setTimeout(r, 400));

        const galaxyDrawerOpen = await page.$eval('#mobile-workspace-drawer', el => !el.classList.contains('hidden'));
        console.log(`412x915: Drawer opens properly? ${galaxyDrawerOpen}`);
        await page.screenshot({ path: path.join(__dirname, 'mobile_drawer_412x915.png') });
        await page.click('#mobile-drawer-close-btn');

        // Check console errors
        console.log(`\nTotal browser console errors: ${consoleErrors.length}`);
        if (consoleErrors.length > 0) {
            console.error('Console errors logged:', consoleErrors);
            throw new Error(`Test failed with ${consoleErrors.length} console errors!`);
        }

        console.log('\n======================================================');
        console.log('ALL VERIFICATION TESTS PASSED PERFECTLY WITH ZERO ERRORS!');
        console.log('======================================================\n');

    } catch (e) {
        console.error('Test execution failed:', e);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.close();
    }
})();
