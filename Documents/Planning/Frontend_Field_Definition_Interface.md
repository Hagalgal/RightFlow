# Frontend Field Definition Interface - Implementation Plan

## Overview
Admin/template creator interface for defining fillable fields (Text, Checkbox) on PDF forms, with proper Hebrew/RTL support. Inspired by PDFfiller's UX but simplified for core functionality.

## User Flow
1. Upload/select PDF document
2. Navigate through pages using thumbnail sidebar
3. Click toolbar button to add field type (Text or Checkbox)
4. Click on PDF to place field
5. Drag to resize field (for text fields)
6. Configure field properties (name, default value, required, etc.)
7. Save template with field definitions

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Toolbar (PDF tools, field type buttons)                │
├──────┬──────────────────────────────────────────────────────┤
│ Page │                                                       │
│ Thumb│         PDF Viewer Canvas                             │
│ nail │         (with draggable field overlays)               │
│      │                                                       │
│ Side │                                                       │
│ bar  │                                                       │
└──────┴──────────────────────────────────────────────────────┘
```

### Left Sidebar - Page Thumbnails
**Purpose**: Multi-page PDF navigation

**Features**:
- Vertical scrollable list of page thumbnails
- Current page highlighted
- Page number label on each thumbnail
- Click to jump to page
- Lazy loading for performance (50+ page PDFs)

**Components**:
- `PageThumbnailSidebar.tsx`
- `PageThumbnail.tsx`

**State**:
```typescript
interface PageThumbnailState {
  currentPage: number;
  totalPages: number;
  thumbnailUrls: string[]; // Data URLs or blob URLs
}
```

### Top Toolbar
**Purpose**: PDF manipulation and field definition tools

**Sections**:
1. **File Operations**: Upload, Save Template, Download
2. **Navigation**: Previous/Next Page, Page Number Input, Zoom Controls
3. **Field Tools**:
   - "Add Text Field" button
   - "Add Checkbox" button
   - Selection tool (default)
4. **View Options**: Fit Width, Fit Page, Actual Size

**Components**:
- `TopToolbar.tsx`
- `ToolbarButton.tsx`
- `ToolbarButtonGroup.tsx`
- `PageNavigator.tsx`
- `ZoomControls.tsx`

**Active Tool State**:
```typescript
type ToolMode = 'select' | 'text-field' | 'checkbox-field';

interface ToolbarState {
  activeTool: ToolMode;
  zoomLevel: number; // percentage
}
```

### Center PDF Viewer
**Purpose**: Display PDF with interactive field definition overlays

**Features**:
- Canvas-based PDF rendering using pdf-lib
- Click to place fields when tool is active
- Drag to resize text fields
- Visual indicators for defined fields
- Field selection for editing
- RTL-aware coordinate system

**Components**:
- `PDFViewer.tsx` - Main viewer container
- `PDFCanvas.tsx` - Renders PDF page
- `FieldOverlay.tsx` - Container for all field markers
- `TextField.tsx` - Individual text field marker
- `CheckboxField.tsx` - Individual checkbox marker
- `FieldPropertiesPanel.tsx` - Floating panel for selected field

**Field Marker Visual Design**:
```
Text Field:
┌─────────────────────────┐
│ [Field Name]        ✕   │ ← Draggable handles on corners
└─────────────────────────┘

Checkbox:
☐ [Checkbox Label]     ✕
```

**Field Definition Data Structure**:
```typescript
interface FieldDefinition {
  id: string;
  type: 'text' | 'checkbox';
  pageNumber: number;

  // Position in PDF coordinates (points)
  x: number;
  y: number;
  width: number;
  height: number;

  // Field properties
  name: string;
  label?: string;
  required: boolean;
  defaultValue?: string;

  // Hebrew-specific
  direction: 'ltr' | 'rtl';
  font?: string; // For text fields - Hebrew font embedding
  fontSize?: number;

  // Validation (future enhancement)
  validation?: {
    type: 'text' | 'email' | 'number' | 'date';
    pattern?: string;
    maxLength?: number;
  };
}

