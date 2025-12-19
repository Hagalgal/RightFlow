import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is not configured',
      });
    }

    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing PDF data' });
    }

    // Initialize Gemini AI with validated API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `Analyze this PDF form and extract all fillable field locations.

For each field, you must provide:
- type: one of "text", "checkbox", "radio", "dropdown", or "signature"
- x: X coordinate in points (origin at BOTTOM-LEFT of page)
- y: Y coordinate in points (origin at BOTTOM-LEFT of page)
- width: width in points
- height: height in points
- pageNumber: page number (starting from 1)
- label: the field label text in its original language (Hebrew or English)
- name: suggested field name in snake_case (use English characters)
- required: true if the field has an asterisk (*) or "חובה" marker, false otherwise
- direction: "rtl" if the label is in Hebrew, "ltr" if in English

Important coordinate system notes:
- PDF coordinate system has origin at BOTTOM-LEFT
- Y-axis goes UP (0 is at the bottom of the page)
- Measurements are in points (1 point = 1/72 inch)

For field type detection:
- Small square boxes (usually 10-20 points) = "checkbox"
- Small circular/square boxes in groups with same name = "radio"
- Rectangular boxes for text entry = "text"
- Signature lines or boxes = "signature"
- Dropdown indicators = "dropdown"

Return ONLY a valid JSON array with no markdown formatting, no code blocks, no explanations:
[{"type":"text","x":640,"y":145,"width":150,"height":20,"pageNumber":1,"label":"שם החברה המנהלת","name":"company_name","required":true,"direction":"rtl"}]

Ensure all coordinates are accurate and within the page boundaries.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
    ]);

    const responseText = result.response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const fields = JSON.parse(cleanedText);

    // Validate that we got an array
    if (!Array.isArray(fields)) {
      throw new Error('Invalid response format: expected array');
    }

    return res.status(200).json({ fields });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Field extraction failed',
    });
  }
}
