/**
 * Hybrid Field Extraction Types
 * Type definitions for Azure OCR + Gemini Visual Analysis
 */

// ============================================================
// Geometric Types
// ============================================================

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
}

// ============================================================
// Azure OCR Types
// ============================================================

export interface OcrTextLine {
  content: string;
  box: Box;
}

export interface OcrWord {
  content: string;
  box: Box;
}

export interface OcrTableCell {
  rowIndex: number;
  columnIndex: number;
  content: string;
  box: Box;
  kind?: string;
}

export interface OcrTable {
  rowCount: number;
  columnCount: number;
  cells: OcrTableCell[];
  box?: Box;
}

export interface OcrSelectionMark {
  state: string;
  box: Box;
  confidence: number;
}

export interface OcrPageData {
  pageNumber: number;
  dimensions: { width: number; height: number };
  textLines: OcrTextLine[];
  words: OcrWord[];
  tables: OcrTable[];
  selectionMarks: OcrSelectionMark[];
  kvPairsWithValue: Array<{
    key: string;
    keyBox: Box;
    valueBox: Box;
    confidence: number;
  }>;
}

// ============================================================
// Gemini Types
// ============================================================

export interface GeminiField {
  labelText: string;
  fieldType:
    | 'underline'
    | 'box_with_title'
    | 'digit_boxes'
    | 'table_cell'
    | 'title_right'
    | 'selection_mark';
  inputType: 'text' | 'checkbox' | 'radio' | 'signature' | 'dropdown';
  section?: string;
  required: boolean;
  visualDescription?: string;
}

export interface GeminiPageResult {
  totalFieldCount: number;
  fields: GeminiField[];
}

// ============================================================
// Extracted Field Types
// ============================================================

export interface ExtractedField {
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature';
  name: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  direction: 'ltr' | 'rtl';
  required: boolean;
  confidence: number;
  sectionName?: string;
  _source?: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ExtractionResponse {
  fields: ExtractedField[];
  guidanceTexts: any[];
  anchorPoints: any[];
  formMetadata: {
    companyName: string;
    formName: string;
    confidence: string;
  };
  pageDimensions: PageInfo[];
  stats: {
    totalFields: number;
    fieldsPerPage: Record<number, number>;
    pageCount: number;
  };
  _source: string;
  _debug: {
    approach: string;
    azurePages: number;
    azureKvPairs: number;
    azureTables: number;
    pagesProcessed: number;
  };
}

// ============================================================
// Constants
// ============================================================

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
};

export const POINTS_PER_INCH = 72;

// Hebrew field name translations
export const HEBREW_FIELD_NAMES: Record<string, string> = {
  'שם': 'name',
  'שם מלא': 'full_name',
  'שם פרטי': 'first_name',
  'שם משפחה': 'last_name',
  'שם הלקוח': 'customer_name',
  'שם הסוכן': 'agent_name',
  'כתובת': 'address',
  'כתובת העסק': 'business_address',
  'עיר': 'city',
  'מיקוד': 'zip_code',
  'רחוב': 'street',
  "רח'": 'street',
  'טלפון': 'phone',
  'נייד': 'mobile',
  'פקס': 'fax',
  'ת.ז': 'id_number',
  'ת.ז.': 'id_number',
  'תאריך': 'date',
  'חתימה': 'signature',
  'חתימת מזמין': 'client_signature',
  'חתימת המזמין': 'client_signature',
  'חתימת מזמין השירות': 'client_signature',
  'חתימת נותן השירות': 'provider_signature',
  'חתימת מסמך השירות': 'service_document_signature',
  'חתימת הלקוח': 'customer_signature',
  'חתימת מורשה': 'authorized_signature',
  'איש קשר': 'contact_person',
  'הערות': 'notes',
  'מספר': 'number',
  "מס'": 'number',
  'חשבון': 'account',
  'בנק': 'bank',
  'סניף': 'branch',
  'פרטי': 'first_name',
  'משפחה': 'last_name',
  'דוא"ל': 'email',
  'E-mail': 'email',
};
