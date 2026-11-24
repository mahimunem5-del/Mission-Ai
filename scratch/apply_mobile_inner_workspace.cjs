const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

console.log('Read index.html, size:', content.length);

// 1. Update CSS in <style>
const oldCssBlock = `        /* ─── Dedicated Standalone Mobile Images Workspace UI (< 768px) ─── */
        @media (min-width: 768px) {
            #mobile-image-home-container,
            #mobile-image-composer-container {
                display: none !important;
            }
        }

        @media (max-width: 767px) {
            /* Inside #image-home-view, hide desktop backdrop & desktop main content on mobile */
            #image-home-view > .pointer-events-none,
            #image-home-view > .flex-1.w-full.pb-16 {
                display: none !important;
            }

            #mobile-image-home-container {
                display: flex !important;
                flex-direction: column !important;
                background-color: #FFFFFF !important;
                min-height: 100dvh;
            }

            #mobile-image-composer-container {
                display: block !important;
            }

            #mobile-image-home-container.hidden,
            #mobile-image-composer-container.hidden {
                display: none !important;
            }

            body.image-home-active #image-home-view {
                background-color: #FFFFFF !important;
            }
        }`;

const newCssBlock = `        /* ─── Dedicated Standalone Mobile Images Workspace UI (< 768px) ─── */
        @media (min-width: 768px) {
            #mobile-image-home-container,
            #mobile-image-composer-container,
            #mobile-workspace-drawer,
            #mobile-workspace-result-feed {
                display: none !important;
            }
        }

        @media (max-width: 767px) {
            #image-studio-workspace {
                display: none !important;
            }

            /* Inside #image-home-view, hide desktop backdrop & desktop main content on mobile */
            #image-home-view > .pointer-events-none,
            #image-home-view > .flex-1.w-full.pb-16 {
                display: none !important;
            }

            #mobile-image-home-container {
                display: flex !important;
                flex-direction: column !important;
                background-color: #FFFFFF !important;
                min-height: 100dvh;
            }

            #mobile-image-composer-container {
                display: block !important;
            }

            #mobile-image-home-container.hidden,
            #mobile-image-composer-container.hidden {
                display: none !important;
            }

            body.image-home-active #image-home-view {
                background-color: #FFFFFF !important;
            }
        }`;

if (!content.includes(oldCssBlock)) {
    console.error('Could not find oldCssBlock in index.html');
    process.exit(1);
}
content = content.replace(oldCssBlock, newCssBlock);
console.log('Successfully updated CSS block');

// 2. Suppress toast on mobile in showStudioToast
const oldToastFn = `        // Toast notification system
        function showStudioToast(msg, duration = 3000) {
            const existing = document.getElementById('studio-toast-banner');`;

const newToastFn = `        // Toast notification system
        function showStudioToast(msg, duration = 3000) {
            if (typeof window !== 'undefined' && window.innerWidth < 768) return;
            const existing = document.getElementById('studio-toast-banner');`;

if (!content.includes(oldToastFn)) {
    console.error('Could not find oldToastFn in index.html');
    process.exit(1);
}
content = content.replace(oldToastFn, newToastFn);
console.log('Successfully updated showStudioToast');

// 3. Update setImageStudioMode for mobile branching
const oldSetImageStudioMode = `            if (heroSection) heroSection.classList.add('hidden');
            if (headerBackBtn) { headerBackBtn.classList.add('hidden'); headerBackBtn.classList.remove('inline-flex'); }
            if (topNavHeader) topNavHeader.classList.add('hidden');
            const chatPlanHeader = document.getElementById('chat-free-plan-header');
            if (chatPlanHeader) {
                chatPlanHeader.classList.add('hidden');
                chatPlanHeader.style.display = 'none';
            }

            if (imageStudioMode === 'home') {`;

