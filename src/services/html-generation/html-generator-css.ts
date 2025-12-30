/**
 * DocsFlow Design System CSS Template
 * Adapted from FormFlowAI for RightFlow
 * Full RTL/Hebrew support
 */

import type { HtmlFormTheme } from './types';

/**
 * Generates RTL-aware CSS based on DocsFlow design system
 */
export function generateDocsFlowCSS(
  rtl: boolean,
  theme: HtmlFormTheme
): string {
  const { primaryColor, fontFamily, spacing, style } = theme;

  // Spacing values based on theme
  const spacingValues = {
    compact: { padding: '15px', gap: '10px', margin: '15px' },
    normal: { padding: '20px', gap: '15px', margin: '25px' },
    spacious: { padding: '30px', gap: '20px', margin: '35px' },
  };

  const sp = spacingValues[spacing];

  // Style-specific variations
  const styleVariations = {
    modern: {
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      inputBg: '#fafafa',
      legendStyle: `background: linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)});`,
    },
    classic: {
      borderRadius: '0',
      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
      inputBg: '#fcfcfc',
      legendStyle: `background: ${primaryColor};`,
    },
    minimal: {
      borderRadius: '4px',
      boxShadow: 'none',
      inputBg: '#fff',
      legendStyle: `background: transparent; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor};`,
    },
  };

  const sv = styleVariations[style];

  return `
:root {
  --primary-color: #333;
  --accent-color: ${primaryColor};
  --border-color: #999;
  --bg-color: #fff;
  --input-bg: ${sv.inputBg};
  --font-family: ${fontFamily};
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
  direction: ${rtl ? 'rtl' : 'ltr'};
  line-height: 1.6;
}

.container {
  max-width: 900px;
  background: #fff;
  margin: 0 auto;
  padding: 40px;
  box-shadow: ${sv.boxShadow};
  border-radius: ${sv.borderRadius};
  border-top: 6px solid var(--accent-color);
}

/* Header */
header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: ${sp.padding};
  border-bottom: 1px solid #eee;
}

header h1 {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: var(--primary-color);
}

header h2 {
  font-size: 18px;
  margin: 0 0 5px 0;
  font-weight: normal;
  color: #555;
}

header p {
  font-size: 14px;
  margin: 0;
  color: #777;
}

/* Fieldset / Sections */
fieldset {
  border: 1px solid var(--border-color);
  border-radius: ${sv.borderRadius};
  padding: ${sp.padding};
  margin-bottom: ${sp.margin};
  background-color: #fff;
}

legend {
  ${sv.legendStyle}
  color: white;
  padding: 6px 16px;
  font-weight: bold;
  font-size: 14px;
  border-radius: ${style === 'modern' ? '4px' : '0'};
}

.legend-note {
  font-size: 12px;
  color: #555;
  font-weight: normal;
  margin-${rtl ? 'right' : 'left'}: 10px;
}

/* Form rows - Flexbox */
.form-row {
  display: flex;
  width: 100%;
  gap: ${sp.gap};
  margin-bottom: ${sp.gap};
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex-basis: 0;
  min-width: 120px;
}

/* Labels */
label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--primary-color);
  line-height: 1.3;
}

label .required {
  color: #e53935;
  margin-${rtl ? 'right' : 'left'}: 2px;
}

/* Text inputs */
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
input[type="number"],
input[type="url"],
input[type="password"] {
  height: 38px;
  border: 1px solid var(--border-color);
  border-radius: ${style === 'minimal' ? '0' : '4px'};
  padding: 0 10px;
  font-size: 14px;
  font-family: var(--font-family);
  width: 100%;
  background-color: var(--input-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="date"]:focus,
input[type="number"]:focus,
input[type="url"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px ${primaryColor}20;
  background-color: #fff;
}

/* Textarea */
textarea {
  border: 1px solid var(--border-color);
  border-radius: ${style === 'minimal' ? '0' : '4px'};
  padding: 10px;
  font-size: 14px;
  font-family: var(--font-family);
  width: 100%;
  min-height: 100px;
  resize: vertical;
  background-color: var(--input-bg);
}

textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px ${primaryColor}20;
}

/* Select / Dropdown */
select {
  height: 38px;
  border: 1px solid var(--border-color);
  border-radius: ${style === 'minimal' ? '0' : '4px'};
  padding: 0 10px;
  font-size: 14px;
  font-family: var(--font-family);
  width: 100%;
  background-color: var(--input-bg);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: ${rtl ? '10px' : 'calc(100% - 10px)'} center;
  padding-${rtl ? 'left' : 'right'}: 30px;
}

select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px ${primaryColor}20;
}

/* Checkbox & Radio wrapper */
.checkbox-wrapper,
.radio-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9f9f9;
  padding: 12px;
  border: 1px dashed #ccc;
  border-radius: ${sv.borderRadius};
  flex-wrap: wrap;
}

.checkbox-label-main,
.radio-label-main {
  font-weight: bold;
  font-size: 13px;
  width: 100%;
  margin-bottom: 8px;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-${rtl ? 'left' : 'right'}: 15px;
}

.checkbox-item input[type="checkbox"],
.radio-item input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.checkbox-item label,
.radio-item label {
  font-weight: normal;
  font-size: 14px;
  margin: 0;
  cursor: pointer;
}

/* Radio group */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.radio-group.vertical {
  flex-direction: column;
}

/* Signature field */
.signature-box {
  border: 2px dashed var(--border-color);
  border-radius: ${sv.borderRadius};
  padding: 20px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  color: #999;
  font-size: 14px;
}

/* Submit button */
.submit-wrapper {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

button[type="submit"],
.btn-submit {
  background: ${style === 'modern' ? `linear-gradient(135deg, ${primaryColor}, ${adjustColor(primaryColor, -20)})` : primaryColor};
  color: white;
  padding: 14px 50px;
  border: none;
  border-radius: ${style === 'minimal' ? '0' : '6px'};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-family: var(--font-family);
}

button[type="submit"]:hover,
.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px ${primaryColor}40;
}

button[type="submit"]:active,
.btn-submit:active {
  transform: translateY(0);
}

/* Validation */
.field-validation {
  font-size: 12px;
  color: #e53935;
  margin-top: 4px;
  min-height: 16px;
}

input:invalid:not(:placeholder-shown),
select:invalid:not(:placeholder-shown),
textarea:invalid:not(:placeholder-shown) {
  border-color: #e53935;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 10px;
  }

  .form-row {
    flex-direction: column;
    gap: 10px;
  }

  .form-group {
    flex-basis: 100% !important;
    flex-grow: 1 !important;
  }

  button[type="submit"] {
    width: 100%;
  }
}

@media (max-width: 480px) {
  body {
    padding: 10px;
  }

  .container {
    padding: 15px;
    margin: 0;
    border-radius: 0;
  }

  header h1 {
    font-size: 20px;
  }

  fieldset {
    padding: 15px;
  }
}

/* Print styles */
@media print {
  body {
    background: white;
    padding: 0;
  }

  .container {
    box-shadow: none;
    max-width: 100%;
  }

  button[type="submit"] {
    display: none;
  }
}
`;
}

