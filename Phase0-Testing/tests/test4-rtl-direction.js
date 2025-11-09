/**
 * Test 4: RTL Direction Validation
 *
 * Purpose: Determine if Hebrew text needs manual reversal
 * or if PDF-lib handles RTL correctly
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

/**
 * Reverse a string (for testing if manual reversal is needed)
 */
function reverseString(str) {
  return str.split('').reverse().join('');
}

async function test4RTLDirection() {
  console.log('\n=== Test 4: RTL Direction Validation ===\n');

  const fontPath = path.join(__dirname, '../fonts/NotoSansHebrew-Regular.ttf');

  if (!fs.existsSync(fontPath)) {
    console.error('✗ Font file not found! Run test2 instructions first.\n');
    process.exit(1);
  }

  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([600, 600]);

    const fontBytes = fs.readFileSync(fontPath);
    const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: false });

    console.log('Testing RTL text direction:\n');

    const originalHebrew = 'שלום עולם';
    const reversedHebrew = reverseString(originalHebrew);

    console.log('Original text:', originalHebrew);
    console.log('Reversed text:', reversedHebrew);
    console.log('Correct rendering should be:', 'שלום עולם (right-to-left)\n');

    // Title
    page.drawText('RTL Direction Test - Which renders correctly?', {
      x: 50,
      y: 550,
      size: 14,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    // Test A: Original order (logical order)
    page.drawText('A. Original (Logical Order):', {
      x: 50,
      y: 500,
      size: 12,
      font: hebrewFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(originalHebrew, {
      x: 100,
      y: 470,
      size: 24,
      font: hebrewFont,
      color: rgb(0, 0, 0.8),
    });

    // Test B: Manually reversed
    page.drawText('B. Manually Reversed:', {
      x: 50,
      y: 420,
      size: 12,
      font: hebrewFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(reversedHebrew, {
      x: 100,
      y: 390,
      size: 24,
      font: hebrewFont,
      color: rgb(0.8, 0, 0),
    });

    // Test C: With RTL marker (Unicode)
    const RLM = '\u200F'; // Right-to-Left Mark
    const withRLM = RLM + originalHebrew + RLM;

    page.drawText('C. With RTL Unicode Markers:', {
      x: 50,
      y: 340,
      size: 12,
      font: hebrewFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(withRLM, {
      x: 100,
      y: 310,
      size: 24,
      font: hebrewFont,
      color: rgb(0, 0.6, 0),
    });

    // Test D: Complex sentence
    const complexSentence = 'זהו טקסט ארוך יותר בעברית';
    const reversedComplex = reverseString(complexSentence);

    page.drawText('D. Complex Sentence (Original):', {
      x: 50,
      y: 260,
      size: 12,
      font: hebrewFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(complexSentence, {
      x: 100,
      y: 230,
      size: 18,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('E. Complex Sentence (Reversed):', {
      x: 50,
      y: 190,
      size: 12,
      font: hebrewFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(reversedComplex, {
      x: 100,
      y: 160,
      size: 18,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    // Instructions
    page.drawText('INSTRUCTIONS:', {
      x: 50,
      y: 110,
      size: 12,
      font: hebrewFont,
      color: rgb(0.8, 0, 0),
    });

    page.drawText('1. Which version (A, B, C, D, or E) renders correctly?', {
      x: 50,
      y: 90,
      size: 10,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('2. If B (reversed) is correct, we need manual reversal', {
      x: 50,
      y: 75,
      size: 10,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('3. If A (original) is correct, PDF-lib handles RTL natively', {
      x: 50,
      y: 60,
      size: 10,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../output/test4-rtl-direction.pdf');
    fs.writeFileSync(outputPath, pdfBytes);

    console.log('✓ PDF created successfully');
    console.log('📄 Output:', outputPath);
    console.log('\nCRITICAL DECISION POINT:');
    console.log('Open the PDF and determine which version renders correctly.');
    console.log('\nIf ORIGINAL (A, D) is correct → PDF-lib handles RTL ✓');
    console.log('If REVERSED (B, E) is correct → We need BiDi algorithm ⚠️');
    console.log('If RTL MARKERS (C) is correct → Use Unicode control chars\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    throw error;
  }
}

// Run the test
test4RTLDirection()
  .then(() => {
    console.log('=== Test 4 Complete ===\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test 4 failed:', error);
    process.exit(1);
  });
