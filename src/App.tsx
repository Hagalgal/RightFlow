import { useRef, useState, useEffect } from 'react';
import { TopToolbar } from '@/components/layout/TopToolbar';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageThumbnailSidebar } from '@/components/layout/PageThumbnailSidebar';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { FieldListSidebar } from '@/components/fields/FieldListSidebar';
import { RecoveryDialog } from '@/components/dialogs/RecoveryDialog';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { useSettingsStore } from '@/store/settingsStore';
import { generateThumbnails } from '@/utils/pdfThumbnails';
import {
  loadRecoveryData,
  clearRecoveryData,
  setupAutoSave,
  RecoveryData,
} from '@/utils/crashRecovery';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Zustand stores
  const {
    pdfFile,
    currentPage,
    totalPages,
    thumbnails,
    zoomLevel,
    activeTool,
    fields,
    selectedFieldId,
    setPdfFile,
    setCurrentPage,
    setTotalPages,
    setThumbnails,
    setZoomLevel,
    setActiveTool,
    setPageDimensions,
    selectField,
    deleteField,
    restoreFromRecovery,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTemplateEditorStore();

  const { settings } = useSettingsStore();

  // Check for crash recovery data on mount
  useEffect(() => {
    const data = loadRecoveryData();
    if (data) {
      setRecoveryData(data);
    }
  }, []);

  // Setup auto-save for crash recovery
  useEffect(() => {
    const cleanup = setupAutoSave(() => ({
      pdfFile,
      currentPage,
      zoomLevel,
      fields,
      totalPages,
    }));

    // Cleanup on unmount
    return cleanup;
  }, [pdfFile, currentPage, zoomLevel, fields, totalPages]);

  const handleRestore = () => {
    if (recoveryData) {
      restoreFromRecovery(recoveryData);
      setRecoveryData(null);
      clearRecoveryData();
      console.log('[App] Recovery data restored successfully');
    }
  };

  const handleDiscardRecovery = () => {
    clearRecoveryData();
    setRecoveryData(null);
    console.log('[App] Recovery data discarded');
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Import validation utilities
    const { validatePDFFile } = await import('@/utils/inputSanitization');

    // Validate PDF file (checks MIME type, size, and magic bytes)
    const validation = await validatePDFFile(file);

    if (validation.isValid) {
      setPdfFile(file);
      setCurrentPage(1);
      setThumbnails([]);
    } else {
      alert(validation.error || 'אנא בחר קובץ PDF תקין');
    }
  };

  const handlePDFLoadSuccess = async (pdf: any) => {
    setTotalPages(pdf.numPages);
    console.log(`PDF loaded successfully with ${pdf.numPages} pages`);

    // Generate thumbnails asynchronously
    if (pdfFile) {
      try {
        const thumbnailUrls = await generateThumbnails(pdfFile);
        setThumbnails(thumbnailUrls);
        console.log('Thumbnails generated successfully');
      } catch (error) {
        console.error('Failed to generate thumbnails:', error);
      }
    }
  };

  const handlePDFLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    alert('שגיאה בטעינת קובץ PDF');
    setPdfFile(null);
    setTotalPages(0);
  };

  const handlePageRender = (page: any) => {
    const { width, height } = page.getSize();
    setPageDimensions(currentPage, { width, height });
  };

  const handleSave = async () => {
    if (!pdfFile) {
      alert('אין PDF להורדה. אנא טען קובץ PDF תחילה.');
      return;
    }

    if (fields.length === 0) {
      alert('אין שדות להוספה. אנא הוסף לפחות שדה אחד.');
      return;
    }

    try {
      // Import PDF generation utilities
      const { generateFillablePDF, downloadPDF, validateFieldsForPDF } = await import(
        '@/utils/pdfGeneration'
      );

      // Validate fields before generation
      const errors = validateFieldsForPDF(fields);
      if (errors.length > 0) {
        alert(`שגיאות בשדות:\n\n${errors.join('\n')}`);
        return;
      }

      console.log('🚀 Generating fillable PDF...');

      // Generate PDF with all fields and settings
      const pdfBytes = await generateFillablePDF(pdfFile, fields, {
        checkboxStyle: settings.checkboxField.style,
      });

      // Download PDF
      const filename = pdfFile.name.replace('.pdf', '_fillable');
      downloadPDF(pdfBytes, filename);

      alert('✅ הPDF הורד בהצלחה! בדוק את תיקיית ההורדות.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`שגיאה ביצירת PDF: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col" dir="rtl">
      {/* Recovery Dialog */}
      {recoveryData && (
        <RecoveryDialog
          recoveryData={recoveryData}
          onRestore={handleRestore}
          onDiscard={handleDiscardRecovery}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <TopToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        activeTool={activeTool}
        onPageChange={setCurrentPage}
        onZoomChange={setZoomLevel}
        onToolChange={setActiveTool}
        onUpload={handleUpload}
        onSave={handleSave}
        onSettings={() => setIsSettingsOpen(true)}
        hasDocument={!!pdfFile}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <MainLayout>
        {pdfFile && totalPages > 0 && (
          <PageThumbnailSidebar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageSelect={setCurrentPage}
            thumbnails={thumbnails}
          />
        )}
        <PDFViewer
          file={pdfFile}
          pageNumber={currentPage}
          scale={zoomLevel}
          onLoadSuccess={handlePDFLoadSuccess}
          onLoadError={handlePDFLoadError}
          onPageRender={handlePageRender}
        />
        {pdfFile && fields.length > 0 && (
          <FieldListSidebar
            fields={fields}
            selectedFieldId={selectedFieldId}
            currentPage={currentPage}
            onFieldSelect={selectField}
            onFieldDelete={deleteField}
            onPageNavigate={setCurrentPage}
          />
        )}
      </MainLayout>
    </div>
  );
}

export default App;
