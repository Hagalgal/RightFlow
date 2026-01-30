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
      color: 'text-black dark:text-white',
      bg: 'bg-zinc-100 dark:bg-zinc-800',
    },
    {
      label: 'משתמשים פעילים',
      value: data.activeUsers,
      icon: Users,
      color: 'text-zinc-600 dark:text-zinc-300',
      bg: 'bg-zinc-50 dark:bg-zinc-900',
    },
    {
      label: 'זמן מילוי ממוצע',
      value: `${Math.floor(data.avgCompletionTime / 60)}:${String(
        Math.floor(data.avgCompletionTime % 60)
      ).padStart(2, '0')}`,
      subtitle: 'דקות',
      icon: Clock,
      color: 'text-zinc-500 dark:text-zinc-400',
      bg: 'bg-zinc-50 dark:bg-zinc-900',
    },
    {
      label: 'שיעור אישור',
      value: `${data.approvalRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-black dark:text-white',
      bg: 'bg-zinc-100 dark:bg-zinc-800',
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
            <div key={index} className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-foreground">{stat.value}</span>
                    {stat.subtitle && (
                      <span className="text-sm text-muted-foreground font-medium">{stat.subtitle}</span>
                    )}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1 mt-3">
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-black dark:text-white" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span
                        className={`text-sm font-bold ${isPositive ? 'text-black dark:text-white' : 'text-zinc-500'
                          }`}
                      >
                        {isPositive ? '+' : ''}
                        {stat.change.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">מאתמול</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bg} p-3 rounded-xl transition-colors`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Chart */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-extrabold text-foreground tracking-tight mb-6">פילוח לפי שעות</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.submissionsByHour}>
            <defs>
              <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#000000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="hour"
              stroke="#a1a1aa"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: any) => `${value}:00`}
            />
            <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e1e1e1',
                borderRadius: '8px',
                direction: 'rtl',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelFormatter={(value: any) => `שעה ${value}:00`}
              formatter={(value: any) => [value, 'טפסים']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#000000"
              strokeWidth={2.5}
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
                    className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'approved'
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
