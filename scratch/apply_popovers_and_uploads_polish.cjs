const fs = require('fs');

let code = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');
console.log('Original build_mobile_workspace.cjs length:', code.length);

// --------------------------------------------------------------------------
// 1. Rename "Count" to "Variations" in Generate Image HTML
// --------------------------------------------------------------------------
const oldCountLabel = `                        <!-- Image Count -->
                        <div class="relative">
                            <label class="text-[12px] font-semibold text-slate-800 block mb-1">Count</label>`;

const newCountLabel = `                        <!-- Variations -->
                        <div class="relative">
                            <label class="text-[12px] font-semibold text-slate-800 block mb-1">Variations</label>`;

if (code.includes(oldCountLabel)) {
    code = code.replace(oldCountLabel, newCountLabel);
    console.log('✓ 1. Renamed Count to Variations in Generate Image HTML');
} else {
    console.error('✗ 1. Count label not found');
}

// --------------------------------------------------------------------------
// 2. Add Popover Backdrop inside mobile-workspace-sheet
// --------------------------------------------------------------------------
const oldSheetStart = `<div id="mobile-workspace-sheet"
            class="w-full max-h-[90dvh] bg-[#FFFFFF] rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-bottom duration-300">`;

const newSheetStart = `<div id="mobile-workspace-sheet"
            class="w-full max-h-[90dvh] bg-[#FFFFFF] rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-bottom duration-300 relative">
            
            <!-- Transparent Outside-Click Popover Backdrop (z-[75]) -->
            <div id="mobile-popover-backdrop" class="hidden fixed inset-0 z-[75] bg-transparent"></div>`;

if (code.includes(oldSheetStart)) {
    code = code.replace(oldSheetStart, newSheetStart);
    console.log('✓ 2. Added mobile-popover-backdrop in mobile-workspace-sheet');
} else {
    console.error('✗ 2. Sheet start not found');
}

// --------------------------------------------------------------------------
// 3. Update Dropdown Classes for Aspect Ratio & Variations in Generate Image
// --------------------------------------------------------------------------
const oldRatioDrop = `                            <div id="mobile-gen-ratio-dropdown"
                                class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 max-h-56 overflow-y-auto ideogram-custom-scroll space-y-0.5">
                            </div>`;

const newRatioDrop = `                            <div id="mobile-gen-ratio-dropdown"
                                class="hidden absolute left-0 right-0 bottom-[calc(100%+6px)] z-[80] bg-[#FFFFFF] border border-slate-200/80 rounded-2xl shadow-[0_8px_28px_rgba(15,23,42,0.12)] py-1.5 overflow-hidden max-h-60 overflow-y-auto ideogram-custom-scroll space-y-0.5">
                            </div>`;

if (code.includes(oldRatioDrop)) {
    code = code.replace(oldRatioDrop, newRatioDrop);
    console.log('✓ 3a. Updated Aspect Ratio popover dropdown classes');
} else {
    console.error('✗ 3a. Aspect Ratio dropdown classes not found');
}

const oldCountDrop = `                            <div id="mobile-gen-count-dropdown"
                                class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 space-y-0.5">
                            </div>`;

const newCountDrop = `                            <div id="mobile-gen-count-dropdown"
                                class="hidden absolute left-0 right-0 bottom-[calc(100%+6px)] z-[80] bg-[#FFFFFF] border border-slate-200/80 rounded-2xl shadow-[0_8px_28px_rgba(15,23,42,0.12)] py-1.5 overflow-hidden max-h-60 overflow-y-auto ideogram-custom-scroll space-y-0.5">
                            </div>`;

if (code.includes(oldCountDrop)) {
    code = code.replace(oldCountDrop, newCountDrop);
    console.log('✓ 3b. Updated Variations popover dropdown classes in Generate Image');
} else {
    console.error('✗ 3b. Count dropdown classes not found');
}

