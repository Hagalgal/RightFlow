import { FieldDefinition } from '@/types/fields';

interface GeminiFieldResponse {
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  label?: string;
  name: string;
  required: boolean;
  direction: 'ltr' | 'rtl';
}

/**
 * Extract form fields from a PDF using Gemini AI
 * @param pdfFile - The PDF file to analyze
 * @param onProgress - Optional callback for progress updates
 * @returns Array of extracted field definitions
 */
export async function extractFieldsWithAI(
  pdfFile: File,
  onProgress?: (status: string) => void,
): Promise<FieldDefinition[]> {
  onProgress?.('המרת PDF ל-Base64...');

  // Convert PDF to base64 (more efficient method)
  const arrayBuffer = await pdfFile.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const base64 = btoa(String.fromCharCode(...bytes));

  onProgress?.('שליחת בקשה ל-AI...');

  // Call Vercel Function
  const response = await fetch('/api/extract-fields', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64: base64 }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'AI extraction failed');
  }

  const { fields: geminiFields } = await response.json();

  onProgress?.('עיבוד תוצאות...');

  // Convert Gemini response to FieldDefinition[]
  const fields: FieldDefinition[] = geminiFields.map(
    (gf: GeminiFieldResponse) => ({
      id: crypto.randomUUID(),
      type: gf.type,
      pageNumber: gf.pageNumber,
      x: gf.x,
      y: gf.y,
      width: gf.width,
      height: gf.height,
      name: gf.name,
      label: gf.label,
      required: gf.required,
      direction: gf.direction,
      sectionName: 'כללי', // Default section
      autoFill: false,
      // Add font settings for text fields
      ...(gf.type === 'text' && {
        font: 'NotoSansHebrew',
        fontSize: 12,
      }),
    }),
  );

  onProgress?.('הושלם!');
  return fields;
}
