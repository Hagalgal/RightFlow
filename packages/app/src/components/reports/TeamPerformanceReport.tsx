/**
 * Team Performance Report - Placeholder
 * TODO: Full implementation with team member stats table and charts
 */

import { useTeamPerformanceReport } from '../../hooks/useReports';
import { Users, Award, TrendingUp } from 'lucide-react';

interface Props {
  from: string;
  to: string;
}

export function TeamPerformanceReport({ from, to }: Props) {
  const { data, isLoading, error } = useTeamPerformanceReport(from, to);

  if (isLoading) return <div className="text-center py-12 text-muted-foreground animate-pulse">טוען נתונים...</div>;
  if (error) return <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">שגיאה: {(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">סה"כ חברי צוות</p>
              <p className="text-3xl font-extrabold text-foreground">{data.summary.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-black dark:text-white opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">סה"כ טפסים</p>
              <p className="text-3xl font-extrabold text-foreground">{data.summary.totalSubmissions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-black dark:text-white opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">שיעור אישור ממוצע</p>
              <p className="text-3xl font-extrabold text-foreground">{data.summary.avgTeamApprovalRate.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-black dark:text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-extrabold text-foreground tracking-tight">ביצועי חברי צוות</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">שם</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">טפסים</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">אושרו</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">נדחו</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">שיעור אישור</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.members.map((member) => (
                <tr key={member.userId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{member.userName}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{member.totalSubmissions}</td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white font-bold">{member.approvedSubmissions}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{member.rejectedSubmissions}</td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">
                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                      {member.approvalRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
