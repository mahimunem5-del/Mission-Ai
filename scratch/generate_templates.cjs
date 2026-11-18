const fs = require('fs');
const path = require('path');
const sharp = require('../server/node_modules/sharp');
const outDir = path.join(__dirname, '..', 'public', 'templates');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const templates = [
  {
    filename: 'editorial-portrait.jpg',
    width: 720,
    height: 1280, // 9:16
    svg: `
      <svg width="720" height="1280" viewBox="0 0 720 1280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1c1917" />
            <stop offset="40%" stop-color="#292524" />
            <stop offset="80%" stop-color="#44403c" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>
          <radialGradient id="sun" cx="70%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#d97706" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#1c1917" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="face" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#b45309" stop-opacity="0.4" />
          </linearGradient>
        </defs>
        <rect width="720" height="1280" fill="url(#bg)"/>
        <rect width="720" height="1280" fill="url(#sun)"/>
        
        <!-- Artistic Golden Hour Portrait Silhouette & Rim Lighting -->
        <g transform="translate(160, 360)">
          <path d="M200 40 C280 40 330 110 330 220 C330 350 270 460 200 500 C130 460 70 350 70 220 C70 110 120 40 200 40 Z" fill="#0c0a09" opacity="0.9" />
          <path d="M200 60 C260 60 300 120 300 210 C300 320 250 420 200 460" stroke="#f59e0b" stroke-width="6" fill="none" opacity="0.85" filter="drop-shadow(0 0 12px #f59e0b)"/>
          <path d="M210 180 C230 220 230 270 205 310" stroke="#fbbf24" stroke-width="4" fill="none" opacity="0.7"/>
          <ellipse cx="200" cy="180" rx="90" ry="120" fill="none" stroke="#d97706" stroke-width="2" opacity="0.4"/>
          <!-- Shoulders -->
          <path d="M70 440 C10 500 -50 620 -80 780 L480 780 C450 620 390 500 330 440 Z" fill="#09090b" opacity="0.95"/>
          <path d="M330 440 C390 500 450 620 480 780" stroke="#f59e0b" stroke-width="5" fill="none" opacity="0.75" />
        </g>
        
        <!-- Typography overlay -->
        <text x="60" y="1150" font-family="Inter, sans-serif" font-size="28" font-weight="600" fill="#f5f5f4" letter-spacing="1">EDITORIAL PORTRAIT</text>
        <text x="60" y="1190" font-family="Inter, sans-serif" font-size="16" font-weight="400" fill="#a8a29e">Golden Hour Lighting • 85mm f/1.4</text>
      </svg>
    `
  },
  {
    filename: 'cyber-avatar.jpg',
    width: 768,
    height: 1024, // 3:4
    svg: `
      <svg width="768" height="1024" viewBox="0 0 768 1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#050505" />
            <stop offset="50%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </linearGradient>
          <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#3b82f6" />
          </linearGradient>
          <linearGradient id="neonPink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="768" height="1024" fill="url(#cyberBg)"/>
        
        <!-- Cyber grid lines -->
        <g stroke="#1e293b" stroke-width="1" opacity="0.4">
          <line x1="0" y1="200" x2="768" y2="200"/>
          <line x1="0" y1="400" x2="768" y2="400"/>
          <line x1="0" y1="600" x2="768" y2="600"/>
          <line x1="0" y1="800" x2="768" y2="800"/>
          <line x1="200" y1="0" x2="200" y2="1024"/>
          <line x1="400" y1="0" x2="400" y2="1024"/>
          <line x1="600" y1="0" x2="600" y2="1024"/>
        </g>
        
        <!-- Cyberpunk Avatar Graphic -->
        <g transform="translate(184, 220)">
          <polygon points="200,20 340,110 370,300 280,480 120,480 30,300 60,110" fill="#090d16" stroke="url(#neonPink)" stroke-width="3"/>
          <circle cx="200" cy="240" r="140" fill="none" stroke="url(#neonCyan)" stroke-width="2" stroke-dasharray="12 6" opacity="0.8"/>
          <path d="M150 210 L190 230 L150 250" fill="none" stroke="#06b6d4" stroke-width="4"/>
          <path d="M250 210 L210 230 L250 250" fill="none" stroke="#ec4899" stroke-width="4"/>
          <line x1="160" y1="340" x2="240" y2="340" stroke="#06b6d4" stroke-width="3"/>
          <path d="M20 460 C80 500 130 540 200 540 C270 540 320 500 380 460 L420 620 L-20 620 Z" fill="#0d1117" stroke="url(#neonCyan)" stroke-width="2"/>
        </g>
        
        <text x="60" y="930" font-family="Inter, sans-serif" font-size="28" font-weight="700" fill="#38bdf8" letter-spacing="1">CYBER AVATAR</text>
        <text x="60" y="965" font-family="Inter, sans-serif" font-size="15" font-weight="400" fill="#94a3b8">Neon Cyan &amp; Magenta • Identity Preserving</text>
      </svg>
    `
  },
  {
    filename: 'luxury-perfume.jpg',
    width: 1000,
    height: 1000, // 1:1
    svg: `
      <svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="studioFloor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e7e5e4" />
            <stop offset="50%" stop-color="#d6d3d1" />
            <stop offset="100%" stop-color="#a8a29e" />
          </linearGradient>
          <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="30%" stop-color="#d97706" />
            <stop offset="70%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>
        </defs>
        <rect width="1000" height="1000" fill="url(#studioFloor)"/>
        
        <!-- Travertine pedestal shadow -->
        <polygon points="280,680 720,680 820,780 180,780" fill="#78716c" opacity="0.35"/>
        <!-- Pedestal -->
        <polygon points="300,640 700,640 680,720 280,720" fill="#f5f5f4"/>
        
        <!-- Perfume bottle shadow -->
        <polygon points="560,340 780,560 720,640 500,640" fill="#292524" opacity="0.3"/>
        
        <!-- Perfume bottle -->
        <g transform="translate(420, 280)">
          <!-- Cap -->
          <rect x="50" y="0" width="60" height="60" rx="4" fill="#1c1917"/>
          <rect x="70" y="60" width="20" height="20" fill="#d97706"/>
          <!-- Body -->
          <rect x="10" y="80" width="140" height="260" rx="16" fill="url(#amberGlass)" opacity="0.95"/>
          <!-- Highlight refraction -->
          <line x1="30" y1="95" x2="30" y2="325" stroke="#fef3c7" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
          <line x1="42" y1="95" x2="42" y2="325" stroke="#fef3c7" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
          <!-- Label -->
          <rect x="35" y="160" width="90" height="100" rx="4" fill="#fafaf9"/>
          <line x1="50" y1="190" x2="110" y2="190" stroke="#1c1917" stroke-width="2"/>
          <line x1="55" y1="210" x2="105" y2="210" stroke="#78716c" stroke-width="1.5"/>
          <line x1="65" y1="225" x2="95" y2="225" stroke="#a8a29e" stroke-width="1"/>
        </g>
        
        <text x="70" y="910" font-family="Inter, sans-serif" font-size="26" font-weight="600" fill="#1c1917">LUXURY PERFUME</text>
        <text x="70" y="945" font-family="Inter, sans-serif" font-size="15" font-weight="400" fill="#57534e">Commercial Studio Product • Amber Glass</text>
      </svg>
    `
  },
  {
    filename: 'geometric-logo.jpg',
    width: 1000,
    height: 1000, // 1:1
    svg: `
      <svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="1000" fill="#09090b"/>
        
        <!-- Modernist Geometric Monogram -->
        <g transform="translate(320, 280)">
          <circle cx="180" cy="180" r="160" fill="none" stroke="#fafafa" stroke-width="28"/>
          <polygon points="180,40 320,280 40,280" fill="none" stroke="#e4e4e7" stroke-width="24"/>
          <rect x="100" y="100" width="160" height="160" fill="#18181b" stroke="#ffffff" stroke-width="16" transform="rotate(45 180 180)"/>
          <circle cx="180" cy="180" r="30" fill="#ffffff"/>
        </g>
        
        <text x="500" y="740" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="4">KINETIC MONOGRAM</text>
        <text x="500" y="775" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" font-weight="400" fill="#71717a">Modernist Swiss Minimalist Typography</text>
      </svg>
    `
  },
  {
    filename: 'nordic-scenery.jpg',
    width: 1280,
    height: 720, // 16:9
    svg: `
      <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fogSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="50%" stop-color="#334155" />
            <stop offset="100%" stop-color="#64748b" />
          </linearGradient>
          <linearGradient id="warmInterior" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#fbbf24" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#fogSky)"/>
        
        <!-- Distant misty mountains -->
        <polygon points="0,450 300,260 650,420 950,290 1280,440 1280,720 0,720" fill="#1e293b" opacity="0.6"/>
        <!-- Pine tree silhouettes -->
        <g fill="#0f172a" opacity="0.8">
          <polygon points="60,520 80,420 100,520"/>
          <polygon points="120,540 145,400 170,540"/>
          <polygon points="200,530 220,440 240,530"/>
          <polygon points="1020,530 1050,390 1080,530"/>
          <polygon points="1120,540 1145,410 1170,540"/>
          <polygon points="1200,520 1220,430 1240,520"/>
        </g>
        
        <!-- Brutalist Architectural Villa Structure -->
        <g transform="translate(340, 240)">
          <!-- Base cantilever concrete block -->
          <rect x="0" y="100" width="600" height="180" fill="#0f172a" stroke="#475569" stroke-width="2"/>
          <!-- Glowing glass facade -->
          <rect x="40" y="120" width="520" height="140" fill="url(#warmInterior)" opacity="0.85" filter="drop-shadow(0 0 25px rgba(245, 158, 11, 0.4))"/>
          <!-- Window frame mullions -->
          <g stroke="#0f172a" stroke-width="4">
            <line x1="120" y1="120" x2="120" y2="260"/>
            <line x1="200" y1="120" x2="200" y2="260"/>
            <line x1="280" y1="120" x2="280" y2="260"/>
            <line x1="360" y1="120" x2="360" y2="260"/>
            <line x1="440" y1="120" x2="440" y2="260"/>
            <line x1="520" y1="120" x2="520" y2="260"/>
          </g>
          <!-- Upper cantilever slab -->
          <rect x="80" y="50" width="380" height="60" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
          <rect x="100" y="60" width="340" height="40" fill="url(#warmInterior)" opacity="0.7"/>
          <line x1="220" y1="60" x2="220" y2="100" stroke="#0f172a" stroke-width="3"/>
          <line x1="340" y1="60" x2="340" y2="100" stroke="#0f172a" stroke-width="3"/>
        </g>
        
        <!-- Ground rock -->
        <polygon points="260,520 1020,520 1280,720 0,720" fill="#090d16"/>
        
        <text x="60" y="640" font-family="Inter, sans-serif" font-size="24" font-weight="600" fill="#f8fafc">BRUTALIST NORDIC VILLA</text>
        <text x="60" y="670" font-family="Inter, sans-serif" font-size="14" font-weight="400" fill="#94a3b8">Cantilevered Concrete &amp; Illuminated Glass • Pine Forest Mist</text>
      </svg>
    `
  },
  {
    filename: 'clay-character.jpg',
    width: 1024,
    height: 768, // 4:3
    svg: `
      <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="clayStudio" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="60%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </radialGradient>
          <radialGradient id="faceClay" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stop-color="#fed7aa" />
            <stop offset="100%" stop-color="#ea580c" />
          </radialGradient>
          <radialGradient id="beanieClay" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#f87171" />
            <stop offset="100%" stop-color="#b91c1c" />
          </radialGradient>
        </defs>
        <rect width="1024" height="768" fill="url(#clayStudio)"/>
        
        <!-- Soft floor shadow -->
        <ellipse cx="512" cy="620" rx="220" ry="40" fill="#075985" opacity="0.6"/>
        
        <!-- 3D Clay Character -->
        <g transform="translate(362, 160)">
          <!-- Parka Body -->
          <ellipse cx="150" cy="380" rx="140" ry="110" fill="#facc15"/>
          <ellipse cx="150" cy="360" rx="120" ry="90" fill="#eab308"/>
          <!-- Beanie Hat -->
          <ellipse cx="150" cy="110" rx="110" ry="80" fill="url(#beanieClay)"/>
          <circle cx="150" cy="40" r="26" fill="#fca5a5"/>
          <!-- Clay Face -->
          <circle cx="150" cy="200" r="95" fill="url(#faceClay)"/>
          <!-- Clay Eyes -->
          <circle cx="115" cy="190" r="14" fill="#1e293b"/>
          <circle cx="119" cy="186" r="4" fill="#ffffff"/>
          <circle cx="185" cy="190" r="14" fill="#1e293b"/>
          <circle cx="189" cy="186" r="4" fill="#ffffff"/>
          <!-- Rosy Cheeks -->
          <circle cx="95" cy="220" r="16" fill="#f87171" opacity="0.6"/>
          <circle cx="205" cy="220" r="16" fill="#f87171" opacity="0.6"/>
          <!-- Cute Smile -->
          <path d="M130 230 Q150 250 170 230" stroke="#7c2d12" stroke-width="6" stroke-linecap="round" fill="none"/>
        </g>
        
        <text x="60" y="690" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="#ffffff">3D TACTILE CLAY EXPLORER</text>
        <text x="60" y="720" font-family="Inter, sans-serif" font-size="14" font-weight="400" fill="#e0f2fe">Claymorphism 3D Character • Blender Cycles Shading</text>
      </svg>
    `
  }
];

async function generate() {
  for (const t of templates) {
    const filePath = path.join(outDir, t.filename);
    console.log(`Generating ${t.filename} (${t.width}x${t.height})...`);
    await sharp(Buffer.from(t.svg))
      .jpeg({ quality: 92 })
      .toFile(filePath);
    console.log(`Saved ${filePath}`);
  }
  console.log('All 6 template images created successfully!');
}

generate().catch(err => {
  console.error('Error generating template images:', err);
  process.exit(1);
});
