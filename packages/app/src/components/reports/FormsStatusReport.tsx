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
  approved: '#000000',
  rejected: '#a1a1aa',
  pending: '#52525b',
};

export function FormsStatusReport({ from, to }: Props) {
  const { data, isLoading, error } = useFormsStatusReport(from, to);

  if (isLoading) return <div className="text-center py-12 text-muted-foreground animate-pulse">טוען נתונים...</div>;
  if (error) return <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">שגיאה: {(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-8">
          <h3 className="text-lg font-extrabold text-foreground tracking-tight mb-8">התפלגות לפי סטטוס</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                labelLine={false}
                label={(entry: any) => `${entry.percentage.toFixed(0)}%`}
                dataKey="count"
              >
                {data.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#d4d4d8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e1e1e1',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any) => [value, 'טפסים']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-8">
          <h3 className="text-lg font-extrabold text-foreground tracking-tight mb-8">סטטיסטיקות</h3>
          <div className="space-y-4">
            {data.byStatus.map((status) => (
              <div key={status.status} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-transparent hover:border-border transition-all">
                <span className="font-bold text-foreground capitalize">{status.status === 'approved' ? 'מאושר' : status.status === 'rejected' ? 'נדחה' : 'ממתין'}</span>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-foreground">{status.count}</span>
                  <span className="text-xs font-bold text-muted-foreground bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg">
                    {status.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-zinc-900 dark:bg-white rounded-xl border border-zinc-900 dark:border-white mt-8 group transition-all">
              <span className="font-bold text-white dark:text-black">ממתינים &gt;48 שעות</span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-2xl font-black text-white dark:text-black">{data.longWaitingCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