// --------------------------------------------------------------------------
// 4. Update Remove Background Upload Box
// --------------------------------------------------------------------------
const oldRemBgDropzone = `                        <div id="mobile-remove-bg-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <div class="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center mb-2.5 text-slate-600">
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <span class="text-[13.5px] font-medium text-slate-800">Choose a photo to remove background</span>
                            <span class="text-[12px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 20MB</span>
                        </div>`;

const newRemBgDropzone = `                        <div id="mobile-remove-bg-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-slate-200/80 bg-[#FFFFFF] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <span class="text-[13.5px] font-medium text-slate-600">Choose a photo to remove background</span>
                            <div class="mt-3 px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-[13px] font-medium text-slate-800 inline-flex items-center gap-1.5 active:scale-95">
                                <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span>Add</span>
                            </div>
                        </div>`;

if (code.includes(oldRemBgDropzone)) {
    code = code.replace(oldRemBgDropzone, newRemBgDropzone);
    console.log('✓ 4. Updated Remove Background Upload Box');
} else {
    console.error('✗ 4. Remove Background Upload Box not found');
}

// --------------------------------------------------------------------------
// 5. Update Precise Edit Source Box & Multi-Slot Reference Images & Dropdowns
// --------------------------------------------------------------------------
const oldPreciseDropzone = `                        <div id="mobile-precise-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <div class="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center mb-2.5 text-slate-600">
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <span class="text-[13.5px] font-medium text-slate-800">Upload image to edit</span>
                            <span class="text-[12px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 20MB</span>
                        </div>`;

const newPreciseDropzone = `                        <div id="mobile-precise-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-slate-200/80 bg-[#FFFFFF] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <span class="text-[13.5px] font-medium text-slate-800">Upload image to edit</span>
                        </div>`;

if (code.includes(oldPreciseDropzone)) {
    code = code.replace(oldPreciseDropzone, newPreciseDropzone);
    console.log('✓ 5a. Updated Precise Edit Source Box');
} else {
    console.error('✗ 5a. Precise Edit Source Box not found');
}

const oldPreciseRefSlots = `                        <div id="mobile-precise-ref-slots" class="flex gap-2">
                            <div id="mobile-precise-ref-add-slot"
                                class="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/60 transition-all cursor-pointer"
                                title="Add reference image">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
                            </div>
                        </div>`;

const newPreciseRefSlots = `                        <div id="mobile-precise-ref-slots" class="grid grid-cols-5 gap-2 w-full">
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
                        </div>`;

if (code.includes(oldPreciseRefSlots)) {
    code = code.replace(oldPreciseRefSlots, newPreciseRefSlots);
    console.log('✓ 5b. Updated Precise Edit Reference Slots Row to 5-slot Grid');
} else {
    console.error('✗ 5b. Precise Edit Reference Slots Row not found');
}

// Also update Generate Image ref slots to use rounded-2xl for consistency
const oldGenRefSlots = `<div id="mobile-gen-ref-slots" class="grid grid-cols-5 gap-2 w-full">
                            <!-- Add Slot -->
                            <div id="mobile-gen-ref-add-slot"
                                class="w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/60 transition-all cursor-pointer"
                                title="Add reference image">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
                            </div>
                            <!-- Ghost slots -->
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-xl border border-dashed border-slate-200 bg-transparent"></div>
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-xl border border-dashed border-slate-200 bg-transparent"></div>
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-xl border border-dashed border-slate-200 bg-transparent"></div>
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-xl border border-dashed border-slate-200 bg-transparent"></div>
                        </div>`;

const newGenRefSlots = `<div id="mobile-gen-ref-slots" class="grid grid-cols-5 gap-2 w-full">
                            <!-- Add Slot -->
                            <div id="mobile-gen-ref-add-slot"
                                class="w-full aspect-square rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/70 transition-all cursor-pointer"
                                title="Add reference image">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>
                            </div>
                            <!-- Ghost slots -->
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                            <div class="mobile-gen-ref-ghost w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]"></div>
                        </div>`;

if (code.includes(oldGenRefSlots)) {
    code = code.replace(oldGenRefSlots, newGenRefSlots);
    console.log('✓ 5c. Updated Generate Image Reference Slots to rounded-2xl and bg-[#FFFFFF]');
} else {
    console.log('Info: Gen ref slots already updated or different snippet');
}