interface TemplateDefinition {
  id: string;
  name: string;
  pdfUrl: string;
  fields: FieldDefinition[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    hasHebrewText: boolean;
    totalPages: number;
  };
}
```

## Component Architecture

### React Component Tree
```
App
├── TopToolbar
│   ├── FileOperations
│   ├── PageNavigator
│   ├── FieldToolButtons
│   └── ZoomControls
├── MainLayout
│   ├── PageThumbnailSidebar
│   │   └── PageThumbnail (×N)
│   └── PDFViewerContainer
│       ├── PDFCanvas
│       └── FieldOverlay
│           ├── TextField (×N)
│           ├── CheckboxField (×N)
│           └── FieldPropertiesPanel (when field selected)
└── Toast/Notifications
```

### State Management
Use **Zustand** (lightweight, TypeScript-friendly) for global state:

```typescript
interface TemplateEditorStore {
  // PDF state
  pdfDocument: PDFDocument | null;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;

  // Tool state
  activeTool: ToolMode;

  // Field state
  fields: FieldDefinition[];
  selectedFieldId: string | null;

  // Actions
  loadPDF: (file: File) => Promise<void>;
  setPage: (page: number) => void;
  setZoom: (level: number) => void;
  setActiveTool: (tool: ToolMode) => void;
  addField: (field: Omit<FieldDefinition, 'id'>) => void;
  updateField: (id: string, updates: Partial<FieldDefinition>) => void;
  deleteField: (id: string) => void;
  selectField: (id: string | null) => void;
  saveTemplate: () => Promise<void>;
}
```

## Technical Implementation Details

### PDF Rendering
Use **react-pdf** (built on pdf.js) for rendering + **pdf-lib** for field embedding:

```typescript
// PDFCanvas.tsx
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

const PDFCanvas = ({ pageNumber, onCanvasClick }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={canvasRef} onClick={onCanvasClick}>
      <Document file={pdfUrl}>
        <Page
          pageNumber={pageNumber}
          width={viewportWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};
```

### Field Placement Interaction

**Text Field Placement**:
1. User clicks "Add Text Field" button → `activeTool = 'text-field'`
2. User clicks on PDF → record initial position
3. User drags → show preview rectangle
4. User releases → create field with dimensions
5. Field properties panel appears → user enters name, sets options
6. Save → add to fields array

**Checkbox Placement**:
1. User clicks "Add Checkbox" button → `activeTool = 'checkbox-field'`
2. User clicks on PDF → create checkbox at fixed size (20x20pt)
3. Field properties panel appears → user enters name, label
4. Save → add to fields array

```typescript
// Field placement handler
const handleCanvasClick = (event: React.MouseEvent) => {
  if (activeTool === 'select') return;

  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Convert viewport coordinates to PDF coordinates
  const pdfCoords = viewportToPDFCoords(x, y, currentPage, zoomLevel);

  if (activeTool === 'text-field') {
    startFieldDrag(pdfCoords);
  } else if (activeTool === 'checkbox-field') {
    addField({
      type: 'checkbox',
      pageNumber: currentPage,
      x: pdfCoords.x,
      y: pdfCoords.y,
      width: 20, // Standard checkbox size in points
      height: 20,
      name: `checkbox_${Date.now()}`,
      required: false,
      direction: 'rtl', // Default for Hebrew context
    });
    setActiveTool('select');
  }
};
```

### Coordinate System Conversion

**Critical for Hebrew/RTL**: PDF coordinate system has origin at bottom-left, y-axis goes up. Canvas has origin at top-left, y-axis goes down.

```typescript
interface PDFCoords {
  x: number; // Points from left edge
  y: number; // Points from BOTTOM edge
}

interface ViewportCoords {
  x: number; // Pixels from left edge
  y: number; // Pixels from TOP edge
}

const viewportToPDFCoords = (
  viewportX: number,
  viewportY: number,
  pageNumber: number,
  zoomLevel: number
): PDFCoords => {
  const page = pdfDocument.getPage(pageNumber - 1);
  const { width, height } = page.getSize();

  // Scale factor from viewport to PDF
  const scale = (zoomLevel / 100) * (width / viewportWidth);

  return {
    x: viewportX / scale,
    y: height - (viewportY / scale), // Flip y-axis
  };
};

const pdfToViewportCoords = (
  pdfX: number,
  pdfY: number,
  pageNumber: number,
  zoomLevel: number
): ViewportCoords => {
  const page = pdfDocument.getPage(pageNumber - 1);
  const { width, height } = page.getSize();

  const scale = (zoomLevel / 100) * (viewportWidth / width);

  return {
    x: pdfX * scale,
    y: (height - pdfY) * scale, // Flip y-axis
  };
};
```

### Hebrew Text Handling in Fields

**Default Direction Detection**:
```typescript
const detectTextDirection = (text: string): 'ltr' | 'rtl' => {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text) ? 'rtl' : 'ltr';
};

