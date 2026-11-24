const fs = require('fs');

let code = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');
console.log('Reading build_mobile_workspace.cjs, current length:', code.length);

// 1. Rename "Count" to "Variations" in Generate Image HTML
if (code.includes('<label class="text-[12px] font-semibold text-slate-800 block mb-1">Count</label>')) {
    code = code.replace(
        '<label class="text-[12px] font-semibold text-slate-800 block mb-1">Count</label>',
        '<label class="text-[12px] font-semibold text-slate-800 block mb-1">Variations</label>'
    );
    console.log('✓ 1. Renamed Count to Variations in Generate Image HTML');
} else {
    console.log('✓ 1. Already renamed Count to Variations');
}

// 2. Add Popover Backdrop inside mobile-workspace-sheet if not already present
if (!code.includes('id="mobile-popover-backdrop"')) {
    const oldSheetStart = `<div id="mobile-workspace-sheet"
            class="w-full max-h-[90dvh] bg-[#FFFFFF] rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-bottom duration-300">`;
    const newSheetStart = `<div id="mobile-workspace-sheet"
            class="w-full max-h-[90dvh] bg-[#FFFFFF] rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-bottom duration-300 relative">
            
            <!-- Transparent Outside-Click Popover Backdrop (z-[75]) -->
            <div id="mobile-popover-backdrop" class="hidden fixed inset-0 z-[75] bg-transparent"></div>`;
    code = code.replace(oldSheetStart, newSheetStart);
    console.log('✓ 2. Added mobile-popover-backdrop in mobile-workspace-sheet');
} else {
    console.log('✓ 2. Popover backdrop already present');
}

// 3a. Update Aspect Ratio popover dropdown classes in Generate Image
const targetRatioClasses = `class="hidden absolute left-0 right-0 bottom-[calc(100%+6px)] z-[80] bg-[#FFFFFF] border border-slate-200/80 rounded-2xl shadow-[0_8px_28px_rgba(15,23,42,0.12)] py-1.5 overflow-hidden max-h-60 overflow-y-auto ideogram-custom-scroll space-y-0.5"`;
code = code.replace(
    /<div id="mobile-gen-ratio-dropdown"\s+class="[^"]*">/,
    `<div id="mobile-gen-ratio-dropdown"\n                                ${targetRatioClasses}>`
);
console.log('✓ 3a. Checked/Updated Aspect Ratio popover dropdown classes');

// 3b. Update Variations popover dropdown classes in Generate Image
code = code.replace(
    /<div id="mobile-gen-count-dropdown"\s+class="[^"]*">/,
    `<div id="mobile-gen-count-dropdown"\n                                ${targetRatioClasses}>`
);
console.log('✓ 3b. Checked/Updated Variations popover dropdown classes');

// 4. Update Remove Background Upload Box: #mobile-remove-bg-dropzone (and support mobile-rembg-dropzone)
const oldRemBgRegex = /<div id="mobile-(?:rembg|remove-bg)-dropzone"[\s\S]*?<\/div>\s*<div id="mobile-rembg-preview-wrap"/;
const newRemBgHtml = `<div id="mobile-remove-bg-dropzone" data-legacy-id="mobile-rembg-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-slate-200/80 bg-[#FFFFFF] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <span class="text-[13.5px] font-medium text-slate-600">Choose a photo to remove background</span>
                            <div class="mt-3 px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-[13px] font-medium text-slate-800 inline-flex items-center gap-1.5 active:scale-95">
                                <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span>Add</span>
                            </div>
                        </div>
                        <div id="mobile-rembg-preview-wrap"`;

if (oldRemBgRegex.test(code)) {
    code = code.replace(oldRemBgRegex, newRemBgHtml);
    console.log('✓ 4. Updated Remove Background Upload Box HTML');
} else {
    console.error('✗ 4. Remove Background Upload Box regex match failed');
}

