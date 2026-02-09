import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import type {
  PerformanceData,
  MonthlyMetrics,
  TaskBreakdown,
  RecentActivity,
  TrendMetrics,
  QualityMetrics,
} from "@/types/performance";

/**
 * GET /api/dashboard/employee/performance
 * Returns comprehensive performance metrics for the authenticated employee
 *
 * @returns {PerformanceData} Performance metrics including current/last month comparison
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const now = new Date();

    // Calculate date ranges
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all user tasks
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, userId));

    // Helper: Calculate metrics for a date range
    const calculateMetrics = (
      startDate: Date,
      endDate: Date,
    ): MonthlyMetrics => {
      const tasksInRange = allTasks.filter((task) => {
        if (!task.createdAt) return false;
        const createdAt = new Date(task.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      });

      const completedTasks = tasksInRange.filter((t) => t.status === "done");
      const tasksTotal = tasksInRange.length;
      const tasksCompleted = completedTasks.length;

      // Calculate on-time rate
      const tasksWithDeadline = completedTasks.filter((t) => t.dueDate);
      const onTimeTasks = tasksWithDeadline.filter((t) => {
        if (!t.completedDate || !t.dueDate) return false;
        return new Date(t.completedDate) <= new Date(t.dueDate);
      });

      const onTimeRate =
        tasksWithDeadline.length > 0
          ? Math.round((onTimeTasks.length / tasksWithDeadline.length) * 100)
          : 100;

      const lateSubmissions = tasksWithDeadline.length - onTimeTasks.length;

      // Calculate average completion days
      const completionTimes = completedTasks
        .filter((t) => t.completedDate && t.createdAt)
        .map((t) => {
          const created = new Date(t.createdAt!).getTime();
          const completed = new Date(t.completedDate!).getTime();
          return (completed - created) / (1000 * 60 * 60 * 24); // Convert to days
        });

      const avgCompletionDays =
        completionTimes.length > 0
          ? Math.round(
              (completionTimes.reduce((a, b) => a + b, 0) /
                completionTimes.length) *
                10,
            ) / 10 // Round to 1 decimal
          : 0;

      // Calculate active days (days with any task activity)
      const activeDaysSet = new Set<string>();
      tasksInRange.forEach((task) => {
        if (task.createdAt) {
          const date = new Date(task.createdAt).toISOString().split("T")[0];
          activeDaysSet.add(date);
        }
        if (task.completedDate) {
          const completedDate = new Date(task.completedDate)
            .toISOString()
            .split("T")[0];
          activeDaysSet.add(completedDate);
        }
      });

      const activeDays = activeDaysSet.size;

      const completionRate =
        tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

      return {
        tasksCompleted,
        tasksTotal,
        completionRate,
        onTimeRate,
        lateSubmissions,
        avgCompletionDays,
        activeDays,
      };
    };

    // Calculate current and last month metrics
    const currentMonth = calculateMetrics(currentMonthStart, now);
    const lastMonth = calculateMetrics(lastMonthStart, lastMonthEnd);

    // Calculate task breakdown (all-time)
    const taskBreakdown: TaskBreakdown = {
      byPriority: {
        high: allTasks.filter((t) => t.priority === "high").length,
        medium: allTasks.filter((t) => t.priority === "medium").length,
        low: allTasks.filter((t) => t.priority === "low").length,
      },
      byStatus: {
        todo: allTasks.filter((t) => t.status === "todo").length,
        in_progress: allTasks.filter((t) => t.status === "in_progress").length,
        review: allTasks.filter((t) => t.status === "review").length,
        done: allTasks.filter((t) => t.status === "done").length,
      },
    };

    // Get recent activity (last 10 completed tasks)
    const recentActivity: RecentActivity[] = allTasks
      .filter((t) => t.status === "done" && t.completedDate && t.createdAt)
      .sort((a, b) => {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((task) => {
        const createdAt = new Date(task.createdAt!);
        const completedAt = task.completedDate
          ? new Date(task.completedDate)
          : null;
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;

        const daysToComplete = completedAt
          ? Math.round(
              (completedAt.getTime() - createdAt.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null;

        const onTime = completedAt && dueDate ? completedAt <= dueDate : true;

        const dateValue = task.completedDate || task.createdAt!;

        return {
          id: task.id,
          date:
            typeof dateValue === "string"
              ? dateValue
              : new Date(dateValue).toISOString(),
          title: task.title,
          status: task.status as RecentActivity["status"],
          priority: task.priority as RecentActivity["priority"],
          onTime,
          daysToComplete,
          qualityScore: task.qualityScore || null,
        };
      });

    // Calculate trends
    const trend: TrendMetrics = {
      tasksCompleted:
        currentMonth.tasksCompleted - lastMonth.tasksCompleted >= 0
          ? `+${currentMonth.tasksCompleted - lastMonth.tasksCompleted}`
          : `${currentMonth.tasksCompleted - lastMonth.tasksCompleted}`,
      completionRate:
        currentMonth.completionRate - lastMonth.completionRate >= 0
          ? `+${currentMonth.completionRate - lastMonth.completionRate}%`
          : `${currentMonth.completionRate - lastMonth.completionRate}%`,
      onTimeRate:
        currentMonth.onTimeRate - lastMonth.onTimeRate >= 0
          ? `+${currentMonth.onTimeRate - lastMonth.onTimeRate}%`
          : `${currentMonth.onTimeRate - lastMonth.onTimeRate}%`,
    };

    // Calculate quality metrics (if AI is enabled)
    let qualityMetrics: QualityMetrics | null = null;

    const tasksWithQualityScore = allTasks.filter(
      (t) => t.qualityScore !== null && t.qualityScore !== undefined,
    );

    if (tasksWithQualityScore.length > 0) {
      const avgQualityScore = Math.round(
        tasksWithQualityScore.reduce(
          (sum, t) => sum + (t.qualityScore || 0),
          0,
        ) / tasksWithQualityScore.length,
      );

      const bestTask = tasksWithQualityScore.reduce((best, current) => {
        return (current.qualityScore || 0) > (best.qualityScore || 0)
          ? current
          : best;
      });

      // Calculate quality trend (current month vs last month)
      const currentMonthQuality = tasksWithQualityScore
        .filter((t) => {
          const completedDate = t.completedDate
            ? new Date(t.completedDate)
            : null;
          return (
            completedDate &&
            completedDate >= currentMonthStart &&
            completedDate <= now
          );
        })
        .reduce((sum, t) => sum + (t.qualityScore || 0), 0);

      const lastMonthQuality = tasksWithQualityScore
        .filter((t) => {
          const completedDate = t.completedDate
            ? new Date(t.completedDate)
            : null;
          return (
            completedDate &&
            completedDate >= lastMonthStart &&
            completedDate <= lastMonthEnd
          );
        })
        .reduce((sum, t) => sum + (t.qualityScore || 0), 0);

      const currentMonthTasksWithScore = tasksWithQualityScore.filter((t) => {
        const completedDate = t.completedDate
          ? new Date(t.completedDate)
          : null;
        return (
          completedDate &&
          completedDate >= currentMonthStart &&
          completedDate <= now
        );
      }).length;

      const lastMonthTasksWithScore = tasksWithQualityScore.filter((t) => {
        const completedDate = t.completedDate
          ? new Date(t.completedDate)
          : null;
        return (
          completedDate &&
          completedDate >= lastMonthStart &&
          completedDate <= lastMonthEnd
        );
      }).length;

      const currentAvg =
        currentMonthTasksWithScore > 0
          ? currentMonthQuality / currentMonthTasksWithScore
          : 0;
      const lastAvg =
        lastMonthTasksWithScore > 0
          ? lastMonthQuality / lastMonthTasksWithScore
          : 0;

      const qualityTrend = Math.round(currentAvg - lastAvg);

      qualityMetrics = {
        avgQualityScore,
        tasksWithScore: tasksWithQualityScore.length,
        bestTask: {
          title: bestTask.title,
          score: bestTask.qualityScore || 0,
        },
        trend: qualityTrend >= 0 ? `+${qualityTrend}` : `${qualityTrend}`,
      };
    }

    const performanceData: PerformanceData = {
      currentMonth,
      lastMonth,
      taskBreakdown,
      recentActivity,
      trend,
      qualityMetrics,
    };

    return NextResponse.json({
      success: true,
      data: performanceData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Performance API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance data",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
