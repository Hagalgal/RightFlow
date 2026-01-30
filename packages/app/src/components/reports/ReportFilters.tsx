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
      <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-border p-5">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            תאריך:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all font-medium"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-border p-5">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          טווח תאריכים:
        </label>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all font-medium"
          />
          <span className="text-muted-foreground opacity-50">—</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all font-medium"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}
