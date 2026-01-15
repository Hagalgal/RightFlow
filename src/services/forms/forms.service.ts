/**
 * Forms Service (Phase 1)
 * Handles form CRUD operations with PostgreSQL persistence
 *
 * Replaces localStorage with database storage
 */

import { getDb } from '../../lib/db';
import crypto from 'crypto';

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  station?: string;  // DocsFlow support
  [key: string]: any;
}

export interface CreateFormData {
  userId: string;
  title: string;
  description?: string;
  fields: FormField[];
  stations?: string[];
  settings?: Record<string, any>;
}

export interface UpdateFormData {
  title?: string;
  description?: string;
  fields?: FormField[];
  stations?: string[];
  settings?: Record<string, any>;
}

export interface FormRecord {
  id: string;
  user_id: string;
  org_id: string | null;
  tenant_type: string;
  slug: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  fields: FormField[];
  stations: string[];
  settings: Record<string, any>;
  pdf_storage_path: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface ServiceResult<T = FormRecord> {
  success: boolean;
  form?: T;
  error?: string;
}

export class FormsService {
  /**
   * Create new form
   */
  async createForm(data: CreateFormData): Promise<ServiceResult> {
    try {
      // Validate required fields
      if (!data.title || data.title.trim().length === 0) {
        return {
          success: false,
          error: 'Form title is required',
        };
      }

      const db = getDb();
      const formId = crypto.randomUUID();
      const slug = await this.generateUniqueSlug(data.title);

      const formRecord = {
        id: formId,
        user_id: data.userId,
        org_id: null,
        tenant_type: 'rightflow',
        slug,
        title: data.title,
        description: data.description || null,
        status: 'draft',
        fields: JSON.stringify(data.fields),
        stations: JSON.stringify(data.stations || []),
        settings: JSON.stringify(data.settings || {}),
        pdf_storage_path: null,
        published_at: null,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      };

      await db('forms').insert(formRecord);

      // Fetch the created form
      const created = await this.getFormById(formId);

      return {
        success: true,
        form: created || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create form',
      };
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(formId: string): Promise<FormRecord | null> {
    try {
      const db = getDb();
      const form = await db('forms')
        .where({ id: formId })
        .whereNull('deleted_at')
        .first();

      if (!form) return null;

      return this.parseFormRecord(form);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get form by slug (for public access)
   */
  async getFormBySlug(slug: string): Promise<FormRecord | null> {
    try {
      const db = getDb();
      const form = await db('forms')
        .where({ slug })
        .whereNull('deleted_at')
        .first();

      if (!form) return null;

      return this.parseFormRecord(form);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all forms for a user
   */
  async getUserForms(userId: string): Promise<FormRecord[]> {
    try {
      const db = getDb();
      const forms = await db('forms')
        .where({ user_id: userId })
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc');

      return forms.map(form => this.parseFormRecord(form));
    } catch (error) {
      return [];
    }
  }

  /**
   * Update form
   */
  async updateForm(
    formId: string,
    userId: string,
    data: UpdateFormData
  ): Promise<ServiceResult> {
    try {
      const db = getDb();

      // Check ownership
      const existing = await db('forms')
        .where({ id: formId, user_id: userId })
        .whereNull('deleted_at')
        .first();

      if (!existing) {
        return {
          success: false,
          error: 'Form not found or unauthorized',
        };
      }

      // Build update object
      const updateData: any = {
        updated_at: new Date(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.fields !== undefined) updateData.fields = JSON.stringify(data.fields);
      if (data.stations !== undefined) updateData.stations = JSON.stringify(data.stations);
      if (data.settings !== undefined) updateData.settings = JSON.stringify(data.settings);

      await db('forms').where({ id: formId }).update(updateData);

      // Fetch updated form
      const updated = await this.getFormById(formId);

      return {
        success: true,
        form: updated || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update form',
      };
    }
  }

  /**
   * Delete form (soft delete)
   */
  async deleteForm(formId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      const db = getDb();

      // Check ownership
      const existing = await db('forms')
        .where({ id: formId, user_id: userId })
        .whereNull('deleted_at')
        .first();

      if (!existing) {
        return {
          success: false,
          error: 'Form not found or unauthorized',
        };
      }

      // Soft delete
      await db('forms')
        .where({ id: formId })
        .update({ deleted_at: new Date() });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete form',
      };
    }
  }

  /**
   * Publish form
   */
  async publishForm(formId: string, userId: string): Promise<ServiceResult> {
    try {
      const db = getDb();

      // Check ownership
      const existing = await db('forms')
        .where({ id: formId, user_id: userId })
        .whereNull('deleted_at')
        .first();

      if (!existing) {
        return {
          success: false,
          error: 'Form not found or unauthorized',
        };
      }

      await db('forms')
        .where({ id: formId })
        .update({
          status: 'published',
          published_at: new Date(),
          updated_at: new Date(),
        });

      const published = await this.getFormById(formId);

      return {
        success: true,
        form: published || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish form',
      };
    }
  }

  /**
   * Unpublish form
   */
  async unpublishForm(formId: string, userId: string): Promise<ServiceResult> {
    try {
      const db = getDb();

      // Check ownership
      const existing = await db('forms')
        .where({ id: formId, user_id: userId })
        .whereNull('deleted_at')
        .first();

      if (!existing) {
        return {
          success: false,
          error: 'Form not found or unauthorized',
        };
      }

      await db('forms')
        .where({ id: formId })
        .update({
          status: 'draft',
          updated_at: new Date(),
        });

      const unpublished = await this.getFormById(formId);

      return {
        success: true,
        form: unpublished || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unpublish form',
      };
    }
  }

  /**
   * Generate unique slug from title
   */
  private async generateUniqueSlug(title: string): Promise<string> {
    const db = getDb();

    // Convert to lowercase and replace spaces/special chars with dashes
    let slug = title
      .toLowerCase()
      .trim()
      // Remove Hebrew and other non-ASCII characters
      .replace(/[^\x00-\x7F]/g, '')
      // Replace spaces and underscores with dashes
      .replace(/[\s_]+/g, '-')
      // Remove special characters
      .replace(/[^a-z0-9-]/g, '')
      // Remove multiple consecutive dashes
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '');

    // If slug is empty after sanitization, use a random string
    if (!slug) {
      slug = 'form-' + crypto.randomBytes(4).toString('hex');
    }

    // Check if slug exists
    const existing = await db('forms').where({ slug }).first();

    if (existing) {
      // Append random suffix
      const suffix = crypto.randomBytes(3).toString('hex');
      slug = `${slug}-${suffix}`;
    }

    return slug;
  }

  /**
   * Parse form record from database
   * Converts JSON strings back to objects
   */
  private parseFormRecord(dbForm: any): FormRecord {
    return {
      ...dbForm,
      fields: typeof dbForm.fields === 'string' ? JSON.parse(dbForm.fields) : dbForm.fields,
      stations: typeof dbForm.stations === 'string' ? JSON.parse(dbForm.stations) : dbForm.stations,
      settings: typeof dbForm.settings === 'string' ? JSON.parse(dbForm.settings) : dbForm.settings,
    };
  }
}

// Export singleton instance
export const formsService = new FormsService();
