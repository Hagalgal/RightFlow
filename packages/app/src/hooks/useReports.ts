/**
 * Reports API Hooks
 * React Query hooks for fetching reports data
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================================================
// Type Definitions (matching backend types)
// ============================================================================

export interface DailyActivityData {
  submissionsToday: number;
  submissionsYesterday: number;
  percentChange: number;
  activeUsers: number;
  avgCompletionTime: number;
  approvalRate: number;
  submissionsByHour: Array<{ hour: number; count: number }>;
  recentSubmissions: Array<{
    id: string;
    formType: string;
    submittedBy: string;
    submittedAt: string;
    status: string;
  }>;
}

export interface TeamPerformanceData {
  members: Array<{
    userId: string;
    userName: string;
    totalSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    pendingSubmissions: number;
    avgCompletionTime: number;
    approvalRate: number;
  }>;
  summary: {
    totalMembers: number;
    totalSubmissions: number;
    avgTeamApprovalRate: number;
    avgTeamCompletionTime: number;
  };
}

export interface FormsStatusData {
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  longWaitingCount: number;
  trend: Array<{
    date: string;
    approved: number;
    rejected: number;
    pending: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// ============================================================================
// API Hooks
// ============================================================================

/**
 * Fetch Daily Activity Report
 */
export function useDailyActivityReport(date?: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['reports', 'daily-activity', date],
    queryFn: async (): Promise<DailyActivityData> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const url = date
        ? `${API_BASE}/v1/reports/daily-activity?date=${date}`
        : `${API_BASE}/v1/reports/daily-activity`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch daily activity report');
      }

      const result: ApiResponse<DailyActivityData> = await response.json();
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch Team Performance Report
 */
export function useTeamPerformanceReport(from: string, to: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['reports', 'team-performance', from, to],
    queryFn: async (): Promise<TeamPerformanceData> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const url = `${API_BASE}/v1/reports/team-performance?from=${from}&to=${to}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch team performance report');
      }

      const result: ApiResponse<TeamPerformanceData> = await response.json();
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(from && to), // Only run if dates are provided
  });
}

/**
 * Fetch Forms Status Report
 */
export function useFormsStatusReport(from: string, to: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['reports', 'forms-status', from, to],
    queryFn: async (): Promise<FormsStatusData> => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const url = `${API_BASE}/v1/reports/forms-status?from=${from}&to=${to}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch forms status report');
      }

      const result: ApiResponse<FormsStatusData> = await response.json();
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(from && to), // Only run if dates are provided
  });
}
