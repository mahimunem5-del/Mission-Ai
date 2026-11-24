const fs = require('fs');

let builder = fs.readFileSync('scratch/build_mobile_workspace.cjs', 'utf8');

const markerBefore = "imageStudioState.model : null) || 'black-forest-labs/flux.2-flex';\n                    modelName = item.modelName || getModelDisplayName(mId) || 'FLUX.2 Flex';\n                    modelIconSvg = getModelDisplayIcon(mId);\n                }";
const markerAfter = "// Square checkbox toggle";

const startIdx = builder.indexOf(markerBefore);
const endIdx = builder.indexOf(markerAfter, startIdx);

if (startIdx === -1 || endIdx === -1) {
    console.error('Markers not found!');
    process.exit(1);
}

const newCard = fs.readFileSync('scratch/new_feed_card_v2_raw.txt', 'utf8').trim();
builder = builder.substring(0, startIdx + markerBefore.length) + '\n\n' + newCard + '\n\n                ' + builder.substring(endIdx);

fs.writeFileSync('scratch/build_mobile_workspace.cjs', builder, 'utf8');
console.log('✓ Successfully updated build_mobile_workspace.cjs');
