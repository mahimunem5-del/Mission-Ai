const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function check(str, label) {
  if (html.includes(str)) {
    console.log(`[PASS] ${label}`);
  } else {
    console.error(`[FAIL] ${label}`);
    console.log('Search was:', str.substring(0, 80));
  }
}

// 1. Ref gen
check(`<div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Reference
                                    images</label>
                                <span id="ideogram-ref-status" class="text-[11px] text-slate-400 font-mono">0/10</span>
                            </div>`, 'Ref gen');

// 2. Ref precise
check(`<div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Reference
                                    images</label>
                                <span id="studio-precise-edit-ref-status"
                                    class="text-[11px] text-slate-400 font-mono">0/10</span>
                            </div>`, 'Ref precise');

// 3. Dropdown options in studio-model-dropdown
check('studio-model-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-white/10 text-neutral-900 dark:text-white text-[12.5px] font-normal cursor-pointer transition-colors group text-left', 'Auto model option');

// 4. In-progress HTML
check('id="ideogram-in-progress-card"', 'In-progress HTML card');

// 5. In-progress JS: remove bg
check('placeholderGroup.id = \'remove-bg-in-progress-card\';', 'Remove BG in-progress JS');

// 6. In-progress JS: upscale
check('placeholderGroup.id = \'upscale-in-progress-card\';', 'Upscale in-progress JS');

// 7. In-progress JS: precise edit
check('placeholderGroup.id = \'precise-edit-in-progress-card\';', 'Precise edit in-progress JS');

// 8. Gallery JS headers
check('const headerContentHtml = isRemoveBg ?', 'Gallery JS isRemoveBg');
check('` : (isPreciseEdit || isSmartEdit) ? `', 'Gallery JS isPreciseEdit');
check('<!-- Line 1: Metadata Row: Generate Image • [Model Icon] [Model Name] • [Relative Time] -->', 'Gallery JS Generate Image');

// 9. Aspect ratio pill
check('${isVectorCard ? \'SVG\' : (isRemoveBg ? \'PNG\' : escapeHtml(group.aspectRatio))}', 'Aspect ratio pill');
