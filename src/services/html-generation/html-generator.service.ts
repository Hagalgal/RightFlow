/**
 * HTML Generator Service
 * Template-based HTML form generation (no AI)
 * Acts as fallback when AI generation fails
 */

import type { FieldDefinition } from '@/types/fields';
import type {
  HtmlFormField,
  HtmlFieldGroup,
  HtmlGenerationOptions,
  GeneratedHtmlResult,
} from './types';
import {
  mapFieldsToHtml,
  createFieldGroups,
  detectFormDirection,
  groupFieldsIntoRows,
} from './field-mapper';
import { generateDocsFlowCSS, generateFormJS } from './html-generator-css';

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates HTML for a single field
 */
function generateFieldHtml(
  field: HtmlFormField,
  includeValidation: boolean
): string {
  const flexGrow = field.position?.width
    ? Math.max(1, Math.round(field.position.width / 50))
    : 1;
  const displayLabel = field.label || field.name;
  const requiredMark = field.required ? '<span class="required">*</span>' : '';

  let fieldHtml = `
    <div class="form-group" style="flex-grow: ${flexGrow};" data-field-id="${escapeHtml(field.id)}">
      <label for="${escapeHtml(field.id)}">
        ${escapeHtml(displayLabel)}${requiredMark}
      </label>`;

  fieldHtml += generateInputHtml(field);

  if (includeValidation) {
    fieldHtml += `
      <div class="field-validation" id="${escapeHtml(field.id)}_validation" role="alert" aria-live="polite"></div>`;
  }

  fieldHtml += `
    </div>`;

  return fieldHtml;
}

/**
 * Generates the input element HTML based on field type
 */
function generateInputHtml(field: HtmlFormField): string {
  const baseAttrs = `
    id="${escapeHtml(field.id)}"
    name="${escapeHtml(field.id)}"
    ${field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : ''}
    ${field.required ? 'required' : ''}
    ${field.value ? `value="${escapeHtml(field.value)}"` : ''}
    ${field.tabOrder !== undefined ? `tabindex="${field.tabOrder}"` : ''}
  `.trim();

  switch (field.type) {
    case 'textarea':
      return `<textarea class="form-control" ${baseAttrs} rows="4"></textarea>`;

    case 'select': {
      let html = `<select class="form-control" ${baseAttrs}>`;
      html += `<option value="">בחר...</option>`;
      if (field.options) {
        for (const option of field.options) {
          html += `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`;
        }
      }
      html += `</select>`;
      return html;
    }

    case 'checkbox':
      return `
        <div class="checkbox-item">
          <input type="checkbox" ${baseAttrs} value="1">
          <label for="${escapeHtml(field.id)}" style="margin:0; font-weight:normal;">
            ${escapeHtml(field.label || field.name)}
          </label>
        </div>`;

    case 'radio': {
      if (field.options && field.options.length > 0) {
        let html = '<div class="radio-group">';
        for (let i = 0; i < field.options.length; i++) {
          const option = field.options[i];
          const optionId = `${field.id}_${i}`;
          html += `
            <div class="radio-item">
              <input type="radio" id="${escapeHtml(optionId)}" name="${escapeHtml(field.id)}"
                     value="${escapeHtml(option)}" ${field.required ? 'required' : ''}>
              <label for="${escapeHtml(optionId)}">${escapeHtml(option)}</label>
            </div>`;
        }
        html += '</div>';
        return html;
      }
      return `<input type="radio" ${baseAttrs}>`;
    }

    case 'signature':
      return `
        <div class="signature-box">
          <span>חתימה</span>
        </div>`;

    case 'email':
      return `<input type="email" class="form-control" ${baseAttrs}>`;

    case 'tel':
      return `<input type="tel" class="form-control" ${baseAttrs}>`;

    case 'date':
      return `<input type="date" class="form-control" ${baseAttrs}>`;

    case 'number':
      return `<input type="number" class="form-control" ${baseAttrs}>`;

    case 'text':
    default:
      return `<input type="text" class="form-control" ${baseAttrs}>`;
  }
}


