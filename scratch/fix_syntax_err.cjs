const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const brokenSnippet = `                        onerror="this.style.display='none';" />
                        \` : ''}
                    </div>\`

                    <!-- Hover Overlay (opacity-0 by default, opacity-100 on hover) -->`;

const fixedSnippet = `                        onerror="this.style.display='none';" />
                        \` : ''}
                    </div>

                    <!-- Hover Overlay (opacity-0 by default, opacity-100 on hover) -->`;

if (html.includes(brokenSnippet)) {
    html = html.replace(brokenSnippet, fixedSnippet);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('[SUCCESS] Removed premature closing backtick!');
} else {
    console.error('[ERROR] Could not find brokenSnippet');
}
