/**
 * Generate PWA Icons from SVG
 *
 * This script generates all required PWA icon sizes from the source SVG logo.
 *
 * Usage:
 *   npm install sharp
 *   node scripts/generate-icons.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(__dirname, '..', 'public', 'icons', 'logo.svg');
const outputDir = join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  console.log('🎨 Generating PWA Icons...\n');

  try {
    // Read SVG file
    const svgBuffer = readFileSync(inputSvg);

    // Generate each size
    for (const size of sizes) {
      const outputPath = join(outputDir, `icon-${size}x${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 51, b: 153, alpha: 1 } // #003399
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Check public/icons/ directory');
    console.log('2. Run: npm run build');
    console.log('3. Test PWA install flow');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure sharp is installed: npm install sharp');
    console.log('2. Verify logo.svg exists in public/icons/');
    process.exit(1);
  }
}

generateIcons();