const oldQualityDrop = `                            <div id="mobile-precise-quality-dropdown"
                                class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 space-y-0.5">
                            </div>`;

const newQualityDrop = `                            <div id="mobile-precise-quality-dropdown"
                                class="hidden absolute left-0 right-0 bottom-[calc(100%+6px)] z-[80] bg-[#FFFFFF] border border-slate-200/80 rounded-2xl shadow-[0_8px_28px_rgba(15,23,42,0.12)] py-1.5 overflow-hidden max-h-60 overflow-y-auto ideogram-custom-scroll space-y-0.5">
                            </div>`;

if (code.includes(oldQualityDrop)) {
    code = code.replace(oldQualityDrop, newQualityDrop);
    console.log('✓ 5d. Updated Precise Edit Quality popover dropdown classes');
} else {
    console.error('✗ 5d. Precise Edit Quality dropdown not found');
}

const oldPreciseVarDrop = `                            <div id="mobile-precise-var-dropdown"
                                class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 space-y-0.5">
                            </div>`;

const newPreciseVarDrop = `                            <div id="mobile-precise-var-dropdown"
                                class="hidden absolute left-0 right-0 bottom-[calc(100%+6px)] z-[80] bg-[#FFFFFF] border border-slate-200/80 rounded-2xl shadow-[0_8px_28px_rgba(15,23,42,0.12)] py-1.5 overflow-hidden max-h-60 overflow-y-auto ideogram-custom-scroll space-y-0.5">
                            </div>`;

if (code.includes(oldPreciseVarDrop)) {
    code = code.replace(oldPreciseVarDrop, newPreciseVarDrop);
    console.log('✓ 5e. Updated Precise Edit Variations popover dropdown classes');
} else {
    console.error('✗ 5e. Precise Edit Variations dropdown not found');
}

// --------------------------------------------------------------------------
// 6. Update Upscale Image Upload Box & Scale Options
// --------------------------------------------------------------------------
const oldUpscaleDropzone = `                        <div id="mobile-upscale-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <div class="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center mb-2.5 text-slate-600">
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            </div>
                            <span class="text-[13.5px] font-medium text-slate-800">Choose a photo to upscale</span>
                            <span class="text-[12px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 20MB</span>
                        </div>`;

const newUpscaleDropzone = `                        <div id="mobile-upscale-dropzone"
                            class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-slate-200/80 bg-[#FFFFFF] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                            <span class="text-[13.5px] font-medium text-slate-600">Choose a photo to upscale</span>
                            <div class="mt-3 px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-[13px] font-medium text-slate-800 inline-flex items-center gap-1.5 active:scale-95">
                                <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span>Add</span>
                            </div>
                        </div>`;

if (code.includes(oldUpscaleDropzone)) {
    code = code.replace(oldUpscaleDropzone, newUpscaleDropzone);
    console.log('✓ 6a. Updated Upscale Image Upload Box');
} else {
    console.error('✗ 6a. Upscale Image Upload Box not found');
}

const oldScaleSection = `                    <!-- Factor -->
                    <div class="space-y-1.5">
                        <label class="text-[12px] font-semibold text-slate-800 block">Upscale factor</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" id="mobile-upscale-2x-btn"
                                class="py-2.5 px-3 rounded-xl border border-slate-900 bg-slate-900 text-white text-[13px] font-medium flex items-center justify-center cursor-pointer transition">
                                2x (Fast)
                            </button>
                            <button type="button" id="mobile-upscale-4x-btn"
                                class="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-medium flex items-center justify-center cursor-pointer hover:border-slate-300 transition">
                                4x (Ultra HD)
                            </button>
                        </div>
                    </div>`;

const newScaleSection = `                    <!-- Scale -->
                    <div class="space-y-1.5">
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
                    </div>`;

if (code.includes(oldScaleSection)) {
    code = code.replace(oldScaleSection, newScaleSection);
    console.log('✓ 6b. Updated Scale label and 2x / 4x buttons HTML');
} else {
    console.error('✗ 6b. Scale section not found');
}