/**
 * Adjusts a hex color by a percentage
 * Positive = lighter, Negative = darker
 */
function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Adjust
  const adjust = (value: number) => {
    const adjusted = Math.round(value + (value * percent) / 100);
    return Math.min(255, Math.max(0, adjusted));
  };

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

/**
 * Generates minimal JavaScript for form handling
 */
export function generateFormJS(formId: string, rtl: boolean): string {
  return `
(function() {
  'use strict';

  const form = document.getElementById('${formId}');
  if (!form) return;

  // Form submission handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(function(field) {
      const validation = document.getElementById(field.id + '_validation');
      if (!field.value || field.value.trim() === '') {
        isValid = false;
        field.style.borderColor = '#e53935';
        if (validation) {
          validation.textContent = '${rtl ? 'שדה חובה' : 'Required field'}';
        }
      } else {
        field.style.borderColor = '';
        if (validation) {
          validation.textContent = '';
        }
      }
    });

    if (isValid) {
      // Collect form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach(function(value, key) {
        data[key] = value;
      });

      console.log('Form data:', data);
      alert('${rtl ? 'הטופס נשלח בהצלחה!' : 'Form submitted successfully!'}');
    }
  });

  // Clear validation on input
  form.querySelectorAll('input, select, textarea').forEach(function(field) {
    field.addEventListener('input', function() {
      this.style.borderColor = '';
      const validation = document.getElementById(this.id + '_validation');
      if (validation) {
        validation.textContent = '';
      }
    });
  });
})();
`;
}
