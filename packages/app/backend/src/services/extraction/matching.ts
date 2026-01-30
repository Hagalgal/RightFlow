/**
 * Smart Matching & Field Positioning Service
 */
import {
  Box,
  PageInfo,
  OcrPageData,
  OcrTextLine,
  OcrWord,
  GeminiField,
  GeminiPageResult,
  ExtractedField,
} from './types';
import {
  hebrewTextSimilarity,
  generateFieldName,
  isHebrewText,
} from './utils';

/**
 * Find label in OCR data
 */
export function findLabelInOcr(
  labelText: string,
  ocrData: OcrPageData,
): { line: OcrTextLine; word?: OcrWord } | null {
  // First try exact line match
  for (const line of ocrData.textLines) {
    const sim = hebrewTextSimilarity(labelText, line.content);
    if (sim >= 0.85) {
      return { line };
    }
  }

  // Try word-level match for multi-word labels on the same line
  for (const word of ocrData.words) {
    const sim = hebrewTextSimilarity(labelText, word.content);
    if (sim >= 0.85) {
      return { line: { content: word.content, box: word.box }, word };
    }
  }

  // Try partial match within longer lines
  for (const line of ocrData.textLines) {
    if (
      line.content.includes(labelText.replace(/:$/, '')) ||
      labelText.replace(/:$/, '').includes(line.content.replace(/:$/, ''))
    ) {
      return { line };
    }
  }

  return null;
}

/**
 * Get all labels on the same row (within Y tolerance)
 */
function getLabelsOnSameRow(
  labelBox: Box,
  allLabels: Array<{ box: Box }>,
  yTolerance: number = 8,
): Array<{ box: Box }> {
  return allLabels.filter(
    (l) => Math.abs(l.box.y - labelBox.y) < yTolerance,
  );
}

/**
 * Position input field based on label location and field type
 */
function positionFieldFromLabel(
  geminiField: GeminiField,
  labelBox: Box,
  pageInfo: PageInfo,
  allMatchedLabels: Array<{ box: Box }>,
): Box {
  const leftMargin = pageInfo.width * 0.05;
  const rightMargin = pageInfo.width * 0.95;
  const isRtl = isHebrewText(geminiField.labelText);

  switch (geminiField.fieldType) {
    case 'underline':
    case 'title_right': {
      // Input is to the LEFT of label (RTL)
      if (isRtl) {
        const sameRow = getLabelsOnSameRow(labelBox, allMatchedLabels);
        let leftBoundary = leftMargin;
        for (const other of sameRow) {
          const rightEdge = other.box.x + other.box.width;
          if (rightEdge < labelBox.x && rightEdge > leftBoundary) {
            leftBoundary = rightEdge + 5;
          }
        }
        const inputX = leftBoundary;
        const inputWidth = Math.max(
          labelBox.x - inputX - 3,
          50,
        );
        return {
          x: inputX,
          y: labelBox.y,
          width: inputWidth,
          height: 20,
        };
      }
      // LTR fallback
      const inputX = labelBox.x + labelBox.width + 5;
      return {
        x: inputX,
        y: labelBox.y,
        width: Math.min(rightMargin - inputX, 180),
        height: 20,
      };
    }

    case 'box_with_title': {
      // Input box is ABOVE the label (higher Y in PDF coords)
      const boxWidth = Math.max(labelBox.width * 1.5, 80);
      const boxX =
        labelBox.x + labelBox.width / 2 - boxWidth / 2;
      return {
        x: Math.max(leftMargin, boxX),
        y: labelBox.y + labelBox.height + 5,
        width: boxWidth,
        height: 35,
      };
    }

    case 'digit_boxes': {
      // Digit box group — position to the LEFT of label for RTL
      if (isRtl) {
        const boxWidth = Math.min(
          labelBox.x - leftMargin - 5,
          200,
        );
        return {
          x: Math.max(leftMargin, labelBox.x - boxWidth - 5),
          y: labelBox.y,
          width: boxWidth,
          height: 22,
        };
      }
      return {
        x: labelBox.x + labelBox.width + 5,
        y: labelBox.y,
        width: 200,
        height: 22,
      };
    }

    case 'table_cell': {
      // For table cells, use the label box directly
      return {
        x: labelBox.x,
        y: labelBox.y,
        width: Math.max(labelBox.width, 50),
        height: Math.max(labelBox.height, 18),
      };
    }

    case 'selection_mark': {
      // Selection marks are positioned by Azure
      return {
        x: labelBox.x,
        y: labelBox.y,
        width: 15,
        height: 15,
      };
    }

    default: {
      // Generic: input to left for RTL
      if (isRtl) {
        return {
          x: Math.max(leftMargin, labelBox.x - 150),
          y: labelBox.y,
          width: 140,
          height: 20,
        };
      }
      return {
        x: labelBox.x + labelBox.width + 5,
        y: labelBox.y,
        width: 140,
        height: 20,
      };
    }
  }
}