// 5a. Update Precise Edit Source Box: #mobile-precise-dropzone
const oldPreciseDropzoneRegex = /<div id="mobile-precise-dropzone"[\s\S]*?<\/div>\s*<div id="mobile-precise-preview-wrap"/;
const newPreciseDropzoneHtml = `<div id="mobile-precise-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-slate-200/80 bg-[#FFFFFF] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <span class="text-[13.5px] font-medium text-slate-800">Upload image to edit</span>
                            <div class="mt-3 px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-[13px] font-medium text-slate-800 inline-flex items-center gap-1.5 active:scale-95">
                                <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span>Add</span>
                            </div>
                        </div>
                        <div id="mobile-precise-preview-wrap"`;

if (oldPreciseDropzoneRegex.test(code)) {
    code = code.replace(oldPreciseDropzoneRegex, newPreciseDropzoneHtml);
    console.log('✓ 5a. Updated Precise Edit Source Box HTML');
} else {
    console.error('✗ 5a. Precise Edit Source Box regex match failed');
}

// 5b. Update Precise Edit Reference Slots Row HTML
const oldPreciseRefRegex = /<div id="mobile-precise-ref-slots"[\s\S]*?<\/div>\s*<input type="file" id="mobile-precise-ref-file-input"/;
const newPreciseRefHtml = `<div id="mobile-precise-ref-slots" class="grid grid-cols-5 gap-2 w-full">
                            <!-- Add Slot -->
                            <div id="mobile-precise-ref-add-slot"
                                class="w-full aspect-square rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/70 transition-all cursor-pointer"
                                title="Add reference image">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
                            </div>
                            <!-- Ghost slots -->
                            <div class="w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                            <div class="w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                            <div class="w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                            <div class="w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                        </div>
                        <input type="file" id="mobile-precise-ref-file-input"`;

if (oldPreciseRefRegex.test(code)) {
    code = code.replace(oldPreciseRefRegex, newPreciseRefHtml);
    console.log('✓ 5b. Updated Precise Edit Reference Slots Row HTML');
} else {
    console.error('✗ 5b. Precise Edit Reference Slots Row regex match failed');
}

// 5c. Ensure Quality & Variations dropdowns in Precise Edit have floating popover classes
code = code.replace(
    /<div id="mobile-precise-quality-dropdown"\s+class="[^"]*">/,
    `<div id="mobile-precise-quality-dropdown"\n                                ${targetRatioClasses}>`
);
code = code.replace(
    /<div id="mobile-precise-var-dropdown"\s+class="[^"]*">/,
    `<div id="mobile-precise-var-dropdown"\n                                ${targetRatioClasses}>`
);
console.log('✓ 5c. Checked/Updated Precise Edit Quality & Variations popover classes');

// 6a. Update Upscale Image Upload Box HTML
const oldUpscaleDropRegex = /<div id="mobile-upscale-dropzone"[\s\S]*?<\/div>\s*<div id="mobile-upscale-preview-wrap"/;
const newUpscaleDropHtml = `<div id="mobile-upscale-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-slate-200/80 bg-[#FFFFFF] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <span class="text-[13.5px] font-medium text-slate-600">Choose a photo to upscale</span>
                            <div class="mt-3 px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-[13px] font-medium text-slate-800 inline-flex items-center gap-1.5 active:scale-95">
                                <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span>Add</span>
                            </div>
                        </div>
                        <div id="mobile-upscale-preview-wrap"`;

if (oldUpscaleDropRegex.test(code)) {
    code = code.replace(oldUpscaleDropRegex, newUpscaleDropHtml);
    console.log('✓ 6a. Checked/Updated Upscale Image Upload Box HTML');
} else {
    console.error('✗ 6a. Upscale Image Upload Box regex match failed');
}

