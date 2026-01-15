/**
 * Responses Service (Phase 1)
 * Handles form response submission and retrieval
 */

import { getDb } from '../../lib/db';
import crypto from 'crypto';

export interface SubmitResponseData {
  formId: string;
  data: Record<string, any>;
  submitterIp?: string;
  submitterUserAgent?: string;
}

export interface ResponseRecord {
  id: string;
  form_id: string;
  data: Record<string, any>;
  filled_pdf_path: string | null;
  submitter_ip: string | null;
  submitter_user_agent: string | null;
  metadata: Record<string, any>;
  submitted_at: Date;
}

export interface ServiceResult<T = ResponseRecord> {
  success: boolean;
  response?: T;
  error?: string;
}

export class ResponsesService {
  /**
   * Submit form response
   */
  async submitResponse(data: SubmitResponseData): Promise<ServiceResult> {
    try {
      const db = getDb();

      // Verify form exists and is published
      const form = await db('forms')
        .where({ id: data.formId })
        .whereNull('deleted_at')
        .first();

      if (!form) {
        return {
          success: false,
          error: 'Form not found',
        };
      }

      if (form.status !== 'published') {
        return {
          success: false,
          error: 'Form is not published',
        };
      }

      // Create response record
      const responseId = crypto.randomUUID();
      const responseRecord = {
        id: responseId,
        form_id: data.formId,
        data: JSON.stringify(data.data),
        filled_pdf_path: null,
        submitter_ip: data.submitterIp || null,
        submitter_user_agent: data.submitterUserAgent || null,
        metadata: JSON.stringify({}),
        submitted_at: new Date(),
      };

      await db('responses').insert(responseRecord);

      // Increment response count for user's usage metrics
      await this.incrementResponseCount(form.user_id);

      // Fetch the created response
      const created = await this.getResponseById(responseId);

      return {
        success: true,
        response: created || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit response',
      };
    }
  }

  /**
   * Get response by ID
   */
  async getResponseById(responseId: string): Promise<ResponseRecord | null> {
    try {
      const db = getDb();
      const response = await db('responses')
        .where({ id: responseId })
        .first();

      if (!response) return null;

      return this.parseResponseRecord(response);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all responses for a form
   */
  async getFormResponses(formId: string, userId: string): Promise<ResponseRecord[]> {
    try {
      const db = getDb();

      // Verify user owns the form
      const form = await db('forms')
        .where({ id: formId, user_id: userId })
        .whereNull('deleted_at')
        .first();

      if (!form) {
        return [];
      }

      const responses = await db('responses')
        .where({ form_id: formId })
        .orderBy('submitted_at', 'desc');

      return responses.map(r => this.parseResponseRecord(r));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get response count for a form
   */
  async getFormResponseCount(formId: string): Promise<number> {
    try {
      const db = getDb();
      const result = await db('responses')
        .where({ form_id: formId })
        .count('* as count')
        .first();

      return parseInt(result?.count as string || '0', 10);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Delete response
   */
  async deleteResponse(responseId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      const db = getDb();

      // Verify user owns the form
      const response = await db('responses')
        .where({ 'responses.id': responseId })
        .join('forms', 'responses.form_id', 'forms.id')
        .where({ 'forms.user_id': userId })
        .first();

      if (!response) {
        return {
          success: false,
          error: 'Response not found or unauthorized',
        };
      }

      await db('responses').where({ id: responseId }).delete();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete response',
      };
    }
  }

  /**
   * Increment response count for user's usage metrics
   */
  private async incrementResponseCount(userId: string): Promise<void> {
    try {
      const db = getDb();
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Check if metrics record exists for this period
      const existing = await db('usage_metrics')
        .where({ user_id: userId })
        .where('period_start', '>=', periodStart)
        .where('period_end', '<=', periodEnd)
        .first();

      if (existing) {
        // Increment existing record
        await db('usage_metrics')
          .where({ id: existing.id })
          .increment('responses_count', 1)
          .update({ updated_at: now });
      } else {
        // Create new metrics record for this period
        await db('usage_metrics').insert({
          id: crypto.randomUUID(),
          user_id: userId,
          forms_count: 0,
          responses_count: 1,
          storage_used_bytes: 0,
          period_start: periodStart,
          period_end: periodEnd,
          created_at: now,
          updated_at: now,
        });
      }
    } catch (error) {
      console.error('Failed to increment response count:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Parse response record from database
   */
  private parseResponseRecord(dbResponse: any): ResponseRecord {
    return {
      ...dbResponse,
      data: typeof dbResponse.data === 'string' ? JSON.parse(dbResponse.data) : dbResponse.data,
      metadata: typeof dbResponse.metadata === 'string' ? JSON.parse(dbResponse.metadata) : dbResponse.metadata,
    };
  }

  /**
   * Export responses as CSV
   */
  async exportResponsesAsCSV(formId: string, userId: string): Promise<string> {
    const responses = await this.getFormResponses(formId, userId);

    if (responses.length === 0) {
      return '';
    }

    // Get all unique field keys
    const fieldKeys = new Set<string>();
    responses.forEach(r => {
      Object.keys(r.data).forEach(key => fieldKeys.add(key));
    });

    const headers = ['Response ID', 'Submitted At', ...Array.from(fieldKeys)];
    const rows = responses.map(r => {
      const row = [
        r.id,
        r.submitted_at.toISOString(),
        ...Array.from(fieldKeys).map(key => {
          const value = r.data[key];
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (value === null || value === undefined) return '';
          return String(value);
        }),
      ];
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Export responses as JSON
   */
  async exportResponsesAsJSON(formId: string, userId: string): Promise<string> {
    const responses = await this.getFormResponses(formId, userId);
    return JSON.stringify(responses, null, 2);
  }
}

// Export singleton instance
export const responsesService = new ResponsesService();
