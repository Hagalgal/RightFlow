/**
 * Run All Phase 0 Tests
 *
 * Executes all Hebrew PDF-lib compatibility tests in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

const tests = [
  'test1-simple-hebrew.js',
  'test2-font-embedding.js',
  'test3-mixed-content.js',
  'test4-rtl-direction.js'
];

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   Phase 0: PDF-lib Hebrew Compatibility Test Suite       ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  console.log(`\n[${ index + 1}/${tests.length}] Running ${test}...\n`);
  console.log('─'.repeat(60));

  try {
    execSync(`node ${path.join(__dirname, test)}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    passed++;
  } catch (error) {
    console.error(`\n✗ ${test} failed\n`);
    failed++;
  }

  console.log('─'.repeat(60));
});

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                    Test Summary                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log(`\n✓ Passed: ${passed}/${tests.length}`);
console.log(`✗ Failed: ${failed}/${tests.length}\n`);

console.log('📁 All test outputs saved to: output/\n');
console.log('Next Steps:');
console.log('1. Review all generated PDFs in the output/ folder');
console.log('2. Document findings in FINDINGS.md');
console.log('3. Make go/no-go decision on PDF-lib for Hebrew support\n');

process.exit(failed > 0 ? 1 : 0);