// Apply to new text fields
const addTextField = (coords: PDFCoords) => {
  addField({
    type: 'text',
    direction: 'rtl', // Default assumption for Israeli market
    font: 'NotoSansHebrew', // Default Hebrew font
    fontSize: 12,
    // ... other properties
  });
};
```

**Font Embedding** (when saving template):
```typescript
const saveTemplate = async () => {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  // Embed Hebrew font if any text fields exist
  const hasTextFields = fields.some(f => f.type === 'text');
  if (hasTextFields) {
    const fontBytes = await fetch('/fonts/NotoSansHebrew-Regular.ttf').then(r => r.arrayBuffer());
    const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: false }); // CRITICAL: subset: false
  }

  // Create AcroForm fields
  const form = pdfDoc.getForm();

  for (const field of fields) {
    const page = pdfDoc.getPage(field.pageNumber - 1);

    if (field.type === 'text') {
      const textField = form.createTextField(field.name);
      textField.addToPage(page, {
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
      });

      if (field.defaultValue) {
        textField.setText(field.defaultValue);
      }

      // Hebrew font application
      if (field.font === 'NotoSansHebrew') {
        textField.updateAppearances(hebrewFont);
      }

    } else if (field.type === 'checkbox') {
      const checkbox = form.createCheckBox(field.name);
      checkbox.addToPage(page, {
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
      });
    }
  }

  // Save modified PDF
  const pdfBytes = await pdfDoc.save();

  // Upload to storage + save field definitions to Firestore
  await uploadTemplate({
    name: templateName,
    pdfBytes,
    fields,
  });
};
```

## UI/UX Design with Tailwind CSS

### Color Scheme (RTL-friendly, professional)
```typescript
// tailwind.config.js theme extension
colors: {
  // Field markers
  'field-text': '#3B82F6',      // Blue for text fields
  'field-checkbox': '#10B981',   // Green for checkboxes
  'field-selected': '#F59E0B',   // Amber for selected field
  'field-hover': '#8B5CF6',      // Purple for hover state

  // UI
  'sidebar-bg': '#F9FAFB',
  'toolbar-bg': '#FFFFFF',
  'canvas-bg': '#E5E7EB',
}
```

### Component Styling Examples

**Top Toolbar**:
```tsx
<div className="w-full h-14 bg-toolbar-bg border-b border-gray-200 flex items-center px-4 gap-4" dir="ltr">
  {/* File operations - left side */}
  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      <Upload className="w-4 h-4 mr-2" />
      העלה PDF
    </Button>
    <Button variant="outline" size="sm">
      <Save className="w-4 h-4 mr-2" />
      שמור תבנית
    </Button>
  </div>

  <Separator orientation="vertical" className="h-8" />

  {/* Navigation - center */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon" onClick={() => setPage(currentPage - 1)}>
      <ChevronRight className="w-4 h-4" /> {/* RTL: right is previous */}
    </Button>
    <span className="text-sm">עמוד {currentPage} מתוך {totalPages}</span>
    <Button variant="ghost" size="icon" onClick={() => setPage(currentPage + 1)}>
      <ChevronLeft className="w-4 h-4" /> {/* RTL: left is next */}
    </Button>
  </div>

  <Separator orientation="vertical" className="h-8" />

  {/* Field tools - center/right */}
  <div className="flex gap-2">
    <Button
      variant={activeTool === 'text-field' ? 'default' : 'outline'}
      size="sm"
      onClick={() => setActiveTool('text-field')}
    >
      <Type className="w-4 h-4 mr-2" />
      שדה טקסט
    </Button>
    <Button
      variant={activeTool === 'checkbox-field' ? 'default' : 'outline'}
      size="sm"
      onClick={() => setActiveTool('checkbox-field')}
    >
      <CheckSquare className="w-4 h-4 mr-2" />
      תיבת סימון
    </Button>
  </div>

  <div className="mr-auto" /> {/* Spacer */}

  {/* Zoom controls - right side */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon" onClick={() => setZoom(zoomLevel - 10)}>
      <ZoomOut className="w-4 h-4" />
    </Button>
    <span className="text-sm min-w-12 text-center">{zoomLevel}%</span>
    <Button variant="ghost" size="icon" onClick={() => setZoom(zoomLevel + 10)}>
      <ZoomIn className="w-4 h-4" />
    </Button>
  </div>
</div>
```

**Page Thumbnail**:
```tsx
<div
  className={cn(
    "relative mb-2 cursor-pointer border-2 rounded transition-all",
    isCurrentPage
      ? "border-blue-500 shadow-md"
      : "border-transparent hover:border-gray-300"
  )}
  onClick={() => setPage(pageNumber)}
>
  <img
    src={thumbnailUrl}
    alt={`עמוד ${pageNumber}`}
    className="w-full"
    loading="lazy"
  />
  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs text-center py-1">
    {pageNumber}
  </div>
</div>
```

**Field Marker Overlay**:
```tsx
// TextField marker component
const TextField = ({ field, isSelected, onSelect, onUpdate }) => {
  const viewportCoords = pdfToViewportCoords(
    field.x,
    field.y,
    field.pageNumber,
    zoomLevel
  );

  return (
    <Rnd
      position={{ x: viewportCoords.x, y: viewportCoords.y }}
      size={{ width: field.width * scale, height: field.height * scale }}
      onDragStop={(e, d) => {
        const newPdfCoords = viewportToPDFCoords(d.x, d.y, field.pageNumber, zoomLevel);
        onUpdate(field.id, { x: newPdfCoords.x, y: newPdfCoords.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const newWidth = parseInt(ref.style.width) / scale;
        const newHeight = parseInt(ref.style.height) / scale;
        onUpdate(field.id, { width: newWidth, height: newHeight });
      }}
      className={cn(
        "border-2 rounded cursor-move",
        isSelected ? "border-field-selected bg-amber-50 bg-opacity-20" : "border-field-text bg-blue-50 bg-opacity-20",
        "hover:border-field-hover"
      )}
      onClick={() => onSelect(field.id)}
    >
      <div className="absolute top-0 left-0 bg-field-text text-white text-xs px-1 rounded-tl" dir="rtl">
        {field.name || 'שדה טקסט'}
      </div>
      <button
        className="absolute top-0 left-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
        style={{ transform: 'translate(-50%, -50%)' }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(field.id);
        }}
      >
        ✕
      </button>
    </Rnd>
  );
};
```

## Performance Optimizations

### Lazy Loading Thumbnails
```typescript
// Generate thumbnails on-demand using Intersection Observer
const PageThumbnailSidebar = ({ totalPages }) => {
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page')!);
          generateThumbnail(pageNum);
        }
      });
    });

    return () => observerRef.current?.disconnect();
  }, []);

  // ...
};
```

### Debounced Field Updates
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdateField = useDebouncedCallback(
  (fieldId, updates) => {
    updateField(fieldId, updates);
  },
  300
);
```

