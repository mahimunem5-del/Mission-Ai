const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  // 1. Hero Headline
  {
    name: 'Hero "Imagine it." styling',
    pass: html.includes(`font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-bold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>`)
  },
  {
    name: 'Hero "Craft it." styling (Plus Jakarta Sans ExtraBold + gradient)',
    pass: html.includes(`font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-extrabold tracking-[-0.035em] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent ml-2">Craft it.</span>`)
  },
  {
    name: 'Zero Instrument_Serif on "Craft it."',
    pass: !html.includes(`Instrument_Serif',serif] italic font-normal text-[34px] sm:text-[38px] tracking-[-0.01em] bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent ml-1.5">Craft it.`)
  },
  {
    name: 'Google Fonts includes 800 weight for Plus Jakarta Sans',
    pass: html.includes('Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap')
  },

  // 2. Base Workspace font-family
  {
    name: 'image-studio-workspace font-family',
    pass: html.includes(`id="image-studio-workspace"\n            class="hidden flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden min-w-0 bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-['Plus_Jakarta_Sans',sans-serif]">`)
  },
  {
    name: 'ideogram-left-panel font-family',
    pass: html.includes(`id="ideogram-left-panel"\n                class="w-full md:w-[380px] shrink-0 h-full flex flex-col bg-white dark:bg-[#191919] z-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"`)
  },
  {
    name: 'ideogram-right-panel font-family',
    pass: html.includes(`id="ideogram-right-panel"\n                class="flex-1 w-full h-full min-w-0 flex flex-col bg-white dark:bg-[#191919] overflow-hidden relative font-['Plus_Jakarta_Sans',sans-serif]">`)
  },

  // 3. Workspace Switcher Header & Clear all
  {
    name: 'Workspace Switcher Header text-[15.5px] font-semibold tracking-[-0.015em]',
    pass: html.includes(`id="workspace-tool-switcher-btn"\n                                class="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2 py-1.5 rounded-lg transition cursor-pointer select-none">`)
  },
  {
    name: 'Clear all action link text-[12.5px] font-medium text-neutral-500 hover:text-neutral-900',
    pass: html.includes(`id="ideogram-reset-composer-btn"\n                            class="text-[12.5px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"`)
  },

  // 4. Section & Field Labels across all 4 workspaces
  {
    name: 'Model label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Model</label>`)
  },
  {
    name: 'Reference images label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Reference images</label>`)
  },
  {
    name: 'Style Presets label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Style Presets</label>`)
  },
  {
    name: 'Prompt label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Prompt</label>`)
  },
  {
    name: 'Remove BG Source image label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">Source image</label>`)
  },
  {
    name: 'Precise Edit Source image label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`studio-precise-edit-file-input"`) && html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">Source image</label>`)
  },
  {
    name: 'Precise Edit What should change? label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label for="studio-precise-edit-input"\n                                class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">What should change?</label>`)
  },
  {
    name: 'Upscale Target Scale label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Target Scale</label>`)
  },
  {
    name: 'Precise Edit Quality label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label\n                                    class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">Quality</label>`)
  },
  {
    name: 'Precise Edit Variations label: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<label\n                                    class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">Variations</label>`)
  },
  {
    name: 'Advanced settings toggle: text-[13px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`<span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Advanced settings</span>`)
  },

  // 5. Helper Counters & Upload hints
  {
    name: 'Reference images counter: text-[12.5px] font-normal text-neutral-500',
    pass: html.includes(`id="ideogram-ref-status" class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">0/10</span>`)
  },
  {
    name: 'Remove BG upload hint: text-[12.5px] font-normal text-neutral-500',
    pass: html.includes(`<span class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">Upload or choose an image</span>`)
  },

  // 6. Dropdowns, Preset Pills & Scale buttons
  {
    name: 'Model button label: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="studio-model-btn" type="button"\n                                    class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Ratio button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="studio-ratio-btn" type="button"\n                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Count button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="studio-count-btn" type="button"\n                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Style Preset pills: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`class="ideogram-style-pill active px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Remove BG + Add button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="remove-bg-add-btn"\n                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Precise Edit + Add button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="studio-precise-edit-add-btn"\n                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Precise Edit Quality button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="studio-precise-edit-weight-btn" type="button"\n                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Precise Edit Variations button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="studio-precise-edit-count-btn" type="button"\n                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Upscale + Add button: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="upscale-add-btn"\n                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[13px] font-medium tracking-[-0.005em]`)
  },
  {
    name: 'Upscale 2x and 4x buttons: text-[13px] font-medium tracking-[-0.005em]',
    pass: html.includes(`id="upscale-scale-2x-btn"\n                                    class="upscale-factor-btn btn-upscale-factor py-2 px-3 rounded-xl border border-[#111111] dark:border-white/30 bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white text-[13px] font-medium tracking-[-0.005em]`)
  },

  // 7. Prompt Textarea Input & Placeholder
  {
    name: 'Generate Prompt textarea: text-[13.5px] font-normal leading-relaxed text-neutral-900 placeholder:text-neutral-400',
    pass: html.includes(`id="studio-prompt-input" rows="10"\n                                    placeholder="Describe the image you want to create..."\n                                    class="w-full min-h-[240px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400`)
  },
  {
    name: 'Precise Edit textarea: text-[13.5px] font-normal leading-relaxed text-neutral-900 placeholder:text-neutral-400',
    pass: html.includes(`id="studio-precise-edit-input" rows="4"\n                                    placeholder="Describe the change you want..."\n                                    class="w-full min-h-[110px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400`)
  },

  // 8. Primary Submit CTA Buttons
  {
    name: 'Generate button: text-[14px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`id="studio-generate-btn" type="button"\n                                class="w-full h-10 py-2 px-4 rounded-lg bg-[#111111] hover:bg-[#262626] active:bg-black text-white text-[14px] font-semibold tracking-[-0.01em]`)
  },
  {
    name: 'Remove BG button: text-[14px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`id="btn-do-remove-bg" disabled\n                            class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em]`)
  },
  {
    name: 'Precise Edit button: text-[14px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`id="studio-apply-precise-edit-btn" type="button" disabled\n                                class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em]`)
  },
  {
    name: 'Upscale button: text-[14px] font-semibold tracking-[-0.01em]',
    pass: html.includes(`id="upscaleSubmitBtn" \n                            disabled \n                            class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em]`)
  },

  // 9. Right Result Canvas
  {
    name: 'Gallery Generate Image Mode Label: text-[13px] font-semibold tracking-[-0.01em] text-neutral-800',
    pass: html.includes(`<span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Generate Image</span>`)
  },
  {
    name: 'Gallery Model Badge: text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 Plus Jakarta Sans',
    pass: html.includes(`text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">`)
  },
  {
    name: 'Gallery Timestamp Metadata: text-[12px] font-normal text-neutral-400',
    pass: html.includes(`<span class="text-[12px] font-normal text-neutral-400">\${formattedTime}</span>`)
  },
  {
    name: 'Gallery Prompt Title: text-[14.5px] font-semibold tracking-[-0.015em] text-neutral-900 leading-snug',
    pass: html.includes(`text-[14.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white leading-snug`)
  },
  {
    name: 'Gallery Aspect Ratio Pill: text-[11.5px] font-semibold tracking-wide',
    pass: html.includes(`text-[11.5px] font-semibold tracking-wide text-white pointer-events-none font-['Plus_Jakarta_Sans',sans-serif]"`)
  }
];

let failed = 0;
checks.forEach(c => {
  if (c.pass) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.error(`[FAIL] ${c.name}`);
    failed++;
  }
});

if (failed === 0) {
  console.log(`\nALL ${checks.length} AUDIT CHECKS PASSED PERFECTLY!`);
} else {
  console.error(`\n${failed} AUDIT CHECKS FAILED.`);
  process.exit(1);
}