// --------------------------------------------------------------------------
// 7. Update JavaScript for Reference Slots (Precise & Gen)
// --------------------------------------------------------------------------
const oldGenRefJs = `            if (refs.length < 10) {
                const addSlot = document.createElement('div');
                addSlot.className = 'w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/60 transition-all cursor-pointer';
                addSlot.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>';
                addSlot.onclick = () => document.getElementById('mobile-gen-ref-file-input')?.click();
                container.appendChild(addSlot);
            }

            const totalSlots = container.children.length;
            const ghostNeeded = Math.max(0, 5 - (totalSlots % 5));
            if (ghostNeeded > 0 && ghostNeeded < 5) {
                for (let i = 0; i < ghostNeeded; i++) {
                    const ghost = document.createElement('div');
                    ghost.className = 'w-full aspect-square rounded-xl border border-dashed border-slate-200 bg-transparent';
                    container.appendChild(ghost);
                }
            }`;

const newGenRefJs = `            if (refs.length < 10) {
                const addSlot = document.createElement('div');
                addSlot.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/70 transition-all cursor-pointer';
                addSlot.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>';
                addSlot.onclick = () => document.getElementById('mobile-gen-ref-file-input')?.click();
                container.appendChild(addSlot);
            }

            const totalSlots = container.children.length;
            const ghostNeeded = Math.max(0, 5 - (totalSlots % 5));
            if (ghostNeeded > 0 && ghostNeeded < 5) {
                for (let i = 0; i < ghostNeeded; i++) {
                    const ghost = document.createElement('div');
                    ghost.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]';
                    container.appendChild(ghost);
                }
            }`;

if (code.includes(oldGenRefJs)) {
    code = code.replace(oldGenRefJs, newGenRefJs);
    console.log('✓ 7a. Updated renderMobileGenRefSlots JS with rounded-2xl and bg-[#FFFFFF]');
} else {
    console.log('Info: renderMobileGenRefSlots JS already updated or different snippet');
}

const oldPreciseRefJs = `            if (refs.length < 10) {
                const addSlot = document.createElement('div');
                addSlot.className = 'w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/60 transition-all cursor-pointer';
                addSlot.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>';
                addSlot.onclick = () => document.getElementById('mobile-precise-ref-file-input')?.click();
                container.appendChild(addSlot);
            }`;

const newPreciseRefJs = `            if (refs.length < 10) {
                const addSlot = document.createElement('div');
                addSlot.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-slate-50/70 transition-all cursor-pointer';
                addSlot.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7h14"/></svg>';
                addSlot.onclick = () => document.getElementById('mobile-precise-ref-file-input')?.click();
                container.appendChild(addSlot);
            }

            const totalSlots = container.children.length;
            const ghostNeeded = Math.max(0, 5 - (totalSlots % 5));
            if (ghostNeeded > 0 && ghostNeeded < 5) {
                for (let i = 0; i < ghostNeeded; i++) {
                    const ghost = document.createElement('div');
                    ghost.className = 'w-full aspect-square rounded-2xl border border-dashed border-slate-200/70 bg-[#FFFFFF]';
                    container.appendChild(ghost);
                }
            }`;

if (code.includes(oldPreciseRefJs)) {
    code = code.replace(oldPreciseRefJs, newPreciseRefJs);
    console.log('✓ 7b. Updated renderMobilePreciseRefSlots JS with ghost slots');
} else {
    console.error('✗ 7b. renderMobilePreciseRefSlots JS not found');
}

