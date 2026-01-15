/**
 * Responses API Endpoint (Phase 1)
 * Handles form response submissions and retrieval
 *
 * Routes:
 * - GET /api/responses?formId=xxx - Get responses for a form
 * - POST /api/responses - Submit a response
 * - DELETE /api/responses?id=xxx - Delete a response
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ResponsesService } from '../src/services/responses/responses.service';

const responsesService = new ResponsesService();

/**
 * Get user ID from auth header (for protected endpoints)
 */
async function getUserFromAuth(req: VercelRequest): Promise<string | null> {
  // TODO: Implement proper Clerk JWT verification
  return req.headers['x-user-id'] as string || null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetResponses(req, res);

      case 'POST':
        return await handleSubmitResponse(req, res);

      case 'DELETE':
        return await handleDeleteResponse(req, res);

      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: `${req.method} is not supported`,
        });
    }
  } catch (error) {
    console.error('Responses API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/responses?formId=xxx
 * Get responses for a form (requires authentication)
 */
async function handleGetResponses(
  req: VercelRequest,
  res: VercelResponse
) {
  const { formId, export: exportFormat } = req.query;

  if (!formId || typeof formId !== 'string') {
    return res.status(400).json({
      error: 'Bad request',
      message: 'formId is required',
    });
  }

  // Authenticate user
  const userId = await getUserFromAuth(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid authentication required',
    });
  }

  // Handle export formats
  if (exportFormat === 'csv') {
    const csv = await responsesService.exportResponsesAsCSV(formId, userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="responses-${formId}.csv"`);
    return res.status(200).send(csv);
  }

  if (exportFormat === 'json') {
    const json = await responsesService.exportResponsesAsJSON(formId, userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="responses-${formId}.json"`);
    return res.status(200).send(json);
  }

  // Get responses
  const responses = await responsesService.getFormResponses(formId, userId);

  return res.status(200).json({
    responses,
    count: responses.length,
  });
}

/**
 * POST /api/responses
 * Submit a form response (public endpoint, no auth required)
 */
async function handleSubmitResponse(
  req: VercelRequest,
  res: VercelResponse
) {
  const { formId, data } = req.body;

  if (!formId || !data) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'formId and data are required',
    });
  }

  // Get submitter info
  const submitterIp = req.headers['x-forwarded-for'] as string ||
                      req.headers['x-real-ip'] as string ||
                      'unknown';
  const submitterUserAgent = req.headers['user-agent'] || 'unknown';

  const result = await responsesService.submitResponse({
    formId,
    data,
    submitterIp,
    submitterUserAgent,
  });

  if (!result.success) {
    return res.status(400).json({
      error: 'Failed to submit response',
      message: result.error,
    });
  }

  return res.status(201).json({
    success: true,
    response: result.response,
    message: 'Response submitted successfully',
  });
}

/**
 * DELETE /api/responses?id=xxx
 * Delete a response (requires authentication)
 */
async function handleDeleteResponse(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Response ID is required',
    });
  }

  // Authenticate user
  const userId = await getUserFromAuth(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid authentication required',
    });
  }

  const result = await responsesService.deleteResponse(id, userId);

  if (!result.success) {
    return res.status(result.error?.includes('unauthorized') ? 403 : 400).json({
      error: 'Failed to delete response',
      message: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Response deleted successfully',
  });
}
