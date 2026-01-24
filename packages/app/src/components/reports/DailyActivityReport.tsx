/**
 * Daily Activity Report Component
 * Shows today's submission activity compared to yesterday
 */

import { useDailyActivityReport } from '../../hooks/useReports';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  date?: string;
}

export function DailyActivityReport({ date }: Props) {
  const { data, isLoading, error } = useDailyActivityReport(date);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
          <p className="text-slate-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">שגיאה בטעינת הדוח</h3>
        <p className="text-red-600 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'טפסים ממולאים היום',
      value: data.submissionsToday,
      change: data.percentChange,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'משתמשים פעילים',
      value: data.activeUsers,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'זמן מילוי ממוצע',
      value: `${Math.floor(data.avgCompletionTime / 60)}:${String(
        Math.floor(data.avgCompletionTime % 60)
      ).padStart(2, '0')}`,
      subtitle: 'דקות',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'שיעור אישור',
      value: `${data.approvalRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change ? stat.change > 0 : null;

          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                    {stat.subtitle && (
                      <span className="text-sm text-slate-500">{stat.subtitle}</span>
                    )}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stat.change.toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500">מאתמול</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">פילוח לפי שעות</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.submissionsByHour}>
            <defs>
              <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6100" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6100" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              tickFormatter={(value: any) => `${value}:00`}
            />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                direction: 'rtl',
              }}
              labelFormatter={(value: any) => `שעה ${value}:00`}
              formatter={(value: any) => [value, 'טפסים']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#FF6100"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubmissions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          טפסים אחרונים ({data.recentSubmissions.length})
        </h3>
        {data.recentSubmissions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">אין טפסים ממולאים היום</p>
        ) : (
          <div className="space-y-3">
            {data.recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{submission.formType}</p>
                  <p className="text-sm text-slate-600">
                    הוגש על ידי: {submission.submittedBy}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {new Date(submission.submittedAt).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : submission.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {submission.status === 'approved'
                      ? 'אושר'
                      : submission.status === 'rejected'
                      ? 'נדחה'
                      : 'ממתין'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
