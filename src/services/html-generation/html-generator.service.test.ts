import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateHtmlFormTemplate } from './html-generator.service';
import type { FieldDefinition } from '@/types/fields';

// Mock crypto.randomUUID for consistent test results
beforeEach(() => {
  vi.stubGlobal('crypto', {
    randomUUID: () => '12345678-1234-1234-1234-123456789012',
  });
});

describe('html-generator.service', () => {
  const commonProps = {
    required: false,
    direction: 'rtl' as const,
    width: 100,
    height: 20,
  };

  describe('generateHtmlFormTemplate', () => {
    it('should generate a complete HTML document', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'first_name',
          label: 'שם פרטי',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('<!DOCTYPE html>');
      expect(result.htmlContent).toContain('<html');
      expect(result.htmlContent).toContain('</html>');
      expect(result.htmlContent).toContain('<head>');
      expect(result.htmlContent).toContain('<body>');
    });

    it('should include RTL attributes for Hebrew content', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'name',
          label: 'שם',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('dir="rtl"');
      expect(result.htmlContent).toContain('lang="he"');
      expect(result.metadata.rtl).toBe(true);
    });

    it('should include field labels in the HTML', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'email',
          label: 'אימייל',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('אימייל');
    });

    it('should generate select element for dropdown fields', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'dropdown',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'city',
          label: 'עיר',
          options: ['תל אביב', 'ירושלים', 'חיפה'],
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('<select');
      expect(result.htmlContent).toContain('תל אביב');
      expect(result.htmlContent).toContain('ירושלים');
      expect(result.htmlContent).toContain('חיפה');
    });

    it('should generate checkbox input for checkbox fields', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'checkbox',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'agree',
          label: 'אני מסכים',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('type="checkbox"');
    });

    it('should generate radio inputs for radio fields with options', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'radio',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'gender',
          label: 'מין',
          options: ['זכר', 'נקבה'],
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('type="radio"');
      expect(result.htmlContent).toContain('זכר');
      expect(result.htmlContent).toContain('נקבה');
    });

    it('should include inline CSS', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('<style>');
      expect(result.cssContent).not.toBe('');
    });

    it('should include inline JavaScript', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('<script>');
      expect(result.jsContent).not.toBe('');
    });

    it('should use custom form title from options', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields, {
        formTitle: 'טופס הרשמה',
      });

      expect(result.htmlContent).toContain('טופס הרשמה');
      expect(result.htmlContent).toContain('<title>טופס הרשמה</title>');
    });

    it('should use custom form description from options', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields, {
        formDescription: 'אנא מלא את כל השדות',
      });

      expect(result.htmlContent).toContain('אנא מלא את כל השדות');
    });

    it('should group fields by section', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 700,
          name: 'name',
          label: 'שם',
          sectionName: 'פרטים אישיים',
          ...commonProps,
        },
        {
          id: '2',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 600,
          name: 'address',
          label: 'כתובת',
          sectionName: 'כתובת',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('פרטים אישיים');
      expect(result.htmlContent).toContain('כתובת');
      expect(result.htmlContent).toContain('<fieldset>');
      expect(result.htmlContent).toContain('<legend>');
    });

    it('should add required marker for required fields', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'name',
          label: 'שם',
          required: true,
          direction: 'rtl',
          width: 100,
          height: 20,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('required');
      expect(result.htmlContent).toContain('class="required"');
    });

    it('should include validation elements when includeValidation is true', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields, {
        includeValidation: true,
      });

      expect(result.htmlContent).toContain('field-validation');
    });

    it('should return proper metadata', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 700,
          name: 'f1',
          sectionName: 'Section A',
          ...commonProps,
        },
        {
          id: '2',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 600,
          name: 'f2',
          sectionName: 'Section B',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.metadata.fieldCount).toBe(2);
      expect(result.metadata.sectionCount).toBe(2);
      expect(result.metadata.method).toBe('template');
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique form ID', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.formId).toMatch(/^form_[a-f0-9]+$/);
    });

    it('should include submit button', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('type="submit"');
      expect(result.htmlContent).toContain('שלח טופס');
    });

    it('should generate signature placeholder for signature fields', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'signature',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'signature',
          label: 'חתימה',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields);

      expect(result.htmlContent).toContain('signature-box');
      expect(result.htmlContent).toContain('חתימה');
    });

    it('should use custom theme colors', async () => {
      const fields: FieldDefinition[] = [
        {
          id: '1',
          type: 'text',
          pageNumber: 1,
          x: 100,
          y: 500,
          name: 'field1',
          ...commonProps,
        },
      ];

      const result = await generateHtmlFormTemplate(fields, {
        theme: {
          primaryColor: '#ff0000',
          fontFamily: 'Arial, sans-serif',
          spacing: 'compact',
          style: 'modern',
        },
      });

      expect(result.cssContent).toContain('#ff0000');
    });
  });
});
