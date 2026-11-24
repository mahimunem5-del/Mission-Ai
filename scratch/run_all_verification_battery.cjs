const { execSync } = require('child_process');

console.log('================================================================');
console.log('RUNNING FULL CONSOLIDATED REGRESSION & VERIFICATION BATTERY');
console.log('================================================================\n');

const suites = [
    { name: 'Inline Scripts Syntax Check', script: 'scratch/verify_syntax.cjs' },
    { name: 'Snippet Syntax Check', script: 'scratch/verify_snippet_syntax.cjs' },
    { name: 'Creations Button, Buttonless Feed & Modal Hierarchy', script: 'scratch/verify_creations_and_modal_hierarchy.cjs' },
    { name: 'Action Alignment & Dedicated Template Modal', script: 'scratch/verify_action_alignment_and_template_modal.cjs' },
    { name: 'Creations Result Feed & Full-Bleed Ideogram Modal', script: 'scratch/verify_creations_and_preview_modal_v2.cjs' },
    { name: 'Feed Item Classification Simulation', script: 'scratch/test_feed_classification_simulation.cjs' },
    { name: 'Floating Popovers & Minimal Uploads', script: 'scratch/verify_popovers_and_uploads.cjs' },
    { name: 'Ideogram Surface Polish & Model Selector', script: 'scratch/verify_ideogram_surface_polish.cjs' }
];

let allPassed = true;

suites.forEach((s, idx) => {
    console.log(`[${idx + 1}/${suites.length}] Running ${s.name}...`);
    try {
        const out = execSync(`node ${s.script}`, { encoding: 'utf8' });
        console.log(`✓ ${s.name} PASSED!\n`);
    } catch (err) {
        console.error(`✗ ${s.name} FAILED!`);
        console.error(err.stdout || err.message);
        allPassed = false;
    }
});

console.log('================================================================');
if (allPassed) {
    console.log('ALL SUITES PASSED CLEANLY (100% GREEN)');
} else {
    console.error('ONE OR MORE SUITES FAILED');
    process.exit(1);
}
console.log('================================================================');