/**
 * Match Gemini fields with OCR data and position input fields
 */
export function matchAndPositionFields(
  geminiResult: GeminiPageResult,
  ocrData: OcrPageData,
  pageInfo: PageInfo,
): ExtractedField[] {
  const fields: ExtractedField[] = [];
  let fieldIndex = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;

  // First pass: collect all label boxes for row-aware positioning
  const allMatchedLabels: Array<{ box: Box }> = [];
  const matchResults: Array<{
    geminiField: GeminiField;
    labelBox: Box | null;
    ocrMatch: OcrTextLine | null;
  }> = [];

  for (const gField of geminiResult.fields) {
    const ocrMatch = findLabelInOcr(gField.labelText, ocrData);
    if (ocrMatch) {
      allMatchedLabels.push({ box: ocrMatch.line.box });
      matchResults.push({
        geminiField: gField,
        labelBox: ocrMatch.line.box,
        ocrMatch: ocrMatch.line,
      });
    } else {
      matchResults.push({
        geminiField: gField,
        labelBox: null,
        ocrMatch: null,
      });
    }
  }

  // Second pass: position fields
  for (const { geminiField, labelBox, ocrMatch } of matchResults) {
    if (!labelBox) {
      unmatchedCount++;
      console.log(
        `[Hybrid] UNMATCHED: "${geminiField.labelText}" ` +
          `(${geminiField.fieldType}) — no OCR match`,
      );
      continue;
    }

    matchedCount++;

    // Handle selection marks specially
    if (geminiField.fieldType === 'selection_mark') {
      // Find nearest Azure selection mark
      const nearest = ocrData.selectionMarks.reduce(
        (best, mark) => {
          const dist =
            Math.abs(mark.box.x - labelBox.x) +
            Math.abs(mark.box.y - labelBox.y);
          return dist < best.dist
            ? { mark, dist }
            : best;
        },
        { mark: null as any, dist: Infinity },
      );

      if (nearest.mark) {
        const inputType =
          geminiField.inputType === 'radio' ? 'radio' : 'checkbox';
        fields.push({
          type: inputType,
          name: generateFieldName(
            geminiField.labelText,
            fieldIndex,
          ),
          label: geminiField.labelText,
          x: nearest.mark.box.x,
          y: nearest.mark.box.y,
          width: Math.max(nearest.mark.box.width, 15),
          height: Math.max(nearest.mark.box.height, 15),
          pageNumber: ocrData.pageNumber,
          direction: 'ltr',
          required: geminiField.required,
          confidence: nearest.mark.confidence,
          sectionName: geminiField.section,
          _source: 'azure_selection_mark',
        });
        fieldIndex++;
        continue;
      }
    }

    // Detect signature from label text even if Gemini missed inputType
    const isSignatureField =
      geminiField.inputType === 'signature' ||
      /חתימ[הת]/.test(geminiField.labelText);

    // Position input field based on type
    const inputBox = positionFieldFromLabel(
      geminiField,
      labelBox,
      { pageNumber: ocrData.pageNumber, ...ocrData.dimensions },
      allMatchedLabels,
    );

    // Override height for signature fields (need more space)
    if (isSignatureField) {
      inputBox.height = Math.max(inputBox.height, 40);
      inputBox.width = Math.max(inputBox.width, 120);
    }

    // Determine field type
    let fieldType: ExtractedField['type'] = 'text';
    if (geminiField.inputType === 'checkbox') fieldType = 'checkbox';
    else if (geminiField.inputType === 'radio') fieldType = 'radio';
    else if (isSignatureField) fieldType = 'signature';
    else if (geminiField.inputType === 'dropdown')
      fieldType = 'dropdown';

    const fieldName = generateFieldName(
      geminiField.labelText,
      fieldIndex,
    );

    console.log(
      `[Hybrid] "${geminiField.labelText}" (${geminiField.fieldType}) → ` +
        `${fieldType} at x=${inputBox.x.toFixed(1)}, ` +
        `y=${inputBox.y.toFixed(1)}, w=${inputBox.width.toFixed(1)}`,
    );

    fields.push({
      type: fieldType,
      name: fieldName,
      label: geminiField.labelText.replace(/:$/, ''),
      x: Math.round(inputBox.x * 100) / 100,
      y: Math.round(inputBox.y * 100) / 100,
      width: Math.round(inputBox.width * 100) / 100,
      height: Math.round(inputBox.height * 100) / 100,
      pageNumber: ocrData.pageNumber,
      direction: isHebrewText(geminiField.labelText)
        ? 'rtl'
        : 'ltr',
      required: geminiField.required,
      confidence: 0.8,
      sectionName: geminiField.section,
      _source: 'hybrid_matched',
    });
    fieldIndex++;
  }

  // Add remaining OCR data (KV pairs, unmatched selection marks)
  addOcrFallbackFields(fields, ocrData, fieldIndex);

  console.log(
    `[Hybrid] Page ${ocrData.pageNumber}: ` +
      `${matchedCount} matched, ${unmatchedCount} unmatched, ` +
      `${fields.length} total fields`,
  );

  return fields;
}

