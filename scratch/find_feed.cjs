const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const queries = [
  'Make this oggy',
  'ideogram-asset-groups-feed',
  'renderAssetGroup',
  'renderIdeogramFeed',
  'renderAssetCard',
  'GPT Image 2.5 Sunburst',
  '14d ago'
];

queries.forEach(q => {
  let idx = 0;
  let count = 0;
  while ((idx = html.indexOf(q, idx)) !== -1) {
    count++;
    if (count <= 3) {
      const line = html.substring(0, idx).split('\n').length;
      console.log(`${q} found at line ${line}`);
    }
    idx += q.length;
  }
  console.log(`${q} total count: ${count}`);
});
