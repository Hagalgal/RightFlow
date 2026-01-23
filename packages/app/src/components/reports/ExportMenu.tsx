/**
 * Export Menu Component
 * Exports reports to Excel, CSV, or PDF format
 */

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  useDailyActivityReport,
  useTeamPerformanceReport,
  useFormsStatusReport,
} from '../../hooks/useReports';
import {
  exportDailyActivityToExcel,
  exportDailyActivityToCSV,
  exportDailyActivityToPDF,
  exportTeamPerformanceToExcel,
  exportTeamPerformanceToCSV,
  exportTeamPerformanceToPDF,
  exportFormsStatusToExcel,
  exportFormsStatusToCSV,
  exportFormsStatusToPDF,
} from '../../services/exportService';

interface Props {
  activeReport: 'daily' | 'team' | 'status';
  selectedDate: string;
  dateRange: { from: string; to: string };
}

export function ExportMenu({ activeReport, selectedDate, dateRange }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch report data based on active report
  const dailyData = useDailyActivityReport(activeReport === 'daily' ? selectedDate : undefined);
  const teamData = useTeamPerformanceReport(
    activeReport === 'team' ? dateRange.from : '',
    activeReport === 'team' ? dateRange.to : ''
  );
  const statusData = useFormsStatusReport(
    activeReport === 'status' ? dateRange.from : '',
    activeReport === 'status' ? dateRange.to : ''
  );

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    setIsExporting(true);

    try {
      // Get the current report data
      let data;
      if (activeReport === 'daily') {
        data = dailyData.data;
        if (!data) {
          alert('אין נתונים לייצא. אנא המתן לטעינת הדוח.');
          return;
        }

        // Export based on format
        if (format === 'excel') {
          exportDailyActivityToExcel(data, selectedDate);
        } else if (format === 'csv') {
          exportDailyActivityToCSV(data, selectedDate);
        } else if (format === 'pdf') {
          exportDailyActivityToPDF(data, selectedDate);
        }
      } else if (activeReport === 'team') {
        data = teamData.data;
        if (!data) {
          alert('אין נתונים לייצא. אנא המתן לטעינת הדוח.');
          return;
        }

        // Export based on format
        if (format === 'excel') {
          exportTeamPerformanceToExcel(data, dateRange.from, dateRange.to);
        } else if (format === 'csv') {
          exportTeamPerformanceToCSV(data, dateRange.from, dateRange.to);
        } else if (format === 'pdf') {
          exportTeamPerformanceToPDF(data, dateRange.from, dateRange.to);
        }
      } else if (activeReport === 'status') {
        data = statusData.data;
        if (!data) {
          alert('אין נתונים לייצא. אנא המתן לטעינת הדוח.');
          return;
        }

        // Export based on format
        if (format === 'excel') {
          exportFormsStatusToExcel(data, dateRange.from, dateRange.to);
        } else if (format === 'csv') {
          exportFormsStatusToCSV(data, dateRange.from, dateRange.to);
        } else if (format === 'pdf') {
          exportFormsStatusToPDF(data, dateRange.from, dateRange.to);
        }
      }

      // Success message
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('שגיאה בייצוא הדוח. אנא נסה שוב.');
      setIsExporting(false);
    }
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-[#FF6100] text-white rounded-lg hover:bg-[#E65700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isExporting ? 'מייצא...' : 'ייצוא'}</span>
      </button>

      {!isExporting && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            onClick={() => handleExport('excel')}
            className="w-full px-4 py-2 text-right hover:bg-slate-50 rounded-t-lg transition-colors"
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="w-full px-4 py-2 text-right hover:bg-slate-50 transition-colors"
          >
            CSV (.csv)
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full px-4 py-2 text-right hover:bg-slate-50 rounded-b-lg transition-colors"
          >
            PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
