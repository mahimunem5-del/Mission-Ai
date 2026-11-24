const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('TESTING FEED ITEM CLASSIFICATION, CONDITIONAL METADATA & ACTIONS');
console.log('================================================================\n');

const html = fs.readFileSync('index.html', 'utf8');

// Extract renderMobileResultFeed function
const feedFnStart = html.indexOf('function renderMobileResultFeed()');
const feedFnEnd = html.indexOf('function handleMobileRegenerate()', feedFnStart);
const feedFnCode = html.substring(feedFnStart, feedFnEnd);

class MockElement {
    constructor(tagName = 'div', id = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.className = '';
        this.children = [];
        this.innerHTML = '';
        this.onclick = null;
        this._frame = null;
    }
    appendChild(child) {
        this.children.push(child);
        return child;
    }
    querySelector(sel) {
        if (sel === '.mobile-output-frame') {
            if (!this._frame) this._frame = new MockElement('div');
            return this._frame;
        }
        return null;
    }
}

const feedEl = new MockElement('div', 'mobile-result-scroll-feed');

const mockImages = [
    // 1. Standard generation (no tool flag)
    { id: 'gen-1', url: '/gen1.png', prompt: 'A golden retriever in space', createdAt: Date.now() - 60000 },
    // 2. Remove background item
    { id: 'rm-1', url: '/rm1.png', isRemoveBg: true, title: 'Background Removed', createdAt: Date.now() - 120000 },
    // 3. Upscale item
    { id: 'up-1', url: '/up1.png', isUpscale: true, scale: '4x', title: 'Upscaled 4x', createdAt: Date.now() - 180000 },
    // 4. Precise edit item
    { id: 'edit-1', url: '/edit1.png', isPreciseEdit: true, prompt: 'Change eyes to blue', createdAt: Date.now() - 240000 }
];

let lastModalPayload = null;

const sandbox = {
    document: {
        getElementById: (id) => (id === 'mobile-result-scroll-feed' ? feedEl : null),
        createElement: (tag) => new MockElement(tag)
    },
    window: {
        activeMobileTool: 'edit', // Active tool is EDIT to test bug fix!
        mobileSelectedImageIds: new Set(),
        STUDIO_RECENT_IMAGES: mockImages
    },
    TOOL_TITLES: {
        'generate': 'Generate Image',
        'remove-bg': 'Remove Background',
        'edit': 'Precise Edit',
        'upscale': 'Upscale Image'
    },
    updateMobileMultiSelectBar: () => {},
    getEffectiveStudioImagesForWorkspace: () => mockImages,
    getRelativeTime: () => '1m ago',
    getModelDisplayName: (m) => 'FLUX.2 Flex',
    getModelDisplayIcon: () => '<svg></svg>',
    escapeHtml: (s) => String(s || ''),
    openTemplateWhitePreviewModal: (payload) => { lastModalPayload = payload; },
    console: console
};

vm.createContext(sandbox);
vm.runInContext(feedFnCode, sandbox);

sandbox.renderMobileResultFeed();

console.log(`Rendered ${feedEl.children.length} feed cards.`);

// Item 1: Generate Image
const card1Html = feedEl.children[0].innerHTML;
if (card1Html.includes('Generate Image') && card1Html.includes('FLUX.2 Flex')) {
    console.log('  ✓ PASS: Generate Image shows workspace title AND model name');
} else {
    console.error('  ✗ FAIL: Generate Image missing title or model name');
    process.exit(1);
}
if (card1Html.includes('A golden retriever in space') && card1Html.includes('Copy prompt')) {
    console.log('  ✓ PASS: Generate Image includes prompt row + Copy prompt button');
} else {
    console.error('  ✗ FAIL: Generate Image missing prompt row');
    process.exit(1);
}
if (card1Html.includes('mobile-output-frame mt-2.5')) {
    console.log('  ✓ PASS: Generate Image uses mt-2.5 spacing with prompt row');
} else {
    console.error('  ✗ FAIL: Generate Image frame spacing incorrect');
    process.exit(1);
}

