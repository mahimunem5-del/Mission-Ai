const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

lines.forEach((l, i) => {
  if (l.includes('ADMIN_PASSCODE') || l.includes('ADMIN_SESSION_KEY') || l.includes('saveAllDesignTemplates') || l.includes('renderAdminTemplates')) {
    console.log(`${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
