import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a promise that rejects after a specified timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wraps a promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, createTimeout(ms)]);
}

/**
 * HTML Form Field structure (from client)
 */
interface HtmlFormField {
  id: string;
  name: string;
  type: string;
  label?: string;
  required: boolean;
  placeholder?: string;
  value?: string;
  options?: string[];
  section?: string;
  tabOrder?: number;
  direction: 'ltr' | 'rtl';
}

/**
 * Field group structure
 */
interface HtmlFieldGroup {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  order: number;
}

/**
 * Generation options
 */
interface GenerationOptions {
  formTitle?: string;
  formDescription?: string;
  language: string;
  rtl: boolean;
  theme: {
    primaryColor: string;
    fontFamily: string;
    spacing: string;
    style: string;
  };
  includeValidation: boolean;
}

/**
 * Request body structure
 */
interface RequestBody {
  fields: HtmlFormField[];
  groups: HtmlFieldGroup[];
  options: GenerationOptions;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    const { fields, groups, options }: RequestBody = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing or invalid fields data' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-pro';
    const parsedTimeout = parseInt(process.env.GEMINI_TIMEOUT || '90000', 10);
    const timeout = Number.isNaN(parsedTimeout) ? 90000 : parsedTimeout;

    console.log(`[HTML Generation] Using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const { primaryColor, style } = options.theme;

    const prompt = `You are an elite frontend developer specializing in accessible, RTL (Hebrew) forms.
Your task is to generate a professional, COMPLETE standalone HTML5 form document.

DESIGN REFERENCE (DocsFlow/Phoenix Style):
- Colors: Primary accent: ${primaryColor}, Text: #333, Background: #f4f4f4
- Layout: Modern flex/grid rows, clean sections with colored legends
- Container: max-width: 900px, white background, subtle shadow, colored top border
- Fields: Labels above inputs, rounded borders (${style === 'modern' ? '8px' : style === 'classic' ? '0' : '4px'})
- Typography: ${options.theme.fontFamily}
- RTL Support: ${options.rtl ? 'Full RTL layout (dir="rtl", lang="he")' : 'LTR layout'}

FORM METADATA:
- Title: ${options.formTitle || 'טופס'}
- Description: ${options.formDescription || ''}
- Language: ${options.language}

FIELD GROUPS (Sections):
${JSON.stringify(groups, null, 2)}

FIELDS DATA:
${JSON.stringify(
  fields.map((f) => ({
    id: f.id,
    name: f.name,
    label: f.label,
    type: f.type,
    required: f.required,
    options: f.options,
    section: f.section,
  })),
  null,
  2
)}

CRITICAL REQUIREMENTS:
1. Generate a COMPLETE, STANDALONE HTML document (with <!DOCTYPE html>, <html>, <head>, <body>)
2. Include ALL CSS inline within a <style> tag in the <head>
3. Include validation JavaScript inline within a <script> tag before </body>
4. Use semantic HTML5 (fieldset, legend, label, proper input types)
5. Implement ${options.rtl ? 'RTL' : 'LTR'} layout correctly
6. Group fields by their sections using the provided field groups
7. Make it responsive (works on mobile, tablet, desktop)
8. Add ARIA attributes for accessibility
9. The form should look premium, modern, and professional
10. Use Hebrew labels exactly as provided

FIELD TYPE MAPPING:
- "text" → <input type="text">
- "email" → <input type="email">
- "tel" → <input type="tel">
- "date" → <input type="date">
- "number" → <input type="number">
- "textarea" → <textarea>
- "select" → <select> with options
- "checkbox" → <input type="checkbox">
- "radio" → <input type="radio"> group with options
- "signature" → signature placeholder box

Return a JSON object with this EXACT structure:
{
  "html": "The COMPLETE HTML document as a single string",
  "css": "The CSS content (for reference, already included in HTML)",
  "js": "The JavaScript content (for reference, already included in HTML)"
}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks or explanations.`;

    console.log('[HTML Generation] Sending request to Gemini...');

    const result = await withTimeout(
      model.generateContent(prompt),
      timeout
    );

    const responseText = result.response.text();
    let cleanedText = responseText.trim();

    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to extract JSON if response contains extra text
    if (!cleanedText.startsWith('{')) {
      const jsonMatch = cleanedText.match(/\{[\s\S]*"html"[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
        console.log('[HTML Generation] Extracted JSON from mixed response');
      } else {
        console.error(
          '[HTML Generation] Response was not JSON:',
          cleanedText.substring(0, 200)
        );
        throw new Error('AI returned text instead of JSON');
      }
    }

    let aiResponse: { html: string; css: string; js: string };
    try {
      aiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        '[HTML Generation] JSON parse failed:',
        cleanedText.substring(0, 500)
      );
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!aiResponse.html) {
      throw new Error('Invalid response format: missing html');
    }

    const formId = `form_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    console.log('[HTML Generation] Successfully generated HTML form');

    return res.status(200).json({
      success: true,
      data: {
        formId,
        htmlContent: aiResponse.html,
        cssContent: aiResponse.css || '',
        jsContent: aiResponse.js || '',
        metadata: {
          fieldCount: fields.length,
          sectionCount: groups.length,
          rtl: options.rtl,
          generatedAt: new Date().toISOString(),
          method: 'gemini',
        },
      },
    });
  } catch (error) {
    console.error('[HTML Generation] Error:', error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'HTML generation failed',
    });
  }
}
