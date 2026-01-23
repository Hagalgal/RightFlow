/**
 * Report Filters Component
 */

import { Calendar } from 'lucide-react';

interface Props {
  reportType: 'daily' | 'team' | 'status';
  selectedDate: string;
  dateRange: { from: string; to: string };
  onDateChange: (date: string) => void;
  onDateRangeChange: (range: { from: string; to: string }) => void;
}

export function ReportFilters({
  reportType,
  selectedDate,
  dateRange,
  onDateChange,
  onDateRangeChange,
}: Props) {
  if (reportType === 'daily') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Calendar className="w-4 h-4" />
            תאריך:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6100] focus:border-transparent"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Calendar className="w-4 h-4" />
          טווח תאריכים:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6100]"
          />
          <span className="text-slate-600">—</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6100]"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}