// 6b. Check Scale Section HTML
if (code.includes('Upscale factor')) {
    code = code.replace(
        /<div class="space-y-1\.5">\s*<label class="text-\[12px\] font-semibold text-slate-800 block">Upscale factor<\/label>[\s\S]*?<\/div>\s*<\/div>/,
        `<div class="space-y-1.5">
                        <label class="text-[12px] font-semibold text-slate-800 block">Scale</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" id="mobile-upscale-2x-btn"
                                class="py-2.5 px-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold text-[13px] flex items-center justify-center cursor-pointer transition">
                                2x
                            </button>
                            <button type="button" id="mobile-upscale-4x-btn"
                                class="py-2.5 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[13px] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                                4x
                            </button>
                        </div>
                    </div>`
    );
    console.log('✓ 6b. Updated Scale section HTML');
} else {
    console.log('✓ 6b. Scale section HTML already up to date');
}

// 7. Update JS for Remove Bg dropzone to support mobile-remove-bg-dropzone & mobile-rembg-dropzone
code = code.replace(
    /document\.getElementById\('mobile-rembg-dropzone'\)/g,
    "(document.getElementById('mobile-remove-bg-dropzone') || document.getElementById('mobile-rembg-dropzone'))"
);
console.log('✓ 7. Updated JS references to mobile-remove-bg-dropzone');

// 8. Wire Floating Popovers (Ratio & Count in Generate Image)
const ratioWiringRegex = /\/\/\s*14\.\s*(?:Aspect\s+)?Ratio Dropdown[\s\S]*?\/\/\s*16\.\s*Advanced Settings Toggle/;
const newRatioWiringHtml = `// Helper to close all floating mobile popovers
            function closeAllMobilePopovers() {
                ['mobile-gen-ratio-dropdown', 'mobile-gen-count-dropdown', 'mobile-precise-quality-dropdown', 'mobile-precise-var-dropdown'].forEach(id => {
                    document.getElementById(id)?.classList.add('hidden');
                });
                document.getElementById('mobile-popover-backdrop')?.classList.add('hidden');
            }
            window.closeAllMobilePopovers = closeAllMobilePopovers;

            function toggleMobilePopover(dropId, renderFn) {
                const drop = document.getElementById(dropId);
                if (!drop) return;
                const isHidden = drop.classList.contains('hidden');
                closeAllMobilePopovers();
                if (isHidden) {
                    if (typeof renderFn === 'function') renderFn();
                    drop.classList.remove('hidden');
                    document.getElementById('mobile-popover-backdrop')?.classList.remove('hidden');
                }
            }

            // Transparent Popover Backdrop Dismissal
            const popoverBackdrop = document.getElementById('mobile-popover-backdrop');
            if (popoverBackdrop && !popoverBackdrop._inited) {
                popoverBackdrop._inited = true;
                popoverBackdrop.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAllMobilePopovers();
                });
            }

            // Close popovers on drawer scroll
            document.getElementById('mobile-drawer-scroll-body')?.addEventListener('scroll', closeAllMobilePopovers, { passive: true });

            // Render Functions for Floating Popovers
            function renderMobileRatioOptions() {
                const ratioDrop = document.getElementById('mobile-gen-ratio-dropdown');
                if (!ratioDrop) return;
                ratioDrop.innerHTML = '';
                const currentRatio = (typeof imageStudioState !== 'undefined' && imageStudioState.aspectRatio) ? imageStudioState.aspectRatio : '1:1';
                RATIOS.forEach(r => {
                    const isSel = (r.id === currentRatio);
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    // Soft selection state: unselected on #FFFFFF (px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50),
                    // selected has soft subtle tinted highlight (bg-slate-100/80 text-slate-900 font-semibold mx-1.5 rounded-xl px-2.5)
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<div class="w-5 h-5 flex items-center justify-center shrink-0"><div class="' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0"></div></div><span class="text-[13.5px]">' + r.label + '</span>';
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.aspectRatio = r.id;
                        const label = document.getElementById('mobile-gen-ratio-label');
                        if (label) label.textContent = r.label;
                        const icon = document.getElementById('mobile-gen-ratio-icon');
                        if (icon) icon.innerHTML = '<div class="' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0"></div>';
                        if (typeof syncStudioRatioDropdown === 'function') syncStudioRatioDropdown(r.id);
                        closeAllMobilePopovers();
                    };
                    ratioDrop.appendChild(opt);
                });
            }

            function renderMobileCountOptions() {
                const countDrop = document.getElementById('mobile-gen-count-dropdown');
                if (!countDrop) return;
                countDrop.innerHTML = '';
                const currentCount = (typeof imageStudioState !== 'undefined' && imageStudioState.imageCount) ? imageStudioState.imageCount : 1;
                [1, 2, 3, 4].forEach(c => {
                    const isSel = (c === currentCount);
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center justify-between px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center justify-between px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span class="text-[13.5px]">' + c + '</span>';
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.imageCount = c;
                        const label = document.getElementById('mobile-gen-count-label');
                        if (label) label.textContent = String(c);
                        if (typeof syncStudioCountDropdown === 'function') syncStudioCountDropdown(c);
                        closeAllMobilePopovers();
                    };
                    countDrop.appendChild(opt);
                });
            }

            // 14. Ratio Popover Wiring
            const ratioBtn = document.getElementById('mobile-gen-ratio-btn');
            if (ratioBtn && !ratioBtn._inited) {
                ratioBtn._inited = true;
                ratioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-gen-ratio-dropdown', renderMobileRatioOptions);
                });
            }

            // 15. Variations Popover Wiring in Generate Image
            const countBtn = document.getElementById('mobile-gen-count-btn');
            if (countBtn && !countBtn._inited) {
                countBtn._inited = true;
                countBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-gen-count-dropdown', renderMobileCountOptions);
                });
            }

            // 16. Advanced Settings Toggle`;

