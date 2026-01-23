/**
 * Reports Feature - Type Definitions
 *
 * TypeScript interfaces and types for the Reports & Analytics feature.
 * These types ensure type safety across the entire Reports implementation.
 */

/**
 * Daily Activity Report Data
 */
export interface DailyActivityReport {
  submissionsToday: number;
  submissionsYesterday: number;
  percentChange: number;
  activeUsers: number;
  avgCompletionTime: number; // in seconds
  approvalRate: number; // percentage (0-100)
  submissionsByHour: SubmissionsByHour[];
  recentSubmissions: RecentSubmission[];
}

export interface SubmissionsByHour {
  hour: number; // 0-23
  count: number;
}

export interface RecentSubmission {
  id: string;
  formType: string;
  submittedBy: string;
  submittedAt: string; // ISO 8601
  status: string;
}

/**
 * Team Performance Report Data
 */
export interface TeamPerformanceReport {
  members: TeamMember[];
  summary: TeamSummary;
}

export interface TeamMember {
  userId: string;
  userName: string;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  pendingSubmissions: number;
  avgCompletionTime: number; // in seconds
  approvalRate: number; // percentage (0-100)
}

export interface TeamSummary {
  totalMembers: number;
  totalSubmissions: number;
  avgTeamApprovalRate: number; // percentage (0-100)
  avgTeamCompletionTime: number; // in seconds
}

/**
 * Forms Status Report Data
 */
export interface FormsStatusReport {
  byStatus: StatusCount[];
  longWaitingCount: number; // submissions pending > 3 days
  trend: StatusTrend[];
}

export interface StatusCount {
  status: string;
  count: number;
  percentage: number; // percentage (0-100)
}

export interface StatusTrend {
  date: string; // YYYY-MM-DD
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Location Report Data (Future)
 */
export interface LocationReport {
  summary: LocationSummary;
  byRegion: RegionCount[];
  byCity: CityCount[];
  mapData: LocationMarker[];
}

export interface LocationSummary {
  totalLocations: number;
  topRegion: string;
  topCity: string;
}

export interface RegionCount {
  region: string;
  count: number;
  percentage: number;
}

export interface CityCount {
  city: string;
  region: string;
  count: number;
}

export interface LocationMarker {
  id: string;
  lat: number;
  lng: number;
  city: string;
  formName: string;
  submittedBy: string;
}

/**
 * Completion Time Report Data (Future)
 */
export interface CompletionTimeReport {
  forms: FormCompletionStats[];
  distribution: TimeDistribution[];
}

export interface FormCompletionStats {
  formId: string;
  formName: string;
  submissionsCount: number;
  avgTime: number; // seconds
  minTime: number;
  maxTime: number;
  stdDev: number;
  rank: number;
}

export interface TimeDistribution {
  bin: string; // e.g., "0-2 min"
  count: number;
}

/**
 * Conditional Fields Report Data (Future)
 */
export interface ConditionalFieldsReport {
  fields: ConditionalFieldStats[];
  summary: ConditionalFieldsSummary;
}

export interface ConditionalFieldStats {
  fieldId: string;
  fieldName: string;
  formName: string;
  condition: string;
  displayedCount: number; // times field was shown
  filledCount: number; // times field was filled
  fillRate: number; // percentage (0-100)
  avgFillTime: number; // seconds
}

export interface ConditionalFieldsSummary {
  totalConditionalFields: number;
  avgFillRate: number;
  totalDisplayed: number;
  totalFilled: number;
}

/**
 * Common Types
 */
export type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'all';

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

/**
 * Filter Options
 */
export interface ReportFilters {
  dateRange?: DateRange;
  formIds?: string[];
  userIds?: string[];
  status?: SubmissionStatus;
  organizationId: string; // Required for multi-tenant isolation
}

/**
 * API Request/Response Types
 */
export interface ReportRequest {
  organizationId: string;
  date?: string; // YYYY-MM-DD (for daily reports)
  from?: string; // YYYY-MM-DD (for range reports)
  to?: string; // YYYY-MM-DD (for range reports)
  formIds?: string[];
  userIds?: string[];
  status?: SubmissionStatus;
}

export interface ReportResponse<T> {
  success: boolean;
  data: T;
  timestamp: string; // ISO 8601
  error?: string;
}

/**
 * Database Query Result Types
 */
export interface SubmissionQueryRow {
  id: string;
  organization_id: string;
  form_id: string;
  submitted_by_id: string;
  data: Record<string, any>;
  metadata: {
    totalSeconds?: number;
    location?: {
      lat: number;
      lng: number;
      city?: string;
      region?: string;
    };
    device?: string;
    version?: string;
  } | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FormQueryRow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  fields: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface UserQueryRow {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'worker';
  created_at: string;
}
