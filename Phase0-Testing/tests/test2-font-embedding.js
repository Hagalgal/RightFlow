/**
 * Test 2: Hebrew Font Embedding
 *
 * Purpose: Test if we can successfully embed a Hebrew font
 * and whether subsetting affects Hebrew character rendering
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function test2FontEmbedding() {
  console.log('\n=== Test 2: Hebrew Font Embedding ===\n');

  const fontPath = path.join(__dirname, '../fonts/NotoSansHebrew-Regular.ttf');

  // Check if font file exists
  if (!fs.existsSync(fontPath)) {
    console.error('✗ Font file not found!');
    console.error('Expected location:', fontPath);
    console.error('\nPlease download Noto Sans Hebrew font:');
    console.error('https://fonts.google.com/noto/specimen/Noto+Sans+Hebrew');
    console.error('Extract NotoSansHebrew-Regular.ttf to fonts/ directory\n');
    process.exit(1);
  }

  console.log('✓ Font file found:', fontPath);

  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([600, 500]);

    // Read the font file
    const fontBytes = fs.readFileSync(fontPath);

    const hebrewText = 'שלום עולם';
    const hebrewText2 = 'טופס מילוי PDF';
    const hebrewText3 = 'עברית בקובץ PDF';

    console.log('\nTest text samples:');
    console.log('1.', hebrewText, '(Hello World)');
    console.log('2.', hebrewText2, '(PDF Form Filling)');
    console.log('3.', hebrewText3, '(Hebrew in PDF)');

    // Test 2A: Embed font WITHOUT subsetting (recommended for Hebrew)
    console.log('\n--- Test 2A: Font embedding WITHOUT subsetting ---');
    try {
      const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: false });
      console.log('✓ Font embedded successfully (subset: false)');

      page.drawText('Test 2A: Full Font (subset: false)', {
        x: 50,
        y: 450,
        size: 12,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(hebrewText, {
        x: 50,
        y: 420,
        size: 24,
        font: hebrewFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(hebrewText2, {
        x: 50,
        y: 390,
        size: 20,
        font: hebrewFont,
        color: rgb(0, 0, 0.8),
      });

      console.log('✓ Hebrew text rendered with full font');
    } catch (error) {
      console.error('✗ Error with full font:', error.message);
    }

    // Test 2B: Embed font WITH subsetting (might break Hebrew)
    console.log('\n--- Test 2B: Font embedding WITH subsetting ---');
    try {
      const hebrewFontSubset = await pdfDoc.embedFont(fontBytes, { subset: true });
      console.log('✓ Font embedded successfully (subset: true)');

      page.drawText('Test 2B: Subset Font (subset: true)', {
        x: 50,
        y: 330,
        size: 12,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(hebrewText, {
        x: 50,
        y: 300,
        size: 24,
        font: hebrewFontSubset,
        color: rgb(0, 0, 0),
      });

      page.drawText(hebrewText3, {
        x: 50,
        y: 270,
        size: 20,
        font: hebrewFontSubset,
        color: rgb(0.8, 0, 0),
      });

      console.log('✓ Hebrew text rendered with subset font');
    } catch (error) {
      console.error('✗ Error with subset font:', error.message);
    }

    // Test 2C: Check file sizes
    console.log('\n--- File Size Comparison ---');
    const pdfBytes = await pdfDoc.save();
    const pdfSize = (pdfBytes.length / 1024).toFixed(2);
    console.log(`PDF size: ${pdfSize} KB`);

    const fontSize = (fontBytes.length / 1024).toFixed(2);
    console.log(`Original font size: ${fontSize} KB`);

    const outputPath = path.join(__dirname, '../output/test2-font-embedding.pdf');
    fs.writeFileSync(outputPath, pdfBytes);

    console.log('\n✓ PDF created successfully');
    console.log('📄 Output:', outputPath);
    console.log('\nInstructions:');
    console.log('1. Open the PDF');
    console.log('2. Compare Test 2A (full font) vs Test 2B (subset)');
    console.log('3. Check if both render correctly');
    console.log('4. If subset breaks rendering, use subset: false for production\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    throw error;
  }
}

// Run the test
test2FontEmbedding()
  .then(() => {
    console.log('=== Test 2 Complete ===\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test 2 failed:', error);
    process.exit(1);
  });
