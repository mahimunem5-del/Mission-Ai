const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Upgrade Google Fonts link to include 800 weight for Plus Jakarta Sans
const oldFontLink = 'Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
const newFontLink = 'Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
html = html.replaceAll(oldFontLink, newFontLink);

// 2. HERO HEADLINE UPGRADE
// Replace "Imagine it." and "Craft it."
const oldHero = `<h1 class="flex items-baseline justify-center flex-wrap leading-tight">
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>
                            <span class="font-['Instrument_Serif',serif] italic font-normal text-[34px] sm:text-[38px] tracking-[-0.01em] bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent ml-1.5">Craft it.</span>
                        </h1>`;

const newHero = `<h1 class="flex items-baseline justify-center flex-wrap leading-tight">
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-bold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-extrabold tracking-[-0.035em] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent ml-2">Craft it.</span>
                        </h1>`;

if (!html.includes(oldHero)) {
  console.error('ERROR: oldHero not found!');
  process.exit(1);
}
console.log('Found oldHero!');
