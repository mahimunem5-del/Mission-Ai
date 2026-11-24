const fs = require('fs');
let code = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

// Update renderMobileResultFeed to include atomic resolution
const oldFeedHead = `            const activeToolTitle = TOOL_TITLES[window.activeMobileTool] || 'Generate Image';

            // 1. In-place Active Generation Slot (when processing)
            if (window.isMobileProcessing) {`;

const newFeedHead = `            const activeToolTitle = TOOL_TITLES[window.activeMobileTool] || 'Generate Image';

            const items = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);

            // Atomic Resolution: If new item arrived at top, immediately clear processing to avoid layout jump
            if (window.isMobileProcessing) {
                const topItem = items[0];
                const topItemId = topItem ? (topItem.id || topItem.url || topItem.img) : null;
                if (topItem && topItemId !== window.mobilePreGenFirstItemId) {
                    window.isMobileProcessing = false;
                }
            }

            // 1. In-place Active Generation Slot (when processing)
            if (window.isMobileProcessing) {`;

if (code.includes(oldFeedHead)) {
    code = code.replace(oldFeedHead, newFeedHead);
    console.log('Successfully updated feed head for atomic resolution!');
} else {
    console.log('oldFeedHead not found directly, checking...');
}

// Also in handleMobileDrawerCtaClick, record window.mobilePreGenFirstItemId
const oldCtaStart = `            // 2. Switch to results feed
            setMobileWorkspaceView('results');

            // 3. Mark processing
            window.isMobileProcessing = true;`;

const newCtaStart = `            // Record pre-generation top item for atomic skeleton resolution
            const preItems = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);
            window.mobilePreGenFirstItemId = preItems[0] ? (preItems[0].id || preItems[0].url || preItems[0].img) : null;
            window.mobileGenerationStartTime = Date.now();

            // 2. Switch to results feed
            setMobileWorkspaceView('results');

            // 3. Mark processing
            window.isMobileProcessing = true;`;

if (code.includes(oldCtaStart)) {
    code = code.replace(oldCtaStart, newCtaStart);
    console.log('Successfully updated handleMobileDrawerCtaClick!');
}

// In handleMobileRegenerate, record window.mobilePreGenFirstItemId
const oldRegenStart = `        function handleMobileRegenerate() {
            window.isMobileProcessing = true;`;

const newRegenStart = `        function handleMobileRegenerate() {
            const preItems = (typeof getEffectiveStudioImagesForWorkspace === 'function')
                ? getEffectiveStudioImagesForWorkspace(window.activeMobileTool)
                : (Array.isArray(window.STUDIO_RECENT_IMAGES) ? window.STUDIO_RECENT_IMAGES : []);
            window.mobilePreGenFirstItemId = preItems[0] ? (preItems[0].id || preItems[0].url || preItems[0].img) : null;
            window.mobileGenerationStartTime = Date.now();
            window.isMobileProcessing = true;`;

if (code.includes(oldRegenStart)) {
    code = code.replace(oldRegenStart, newRegenStart);
    console.log('Successfully updated handleMobileRegenerate!');
}

// Also in handleMobileDrawerCtaClick finally block, clear immediately upon completion
const oldFinally = `            } finally {
                setTimeout(() => {
                    window.isMobileProcessing = false;
                    renderMobileResultFeed();
                }, 2200);
            }`;

const newFinally = `            } finally {
                window.isMobileProcessing = false;
                renderMobileResultFeed();
            }`;

if (code.includes(oldFinally)) {
    code = code.replace(oldFinally, newFinally);
    console.log('Successfully updated finally block!');
}

fs.writeFileSync('scratch/build_mobile_workspace.cjs', code, 'utf8');
console.log('Wrote updated scratch/build_mobile_workspace.cjs');