if (ratioWiringRegex.test(code)) {
    code = code.replace(ratioWiringRegex, newRatioWiringHtml);
    console.log('✓ 8. Replaced Ratio & Count dropdown JS with Floating Popover logic');
} else {
    console.error('✗ 8. Ratio & Count dropdown JS regex match failed');
}

// 9. Update Upscale 2x / 4x Click Handlers
const upscaleBtnsRegex = /\/\/\s*19\.\s*Upscale Scale Buttons[\s\S]*?\/\/\s*20\.\s*Sync State on Init/;
const newUpscaleBtnsHtml = `// 19. Upscale Scale Buttons (Soft-Tinted 2x / 4x Pills)
            const btn2x = document.getElementById('mobile-upscale-2x-btn');
            const btn4x = document.getElementById('mobile-upscale-4x-btn');
            if (btn2x && btn4x && !btn2x._inited) {
                btn2x._inited = true;
                btn2x.onclick = () => {
                    window.upscaleScaleFactor = 2;
                    btn2x.className = 'py-2.5 px-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold text-[13px] flex items-center justify-center cursor-pointer transition';
                    btn4x.className = 'py-2.5 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[13px] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition';
                    document.getElementById('upscale-scale-2x-btn')?.click();
                };
                btn4x.onclick = () => {
                    window.upscaleScaleFactor = 4;
                    btn4x.className = 'py-2.5 px-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold text-[13px] flex items-center justify-center cursor-pointer transition';
                    btn2x.className = 'py-2.5 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[13px] flex items-center justify-center cursor-pointer hover:bg-slate-50 transition';
                    document.getElementById('upscale-scale-4x-btn')?.click();
                };
            }

            // 20. Sync State on Init`;

if (upscaleBtnsRegex.test(code)) {
    code = code.replace(upscaleBtnsRegex, newUpscaleBtnsHtml);
    console.log('✓ 9. Updated Upscale 2x / 4x click handlers in JS');
} else {
    console.error('✗ 9. Upscale 2x / 4x wiring regex match failed');
}

fs.writeFileSync('scratch/build_mobile_workspace.cjs', code, 'utf8');
console.log('Successfully wrote updated scratch/build_mobile_workspace.cjs, final length:', code.length);
