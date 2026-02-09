/**
 * Performance Metrics Type Definitions
 * Type-safe interfaces for employee performance tracking
 */

export interface MonthlyMetrics {
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number;
  onTimeRate: number;
  lateSubmissions: number;
  avgCompletionDays: number;
  activeDays: number;
}

export interface TaskBreakdown {
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    todo: number;
    in_progress: number;
    review: number;
    done: number;
  };
}

export interface RecentActivity {
  id: string;
  date: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "high" | "medium" | "low";
  onTime: boolean;
  daysToComplete: number | null;
  qualityScore: number | null; // Optional: populated when AI is enabled
}

export interface TrendMetrics {
  tasksCompleted: string; // e.g., "+3" or "-2"
  completionRate: string; // e.g., "+5%" or "-3%"
  onTimeRate: string; // e.g., "+10%" or "-5%"
}

export interface QualityMetrics {
  avgQualityScore: number;
  tasksWithScore: number;
  bestTask: {
    title: string;
    score: number;
  } | null;
  trend: string; // e.g., "+5" or "-3"
}

export interface PerformanceData {
  currentMonth: MonthlyMetrics;
  lastMonth: MonthlyMetrics;
  taskBreakdown: TaskBreakdown;
  recentActivity: RecentActivity[];
  trend: TrendMetrics;
  qualityMetrics: QualityMetrics | null; // Optional: null when AI is disabled
}

export interface PerformanceResponse {
  success: boolean;
  data: PerformanceData;
  generatedAt: string;
}

export interface PerformanceError {
  success: false;
  error: string;
  code?: string;
}