// --------------------------------------------------------------------------
// 8. Update JavaScript for Floating Popovers (Generate & Precise Edit)
// --------------------------------------------------------------------------
const oldRatioWiring = `            // 14. Ratio Dropdown
            const ratioBtn = document.getElementById('mobile-gen-ratio-btn');
            const ratioDrop = document.getElementById('mobile-gen-ratio-dropdown');
            if (ratioBtn && ratioDrop && !ratioBtn._inited) {
                ratioBtn._inited = true;
                RATIOS.forEach(r => {
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = 'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-800 text-[12.5px] font-normal cursor-pointer transition-colors text-left';
                    opt.innerHTML = \`
                        <div class="w-5 h-5 flex items-center justify-center shrink-0">
                            <div class="\${r.wireframe} border-[1.5px] border-current rounded-[2px] shrink-0"></div>
                        </div>
                        <span>\${r.label}</span>
                    \`;
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.aspectRatio = r.id;
                        const label = document.getElementById('mobile-gen-ratio-label');
                        if (label) label.textContent = r.label;
                        const icon = document.getElementById('mobile-gen-ratio-icon');
                        if (icon) icon.innerHTML = '<div class="' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0"></div>';
                        if (typeof syncStudioRatioDropdown === 'function') syncStudioRatioDropdown(r.id);
                        ratioDrop.classList.add('hidden');
                    };
                    ratioDrop.appendChild(opt);
                });

                ratioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    ratioDrop.classList.toggle('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (!ratioDrop.contains(e.target) && !ratioBtn.contains(e.target)) {
                        ratioDrop.classList.add('hidden');
                    }
                });
            }

            // 15. Count Dropdown
            const countBtn = document.getElementById('mobile-gen-count-btn');
            const countDrop = document.getElementById('mobile-gen-count-dropdown');
            if (countBtn && countDrop && !countBtn._inited) {
                countBtn._inited = true;
                [1, 2, 3, 4].forEach(c => {
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = 'w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-800 text-[12.5px] font-normal cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span>' + c + '</span>';
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.imageCount = c;
                        const label = document.getElementById('mobile-gen-count-label');
                        if (label) label.textContent = String(c);
                        if (typeof syncStudioCountDropdown === 'function') syncStudioCountDropdown(c);
                        countDrop.classList.add('hidden');
                    };
                    countDrop.appendChild(opt);
                });

                countBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    countDrop.classList.toggle('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (!countDrop.contains(e.target) && !countBtn.contains(e.target)) {
                        countDrop.classList.add('hidden');
                    }
                });
            }`;

const newRatioWiring = `            // Helper to close all floating mobile popovers
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
                    opt.innerHTML = '<div class=\"w-5 h-5 flex items-center justify-center shrink-0\"><div class=\"' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0\"></div></div><span class=\"text-[13.5px]\">' + r.label + '</span>';
                    opt.onclick = () => {
                        if (typeof imageStudioState !== 'undefined') imageStudioState.aspectRatio = r.id;
                        const label = document.getElementById('mobile-gen-ratio-label');
                        if (label) label.textContent = r.label;
                        const icon = document.getElementById('mobile-gen-ratio-icon');
                        if (icon) icon.innerHTML = '<div class=\"' + r.wireframe + ' border-[1.5px] border-current rounded-[2px] shrink-0\"></div>';
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
                    opt.innerHTML = '<span class=\"text-[13.5px]\">' + c + '</span>';
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
            }`;

if (code.includes(oldRatioWiring)) {
    code = code.replace(oldRatioWiring, newRatioWiring);
    console.log('✓ 8a. Updated Ratio & Count popover wiring in Generate Image');
} else {
    console.error('✗ 8a. Ratio & Count wiring not found');
}

