/**
 * Test 3: Mixed Hebrew/English Content
 *
 * Purpose: Test how PDF-lib handles text with both Hebrew and English
 * This is critical as most forms will have mixed content
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function test3MixedContent() {
  console.log('\n=== Test 3: Mixed Hebrew/English Content ===\n');

  const fontPath = path.join(__dirname, '../fonts/NotoSansHebrew-Regular.ttf');

  if (!fs.existsSync(fontPath)) {
    console.error('✗ Font file not found! Run test2 instructions first.\n');
    process.exit(1);
  }

  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([600, 700]);

    const fontBytes = fs.readFileSync(fontPath);
    const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: false });

    console.log('Testing mixed content scenarios:\n');

    const testCases = [
      {
        label: 'Hebrew then English',
        text: 'שלום Hello',
        expected: 'Should show: שלום Hello'
      },
      {
        label: 'English then Hebrew',
        text: 'Hello שלום',
        expected: 'Should show: Hello שלום'
      },
      {
        label: 'Mixed sentence',
        text: 'PDF טופס 2024',
        expected: 'Should show: PDF טופס 2024'
      },
      {
        label: 'Hebrew with numbers',
        text: 'מספר 123 ושם',
        expected: 'Should show: מספר 123 ושם'
      },
      {
        label: 'Punctuation test',
        text: 'שאלה? Question!',
        expected: 'Punctuation should be in correct positions'
      },
      {
        label: 'Parentheses (critical)',
        text: 'טקסט (בסוגריים) text',
        expected: 'Parentheses should not flip'
      },
      {
        label: 'Email in Hebrew context',
        text: 'מייל: user@example.com',
        expected: 'Email should read left-to-right'
      },
      {
        label: 'Complex mixed',
        text: 'Form טופס ID: 12345',
        expected: 'Should maintain logical order'
      }
    ];

    let yPosition = 650;

    testCases.forEach((testCase, index) => {
      console.log(`${index + 1}. ${testCase.label}`);
      console.log(`   Input: "${testCase.text}"`);
      console.log(`   Expected: ${testCase.expected}\n`);

      // Draw label
      page.drawText(`${index + 1}. ${testCase.label}:`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: hebrewFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      yPosition -= 20;

      // Draw the actual text
      page.drawText(testCase.text, {
        x: 70,
        y: yPosition,
        size: 16,
        font: hebrewFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 35;
    });

    // Add instructions at the bottom
    page.drawText('CRITICAL: Check if the text appears in logical order', {
      x: 50,
      y: 100,
      size: 12,
      font: hebrewFont,
      color: rgb(0.8, 0, 0),
    });

    page.drawText('If text is jumbled or reversed, we need BiDi algorithm', {
      x: 50,
      y: 80,
      size: 12,
      font: hebrewFont,
      color: rgb(0.8, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../output/test3-mixed-content.pdf');
    fs.writeFileSync(outputPath, pdfBytes);

    console.log('✓ PDF created successfully');
    console.log('📄 Output:', outputPath);
    console.log('\nInstructions:');
    console.log('1. Open the PDF and compare each line with expected results');
    console.log('2. Pay special attention to:');
    console.log('   - Punctuation placement');
    console.log('   - Number direction (should be LTR)');
    console.log('   - Parentheses orientation');
    console.log('3. Note any text that appears reversed or jumbled');
    console.log('4. This will determine if we need a BiDi algorithm\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    throw error;
  }
}

// Run the test
test3MixedContent()
  .then(() => {
    console.log('=== Test 3 Complete ===\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test 3 failed:', error);
    process.exit(1);
  });
