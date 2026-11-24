const fs = require('fs');

const originalHtml = fs.readFileSync('index.html', 'utf8');

// 1. JS in lines 21532-21790
const jsComposerOldStart = `        function syncMobileImageSendButton() {`;
const jsComposerOldEnd = `            if (micBtn && !micBtn._inited) {
                micBtn._inited = true;
                micBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleMobileImageVoice();
                });
            }

        }`;

console.log('jsComposerOldStart found:', originalHtml.includes(jsComposerOldStart));
console.log('jsComposerOldEnd found:', originalHtml.includes(jsComposerOldEnd));

// Check the full block between jsComposerOldStart and jsComposerOldEnd
const startIdx = originalHtml.indexOf(jsComposerOldStart);
const endIdx = originalHtml.indexOf(jsComposerOldEnd);
console.log('jsComposer block span:', startIdx, endIdx, 'length:', endIdx - startIdx + jsComposerOldEnd.length);

// 2. updateMobileMultiSelectBar
const updateMultiSelectOld = `        function updateMobileMultiSelectBar() {
            const bar = document.getElementById('mobile-result-multiselect-bar');
            const countEl = document.getElementById('mobile-multiselect-count');
            const editBtn = document.getElementById('mobile-multiselect-edit-btn');
            if (!bar) return;

            const size = window.mobileSelectedImageIds ? window.mobileSelectedImageIds.size : 0;
            if (size > 0) {
                bar.classList.remove('hidden');
                if (countEl) countEl.textContent = \`\${size} selected\`;
                if (editBtn) {
                    editBtn.classList.toggle('hidden', size !== 1);
                }
            } else {
                bar.classList.add('hidden');
            }
        }`;
console.log('updateMultiSelectOld found:', originalHtml.includes(updateMultiSelectOld));

// 3. Multi-Select Event Listeners
const multiListenersOld = `            // 10. Multi-Select Bar Buttons
            const deselectBtn = document.getElementById('mobile-multiselect-deselect-btn');
            if (deselectBtn && !deselectBtn._inited) {
                deselectBtn._inited = true;
                deselectBtn.addEventListener('click', () => {
                    window.mobileSelectedImageIds.clear();
                    updateMobileMultiSelectBar();
                    renderMobileResultFeed();
                });
            }

            const multiDlBtn = document.getElementById('mobile-multiselect-download-btn');
            if (multiDlBtn && !multiDlBtn._inited) {
                multiDlBtn._inited = true;
                multiDlBtn.addEventListener('click', handleMobileMultiDownload);
            }

            const multiDelBtn = document.getElementById('mobile-multiselect-delete-btn');
            if (multiDelBtn && !multiDelBtn._inited) {
                multiDelBtn._inited = true;
                multiDelBtn.addEventListener('click', handleMobileMultiDelete);
            }

            const multiEditBtn = document.getElementById('mobile-multiselect-edit-btn');
            if (multiEditBtn && !multiEditBtn._inited) {
                multiEditBtn._inited = true;
                multiEditBtn.addEventListener('click', handleMobileMultiEdit);
            }`;
console.log('multiListenersOld found:', originalHtml.includes(multiListenersOld));

// 4. openMobileWorkspaceDrawer options
const drawerOptionsOld = `                if (options.aspectRatio && typeof imageStudioState !== 'undefined') {
                    imageStudioState.aspectRatio = options.aspectRatio;
                }`;
console.log('drawerOptionsOld found:', originalHtml.includes(drawerOptionsOld));
