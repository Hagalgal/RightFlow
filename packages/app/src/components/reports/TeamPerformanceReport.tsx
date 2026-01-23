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

  if (isLoading) return <div className="text-center py-12 text-slate-600">טוען...</div>;
  if (error) return <div className="text-red-600 p-4">שגיאה: {(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">סה"כ חברי צוות</p>
              <p className="text-3xl font-bold text-slate-900">{data.summary.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">סה"כ טפסים</p>
              <p className="text-3xl font-bold text-slate-900">{data.summary.totalSubmissions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">שיעור אישור ממוצע</p>
              <p className="text-3xl font-bold text-slate-900">{data.summary.avgTeamApprovalRate.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">ביצועי חברי צוות</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-900">שם</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-900">טפסים</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-900">אושרו</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-900">נדחו</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-900">שיעור אישור</th>
              </tr>
            </thead>
            <tbody>
              {data.members.map((member) => (
                <tr key={member.userId} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{member.userName}</td>
                  <td className="px-4 py-3">{member.totalSubmissions}</td>
                  <td className="px-4 py-3 text-green-600">{member.approvedSubmissions}</td>
                  <td className="px-4 py-3 text-red-600">{member.rejectedSubmissions}</td>
                  <td className="px-4 py-3">{member.approvalRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
