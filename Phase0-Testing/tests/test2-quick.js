/**
 * Quick Font Test - Try multiple font files
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function testFont(fontFileName) {
  console.log(`\n=== Testing: ${fontFileName} ===`);

  const fontPath = path.join(__dirname, '../fonts', fontFileName);

  if (!fs.existsSync(fontPath)) {
    console.log(`✗ File not found: ${fontPath}`);
    return false;
  }

  const stats = fs.statSync(fontPath);
  console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`);

  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync(fontPath);
    console.log(`  Font bytes loaded: ${fontBytes.length} bytes`);

    // Try to embed
    const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: false });
    console.log(`  ✓ Font embedded successfully!`);

    const page = pdfDoc.addPage([400, 200]);
    page.drawText('שלום עולם', {
      x: 50,
      y: 100,
      size: 24,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../output', `test-${fontFileName.replace('.ttf', '')}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`  ✓ PDF created: ${outputPath}`);
    console.log(`  ✓ SUCCESS!\n`);
    return true;

  } catch (error) {
    console.log(`  ✗ Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  Quick Font Compatibility Test              ║');
  console.log('╚══════════════════════════════════════════════╝');

  const fonts = [
    'NotoSansHebrew-Regular.ttf',
    'NotoSansHebrew-Regular-v2.ttf'
  ];

  for (const font of fonts) {
    await testFont(font);
  }
}

main().catch(console.error);
