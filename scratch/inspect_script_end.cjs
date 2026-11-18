const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const lastScriptIdx = content.lastIndexOf('</script>');
console.log('Last script ends at:', lastScriptIdx);
console.log(content.slice(lastScriptIdx - 800, lastScriptIdx + 200));
