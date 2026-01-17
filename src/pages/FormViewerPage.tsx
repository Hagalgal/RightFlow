import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Home, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { FormRecord } from '../services/forms/forms.service';
import { useDirection } from '../i18n';
import { QRScannerField } from '../components/fields/QRScannerField';
import { BarcodeScannerField } from '../components/fields/BarcodeScannerField';
import { CameraField } from '../components/fields/CameraField';
import { GPSLocationField } from '../components/fields/GPSLocationField';

export function FormViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const direction = useDirection();
  const [form, setForm] = useState<FormRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Multi-page state
  const [currentPage, setCurrentPage] = useState(1); // Start at page 1
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [fieldsByPage, setFieldsByPage] = useState<Map<number, any[]>>(new Map());

  useEffect(() => {
    if (slug) {
      loadForm();
    }
  }, [slug]);

  async function loadForm() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/forms?slug=${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError(direction === 'rtl' ? 'הטופס לא נמצא' : 'Form not found');
        } else {
          setError(direction === 'rtl' ? 'טעינת הטופס נכשלה' : 'Failed to load form');
        }
        return;
      }

      const data = await response.json();
      const loadedForm = data.form;

      if (loadedForm.status !== 'published') {
        setError(direction === 'rtl' ? 'הטופס אינו מפורסם' : 'This form is not published');
        return;
      }

      try {
        const versionResponse = await fetch(`/api/form-versions?formId=${loadedForm.id}`);

        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          const versions = versionData.versions || [];
          const currentVersion = versions.find((v: any) => v.is_current);

          if (currentVersion) {
            loadedForm.fields = currentVersion.fields;
          }
        }
      } catch (versionError) {
        console.warn('Error loading version:', versionError);
      }

      setForm(loadedForm);

      // Organize fields by page
      const pageMap = new Map<number, any[]>();
      loadedForm.fields.forEach((field: any) => {
        const page = field.position?.page || 1;
        if (!pageMap.has(page)) {
          pageMap.set(page, []);
        }
        pageMap.get(page)!.push(field);
      });

      // Sort fields within each page by position.y
      pageMap.forEach((fields, page) => {
        fields.sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));
      });

      setFieldsByPage(pageMap);
      setTotalPages(pageMap.size);

      const initialData: Record<string, any> = {};
      loadedForm.fields.forEach((field: any) => {
        if (field.type === 'checkbox') {
          initialData[field.id] = false;
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFieldChange(fieldId: string, value: any) {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  }

  function validateCurrentPage(): boolean {
    const fieldsOnPage = fieldsByPage.get(currentPage) || [];
    const requiredFields = fieldsOnPage.filter((field: any) => field.required);

    for (const field of requiredFields) {
      const value = formData[field.id];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        alert(
          direction === 'rtl'
            ? `אנא מלא את השדה: ${field.label || field.name}`
            : `Please fill in: ${field.label || field.name}`,
        );
        return false;
      }
    }

    return true;
  }

  function goToPage(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > totalPages) return;
    setCurrentPage(pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNext() {
    if (validateCurrentPage()) {
      setCompletedPages(prev => new Set(prev).add(currentPage));
      goToPage(currentPage + 1);
    }
  }

  function handlePrevious() {
    goToPage(currentPage - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form) return;

    // Validate all pages
    for (let page = 1; page <= totalPages; page++) {
      const fieldsOnPage = fieldsByPage.get(page) || [];
      const requiredFields = fieldsOnPage.filter((field: any) => field.required);

      for (const field of requiredFields) {
        const value = formData[field.id];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          goToPage(page);
          alert(
            direction === 'rtl'
              ? `אנא מלא את השדה: ${field.label || field.name} בעמוד ${page}`
              : `Please fill in: ${field.label || field.name} on page ${page}`,
          );
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form.id,
          data: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitSuccess(true);
      setFormData({});
      setCurrentPage(1);
      setCompletedPages(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" dir={direction}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">{direction === 'rtl' ? 'טוען טופס...' : 'Loading form...'}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" dir={direction}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 glass-card max-w-md"
        >
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{error}</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-secondary hover:scale-105 transition-transform"
          >
            {direction === 'rtl' ? 'חזור לדף הבית' : 'Go back home'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={direction}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="glass-card p-12 text-center max-w-md border-green-500/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-6"
          >
            ✅
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {direction === 'rtl' ? 'תודה רבה!' : 'Thank you!'}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {direction === 'rtl' ? 'התגובה שלך נשלחה בהצלחה.' : 'Your response has been submitted successfully.'}
          </p>
          <button
            onClick={() => {
              setSubmitSuccess(false);
              setFormData({});
            }}
            className="btn-primary w-full hover:scale-105 transition-transform"
          >
            {direction === 'rtl' ? 'שלח תגובה נוספת' : 'Submit another response'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (!form) return null;

  const isLastPage = currentPage === totalPages;

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      {/* Header */}
      <header className="border-b-4 border-primary bg-white shadow-md">
        <div className="container mx-auto px-6 py-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <Layout className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Right<span className="text-primary">Flow</span>
              </span>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              {direction === 'rtl' ? 'דף הבית' : 'Home'}
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-primary"
        >
          {/* Form Header */}
          <div className="px-10 py-8 border-b border-border bg-gradient-to-br from-background to-muted/20">
            <h1 className="text-3xl font-bold text-primary mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground text-base">{form.description}</p>
            )}
          </div>

          {/* Page Tabs Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 px-10 py-6 bg-muted/30 border-b border-border">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const isActive = currentPage === pageNum;
                const isCompleted = completedPages.has(pageNum);
                const isClickable = pageNum <= currentPage || isCompleted;

                return (
                  <div key={pageNum} className="flex items-center gap-4">
                    <button
                      onClick={() => isClickable && goToPage(pageNum)}
                      disabled={!isClickable}
                      className={`
                        w-10 h-10 rounded-full font-bold text-base
                        flex items-center justify-center
                        transition-all duration-300
                        ${isActive
                          ? 'bg-primary text-white shadow-lg scale-110'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white border-2 border-border text-muted-foreground'
                        }
                        ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                      `}
                    >
                      {isCompleted && !isActive ? <Check className="w-5 h-5" /> : pageNum}
                    </button>
                    {pageNum < totalPages && (
                      <div
                        className={`w-8 h-0.5 transition-colors duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Pages */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: direction === 'rtl' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 'rtl' ? -100 : 100 }}
                transition={{ duration: 0.4 }}
                className="p-10"
              >
                {/* Page Title */}
                <div className="mb-8 pb-4 border-b-2 border-primary/20 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {currentPage}
                  </div>
                  <h2 className="text-2xl font-bold text-primary">
                    {direction === 'rtl' ? `עמוד ${currentPage}` : `Page ${currentPage}`}
                  </h2>
                  <span className="text-sm text-muted-foreground mr-auto">
                    {direction === 'rtl' ? 'מתוך' : 'of'} {totalPages}
                  </span>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(fieldsByPage.get(currentPage) || []).map((field: any, index: number) => {
                    const isMobileField = ['qr-scan', 'barcode-scan', 'camera', 'gps-location'].includes(field.type);
                    const isFullWidth = field.type === 'textarea' || isMobileField;

                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className={`flex flex-col gap-2 ${isFullWidth ? 'md:col-span-2' : ''}`}
                      >
                        {!isMobileField && (
                          <label className="text-sm font-semibold text-foreground/80">
                            {field.label || field.name}
                            {field.required && <span className="text-destructive mr-1">*</span>}
                          </label>
                        )}

                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="px-4 py-3 border-2 border-border rounded-lg text-base transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white"
                            required={field.required}
                            dir={field.direction || 'ltr'}
                          />
                        )}

                        {field.type === 'checkbox' && (
                          <div className="flex items-center gap-3 py-2">
                            <input
                              type="checkbox"
                              checked={formData[field.id] || false}
                              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                              className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                            <span className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                              {field.label || field.name}
                            </span>
                          </div>
                        )}

                        {field.type === 'qr-scan' && (
                          <QRScannerField
                            field={field}
                            value={formData[field.id] || ''}
                            onChange={(value) => handleFieldChange(field.id, value)}
                          />
                        )}

                        {field.type === 'barcode-scan' && (
                          <BarcodeScannerField
                            field={field}
                            value={formData[field.id] || ''}
                            onChange={(value) => handleFieldChange(field.id, value)}
                          />
                        )}

                        {field.type === 'camera' && (
                          <CameraField
                            field={field}
                            value={formData[field.id] || ''}
                            onChange={(value) => handleFieldChange(field.id, value)}
                          />
                        )}

                        {field.type === 'gps-location' && (
                          <GPSLocationField
                            field={field}
                            value={formData[field.id] || ''}
                            onChange={(value) => handleFieldChange(field.id, value)}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="px-10 pb-10 pt-8 border-t border-border bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all"
              >
                {direction === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                {direction === 'rtl' ? 'הקודם' : 'Previous'}
              </button>

              <div className="text-sm text-muted-foreground font-medium">
                {direction === 'rtl' ? 'עמוד' : 'Page'}{' '}
                <strong className="text-primary text-lg">{currentPage}</strong>{' '}
                {direction === 'rtl' ? 'מתוך' : 'of'} <strong className="text-primary text-lg">{totalPages}</strong>
              </div>

              {!isLastPage ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg"
                >
                  {direction === 'rtl' ? 'הבא' : 'Next'}
                  {direction === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-primary text-white text-base font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isSubmitting
                    ? (direction === 'rtl' ? 'שולח...' : 'Submitting...')
                    : (direction === 'rtl' ? 'שליחת הטופס' : 'Submit Form')}
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-sm text-muted-foreground/60"
        >
          Powered by{' '}
          <a href="/" className="font-bold text-primary hover:underline transition-colors">
            RightFlow
          </a>
        </motion.div>
      </div>
    </div>
  );
}
