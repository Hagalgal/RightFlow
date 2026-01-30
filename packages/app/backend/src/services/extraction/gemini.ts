/**
 * Gemini Visual Analysis Service
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OcrPageData, GeminiPageResult } from './types';
import { extractSinglePage } from './utils';

/**
 * Build Gemini prompt for field identification
 */
function buildGeminiPrompt(ocrData: OcrPageData): string {
  // Build OCR text list for Gemini to reference
  const textList = ocrData.textLines
    .map((l, i) => `  [${i + 1}] "${l.content}"`)
    .join('\n');

  const tableInfo =
    ocrData.tables.length > 0
      ? ocrData.tables
          .map(
            (t, i) =>
              `  Table ${i + 1}: ${t.rowCount} rows x ${t.columnCount} cols`,
          )
          .join('\n')
      : '  (no tables detected)';

  const selectionInfo =
    ocrData.selectionMarks.length > 0
      ? `  ${ocrData.selectionMarks.length} selection marks (checkboxes/radio buttons)`
      : '  (no selection marks detected)';

  return `You are analyzing a Hebrew RTL form page. I have already extracted all text using OCR.
Your job is to identify WHAT form fields exist on this page — not WHERE they are.

OCR TEXT FOUND ON THIS PAGE:
${textList}

TABLES:
${tableInfo}

SELECTION MARKS:
${selectionInfo}

For EACH fillable form field you can see, provide:
1. "labelText": the exact Hebrew label text associated with this field
   - MUST match one of the OCR texts above (copy exactly)
   - For fields without labels, use a descriptive name
2. "fieldType": one of:
   - "underline" — fill field with underline (קו למילוי)
   - "box_with_title" — fill box with title below (קופסא + כותרת)
   - "digit_boxes" — boxes for individual digits (קופסאות ספרות)
   - "table_cell" — input cell within a table (תא בטבלה)
   - "title_right" — title on right with fill area to left (כותרת מימין)
   - "selection_mark" — checkbox or radio button (סימון בחירה)
3. "inputType": "text" | "checkbox" | "radio" | "signature" | "dropdown"
4. "section": logical section name (Hebrew)
5. "required": true/false

CRITICAL RULES:
- Identify EVERY fillable field on the page — do not skip any
- Look at the ENTIRE page including header, body, footer, and bottom areas
- For digit boxes (phone, ID): count as ONE field with fieldType "digit_boxes"
- For table cells that expect user input: each is a separate field
- Selection marks (checkboxes/radio) should be identified with their nearby label text
- The form is in Hebrew (right-to-left). Labels are on the RIGHT side.

SIGNATURE FIELD DETECTION — VERY IMPORTANT:
- Any label containing "חתימה" or "חתימת" MUST have inputType: "signature"
  Examples: "חתימת מזמין השירות", "חתימת המזמין", "חתימת נותן השירות",
  "חתימה", "חתימת הלקוח", "חתימת מורשה חתימה", "חתימת מסמך השירות"
- Signature areas are visually larger blank spaces for handwritten signatures
- When a label like "חתימת מזמין השירות" appears, create TWO fields:
  1. The signature field (inputType: "signature") for the actual signature area
  2. If there's also a name/text area nearby (e.g., line for printed name),
     add it as a separate text field

FIELD DETECTION TIPS:
- Blank lines, underlines, or empty spaces next to labels are fillable fields
- Fields at the bottom of the page (dates, signatures) are often missed — check carefully
- "תאריך" (date) fields should be inputType: "text"
- If a label has both a signature area AND a name/text field, report BOTH
- Return "totalFieldCount" with the total number of fields you identified

RETURN ONLY VALID JSON:
{
  "totalFieldCount": <number>,
  "fields": [
    {
      "labelText": "<exact OCR text>",
      "fieldType": "<type>",
      "inputType": "<type>",
      "section": "<section name>",
      "required": <true/false>
    }
  ]
}`;
}

/**
 * Run Gemini visual analysis on a PDF page
 */
export async function runGeminiAnalysis(
  pdfBase64: string,
  ocrData: OcrPageData,
): Promise<GeminiPageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-pro';
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = buildGeminiPrompt(ocrData);

  console.log(
    `[Hybrid] Phase 2: Extracting page ${ocrData.pageNumber} for Gemini...`,
  );

  // Extract ONLY this specific page before sending to Gemini
  const singlePagePdf = await extractSinglePage(
    pdfBase64,
    ocrData.pageNumber,
  );

  console.log(
    `[Hybrid] Phase 2: Sending page ${ocrData.pageNumber} to Gemini...`,
  );

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: singlePagePdf,
      },
    },
  ]);

  let text = result.response.text().trim();

  // Clean markdown code blocks
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Extract JSON if mixed with text
  if (!text.startsWith('{')) {
    const match = text.match(/\{[\s\S]*"fields"[\s\S]*\}/);
    if (match) text = match[0];
  }

  try {
    const parsed = JSON.parse(text) as GeminiPageResult;
    console.log(
      `[Hybrid] Gemini identified ${parsed.totalFieldCount} fields ` +
        `(${parsed.fields.length} in detail)`,
    );
    return parsed;
  } catch (e) {
    console.error(
      '[Hybrid] Gemini JSON parse error:',
      text.substring(0, 200),
    );
    return { totalFieldCount: 0, fields: [] };
  }
}
