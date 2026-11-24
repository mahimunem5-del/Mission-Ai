const fs = require('fs');

let builder = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

// 1. Remove Bottom Sticky Footer (Edit Prompt & Regenerate Bar) & update feed padding to pb-8
const oldScrollFeedAndFooter = `        <!-- C. Scrollable Result Feed -->
        <div id="mobile-result-scroll-feed"
            class="flex-1 min-h-0 overflow-y-auto px-4 py-2 pb-28 space-y-6 ideogram-custom-scroll bg-[#FFFFFF]">
            <!-- Dynamic output items populated via renderMobileResultFeed() -->
        </div>

        <!-- D. Fixed Bottom Quick-Action Bar (Edit Prompt & Regenerate) -->
        <div class="fixed bottom-0 inset-x-0 z-30 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-[#FFFFFF]/95 backdrop-blur-sm border-t border-slate-100/80 flex items-center gap-2.5 select-none md:hidden">
            <!-- Left Button: Edit Prompt -->
            <button type="button" id="mobile-result-edit-prompt-btn"
                class="flex-1 h-11 rounded-xl border border-slate-200/90 bg-[#FFFFFF] hover:bg-slate-50 active:scale-[0.99] font-semibold text-[14px] text-slate-800 transition-all cursor-pointer flex items-center justify-center">
                Edit Prompt
            </button>
            <!-- Right Button: Regenerate -->
            <button type="button" id="mobile-result-regenerate-btn"
                class="flex-1 h-11 rounded-xl bg-[#111827] hover:bg-black font-semibold text-[14px] text-white active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                <span>Regenerate</span>
            </button>
        </div>`;

const newScrollFeed = `        <!-- C. Scrollable Result Feed (pb-8 clean scrolling without sticky footer) -->
        <div id="mobile-result-scroll-feed"
            class="flex-1 min-h-0 overflow-y-auto px-4 py-2 pb-8 space-y-6 ideogram-custom-scroll bg-[#FFFFFF]">
            <!-- Dynamic output items populated via renderMobileResultFeed() -->
        </div>`;

if (builder.includes(oldScrollFeedAndFooter)) {
    console.log('Found oldScrollFeedAndFooter');
} else {
    console.error('NOT found oldScrollFeedAndFooter');
}
