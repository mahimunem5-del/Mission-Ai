const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find major top-level containers and workspaces
console.log('--- Head font links ---');
const fontLinks = html.match(/<link[^>]*fonts\.googleapis[^>]*>/g);
console.log(fontLinks);

console.log('--- Major layout sections ---');
const mainContainers = html.match(/<div[^>]*id=["'][^"']*workspace[^"']*["'][^>]*>/g);
console.log('Workspaces:', mainContainers);

// Search for chat container
const chatSections = html.match(/<div[^>]*id=["'][^"']*chat[^"']*["'][^>]*>/g);
console.log('Chat sections:', chatSections);

// Search for mobile references
const mobileClasses = html.match(/class=["'][^"']*\b(md:hidden|hidden\s+md:block|hidden\s+md:flex)\b[^"']*["']/g);
console.log('Mobile classes count:', mobileClasses ? mobileClasses.length : 0);
if (mobileClasses) {
  console.log('Sample mobile classes:', mobileClasses.slice(0, 10));
}

// Search for sidebar drawer, incognito, model selector, file upload, voice, etc.
const keyFunctions = ['toggleSidebar', 'sidebar', 'incognito', 'toggleIncognito', 'isIncognito', 'model', 'selectedModel', 'voice', 'speech', 'mic', 'attachment', 'upload', 'sendMessage', 'handleSend', 'submitPrompt'];
keyFunctions.forEach(fn => {
  const count = (html.match(new RegExp(fn, 'gi')) || []).length;
  console.log(`Function / keyword "${fn}": ${count} occurrences`);
});
