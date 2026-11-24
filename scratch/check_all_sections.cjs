const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function checkSection(start, end, label) {
  console.log(`\n=================== ${label} (${start} - ${end}) ===================`);
  for (let i = start - 1; i < end; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}

checkSection(4870, 4972, '1. Mobile Composer HTML');
checkSection(21532, 21795, '2. Mobile Composer JS');
checkSection(39499, 39570, '3. Multi-select & Template Modal HTML');
checkSection(40060, 40090, '4. openMobileWorkspaceDrawer options');
checkSection(40610, 40630, '5. updateMobileMultiSelectBar JS');
checkSection(41134, 41168, '6. MultiSelect event listeners');
