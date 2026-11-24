const fs = require('fs');

let code = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

// 1. Add Creations title next to back button in Result Feed header
const oldFeedHeader = `<button type="button" id="mobile-result-back-btn"
                class="w-9 h-9 rounded-full bg-[#FFFFFF] border border-slate-200/70 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:bg-slate-50 flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to landing" title="Back">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>`;

const newFeedHeader = `<div class="flex items-center gap-2.5">
                <button type="button" id="mobile-result-back-btn"
                    class="w-9 h-9 rounded-full bg-[#FFFFFF] border border-slate-200/70 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:bg-slate-50 flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer"
                    aria-label="Back to landing" title="Back">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2 class="text-[16px] font-semibold text-slate-900 tracking-tight">Creations</h2>
            </div>`;

if (code.includes(oldFeedHeader)) {
    code = code.replace(oldFeedHeader, newFeedHeader);
    console.log('✓ 1. Added Creations header next to back button in Result Feed');
} else {
    console.log('Info: Feed header might already be updated');
}

// 2. Replace renderMobileResultFeed item metadata and classification logic
const oldCardBlock = fs.readFileSync('scratch/old_feed_card.txt', 'utf8');
const newCardBlock = fs.readFileSync('scratch/new_feed_card.txt', 'utf8');

if (code.includes(oldCardBlock)) {
    code = code.replace(oldCardBlock, newCardBlock);
    console.log('✓ 2. Updated renderMobileResultFeed item classification and metadata row');
} else {
    console.error('✗ 2. oldCardBlock not found in code');
}

// 3. Update frameEl.onclick to pass context metadata to preview modal
const oldFrameClick = fs.readFileSync('scratch/old_frame_click.txt', 'utf8');
const newFrameClick = fs.readFileSync('scratch/new_frame_click.txt', 'utf8');

if (code.includes(oldFrameClick)) {
    code = code.replace(oldFrameClick, newFrameClick);
    console.log('✓ 3. Updated frameEl.onclick to pass context metadata to preview modal');
} else {
    console.error('✗ 3. oldFrameClick not found in code');
}

fs.writeFileSync('scratch/build_mobile_workspace.cjs', code, 'utf8');
console.log('Successfully wrote updated scratch/build_mobile_workspace.cjs, length:', code.length);
