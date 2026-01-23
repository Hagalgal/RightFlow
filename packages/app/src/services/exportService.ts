/**
 * Export Service - Excel, CSV, PDF Generation
 * Exports reports to various formats with Hebrew/RTL support
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type {
  DailyActivityData,
  TeamPerformanceData,
  FormsStatusData,
} from '../hooks/useReports';

// ============================================================================
// Excel Export
// ============================================================================

export function exportDailyActivityToExcel(data: DailyActivityData, date: string) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['דוח פעילות יומית', ''],
    ['תאריך:', date],
    [''],
    ['מדד', 'ערך'],
    ['טפסים ממולאים היום', data.submissionsToday],
    ['טפסים ממולאים אתמול', data.submissionsYesterday],
    ['שינוי באחוזים', `${data.percentChange.toFixed(1)}%`],
    ['משתמשים פעילים', data.activeUsers],
    ['זמן מילוי ממוצע (שניות)', data.avgCompletionTime],
    ['שיעור אישור (%)', data.approvalRate.toFixed(1)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'סיכום');

  // Hourly Data Sheet
  const hourlyData = [
    ['שעה', 'מספר טפסים'],
    ...data.submissionsByHour.map((h) => [`${h.hour}:00`, h.count]),
  ];
  const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData);
  XLSX.utils.book_append_sheet(wb, hourlySheet, 'פילוח שעתי');

  // Recent Submissions Sheet
  if (data.recentSubmissions.length > 0) {
    const recentData = [
      ['מזהה', 'סוג טופס', 'הוגש על ידי', 'תאריך הגשה', 'סטטוס'],
      ...data.recentSubmissions.map((s) => [
        s.id,
        s.formType,
        s.submittedBy,
        new Date(s.submittedAt).toLocaleString('he-IL'),
        s.status,
      ]),
    ];
    const recentSheet = XLSX.utils.aoa_to_sheet(recentData);
    XLSX.utils.book_append_sheet(wb, recentSheet, 'טפסים אחרונים');
  }

  // Download
  XLSX.writeFile(wb, `דוח-פעילות-יומית-${date}.xlsx`, { bookType: 'xlsx' });
}

export function exportTeamPerformanceToExcel(
  data: TeamPerformanceData,
  from: string,
  to: string
) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['דוח ביצועי צוות', ''],
    ['מתאריך:', from],
    ['עד תאריך:', to],
    [''],
    ['מדד', 'ערך'],
    ['סה"כ חברי צוות', data.summary.totalMembers],
    ['סה"כ טפסים', data.summary.totalSubmissions],
    ['שיעור אישור ממוצע (%)', data.summary.avgTeamApprovalRate.toFixed(1)],
    ['זמן השלמה ממוצע (שניות)', data.summary.avgTeamCompletionTime.toFixed(1)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'סיכום');

  // Team Members Sheet
  const membersData = [
    [
      'שם משתמש',
      'סה"כ טפסים',
      'אושרו',
      'נדחו',
      'ממתינים',
      'זמן ממוצע (שניות)',
      'שיעור אישור (%)',
    ],
    ...data.members.map((m) => [
      m.userName,
      m.totalSubmissions,
      m.approvedSubmissions,
      m.rejectedSubmissions,
      m.pendingSubmissions,
      m.avgCompletionTime.toFixed(1),
      m.approvalRate.toFixed(1),
    ]),
  ];
  const membersSheet = XLSX.utils.aoa_to_sheet(membersData);
  XLSX.utils.book_append_sheet(wb, membersSheet, 'חברי צוות');

  // Download
  XLSX.writeFile(wb, `דוח-ביצועי-צוות-${from}-${to}.xlsx`, { bookType: 'xlsx' });
}

export function exportFormsStatusToExcel(data: FormsStatusData, from: string, to: string) {
  const wb = XLSX.utils.book_new();

  // Status Distribution Sheet
  const statusData = [
    ['דוח סטטוס טפסים', ''],
    ['מתאריך:', from],
    ['עד תאריך:', to],
    [''],
    ['סטטוס', 'כמות', 'אחוז'],
    ...data.byStatus.map((s) => [s.status, s.count, `${s.percentage.toFixed(1)}%`]),
    [''],
    ['טפסים ממתינים מעל 48 שעות:', data.longWaitingCount],
  ];
  const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
  XLSX.utils.book_append_sheet(wb, statusSheet, 'התפלגות סטטוס');

  // Trend Sheet
  if (data.trend.length > 0) {
    const trendData = [
      ['תאריך', 'אושרו', 'נדחו', 'ממתינים'],
      ...data.trend.map((t) => [t.date, t.approved, t.rejected, t.pending]),
    ];
    const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
    XLSX.utils.book_append_sheet(wb, trendSheet, 'מגמה');
  }

  // Download
  XLSX.writeFile(wb, `דוח-סטטוס-טפסים-${from}-${to}.xlsx`, { bookType: 'xlsx' });
}

// ============================================================================
// CSV Export
// ============================================================================

export function exportDailyActivityToCSV(data: DailyActivityData, date: string) {
  const csvContent = [
    ['דוח פעילות יומית - ' + date],
    [''],
    ['טפסים ממולאים היום', data.submissionsToday],
    ['טפסים ממולאים אתמול', data.submissionsYesterday],
    ['שינוי באחוזים', data.percentChange.toFixed(1)],
    ['משתמשים פעילים', data.activeUsers],
    ['זמן מילוי ממוצע (שניות)', data.avgCompletionTime],
    ['שיעור אישור (%)', data.approvalRate.toFixed(1)],
    [''],
    ['פילוח שעתי:'],
    ['שעה', 'כמות'],
    ...data.submissionsByHour.map((h) => [h.hour, h.count]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  downloadCSV(csvContent, `דוח-פעילות-יומית-${date}.csv`);
}

export function exportTeamPerformanceToCSV(
  data: TeamPerformanceData,
  from: string,
  to: string
) {
  const csvContent = [
    [`דוח ביצועי צוות - ${from} עד ${to}`],
    [''],
    ['שם', 'טפסים', 'אושרו', 'נדחו', 'ממתינים', 'זמן ממוצע', 'שיעור אישור'],
    ...data.members.map((m) => [
      m.userName,
      m.totalSubmissions,
      m.approvedSubmissions,
      m.rejectedSubmissions,
      m.pendingSubmissions,
      m.avgCompletionTime.toFixed(1),
      m.approvalRate.toFixed(1),
    ]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  downloadCSV(csvContent, `דוח-ביצועי-צוות-${from}-${to}.csv`);
}

export function exportFormsStatusToCSV(data: FormsStatusData, from: string, to: string) {
  const csvContent = [
    [`דוח סטטוס טפסים - ${from} עד ${to}`],
    [''],
    ['סטטוס', 'כמות', 'אחוז'],
    ...data.byStatus.map((s) => [s.status, s.count, s.percentage.toFixed(1)]),
    [''],
    ['טפסים ממתינים מעל 48 שעות', data.longWaitingCount],
  ]
    .map((row) => row.join(','))
    .join('\n');

  downloadCSV(csvContent, `דוח-סטטוס-טפסים-${from}-${to}.csv`);
}

function downloadCSV(content: string, filename: string) {
  // Add UTF-8 BOM for Hebrew support in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// PDF Export
// ============================================================================

export function exportDailyActivityToPDF(data: DailyActivityData, date: string) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Daily Activity Report', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 105, 30, { align: 'center' });

  // Summary Stats
  let y = 50;
  doc.setFontSize(14);
  doc.text('Summary', 20, y);
  y += 10;

  doc.setFontSize(10);
  const stats = [
    ['Submissions Today:', data.submissionsToday.toString()],
    ['Submissions Yesterday:', data.submissionsYesterday.toString()],
    ['Percent Change:', `${data.percentChange.toFixed(1)}%`],
    ['Active Users:', data.activeUsers.toString()],
    ['Avg Completion Time:', `${data.avgCompletionTime.toFixed(0)}s`],
    ['Approval Rate:', `${data.approvalRate.toFixed(1)}%`],
  ];

  stats.forEach(([label, value]) => {
    doc.text(label, 20, y);
    doc.text(value, 100, y);
    y += 7;
  });

  // Recent Submissions
  y += 10;
  doc.setFontSize(14);
  doc.text('Recent Submissions', 20, y);
  y += 10;

  doc.setFontSize(9);
  data.recentSubmissions.slice(0, 10).forEach((sub) => {
    doc.text(`${sub.formType} - ${sub.status}`, 20, y);
    y += 6;
  });

  doc.save(`daily-activity-${date}.pdf`);
}

export function exportTeamPerformanceToPDF(
  data: TeamPerformanceData,
  from: string,
  to: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Team Performance Report', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${from} to ${to}`, 105, 30, { align: 'center' });

  // Summary
  let y = 50;
  doc.setFontSize(14);
  doc.text('Team Summary', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Total Members: ${data.summary.totalMembers}`, 20, y);
  y += 7;
  doc.text(`Total Submissions: ${data.summary.totalSubmissions}`, 20, y);
  y += 7;
  doc.text(
    `Avg Approval Rate: ${data.summary.avgTeamApprovalRate.toFixed(1)}%`,
    20,
    y
  );
  y += 15;

  // Team Members
  doc.setFontSize(14);
  doc.text('Team Members', 20, y);
  y += 10;

  doc.setFontSize(9);
  data.members.forEach((member) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${member.userName}: ${member.totalSubmissions} submissions (${member.approvalRate.toFixed(1)}% approved)`,
      20,
      y
    );
    y += 6;
  });

  doc.save(`team-performance-${from}-${to}.pdf`);
}

export function exportFormsStatusToPDF(data: FormsStatusData, from: string, to: string) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Forms Status Report', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${from} to ${to}`, 105, 30, { align: 'center' });

  let y = 50;
  doc.setFontSize(14);
  doc.text('Status Distribution', 20, y);
  y += 10;

  doc.setFontSize(10);
  data.byStatus.forEach((status) => {
    doc.text(
      `${status.status}: ${status.count} (${status.percentage.toFixed(1)}%)`,
      20,
      y
    );
    y += 7;
  });

  y += 10;
  doc.setFontSize(12);
  doc.text(`Long Waiting (>48h): ${data.longWaitingCount}`, 20, y);

  doc.save(`forms-status-${from}-${to}.pdf`);
}