/**
 * Groups fields by page number
 */
function groupFieldsByPage(
  fields: HtmlFormField[]
): Map<number, HtmlFormField[]> {
  const pageMap = new Map<number, HtmlFormField[]>();

  for (const field of fields) {
    const pageNum = field.position?.page ?? 1;
    if (!pageMap.has(pageNum)) {
      pageMap.set(pageNum, []);
    }
    pageMap.get(pageNum)!.push(field);
  }

  return pageMap;
}

/**
 * Generates tab indicators HTML
 */
function generateTabsHtml(totalPages: number): string {
  if (totalPages <= 1) return '';

  let html = '<div class="page-tabs" role="tablist">';

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <div class="page-tab${i === 1 ? ' active' : ''}"
           role="tab"
           aria-selected="${i === 1}"
           aria-controls="page-${i}"
           tabindex="${i === 1 ? 0 : -1}">
        ${i}
      </div>`;

    // Add connector between tabs (except after last)
    if (i < totalPages) {
      html += '<div class="tab-connector"></div>';
    }
  }

  html += '</div>';
  return html;
}

/**
 * Generates navigation buttons HTML
 */
function generateNavigationHtml(
  totalPages: number,
  rtl: boolean
): string {
  if (totalPages <= 1) {
    // Single page - just show submit button
    return `
    <div class="submit-wrapper">
      <button type="submit" class="btn-submit">
        ${rtl ? 'שלח טופס' : 'Submit Form'}
      </button>
    </div>`;
  }

  const prevArrow = rtl ? '→' : '←';
  const nextArrow = rtl ? '←' : '→';

  return `
    <div class="page-navigation">
      <button type="button" id="prev-btn" class="nav-btn" disabled>
        <span class="arrow">${prevArrow}</span>
        ${rtl ? 'הקודם' : 'Previous'}
      </button>

      <div class="page-progress" id="page-progress-text">
        ${rtl ? 'עמוד' : 'Page'} <strong>1</strong> ${rtl ? 'מתוך' : 'of'} <strong>${totalPages}</strong>
      </div>

      <button type="button" id="next-btn" class="nav-btn primary">
        ${rtl ? 'הבא' : 'Next'}
        <span class="arrow">${nextArrow}</span>
      </button>

      <button type="submit" id="submit-btn" class="nav-btn primary" style="display: none;">
        ${rtl ? 'שלח טופס' : 'Submit Form'}
      </button>
    </div>`;
}

/**
 * Generates HTML for a single page of fields
 */
function generatePageHtml(
  pageNum: number,
  fields: HtmlFormField[],
  groups: HtmlFieldGroup[],
  includeValidation: boolean,
  rtl: boolean,
  isActive: boolean = false
): string {
  // Filter groups that have fields on this page
  const pageFieldIds = new Set(fields.map((f) => f.id));
  const pageGroups = groups.filter((g) =>
    g.fields.some((fid) => pageFieldIds.has(fid))
  );

  let html = `
    <div class="form-page${isActive ? ' active' : ''}" id="page-${pageNum}" role="tabpanel">
      <div class="page-title">
        <span class="page-number">${pageNum}</span>
        ${rtl ? `עמוד ${pageNum}` : `Page ${pageNum}`}
      </div>`;

  if (pageGroups.length > 0) {
    for (const group of pageGroups) {
      // Only include fields from this page
      const groupFieldsOnPage = fields.filter((f) => group.fields.includes(f.id));
      if (groupFieldsOnPage.length === 0) continue;

      const rows = groupFieldsIntoRows(groupFieldsOnPage);

      html += `
      <fieldset>
        <legend>${escapeHtml(group.title)}</legend>
        ${group.description ? `<p class="legend-note">${escapeHtml(group.description)}</p>` : ''}`;

      for (const row of rows) {
        html += '<div class="form-row">';
        for (const field of row) {
          html += generateFieldHtml(field, includeValidation);
        }
        html += '</div>';
      }

      html += '</fieldset>';
    }
  } else {
    // No groups - render all page fields in rows
    const rows = groupFieldsIntoRows(fields);
    html += `<fieldset><legend>${rtl ? 'פרטים' : 'Details'}</legend>`;
    for (const row of rows) {
      html += '<div class="form-row">';
      for (const field of row) {
        html += generateFieldHtml(field, includeValidation);
      }
      html += '</div>';
    }
    html += '</fieldset>';
  }

  html += '</div>';
  return html;
}

/**
 * Main HTML generation function (template-based)
 * Generates multi-page tabbed form with navigation
 */
export async function generateHtmlFormTemplate(
  fields: FieldDefinition[],
  options: Partial<HtmlGenerationOptions> = {}
): Promise<GeneratedHtmlResult> {
  const formId = `form_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;

  // Detect RTL if not specified
  const rtl = options.rtl ?? detectFormDirection(fields) === 'rtl';

  // Merge options with defaults
  const finalOptions: HtmlGenerationOptions = {
    formTitle: options.formTitle || 'טופס',
    formDescription: options.formDescription,
    language: options.language || (rtl ? 'hebrew' : 'english'),
    rtl,
    theme: {
      primaryColor: options.theme?.primaryColor || '#003399',
      fontFamily:
        options.theme?.fontFamily ||
        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      spacing: options.theme?.spacing || 'normal',
      style: options.theme?.style || 'modern',
    },
    includeValidation: options.includeValidation ?? true,
    generationMethod: 'template',
  };

  // Convert fields
  const htmlFields = mapFieldsToHtml(fields);
  const groups = createFieldGroups(fields);

  // Group fields by page
  const pageMap = groupFieldsByPage(htmlFields);
  const pageNumbers = Array.from(pageMap.keys()).sort((a, b) => a - b);
  const totalPages = pageNumbers.length || 1;

  // Generate CSS and JS with page count
  const cssContent = generateDocsFlowCSS(finalOptions.rtl, finalOptions.theme);
  const jsContent = generateFormJS(formId, finalOptions.rtl, totalPages);

  // Build HTML document
  const dirAttr = finalOptions.rtl ? 'dir="rtl"' : '';
  const langAttr = finalOptions.rtl ? 'lang="he"' : 'lang="en"';

  let htmlContent = `<!DOCTYPE html>
<html ${langAttr} ${dirAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(finalOptions.formTitle || 'טופס')}</title>
  <style>
${cssContent}
  </style>
</head>
<body>

<div class="container">
  <header>
    <h1>${escapeHtml(finalOptions.formTitle || 'טופס')}</h1>
    ${finalOptions.formDescription ? `<p>${escapeHtml(finalOptions.formDescription)}</p>` : ''}
  </header>

  ${generateTabsHtml(totalPages)}

  <form id="${formId}" novalidate>
    <div class="form-pages">
`;

  // Generate pages
  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNum = pageNumbers[i];
    const pageFields = pageMap.get(pageNum) || [];
    htmlContent += generatePageHtml(
      i + 1, // Use 1-based index for display
      pageFields,
      groups,
      finalOptions.includeValidation,
      finalOptions.rtl,
      i === 0 // First page is active
    );
  }

  // If no pages (shouldn't happen), create single page with all fields
  if (pageNumbers.length === 0) {
    htmlContent += generatePageHtml(
      1,
      htmlFields,
      groups,
      finalOptions.includeValidation,
      finalOptions.rtl,
      true
    );
  }

  htmlContent += `
    </div>
    ${generateNavigationHtml(totalPages, finalOptions.rtl)}
  </form>
</div>

<script>
${jsContent}
</script>

</body>
</html>`;

  return {
    formId,
    htmlContent,
    cssContent,
    jsContent,
    metadata: {
      fieldCount: fields.length,
      sectionCount: groups.length,
      rtl: finalOptions.rtl,
      generatedAt: new Date(),
      method: 'template',
    },
  };
}