/**
 * Add fields from OCR data that weren't matched by Gemini
 */
function addOcrFallbackFields(
  fields: ExtractedField[],
  ocrData: OcrPageData,
  startIndex: number,
): void {
  let fieldIndex = startIndex;

  // Add KV pairs with value regions that weren't already matched
  for (const kv of ocrData.kvPairsWithValue) {
    const alreadyMatched = fields.some(
      (f) =>
        Math.abs(f.x - kv.valueBox.x) < 20 &&
        Math.abs(f.y - kv.valueBox.y) < 10,
    );
    if (!alreadyMatched) {
      fields.push({
        type: 'text',
        name: generateFieldName(kv.key, fieldIndex),
        label: kv.key,
        x: kv.valueBox.x,
        y: kv.valueBox.y,
        width: kv.valueBox.width,
        height: kv.valueBox.height,
        pageNumber: ocrData.pageNumber,
        direction: isHebrewText(kv.key) ? 'rtl' : 'ltr',
        required: false,
        confidence: kv.confidence,
        _source: 'azure_kv_value',
      });
      fieldIndex++;
    }
  }

  // Add unmatched selection marks
  for (const mark of ocrData.selectionMarks) {
    const alreadyAdded = fields.some(
      (f) =>
        f.type === 'checkbox' &&
        Math.abs(f.x - mark.box.x) < 10 &&
        Math.abs(f.y - mark.box.y) < 10,
    );
    if (!alreadyAdded) {
      fields.push({
        type: 'checkbox',
        name: `checkbox_${fieldIndex + 1}`,
        x: mark.box.x,
        y: mark.box.y,
        width: Math.max(mark.box.width, 15),
        height: Math.max(mark.box.height, 15),
        pageNumber: ocrData.pageNumber,
        direction: 'ltr',
        required: false,
        confidence: mark.confidence,
        _source: 'azure_selection_mark_unmatched',
      });
      fieldIndex++;
    }
  }
}
