import { useRef, useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FieldOverlay } from '@/components/fields/FieldOverlay';
import { FieldPropertiesPanel } from '@/components/fields/FieldPropertiesPanel';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getCanvasRelativeCoords, viewportToPDFCoords } from '@/utils/pdfCoordinates';
import { FieldDefinition } from '@/types/fields';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFCanvasProps {
  file: File | null;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (pdf: any) => void;
  onLoadError: (error: Error) => void;
  onPageRender: (page: any) => void;
}

export const PDFCanvas = ({
  file,
  pageNumber,
  scale,
  onLoadSuccess,
  onLoadError,
  onPageRender,
}: PDFCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  // Zustand stores
  const {
    activeTool,
    fields,
    selectedFieldId,
    isDragging,
    dragStartX,
    dragStartY,
    dragCurrentX,
    dragCurrentY,
    pageDimensions,
    addFieldWithUndo,
    updateField,
    updateFieldWithUndo,
    deleteFieldWithUndo,
    selectField,
    startDrag,
    updateDragPosition,
    endDrag,
    setCanvasWidth: setStoreCanvasWidth,
    getFieldsForPage,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTemplateEditorStore();

  const { settings } = useSettingsStore();

  const currentPageFields = getFieldsForPage(pageNumber);
  const currentPageDimensions = pageDimensions[pageNumber];

  const handlePageLoadSuccess = useCallback(
    (page: any) => {
      // In react-pdf, page object has width/height properties directly
      const width = page.originalWidth || page.width;
      const height = page.originalHeight || page.height;

      const scaledWidth = width * (scale / 100);
      setCanvasWidth(scaledWidth);
      setStoreCanvasWidth(scaledWidth);

      // Store page dimensions for coordinate conversion
      onPageRender({ getSize: () => ({ width, height }) });
    },
    [scale, onPageRender, setStoreCanvasWidth],
  );

  const handleCanvasMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current || !currentPageDimensions || !canvasWidth) return;

      // Ignore clicks on field markers
      const target = event.target as HTMLElement;
      if (target.closest('.field-marker')) return;

      const viewportCoords = getCanvasRelativeCoords(event, containerRef.current);

      // Start drag for text field or dropdown (drag-to-create)
      if ((activeTool === 'text-field' || activeTool === 'dropdown-field') && !isDragging) {
        startDrag(viewportCoords.x, viewportCoords.y);
        event.preventDefault(); // Prevent text selection during drag
        return;
      }
    },
    [
      activeTool,
      isDragging,
      currentPageDimensions,
      canvasWidth,
      startDrag,
    ],
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current || !currentPageDimensions || !canvasWidth) return;

      // Ignore clicks on field markers
      const target = event.target as HTMLElement;
      if (target.closest('.field-marker')) return;

      const viewportCoords = getCanvasRelativeCoords(event, containerRef.current);

      // Click-to-place checkbox
      if (activeTool === 'checkbox-field') {
        const pdfCoords = viewportToPDFCoords(
          viewportCoords.x,
          viewportCoords.y,
          currentPageDimensions,
          scale,
          canvasWidth,
        );

        const newField: Omit<FieldDefinition, 'id'> = {
          type: 'checkbox',
          pageNumber,
          x: pdfCoords.x,
          y: pdfCoords.y - 20, // Adjust for checkbox height
          width: 20,
          height: 20,
          name: '',
          required: false,
          direction: 'rtl',
        };

        addFieldWithUndo(newField);

        // Reset tool to select mode after creating checkbox
        const { setActiveTool } = useTemplateEditorStore.getState();
        setActiveTool('select');
        return;
      }

      // Click-to-place radio button group (uses settings for defaults)
      if (activeTool === 'radio-field') {
        const pdfCoords = viewportToPDFCoords(
          viewportCoords.x,
          viewportCoords.y,
          currentPageDimensions,
          scale,
          canvasWidth,
        );

        const buttonCount = settings.radioField.defaultButtonCount;

        // Generate default options based on settings
        const defaultOptions = Array.from({ length: buttonCount }, (_, i) => `אפשרות ${i + 1}`);

        // Create radio group with settings-based defaults
        const newField: Omit<FieldDefinition, 'id'> = {
          type: 'radio',
          pageNumber,
          x: pdfCoords.x,
          y: pdfCoords.y - 20, // Adjust for radio height
          width: 20,
          height: 20,
          name: '',
          required: false,
          direction: 'rtl',
          radioGroup: '', // Empty group name, user should set meaningful name
          options: defaultOptions,
          spacing: settings.radioField.spacing,
          orientation: settings.radioField.orientation,
        };

        addFieldWithUndo(newField);

        // Reset tool to select mode after creating radio group
        const { setActiveTool } = useTemplateEditorStore.getState();
        setActiveTool('select');
        return;
      }

      // Deselect field when clicking on empty area
      if (activeTool === 'select') {
        selectField(null);
      }
    },
    [
      activeTool,
      isDragging,
      pageNumber,
      currentPageDimensions,
      canvasWidth,
      scale,
      addFieldWithUndo,
      startDrag,
      selectField,
      settings,
    ],
  );

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || (activeTool !== 'text-field' && activeTool !== 'dropdown-field') || !containerRef.current) return;

      // Track current mouse position for drag preview
      const viewportCoords = getCanvasRelativeCoords(event, containerRef.current);
      updateDragPosition(viewportCoords.x, viewportCoords.y);

      event.preventDefault();
    },
    [isDragging, activeTool, updateDragPosition],
  );

  const handleCanvasMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || (activeTool !== 'text-field' && activeTool !== 'dropdown-field') || !containerRef.current) return;
      if (!currentPageDimensions || !canvasWidth || dragStartX === null || dragStartY === null)
        return;

      const viewportCoords = getCanvasRelativeCoords(event, containerRef.current);

      // Calculate dimensions (absolute values work for any drag direction - fixes bug a)
      const width = Math.abs(viewportCoords.x - dragStartX);
      const height = Math.abs(viewportCoords.y - dragStartY);

      // Minimum size check
      if (width < 30 || height < 15) {
        endDrag();
        return;
      }

      // Get top-left corner in viewport (accounting for any drag direction - fixes bug a)
      const viewportX = Math.min(dragStartX, viewportCoords.x);
      const viewportY = Math.min(dragStartY, viewportCoords.y);

      // Convert top-left corner to PDF coordinates
      // viewportToPDFCoords already handles Y-axis flip (viewport top → PDF bottom)
      const pdfCoords = viewportToPDFCoords(
        viewportX,
        viewportY,
        currentPageDimensions,
        scale,
        canvasWidth,
      );

      // Convert width and height to PDF points
      const pdfWidth = (width / canvasWidth) * currentPageDimensions.width;
      const pdfHeight = (height / canvasWidth) * currentPageDimensions.width;

      // pdfCoords.y points to the top edge converted to PDF space (from bottom)
      // We need the bottom-left corner for PDF, so subtract height (fixes bug c)
      const newField: Omit<FieldDefinition, 'id'> = activeTool === 'dropdown-field' ? {
        type: 'dropdown',
        pageNumber,
        x: pdfCoords.x,
        y: pdfCoords.y - pdfHeight,
        width: pdfWidth,
        height: pdfHeight,
        name: '',
        required: false,
        direction: settings.dropdownField.direction,
        font: settings.dropdownField.font,
        options: ['אפשרות 1', 'אפשרות 2', 'אפשרות 3'],
      } : {
        type: 'text',
        pageNumber,
        x: pdfCoords.x,
        y: pdfCoords.y - pdfHeight,
        width: pdfWidth,
        height: pdfHeight,
        name: '',
        required: false,
        direction: settings.textField.direction,
        font: settings.textField.font,
        fontSize: settings.textField.fontSize,
      };

      addFieldWithUndo(newField);
      endDrag();

      // Reset tool to select mode after creating field (fixes bug: continuous creation)
      const { setActiveTool } = useTemplateEditorStore.getState();
      setActiveTool('select');
    },
    [
      isDragging,
      activeTool,
      dragStartX,
      dragStartY,
      pageNumber,
      currentPageDimensions,
      canvasWidth,
      scale,
      addFieldWithUndo,
      endDrag,
      settings,
    ],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (or Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
          console.log('↶ Undo (Ctrl+Z)');
        }
      }

      // Redo: Ctrl+Shift+Z (or Cmd+Shift+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) {
          redo();
          console.log('↷ Redo (Ctrl+Shift+Z)');
        }
      }

      // Copy: Ctrl+C (or Cmd+C on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedFieldId) {
        e.preventDefault();
        const { copyField } = useTemplateEditorStore.getState();
        copyField();
        console.log('📋 Field copied (Ctrl+Z)');
      }

      // Paste: Ctrl+V (or Cmd+V on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const { pasteField, copiedField } = useTemplateEditorStore.getState();
        if (copiedField) {
          pasteField();
          console.log('📋 Field pasted (Ctrl+V)');
        }
      }

      // Delete key - delete selected field
      if (e.key === 'Delete' && selectedFieldId) {
        e.preventDefault();
        deleteFieldWithUndo(selectedFieldId);
      }

      // Escape key - deselect field or cancel dragging
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isDragging) {
          endDrag(); // Cancel drag on Escape
        } else {
          selectField(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedFieldId,
    isDragging,
    deleteFieldWithUndo,
    selectField,
    endDrag,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  // Global mouseup handler to catch releases outside canvas (fixes bug b)
  useEffect(() => {
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (isDragging && activeTool === 'text-field') {
        // If mouse released outside the canvas, just cancel the drag
        if (!containerRef.current?.contains(event.target as Node)) {
          endDrag(); // Cancel drag without creating field
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, activeTool, endDrag]);

  if (!file) {
    return null;
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div
        ref={containerRef}
        className="relative"
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{
          cursor:
            activeTool === 'text-field' || activeTool === 'dropdown-field'
              ? 'crosshair'
              : activeTool === 'checkbox-field' || activeTool === 'radio-field'
              ? 'copy' // Plus icon cursor for click-to-place
              : 'default', // Arrow for select mode
        }}
      >
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={<div className="text-muted-foreground">טוען PDF...</div>}
          error={<div className="text-destructive">שגיאה בטעינת PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale / 100}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="pdf-page"
            loading={<div className="text-muted-foreground">טוען עמוד...</div>}
            onLoadSuccess={handlePageLoadSuccess}
          />
        </Document>

        {/* Field overlay */}
        {canvasWidth > 0 && (
          <FieldOverlay
            fields={currentPageFields}
            selectedFieldId={selectedFieldId}
            scale={scale}
            onFieldSelect={selectField}
            onFieldUpdate={updateField}
            onFieldDelete={deleteFieldWithUndo}
            onFieldDuplicate={(id) => {
              const { duplicateField } = useTemplateEditorStore.getState();
              duplicateField(id);
            }}
          />
        )}

        {/* Drag preview for text field */}
        {isDragging &&
          dragStartX !== null &&
          dragStartY !== null &&
          dragCurrentX !== null &&
          dragCurrentY !== null && (
            <div
              className="absolute border-2 border-dashed pointer-events-none"
              style={{
                borderColor: 'hsl(var(--field-text))',
                left: Math.min(dragStartX, dragCurrentX),
                top: Math.min(dragStartY, dragCurrentY),
                width: Math.abs(dragCurrentX - dragStartX),
                height: Math.abs(dragCurrentY - dragStartY),
              }}
            />
          )}
      </div>

      {/* Field Properties Panel */}
      {selectedFieldId && (() => {
        const selectedField = fields.find(f => f.id === selectedFieldId);
        if (!selectedField) return null;

        return (
          <FieldPropertiesPanel
            field={selectedField}
            onUpdate={(updates) => updateFieldWithUndo(selectedFieldId, updates)}
            onClose={() => selectField(null)}
          />
        );
      })()}
    </div>
  );
};
