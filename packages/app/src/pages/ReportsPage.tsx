/**
 * Reports Page - Analytics Dashboard
 * Displays Daily Activity, Team Performance, and Forms Status reports
 */

import { useState } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { DailyActivityReport } from '../components/reports/DailyActivityReport';
import { TeamPerformanceReport } from '../components/reports/TeamPerformanceReport';
import { FormsStatusReport } from '../components/reports/FormsStatusReport';
import { ReportFilters } from '../components/reports/ReportFilters';
import { ExportMenu } from '../components/reports/ExportMenu';

type ReportTab = 'daily' | 'team' | 'status';

interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export function ReportsPage() {
  const { orgId, orgRole } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportTab>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    to: new Date().toISOString().split('T')[0],
  });

  // Role-based permissions
  // Allow reports access for:
  // 1. Personal accounts (no organization) - !orgId
  // 2. Organization members with admin or member role
  const canViewReports = !orgId || (
    orgRole === 'org:admin' ||
    orgRole === 'org:member' ||
    orgRole === 'org:basic_member'
  );

  if (!canViewReports) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground opacity-80">אין הרשאה לצפות בדוחות</h1>
          <p className="text-muted-foreground">פנה למנהל הארגון לקבלת גישה</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'daily' as const,
      label: 'פעילות יומית',
      icon: TrendingUp,
      description: 'מעקב יומי אחר טפסים ממולאים',
    },
    {
      id: 'team' as const,
      label: 'ביצועי צוות',
      icon: Users,
      description: 'השוואת ביצועים בין חברי צוות',
    },
    {
      id: 'status' as const,
      label: 'סטטוס טפסים',
      icon: CheckCircle2,
      description: 'מעקב אחר סטטוס טפסים',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/20" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-black dark:bg-white p-3 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">דוחות ואנליטיקה</h1>
                <p className="text-sm text-muted-foreground font-medium">תובנות עסקיות בזמן אמת</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ExportMenu
                activeReport={activeTab}
                selectedDate={selectedDate}
                dateRange={dateRange}
              />
              <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-10 w-10 rounded-lg' } }} />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-5 flex items-center gap-3 transition-all min-w-fit
                    ${isActive
                      ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  <div className="text-right">
                    <div className="font-bold tracking-tight">{tab.label}</div>
                    <div className="text-[10px] text-muted-foreground opacity-70 uppercase tracking-widest">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filters */}
          <div className="mb-6">
            <ReportFilters
              reportType={activeTab}
              selectedDate={selectedDate}
              dateRange={dateRange}
              onDateChange={setSelectedDate}
              onDateRangeChange={setDateRange}
            />
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            {activeTab === 'daily' && <DailyActivityReport date={selectedDate} />}
            {activeTab === 'team' && (
              <TeamPerformanceReport from={dateRange.from} to={dateRange.to} />
            )}
            {activeTab === 'status' && (
              <FormsStatusReport from={dateRange.from} to={dateRange.to} />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
