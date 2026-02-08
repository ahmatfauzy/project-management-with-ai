"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import type { PerformanceData } from "@/types/performance";

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard/employee/performance");

      if (!res.ok) {
        throw new Error("Failed to fetch performance data");
      }

      const response = await res.json();

      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      console.error("Performance fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load performance data",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PerformanceLoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Failed to Load Performance Data
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <button
            onClick={fetchPerformanceData}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const {
    currentMonth,
    lastMonth,
    taskBreakdown,
    recentActivity,
    trend,
    qualityMetrics,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Performance</h1>
        <p className="text-muted-foreground mt-1">
          Track your productivity and progress over time
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Tasks Completed */}
        <MetricCard
          title="Tasks Completed"
          value={currentMonth.tasksCompleted}
          subtitle={`of ${currentMonth.tasksTotal} total`}
          trend={trend.tasksCompleted}
          icon={<CheckCircle2 className="w-4 h-4" />}
          trendLabel="vs last month"
        />

        {/* Completion Rate */}
        <MetricCard
          title="Completion Rate"
          value={`${currentMonth.completionRate}%`}
          subtitle="tasks finished"
          trend={trend.completionRate}
          icon={<Target className="w-4 h-4" />}
          trendLabel="vs last month"
        />

        {/* On-Time Delivery */}
        <MetricCard
          title="On-Time Delivery"
          value={`${currentMonth.onTimeRate}%`}
          subtitle="before deadline"
          trend={trend.onTimeRate}
          icon={<Clock className="w-4 h-4" />}
          trendLabel="vs last month"
        />

        {/* Quality Score (if available) */}
        {qualityMetrics ? (
          <MetricCard
            title="Quality Score"
            value={`${qualityMetrics.avgQualityScore}/100`}
            subtitle={`${qualityMetrics.tasksWithScore} tasks scored`}
            trend={qualityMetrics.trend}
            icon={<Award className="w-4 h-4" />}
            trendLabel="vs last month"
          />
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Quality Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                N/A
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AI scoring not yet available
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Days</CardDescription>
            <CardTitle className="text-2xl">
              {currentMonth.activeDays}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Days with task activity this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Completion Time</CardDescription>
            <CardTitle className="text-2xl">
              {currentMonth.avgCompletionDays} days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Average time to complete tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Late Submissions</CardDescription>
            <CardTitle className="text-2xl">
              {currentMonth.lateSubmissions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Tasks completed after deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
            <CardDescription>Distribution of all your tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {taskBreakdown.byPriority.high}
                </span>
                <span className="text-xs text-muted-foreground">
                  (
                  {Math.round(
                    (taskBreakdown.byPriority.high /
                      (currentMonth.tasksTotal || 1)) *
                      100,
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {taskBreakdown.byPriority.medium}
                </span>
                <span className="text-xs text-muted-foreground">
                  (
                  {Math.round(
                    (taskBreakdown.byPriority.medium /
                      (currentMonth.tasksTotal || 1)) *
                      100,
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Low Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {taskBreakdown.byPriority.low}
                </span>
                <span className="text-xs text-muted-foreground">
                  (
                  {Math.round(
                    (taskBreakdown.byPriority.low /
                      (currentMonth.tasksTotal || 1)) *
                      100,
                  )}
                  %)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Status</CardTitle>
            <CardDescription>Current state of all tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm">To Do</span>
              </div>
              <span className="text-sm font-medium">
                {taskBreakdown.byStatus.todo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <span className="text-sm font-medium">
                {taskBreakdown.byStatus.in_progress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">In Review</span>
              </div>
              <span className="text-sm font-medium">
                {taskBreakdown.byStatus.review}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Done</span>
              </div>
              <span className="text-sm font-medium">
                {taskBreakdown.byStatus.done}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Your latest completed tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No completed tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium line-clamp-1">
                        {activity.title}
                      </p>
                      {activity.priority === "high" && (
                        <Badge
                          variant="destructive"
                          className="h-4 px-1 text-[10px]"
                        >
                          High
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(activity.date), "MMM d, yyyy")}
                      </span>
                      {activity.daysToComplete !== null && (
                        <span>
                          • {activity.daysToComplete} days to complete
                        </span>
                      )}
                      {!activity.onTime && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1 text-[10px] text-destructive border-destructive"
                        >
                          Late
                        </Badge>
                      )}
                    </div>
                  </div>
                  {activity.qualityScore !== null && (
                    <div className="ml-4">
                      <Badge
                        variant="outline"
                        className={`h-6 px-2 text-xs font-semibold ${
                          activity.qualityScore >= 80
                            ? "text-green-600 border-green-600"
                            : activity.qualityScore >= 60
                              ? "text-yellow-600 border-yellow-600"
                              : "text-red-600 border-red-600"
                        }`}
                      >
                        {activity.qualityScore}/100
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Performance (if quality metrics available) */}
      {qualityMetrics && qualityMetrics.bestTask && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Best Performance
            </CardTitle>
            <CardDescription>Your highest quality task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{qualityMetrics.bestTask.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Exceptional work on this task!
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                {qualityMetrics.bestTask.score}/100
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: string;
  icon: React.ReactNode;
  trendLabel: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  trendLabel,
}: MetricCardProps) {
  const isPositive = trend.startsWith("+");
  const isNeutral = trend === "0" || trend === "+0" || trend === "0%";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        <div className="flex items-center gap-1 mt-2">
          {!isNeutral && (
            <>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
            </>
          )}
          <span
            className={`text-xs font-medium ${
              isNeutral
                ? "text-muted-foreground"
                : isPositive
                  ? "text-green-600"
                  : "text-red-600"
            }`}
          >
            {trend}
          </span>
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function PerformanceLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
