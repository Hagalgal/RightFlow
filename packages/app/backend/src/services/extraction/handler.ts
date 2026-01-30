/**
 * Main Hybrid Extraction Handler
 * Orchestrates Azure OCR + Gemini Analysis + Smart Matching
 */
import {
  PageInfo,
  ExtractedField,
  ExtractionResponse,
  PAGE_SIZES,
} from './types';
import { extractPageDimensions, isHebrewText, generateFieldName } from './utils';
import { runAzureOcr } from './azure';
import { runGeminiAnalysis } from './gemini';
import { matchAndPositionFields } from './matching';

/**
 * Process PDF with hybrid extraction
 */
export async function processHybridExtraction(
  pdfBase64: string,
): Promise<ExtractionResponse> {
  // Validate environment variables
  const azureEndpoint =
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const azureKey =
    process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!azureEndpoint || !azureKey) {
    throw new Error('Azure Document Intelligence not configured');
  }
  if (!geminiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Extract page dimensions
  const pageInfoList = await extractPageDimensions(pdfBase64);
  const pageInfoMap = new Map<number, PageInfo>();
  for (const info of pageInfoList) {
    pageInfoMap.set(info.pageNumber, info);
  }

  console.log(
    `[Hybrid] Processing ${pageInfoList.length} page(s)`,
  );

  // Phase 1: Azure OCR
  const { ocrPages, raw: azureResult } = await runAzureOcr(
    pdfBase64,
    pageInfoMap,
  );

  // Phase 2 + 3: For each page, run Gemini analysis and match
  const allFields: ExtractedField[] = [];

  for (const [pageNum, ocrData] of ocrPages) {
    const pageInfo = pageInfoMap.get(pageNum) || {
      pageNumber: pageNum,
      width: PAGE_SIZES.A4.width,
      height: PAGE_SIZES.A4.height,
    };

    try {
      // Phase 2: Gemini analysis
      const geminiResult = await runGeminiAnalysis(
        pdfBase64,
        ocrData,
      );

      // Phase 3: Match and position
      const pageFields = matchAndPositionFields(
        geminiResult,
        ocrData,
        pageInfo,
      );
      allFields.push(...pageFields);

      // Phase 4: Gap detection
      const gap =
        geminiResult.totalFieldCount - pageFields.length;
      if (gap > 0) {
        console.warn(
          `[Hybrid] Page ${pageNum}: Gemini expected ` +
            `${geminiResult.totalFieldCount} fields, ` +
            `got ${pageFields.length} (${gap} gap)`,
        );
      }
    } catch (geminiError) {
      console.error(
        `[Hybrid] Gemini failed for page ${pageNum}:`,
        geminiError,
      );
      // Fallback: use Azure OCR text lines as labels
      console.log(
        `[Hybrid] Falling back to Azure-only for page ${pageNum}`,
      );

      // Simple fallback: create fields from label-like text
      for (const line of ocrData.textLines) {
        const content = line.content.trim();
        if (
          content.endsWith(':') ||
          content.endsWith('׃')
        ) {
          const isRtl = isHebrewText(content);
          const leftMargin = pageInfo.width * 0.05;
          const inputX = isRtl
            ? Math.max(leftMargin, line.box.x - 150)
            : line.box.x + line.box.width + 5;
          const inputWidth = isRtl
            ? line.box.x - inputX - 3
            : 140;

          allFields.push({
            type: 'text',
            name: generateFieldName(content, allFields.length),
            label: content.replace(/:$/, ''),
            x: inputX,
            y: line.box.y,
            width: Math.max(inputWidth, 50),
            height: 20,
            pageNumber: pageNum,
            direction: isRtl ? 'rtl' : 'ltr',
            required: false,
            confidence: 0.5,
            _source: 'azure_fallback',
          });
        }
      }
    }
  }

  // Generate stats
  const pageStats: Record<number, number> = {};
  allFields.forEach((f) => {
    pageStats[f.pageNumber] =
      (pageStats[f.pageNumber] || 0) + 1;
  });

  console.log(
    `[Hybrid] DONE: ${allFields.length} total fields across ` +
      `${pageInfoList.length} pages`,
  );
  console.log('[Hybrid] Fields per page:', pageStats);

  return {
    fields: allFields,
    guidanceTexts: [],
    anchorPoints: [],
    formMetadata: {
      companyName: 'Unknown',
      formName: 'Document',
      confidence: 'medium',
    },
    pageDimensions: pageInfoList,
    stats: {
      totalFields: allFields.length,
      fieldsPerPage: pageStats,
      pageCount: pageInfoList.length,
    },
    _source: 'hybrid_azure_gemini',
    _debug: {
      approach: 'hybrid',
      azurePages: azureResult.pages?.length || 0,
      azureKvPairs: azureResult.keyValuePairs?.length || 0,
      azureTables: azureResult.tables?.length || 0,
      pagesProcessed: ocrPages.size,
    },
  };
}