const newSetImageStudioMode = `            if (heroSection) heroSection.classList.add('hidden');
            if (headerBackBtn) { headerBackBtn.classList.add('hidden'); headerBackBtn.classList.remove('inline-flex'); }
            if (topNavHeader) topNavHeader.classList.add('hidden');
            const chatPlanHeader = document.getElementById('chat-free-plan-header');
            if (chatPlanHeader) {
                chatPlanHeader.classList.add('hidden');
                chatPlanHeader.style.display = 'none';
            }

            if (window.innerWidth < 768) {
                if (workspaceView) workspaceView.classList.add('hidden');
                if (imageStudioMode === 'home') {
                    document.body.classList.add('image-home-active');
                    if (homeView) {
                        homeView.classList.remove('hidden');
                        homeView.scrollTop = 0;
                    }
                    if (typeof setMobileWorkspaceView === 'function') {
                        setMobileWorkspaceView('landing');
                    }
                    if (typeof setIsMobileDrawerOpen === 'function') {
                        setIsMobileDrawerOpen(false);
                    }
                    renderImageHomeCreations();
                    renderImageHomeTemplates();
                    if (typeof renderMobileImageHomeTemplates === "function") renderMobileImageHomeTemplates();
                    return;
                } else {
                    // Mobile workspace mode: open dedicated Ideogram-style bottom sheet drawer or trigger auto-generate
                    const tool = options.tool || 'generate-image';
                    if (options.autoGenerate) {
                        if (typeof activeMobileTool !== 'undefined') activeMobileTool = tool;
                        if (typeof setMobileWorkspaceView === 'function') setMobileWorkspaceView('results');
                        if (typeof setIsMobileDrawerOpen === 'function') setIsMobileDrawerOpen(false);
                        if (options.prompt) {
                            const studioPrompt = document.getElementById('studio-prompt-input');
                            if (studioPrompt) studioPrompt.value = options.prompt;
                            imageStudioState.prompt = options.prompt;
                        }
                        if (typeof isMobileProcessing !== 'undefined') {
                            isMobileProcessing = true;
                            mobileProcessingStatus = 'Generating your image...';
                        }
                        if (typeof renderMobileResultFeed === 'function') renderMobileResultFeed();
                        setTimeout(() => {
                            generateStudioImages(options.prompt, options.aspectRatio, options.referenceImage);
                        }, 50);
                        return;
                    }

                    if (typeof openMobileWorkspaceDrawer === 'function') {
                        openMobileWorkspaceDrawer(tool, options);
                    }
                    return;
                }
            }

            if (imageStudioMode === 'home') {`;

if (!content.includes(oldSetImageStudioMode)) {
    console.error('Could not find oldSetImageStudioMode in index.html');
    process.exit(1);
}
content = content.replace(oldSetImageStudioMode, newSetImageStudioMode);
console.log('Successfully updated setImageStudioMode');

// 4. Update renderStudioAssetsGallery to trigger mobile result feed
const oldRenderGalleryEnd = `            renderStudioRecentImages();
            renderStudioResults();
        }

        function deleteAssetGroup(groupId) {`;

const newRenderGalleryEnd = `            renderStudioRecentImages();
            renderStudioResults();
            if (typeof renderMobileResultFeed === 'function') {
                renderMobileResultFeed();
            }
        }

        function deleteAssetGroup(groupId) {`;

if (!content.includes(oldRenderGalleryEnd)) {
    console.error('Could not find oldRenderGalleryEnd in index.html');
    process.exit(1);
}
content = content.replace(oldRenderGalleryEnd, newRenderGalleryEnd);
console.log('Successfully updated renderStudioAssetsGallery');

// 5. Insert Mobile Floating Bottom Sheet Drawer & Result Feed HTML + Script right after template-white-preview-modal
const templateModalEnd = `    </div>


    <!-- Secret Template Admin Studio (100% Invisible to Public Users) -->`;

const snippetPath = path.join(__dirname, 'mobile_workspace_snippet.html');
const mobileHtmlAndScript = fs.readFileSync(snippetPath, 'utf8');

if (!content.includes(templateModalEnd)) {
    console.error('Could not find templateModalEnd in index.html');
    process.exit(1);
}
content = content.replace(templateModalEnd, mobileHtmlAndScript + '\n' + templateModalEnd);
console.log('Successfully inserted mobile HTML and script');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Successfully wrote index.html, new size:', content.length);