const oldPreciseWiring = `            // 17. Quality Dropdown in Precise Edit
            const qualityBtn = document.getElementById('mobile-precise-quality-btn');
            const qualityDrop = document.getElementById('mobile-precise-quality-dropdown');
            if (qualityBtn && qualityDrop && !qualityBtn._inited) {
                qualityBtn._inited = true;
                ['Low', 'Medium', 'High'].forEach(q => {
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = 'w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-800 text-[12.5px] font-normal cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span>' + q + '</span>';
                    opt.onclick = () => {
                        if (typeof studioPreciseEditState !== 'undefined') {
                            studioPreciseEditState.quality = q;
                            studioPreciseEditState.editWeight = q;
                        }
                        const label = document.getElementById('mobile-precise-quality-label');
                        if (label) label.textContent = q;
                        qualityDrop.classList.add('hidden');
                    };
                    qualityDrop.appendChild(opt);
                });

                qualityBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    qualityDrop.classList.toggle('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (!qualityDrop.contains(e.target) && !qualityBtn.contains(e.target)) {
                        qualityDrop.classList.add('hidden');
                    }
                });
            }

            // 18. Variations Dropdown in Precise Edit
            const varBtn = document.getElementById('mobile-precise-var-btn');
            const varDrop = document.getElementById('mobile-precise-var-dropdown');
            if (varBtn && varDrop && !varBtn._inited) {
                varBtn._inited = true;
                [1, 2, 3, 4].forEach(v => {
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = 'w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-800 text-[12.5px] font-normal cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span>' + v + '</span>';
                    opt.onclick = () => {
                        if (typeof studioPreciseEditState !== 'undefined') studioPreciseEditState.variationCount = v;
                        const label = document.getElementById('mobile-precise-var-label');
                        if (label) label.textContent = String(v);
                        varDrop.classList.add('hidden');
                    };
                    varDrop.appendChild(opt);
                });

                varBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    varDrop.classList.toggle('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (!varDrop.contains(e.target) && !varBtn.contains(e.target)) {
                        varDrop.classList.add('hidden');
                    }
                });
            }`;

const newPreciseWiring = `            function renderMobileQualityOptions() {
                const qualityDrop = document.getElementById('mobile-precise-quality-dropdown');
                if (!qualityDrop) return;
                qualityDrop.innerHTML = '';
                const currentQuality = (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState.quality) ? studioPreciseEditState.quality : 'High';
                ['Low', 'Medium', 'High'].forEach(q => {
                    const isSel = (q.toLowerCase() === currentQuality.toLowerCase());
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center justify-between px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center justify-between px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span class=\"text-[13.5px]\">' + q + '</span>';
                    opt.onclick = () => {
                        if (typeof studioPreciseEditState !== 'undefined') {
                            studioPreciseEditState.quality = q;
                            studioPreciseEditState.editWeight = q;
                        }
                        const label = document.getElementById('mobile-precise-quality-label');
                        if (label) label.textContent = q;
                        closeAllMobilePopovers();
                    };
                    qualityDrop.appendChild(opt);
                });
            }

            function renderMobilePreciseVarOptions() {
                const varDrop = document.getElementById('mobile-precise-var-dropdown');
                if (!varDrop) return;
                varDrop.innerHTML = '';
                const currentVar = (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState.variationCount) ? studioPreciseEditState.variationCount : 1;
                [1, 2, 3, 4].forEach(v => {
                    const isSel = (v === currentVar);
                    const opt = document.createElement('button');
                    opt.type = 'button';
                    opt.className = isSel
                        ? 'w-[calc(100%-12px)] mx-1.5 flex items-center justify-between px-2.5 py-2.5 rounded-xl bg-slate-100/80 text-slate-900 font-semibold cursor-pointer transition-colors text-left'
                        : 'w-full flex items-center justify-between px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors text-left';
                    opt.innerHTML = '<span class=\"text-[13.5px]\">' + v + '</span>';
                    opt.onclick = () => {
                        if (typeof studioPreciseEditState !== 'undefined') studioPreciseEditState.variationCount = v;
                        const label = document.getElementById('mobile-precise-var-label');
                        if (label) label.textContent = String(v);
                        closeAllMobilePopovers();
                    };
                    varDrop.appendChild(opt);
                });
            }

            // 17. Quality Popover Wiring in Precise Edit
            const qualityBtn = document.getElementById('mobile-precise-quality-btn');
            if (qualityBtn && !qualityBtn._inited) {
                qualityBtn._inited = true;
                qualityBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-precise-quality-dropdown', renderMobileQualityOptions);
                });
            }

            // 18. Variations Popover Wiring in Precise Edit
            const varBtn = document.getElementById('mobile-precise-var-btn');
            if (varBtn && !varBtn._inited) {
                varBtn._inited = true;
                varBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobilePopover('mobile-precise-var-dropdown', renderMobilePreciseVarOptions);
                });
            }`;

