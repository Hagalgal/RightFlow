/**
 * Field Extraction API Routes
 * POST /api/v1/extract-fields-hybrid - Hybrid Azure + Gemini extraction
 */
import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../../utils/validation';
import logger from '../../utils/logger';
import { processHybridExtraction } from '../../services/extraction/handler';

const router = express.Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const extractFieldsSchema = z.object({
  pdfBase64: z.string().min(1, 'PDF data is required'),
  pageCount: z.number().optional(),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/v1/extract-fields-hybrid
 * Extract form fields from PDF using hybrid Azure + Gemini approach
 */
router.post('/extract-fields-hybrid', async (req, res, next) => {
  try {
    logger.info('Starting hybrid field extraction');

    // Validate request body
    const { pdfBase64, pageCount } = validateRequest(
      extractFieldsSchema,
      req.body,
    );

    logger.info(`Processing PDF with ${pageCount || 'unknown'} pages`);

    // Run hybrid extraction
    const result = await processHybridExtraction(pdfBase64);

    logger.info(
      `Extraction completed: ${result.stats.totalFields} fields extracted`,
    );

    res.status(200).json(result);
  } catch (error) {
    logger.error('Field extraction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
});

export default router;
