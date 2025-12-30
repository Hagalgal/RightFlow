/**
 * HTML Form Generation Module
 * Main entry point for generating HTML forms from field definitions
 */

import type { FieldDefinition } from '@/types/fields';
import type {
  HtmlGenerationOptions,
  GeneratedHtmlResult,
} from './types';
import { generateHtmlWithGemini } from './gemini-html-generation';
import { generateHtmlFormTemplate } from './html-generator.service';
import { detectFormDirection } from './field-mapper';

// Re-export types for convenience
export type {
  HtmlFormField,
  HtmlFieldGroup,
  HtmlFormTheme,
  HtmlGenerationOptions,
  GeneratedHtmlResult,
} from './types';

export { DEFAULT_HTML_GENERATION_OPTIONS } from './types';

/**
 * Progress callback type
 */
export type ProgressCallback = (status: string, progress?: number) => void;

/**
 * Main HTML generation function
 * Orchestrates AI and template-based generation with automatic fallback
 *
 * @param fields - Array of field definitions from RightFlow
 * @param options - Generation options (partial, merged with defaults)
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to generated HTML result
 */
export async function generateHtmlForm(
  fields: FieldDefinition[],
  options: Partial<HtmlGenerationOptions> = {},
  onProgress?: ProgressCallback
): Promise<GeneratedHtmlResult> {
  if (!fields || fields.length === 0) {
    throw new Error('No fields provided for HTML generation');
  }

  // Determine generation method
  const method = options.generationMethod || 'auto';

  // Auto-detect RTL if not specified
  const rtl = options.rtl ?? detectFormDirection(fields) === 'rtl';
  const finalOptions = { ...options, rtl };

  // Template-only mode
  if (method === 'template') {
    onProgress?.('יוצר HTML מתבנית...', 50);
    const result = await generateHtmlFormTemplate(fields, finalOptions);
    onProgress?.('הושלם!', 100);
    return result;
  }

  // AI mode or auto mode (AI with fallback)
  if (method === 'ai' || method === 'auto') {
    try {
      onProgress?.('יוצר HTML באמצעות AI...', 20);
      const result = await generateHtmlWithGemini(fields, finalOptions);
      onProgress?.('הושלם!', 100);
      return result;
    } catch (error) {
      console.warn(
        '[HTML Generation] AI generation failed, falling back to template:',
        error
      );

      // If strict AI mode, throw the error
      if (method === 'ai') {
        throw error;
      }

      // Auto mode: fallback to template
      onProgress?.('AI נכשל, יוצר מתבנית...', 60);
      const result = await generateHtmlFormTemplate(fields, finalOptions);
      onProgress?.('הושלם!', 100);
      return result;
    }
  }

  // Default fallback
  return generateHtmlFormTemplate(fields, finalOptions);
}

/**
 * Downloads the generated HTML as a file
 */
export function downloadHtmlFile(
  result: GeneratedHtmlResult,
  filename?: string
): void {
  const blob = new Blob([result.htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${result.formId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Opens the generated HTML in a new browser tab for preview
 */
export function previewHtmlInNewTab(result: GeneratedHtmlResult): Window | null {
  const blob = new Blob([result.htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');

  // Clean up URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return newWindow;
}

/**
 * Creates a data URL from the HTML content for iframe embedding
 */
export function createHtmlDataUrl(result: GeneratedHtmlResult): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(result.htmlContent)}`;
}