if (code.includes(oldPreciseWiring)) {
    code = code.replace(oldPreciseWiring, newPreciseWiring);
    console.log('✓ 8b. Updated Precise Edit Quality & Variations popover wiring');
} else {
    console.error('✗ 8b. Precise Edit wiring not found');
}

// --------------------------------------------------------------------------
// 9. Update Upscale 2x / 4x Click Handlers
// --------------------------------------------------------------------------
const oldUpscaleBtnsJs = `            // 20. Upscale Scale Factor Buttons
            const btn2x = document.getElementById('mobile-upscale-2x-btn');
            const btn4x = document.getElementById('mobile-upscale-4x-btn');
            if (btn2x && btn4x && !btn2x._inited) {
                btn2x._inited = true;
                btn2x.onclick = () => {
                    window.upscaleScaleFactor = 2;
                    btn2x.className = 'py-2.5 px-3 rounded-xl border border-slate-900 bg-slate-900 text-white text-[13px] font-medium flex items-center justify-center cursor-pointer transition';
                    btn4x.className = 'py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-medium flex items-center justify-center cursor-pointer hover:border-slate-300 transition';
                    document.getElementById('upscale-scale-2x-btn')?.click();
                };
                btn4x.onclick = () => {
                    window.upscaleScaleFactor = 4;
                    btn4x.className = 'py-2.5 px-3 rounded-xl border border-slate-900 bg-slate-900 text-white text-[13px] font-medium flex items-center justify-center cursor-pointer transition';
                    btn2x.className = 'py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-medium flex items-center justify-center cursor-pointer hover:border-slate-300 transition';
                    document.getElementById('upscale-scale-4x-btn')?.click();
                };
            }`;

const newUpscaleBtnsJs = `            // 20. Upscale Scale Factor Buttons (Soft-Tinted 2x / 4x Pills)
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
            }`;

if (code.includes(oldUpscaleBtnsJs)) {
    code = code.replace(oldUpscaleBtnsJs, newUpscaleBtnsJs);
    console.log('✓ 9. Updated Upscale 2x / 4x click handlers in JS');
} else {
    console.error('✗ 9. Upscale 2x / 4x wiring not found');
}

// --------------------------------------------------------------------------
// 10. Update setIsMobileDrawerOpen to close popovers on drawer open/close
// --------------------------------------------------------------------------
const oldSetDrawerOpen = `        function setIsMobileDrawerOpen(isOpen) {
            window.isMobileDrawerOpen = Boolean(isOpen);
            const drawer = document.getElementById('mobile-workspace-drawer');
            if (!drawer) return;
            if (isOpen) {
                // Ensure model drawer is closed when opening workspace drawer
                setIsMobileModelDrawerOpen(false);
                drawer.classList.remove('hidden');
                syncControlsFromState();
            } else {
                drawer.classList.add('hidden');
            }
        }`;

const newSetDrawerOpen = `        function setIsMobileDrawerOpen(isOpen) {
            window.isMobileDrawerOpen = Boolean(isOpen);
            if (typeof closeAllMobilePopovers === 'function') closeAllMobilePopovers();
            const drawer = document.getElementById('mobile-workspace-drawer');
            if (!drawer) return;
            if (isOpen) {
                // Ensure model drawer is closed when opening workspace drawer
                setIsMobileModelDrawerOpen(false);
                drawer.classList.remove('hidden');
                syncControlsFromState();
            } else {
                drawer.classList.add('hidden');
            }
        }`;

if (code.includes(oldSetDrawerOpen)) {
    code = code.replace(oldSetDrawerOpen, newSetDrawerOpen);
    console.log('✓ 10. Updated setIsMobileDrawerOpen to close popovers');
} else {
    console.error('✗ 10. setIsMobileDrawerOpen not found');
}

fs.writeFileSync('scratch/build_mobile_workspace.cjs', code, 'utf8');
console.log('Successfully wrote updated scratch/build_mobile_workspace.cjs, new length:', code.length);
