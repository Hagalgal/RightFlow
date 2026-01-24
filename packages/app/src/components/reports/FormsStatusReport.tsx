/**
 * Forms Status Report - Placeholder
 */

import { useFormsStatusReport } from '../../hooks/useReports';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Props {
  from: string;
  to: string;
}

const COLORS = {
  approved: '#10b981',
  rejected: '#ef4444',
  pending: '#f59e0b',
};

export function FormsStatusReport({ from, to }: Props) {
  const { data, isLoading, error } = useFormsStatusReport(from, to);

  if (isLoading) return <div className="text-center py-12 text-slate-600">טוען...</div>;
  if (error) return <div className="text-red-600 p-4">שגיאה: {(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">התפלגות לפי סטטוס</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [value, 'טפסים']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">סטטיסטיקות</h3>
          <div className="space-y-4">
            {data.byStatus.map((status) => (
              <div key={status.status} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="font-medium capitalize">{status.status}</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{status.count}</span>
                  <span className="text-sm text-slate-600">({status.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
              <span className="font-medium text-red-800">ממתינים &gt;48 שעות</span>
              <span className="text-2xl font-bold text-red-800">{data.longWaitingCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
