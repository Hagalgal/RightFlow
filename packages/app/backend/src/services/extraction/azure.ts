/**
 * Azure Document Intelligence OCR Service
 */
import DocumentIntelligence, {
  AnalyzeResultOutput,
  getLongRunningPoller,
  isUnexpected,
} from '@azure-rest/ai-document-intelligence';
import { AzureKeyCredential } from '@azure/core-auth';
import {
  OcrPageData,
  OcrTextLine,
  OcrWord,
  OcrSelectionMark,
  OcrTableCell,
  PageInfo,
  PAGE_SIZES,
} from './types';
import { convertPolygonToBox } from './utils';

/**
 * Run Azure Document Intelligence OCR on PDF
 */
export async function runAzureOcr(
  pdfBase64: string,
  pageInfoMap: Map<number, PageInfo>,
): Promise<{ ocrPages: Map<number, OcrPageData>; raw: AnalyzeResultOutput }> {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT!;
  const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY!;
  const client = DocumentIntelligence(
    endpoint,
    new AzureKeyCredential(apiKey),
  );

  console.log('[Hybrid] Phase 1: Sending to Azure DI...');
  const initialResponse = await client
    .path('/documentModels/{modelId}:analyze', 'prebuilt-layout')
    .post({
      contentType: 'application/json',
      body: { base64Source: pdfBase64 },
      queryParameters: { features: ['keyValuePairs'] },
    });

  if (isUnexpected(initialResponse)) {
    throw new Error(
      `Azure API error: ${JSON.stringify(initialResponse.body)}`,
    );
  }

  const poller = getLongRunningPoller(client, initialResponse);
  const result = await poller.pollUntilDone();
  if (isUnexpected(result)) {
    throw new Error(
      `Azure analysis failed: ${JSON.stringify(result.body)}`,
    );
  }

  const resultBody = result.body as {
    analyzeResult?: AnalyzeResultOutput;
  };
  const analyzeResult = resultBody.analyzeResult;
  if (!analyzeResult) {
    throw new Error('No analysis result from Azure');
  }

  // Build OCR page data
  const ocrPages = new Map<number, OcrPageData>();

  if (analyzeResult.pages) {
    for (const page of analyzeResult.pages) {
      const pi = pageInfoMap.get(page.pageNumber) || {
        pageNumber: page.pageNumber,
        width: PAGE_SIZES.A4.width,
        height: PAGE_SIZES.A4.height,
      };

      const textLines: OcrTextLine[] = (page.lines || []).map(
        (l: any) => ({
          content: l.content || '',
          box: convertPolygonToBox(l.polygon || [], pi),
        }),
      );

      const words: OcrWord[] = (page.words || []).map((w: any) => ({
        content: w.content || '',
        box: convertPolygonToBox(w.polygon || [], pi),
      }));

      const selectionMarks: OcrSelectionMark[] = (
        page.selectionMarks || []
      ).map((m: any) => ({
        state: m.state || 'unselected',
        box: convertPolygonToBox(m.polygon || [], pi),
        confidence: m.confidence || 0.5,
      }));

      ocrPages.set(page.pageNumber, {
        pageNumber: page.pageNumber,
        dimensions: { width: pi.width, height: pi.height },
        textLines,
        words,
        tables: [],
        selectionMarks,
        kvPairsWithValue: [],
      });

      console.log(
        `[Hybrid] Page ${page.pageNumber}: ` +
          `${textLines.length} lines, ${words.length} words, ` +
          `${selectionMarks.length} selection marks`,
      );
    }
  }

  // Process tables
  if (analyzeResult.tables) {
    for (const table of analyzeResult.tables) {
      // Find which page this table belongs to
      const firstCell = table.cells?.[0];
      const tablePageNum =
        firstCell?.boundingRegions?.[0]?.pageNumber || 1;
      const pi = pageInfoMap.get(tablePageNum) || {
        pageNumber: tablePageNum,
        width: PAGE_SIZES.A4.width,
        height: PAGE_SIZES.A4.height,
      };

      const cells: OcrTableCell[] = (table.cells || []).map(
        (c: any) => ({
          rowIndex: c.rowIndex,
          columnIndex: c.columnIndex,
          content: c.content || '',
          box: c.boundingRegions?.[0]?.polygon
            ? convertPolygonToBox(
                c.boundingRegions[0].polygon,
                pi,
              )
            : { x: 0, y: 0, width: 50, height: 20 },
          kind: c.kind,
        }),
      );

      const ocrPage = ocrPages.get(tablePageNum);
      if (ocrPage) {
        ocrPage.tables.push({
          rowCount: table.rowCount || 0,
          columnCount: table.columnCount || 0,
          cells,
        });
      }
    }

    console.log(
      `[Hybrid] Found ${analyzeResult.tables.length} tables`,
    );
  }

  // Process KV pairs with value regions
  if (analyzeResult.keyValuePairs) {
    for (const kv of analyzeResult.keyValuePairs) {
      if (!kv.value?.boundingRegions?.length) continue;
      if (!kv.key?.boundingRegions?.length) continue;

      const keyRegion = kv.key.boundingRegions[0];
      const valueRegion = kv.value.boundingRegions[0];
      const pi = pageInfoMap.get(keyRegion.pageNumber) || {
        pageNumber: keyRegion.pageNumber,
        width: PAGE_SIZES.A4.width,
        height: PAGE_SIZES.A4.height,
      };

      const ocrPage = ocrPages.get(keyRegion.pageNumber);
      if (ocrPage) {
        ocrPage.kvPairsWithValue.push({
          key: kv.key.content || '',
          keyBox: convertPolygonToBox(
            keyRegion.polygon || [],
            pi,
          ),
          valueBox: convertPolygonToBox(
            valueRegion.polygon || [],
            pi,
          ),
          confidence: kv.confidence || 0.8,
        });
      }
    }
  }

  return { ocrPages, raw: analyzeResult };
}
