/**
 * ResponseExportButton Component (Phase 4)
 * Button for exporting form responses as CSV or JSON
 */

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';

interface ResponseExportButtonProps {
  formId: string;
}

export function ResponseExportButton({ formId }: ResponseExportButtonProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  async function handleExport(format: 'csv' | 'json') {
    try {
      setIsLoading(true);
      setError(null);
      setIsOpen(false);

      // Create abort controller for fetch
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `/api/responses?formId=${formId}&export=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.primaryEmailAddress?.id || ''}`,
            'X-User-Id': user?.id || '',
          },
          signal: abortControllerRef.current.signal,
        },
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.text();
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `responses-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Handle abort errors silently (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Export failed');
      setIsOpen(false); // Close dropdown when error occurs
    } finally {
      setIsLoading(false);
    }
  }

  // Cleanup: abort fetch on component unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="relative">
      <button
        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        {isLoading ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="py-1">
            <button
              className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => handleExport('csv')}
            >
              Export as CSV
            </button>
            <button
              className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => handleExport('json')}
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-48 bg-destructive/10 text-destructive p-3 rounded-xl text-xs font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}
    </div>
  );
}
