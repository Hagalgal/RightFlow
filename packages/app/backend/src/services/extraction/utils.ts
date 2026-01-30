/**
 * Utility functions for PDF field extraction
 */
import { PDFDocument } from 'pdf-lib';
import {
  Box,
  PageInfo,
  POINTS_PER_INCH,
  PAGE_SIZES,
  HEBREW_FIELD_NAMES,
} from './types';

/**
 * Check if text contains Hebrew characters
 */
export function isHebrewText(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * Generate field name from label text
 */
export function generateFieldName(label: string, index: number): string {
  const clean = label.trim().replace(/[:\s]+$/, '');
  for (const [heb, eng] of Object.entries(HEBREW_FIELD_NAMES)) {
    if (clean.includes(heb)) return eng;
  }
  return `field_${index + 1}`;
}

/**
 * Convert Azure bounding polygon (inches, clockwise from TL) to PDF points
 */
export function convertPolygonToBox(
  polygon: number[],
  pageInfo: PageInfo,
): Box {
  if (!polygon || polygon.length < 8) {
    return { x: 0, y: 0, width: 50, height: 20 };
  }
  const [tlX, tlY, trX, trY, brX, brY, blX, blY] = polygon;
  // Use min/max across ALL coordinates to handle rotated/skewed boxes
  const xMin = Math.min(tlX, trX, brX, blX) * POINTS_PER_INCH;
  const xMax = Math.max(tlX, trX, brX, blX) * POINTS_PER_INCH;
  const yMin = Math.min(tlY, trY, brY, blY) * POINTS_PER_INCH;
  const yMax = Math.max(tlY, trY, brY, blY) * POINTS_PER_INCH;
  return {
    x: Math.round(xMin * 100) / 100,
    y: Math.round((pageInfo.height - yMax) * 100) / 100,
    width: Math.round((xMax - xMin) * 100) / 100,
    height: Math.round((yMax - yMin) * 100) / 100,
  };
}

/**
 * Extract page dimensions from PDF using pdf-lib
 */
export async function extractPageDimensions(
  pdfBase64: string,
): Promise<PageInfo[]> {
  try {
    const pdfBytes = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
    });
    return pdfDoc.getPages().map((page, i) => {
      const { width, height } = page.getSize();
      const rot = page.getRotation().angle;
      const w = rot === 90 || rot === 270 ? height : width;
      const h = rot === 90 || rot === 270 ? width : height;
      return { pageNumber: i + 1, width: w, height: h };
    });
  } catch {
    return [
      {
        pageNumber: 1,
        width: PAGE_SIZES.A4.width,
        height: PAGE_SIZES.A4.height,
      },
    ];
  }
}

/**
 * Extract a single page from a multi-page PDF
 * Returns the extracted page as base64
 */
export async function extractSinglePage(
  pdfBase64: string,
  pageNumber: number,
): Promise<string> {
  try {
    const pdfBytes = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
    });

    // Create new PDF with only the specified page
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1]);
    newPdf.addPage(copiedPage);

    // Save and return as base64
    const newPdfBytes = await newPdf.save();
    return Buffer.from(newPdfBytes).toString('base64');
  } catch (error) {
    console.error(
      `[Hybrid] Failed to extract page ${pageNumber}:`,
      error,
    );
    throw error;
  }
}

/**
 * Hebrew-aware fuzzy text matching
 * Returns a score 0-1 indicating how well two strings match
 */
export function hebrewTextSimilarity(a: string, b: string): number {
  const cleanA = a
    .trim()
    .replace(/[:\s׃]+$/, '')
    .replace(/\s+/g, ' ');
  const cleanB = b
    .trim()
    .replace(/[:\s׃]+$/, '')
    .replace(/\s+/g, ' ');

  // Handle empty strings - no match unless both are empty
  if (cleanA === '' || cleanB === '') {
    return cleanA === cleanB ? 1.0 : 0;
  }

  if (cleanA === cleanB) return 1.0;
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return 0.9;

  // Normalize Hebrew characters
  const normA = cleanA.replace(/[\u05B0-\u05BD\u05BF-\u05C7]/g, '');
  const normB = cleanB.replace(/[\u05B0-\u05BD\u05BF-\u05C7]/g, '');
  if (normA === normB) return 0.95;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  return 0;
}

/**
 * Calculate overall confidence score for a positioned field
 */
export function calculateConfidence(factors: {
  labelMatch: number;
  positionCertainty: number;
  typeCertainty: number;
  visualBoundary?: boolean;
}): {
  overall: number;
  breakdown: {
    labelMatch: number;
    positionCertainty: number;
    typeCertainty: number;
  };
  quality: 'high' | 'medium' | 'low';
} {
  const LABEL_WEIGHT = 0.3;
  const POSITION_WEIGHT = 0.5;
  const TYPE_WEIGHT = 0.2;
  const VISUAL_BOUNDARY_BOOST = 0.05;

  let overall =
    factors.labelMatch * LABEL_WEIGHT +
    factors.positionCertainty * POSITION_WEIGHT +
    factors.typeCertainty * TYPE_WEIGHT;

  if (factors.visualBoundary === true) {
    overall += VISUAL_BOUNDARY_BOOST;
  }

  overall = Math.min(overall, 1.0);

  let quality: 'high' | 'medium' | 'low';
  if (overall >= 0.85) {
    quality = 'high';
  } else if (overall >= 0.70) {
    quality = 'medium';
  } else {
    quality = 'low';
  }

  return {
    overall,
    breakdown: {
      labelMatch: factors.labelMatch,
      positionCertainty: factors.positionCertainty,
      typeCertainty: factors.typeCertainty,
    },
    quality,
  };
}
