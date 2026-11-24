const fs = require('fs');

let code = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

const oldBlock = `// 19. Upscale Scale Buttons (2x and 4x)
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

const newBlock = `// 19. Upscale Scale Buttons (Soft-Tinted 2x / 4x Pills)
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

if (code.includes(oldBlock)) {
    code = code.replace(oldBlock, newBlock);
    fs.writeFileSync('scratch/build_mobile_workspace.cjs', code, 'utf8');
    console.log('✓ Successfully updated upscale 2x/4x buttons JS in scratch/build_mobile_workspace.cjs');
} else {
    console.error('✗ Old upscale block not found');
}
