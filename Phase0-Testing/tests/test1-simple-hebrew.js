/**
 * Test 1: Simple Hebrew Text Rendering
 *
 * Purpose: Test if PDF-lib can render basic Hebrew text
 * without a custom font (using standard fonts)
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function test1SimpleHebrew() {
  console.log('\n=== Test 1: Simple Hebrew Text ===\n');

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    // Try to use a standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const hebrewText = 'שלום עולם';
    const englishText = 'Hello World (English)';

    console.log('Testing Hebrew text:', hebrewText);
    console.log('Testing English text:', englishText);

    // Draw English text (baseline)
    page.drawText(englishText, {
      x: 50,
      y: 300,
      size: 24,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Try to draw Hebrew text with standard font
    try {
      page.drawText(hebrewText, {
        x: 50,
        y: 250,
        size: 24,
        font: helveticaFont,
        color: rgb(0, 0, 1), // Blue to distinguish
      });
      console.log('✓ Hebrew text drawn without error');
    } catch (error) {
      console.error('✗ Error drawing Hebrew text:', error.message);
    }

    // Add labels
    const labelFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText('English (Helvetica):', {
      x: 50,
      y: 320,
      size: 12,
      font: labelFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('Hebrew with Standard Font (will likely show as boxes):', {
      x: 50,
      y: 270,
      size: 12,
      font: labelFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../output/test1-simple-hebrew.pdf');
    fs.writeFileSync(outputPath, pdfBytes);

    console.log('\n✓ PDF created successfully');
    console.log('📄 Output:', outputPath);
    console.log('\nExpected Result: Hebrew text will likely appear as boxes (□□□)');
    console.log('This confirms we need a custom Hebrew font.\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    throw error;
  }
}

// Run the test
test1SimpleHebrew()
  .then(() => {
    console.log('=== Test 1 Complete ===\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test 1 failed:', error);
    process.exit(1);
  });