### Memoized Field Overlays
```typescript
const MemoizedTextField = React.memo(TextField, (prev, next) => {
  return prev.field === next.field && prev.isSelected === next.isSelected;
});
```

## Accessibility Considerations

### Keyboard Navigation
```typescript
// Keyboard shortcuts for field definition
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 't' && e.ctrlKey) {
      e.preventDefault();
      setActiveTool('text-field');
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setActiveTool('checkbox-field');
    } else if (e.key === 'Escape') {
      setActiveTool('select');
      selectField(null);
    } else if (e.key === 'Delete' && selectedFieldId) {
      deleteField(selectedFieldId);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedFieldId]);
```

### Screen Reader Support
- Use semantic HTML elements
- Add `aria-label` to toolbar buttons
- Announce tool changes with live regions
- Provide alt text for PDF thumbnails

## Testing Strategy

### Unit Tests (Vitest)
- Coordinate conversion functions
- Field overlap detection
- Hebrew text direction detection
- Field validation logic

### Component Tests (React Testing Library)
- Toolbar button interactions
- Field placement workflow
- Field selection and editing
- Properties panel updates

### E2E Tests (Playwright)
- Complete template creation flow
- Multi-page navigation
- Field definition and saving
- Hebrew text field creation

### Manual Testing Checklist
- [ ] Upload PDF with Hebrew content
- [ ] Navigate between pages using thumbnails
- [ ] Place text field on Hebrew text
- [ ] Resize text field
- [ ] Place checkbox field
- [ ] Edit field properties
- [ ] Delete field
- [ ] Save template
- [ ] Verify saved PDF has AcroForm fields
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile/tablet viewport

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-pdf": "^7.7.0",
    "pdf-lib": "^1.17.1",
    "@pdf-lib/fontkit": "^1.1.1",
    "zustand": "^4.5.0",
    "react-rnd": "^10.4.1",
    "@radix-ui/react-toolbar": "^1.0.4",
    "@radix-ui/react-separator": "^1.0.3",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "use-debounce": "^10.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.4.0",
    "vite": "^5.1.0",
    "vitest": "^1.3.1",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^14.5.2",
    "playwright": "^1.42.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35"
  }
}
```

## Implementation Phases

### Phase 1: Basic Layout (Week 1)
- [ ] Setup Vite + React + TypeScript project
- [ ] Configure Tailwind CSS v4
- [ ] Create basic layout structure (toolbar + sidebar + canvas)
- [ ] Implement PDF upload and display
- [ ] Generate page thumbnails

### Phase 2: Field Placement (Week 2)
- [ ] Implement toolbar tool selection
- [ ] Add click-to-place for checkboxes
- [ ] Add drag-to-create for text fields
- [ ] Display field markers with react-rnd
- [ ] Coordinate conversion utilities

### Phase 3: Field Editing (Week 3)
- [ ] Field selection logic
- [ ] Properties panel component
- [ ] Field name, required, default value editing
- [ ] Field deletion
- [ ] Keyboard shortcuts

### Phase 4: Template Saving (Week 4)
- [ ] pdf-lib AcroForm integration
- [ ] Hebrew font embedding
- [ ] Template data structure serialization
- [ ] Firebase storage upload
- [ ] Firestore metadata save

### Phase 5: Hebrew/RTL Polish (Week 5)
- [ ] RTL direction detection
- [ ] Hebrew font dropdown
- [ ] BiDi text preview
- [ ] Unicode sanitization
- [ ] Cross-browser testing

### Phase 6: Performance & UX (Week 6)
- [ ] Lazy thumbnail loading
- [ ] Debounced updates
- [ ] Component memoization
- [ ] Error handling and validation
- [ ] Loading states and toasts
- [ ] Accessibility audit

## Integration with Existing Project

This interface will be the **first major feature** of the RightFlow application, built on top of Phase 0 validation findings.

**File Structure**:
```
RightFlow/
├── Phase0-Testing/          # Keep for reference
├── src/                     # NEW - React application
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── TopToolbar.tsx
│   │   │   ├── PageThumbnailSidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── pdf/
│   │   │   ├── PDFViewer.tsx
│   │   │   ├── PDFCanvas.tsx
│   │   │   └── FieldOverlay.tsx
│   │   └── fields/
│   │       ├── TextField.tsx
│   │       ├── CheckboxField.tsx
│   │       └── FieldPropertiesPanel.tsx
│   ├── store/
│   │   └── templateEditorStore.ts    # Zustand store
│   ├── utils/
│   │   ├── pdfCoordinates.ts
│   │   ├── hebrewText.ts
│   │   └── fieldValidation.ts
│   ├── types/
│   │   └── fields.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── fonts/
│       └── NotoSansHebrew-Regular.ttf
└── Documents/Planning/
    └── Frontend_Field_Definition_Interface.md  # This document
```

## Open Questions / Future Enhancements

1. **Field Types**: Should we support additional field types in future (dropdown, radio button, signature)?
2. **Validation**: Should field validation rules be configurable in this interface?
3. **Templates**: Should we support template categorization/tagging?
4. **Collaboration**: Multi-user template editing?
5. **Version Control**: Template versioning/history?
6. **Preview Mode**: Should we add a "preview as form filler" mode to test the template?

## Success Metrics

- Template creation time: < 5 minutes for 10-field form
- Field placement accuracy: < 5px deviation from intended position
- Cross-browser consistency: Identical rendering on Chrome, Firefox, Safari
- Hebrew text: 100% correct rendering with embedded fonts
- Performance: No lag on 50+ page PDFs with lazy loading