// Item 2: Remove Background
const card2Html = feedEl.children[1].innerHTML;
if (card2Html.includes('Remove Background') && !card2Html.includes('FLUX.2 Flex') && !card2Html.includes('BiRefNet')) {
    console.log('  ✓ PASS: Remove Background shows ONLY workspace title + timestamp (no model badge)');
} else {
    console.error('  ✗ FAIL: Remove Background has unwanted model badge');
    process.exit(1);
}
if (!card2Html.includes('Copy prompt') && !card2Html.includes('leading-relaxed text-slate-600 break-words')) {
    console.log('  ✓ PASS: Remove Background omits prompt text and Copy prompt button');
} else {
    console.error('  ✗ FAIL: Remove Background should NOT have prompt row');
    process.exit(1);
}
if (card2Html.includes('mobile-output-frame mt-2 ')) {
    console.log('  ✓ PASS: Remove Background uses tight mt-2 spacing directly below title');
} else {
    console.error('  ✗ FAIL: Remove Background frame spacing incorrect');
    process.exit(1);
}

// Item 3: Upscale Image
const card3Html = feedEl.children[2].innerHTML;
if (card3Html.includes('Upscale Image') && !card3Html.includes('4x Upscale') && !card3Html.includes('FLUX.2 Flex')) {
    console.log('  ✓ PASS: Upscale Image shows ONLY workspace title + timestamp (no model/scale badge in header)');
} else {
    console.error('  ✗ FAIL: Upscale Image has unwanted model/scale badge in header');
    process.exit(1);
}
if (!card3Html.includes('Copy prompt') && !card3Html.includes('leading-relaxed text-slate-600 break-words')) {
    console.log('  ✓ PASS: Upscale Image omits prompt text and Copy prompt button');
} else {
    console.error('  ✗ FAIL: Upscale Image should NOT have prompt row');
    process.exit(1);
}
if (card3Html.includes('mobile-output-frame mt-2 ')) {
    console.log('  ✓ PASS: Upscale Image uses tight mt-2 spacing directly below title');
} else {
    console.error('  ✗ FAIL: Upscale Image frame spacing incorrect');
    process.exit(1);
}

// Item 4: Precise Edit
const card4Html = feedEl.children[3].innerHTML;
if (card4Html.includes('Precise Edit') && !card4Html.includes('FLUX.2 Flex')) {
    console.log('  ✓ PASS: Precise Edit shows ONLY workspace title + timestamp (no model badge)');
} else {
    console.error('  ✗ FAIL: Precise Edit has unwanted model badge');
    process.exit(1);
}
if (card4Html.includes('Change eyes to blue') && card4Html.includes('Copy prompt')) {
    console.log('  ✓ PASS: Precise Edit includes prompt row + Copy prompt button');
} else {
    console.error('  ✗ FAIL: Precise Edit missing prompt row');
    process.exit(1);
}
if (card4Html.includes('mobile-output-frame mt-2.5')) {
    console.log('  ✓ PASS: Precise Edit uses mt-2.5 spacing with prompt row');
} else {
    console.error('  ✗ FAIL: Precise Edit frame spacing incorrect');
    process.exit(1);
}

// Buttonless feed verification across cards
[card1Html, card2Html, card3Html, card4Html].forEach((cHtml, idx) => {
    if (!cHtml.includes('>Edit</button>') && !cHtml.includes('>Upscale</button>') && !cHtml.includes('>Download</button>')) {
        console.log(`  ✓ PASS: Card ${idx + 1} is clean and buttonless (0 inline buttons underneath)`);
    } else {
        console.error(`  ✗ FAIL: Card ${idx + 1} has unwanted inline buttons`);
        process.exit(1);
    }
});

// Test frame clicks passing payload to modal
feedEl.children[0]._frame.onclick();
if (lastModalPayload && lastModalPayload.isFeedResult && lastModalPayload.workspaceType === 'generate-image') {
    console.log('  ✓ PASS: Card 1 frame click passes workspaceType "generate-image" to preview modal');
} else {
    console.error('  ✗ FAIL: Card 1 frame click payload incorrect:', lastModalPayload);
    process.exit(1);
}

feedEl.children[2]._frame.onclick();
if (lastModalPayload && lastModalPayload.isFeedResult && lastModalPayload.workspaceType === 'upscale-image' && lastModalPayload.scale === '4x') {
    console.log('  ✓ PASS: Card 3 frame click passes workspaceType "upscale-image" and scale "4x" to preview modal');
} else {
    console.error('  ✗ FAIL: Card 3 frame click payload incorrect:', lastModalPayload);
    process.exit(1);
}

console.log('\nAll conditional metadata, spacing, and text-only action tests passed successfully!');
