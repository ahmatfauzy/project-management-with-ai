"use client";

import {
  IconTrendingDown,
  IconTrendingUp,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeStats {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  upcomingDeadlines: number;
  overdueTasks: number;
  avgQualityScore: number | null;
  taskDistribution: {
    todo: number;
    in_progress: number;
    review: number;
    done: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export function SectionCards() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/employee/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch employee stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 px-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Failed to load stats
      </div>
    );
  }

  // Calculate completion rate
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  // Calculate in-progress rate
  const inProgressRate =
    stats.totalTasks > 0
      ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="grid gap-4 px-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Tasks */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Tugas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTasks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="h-3 w-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {stats.inProgressTasks} sedang dikerjakan
          </div>
        </CardFooter>
      </Card>

      {/* Done Tasks */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tugas Selesai</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.doneTasks}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`gap-1 ${
                completionRate >= 70
                  ? "text-green-600 border-green-600"
                  : completionRate >= 40
                    ? "text-yellow-600 border-yellow-600"
                    : "text-red-600 border-red-600"
              }`}
            >
              {completionRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {completionRate >= 70 ? (
              <>
                Great progress! <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Keep going! <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            {completionRate}% completion rate
          </div>
        </CardFooter>
      </Card>

      {/* Upcoming Deadlines */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Deadline Mendekati</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.upcomingDeadlines}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`gap-1 ${
                stats.upcomingDeadlines > 0
                  ? "text-yellow-600 border-yellow-600"
                  : "text-green-600 border-green-600"
              }`}
            >
              <IconClock className="h-3 w-3" />7 hari
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {stats.upcomingDeadlines > 0
              ? `${stats.upcomingDeadlines} tugas dalam 7 hari ke depan`
              : "Tidak ada deadline mendesak"}
          </div>
        </CardFooter>
      </Card>

      {/* Overdue Tasks */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tugas Terlambat</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.overdueTasks}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`gap-1 ${
                stats.overdueTasks > 0
                  ? "text-red-600 border-red-600"
                  : "text-green-600 border-green-600"
              }`}
            >
              {stats.overdueTasks > 0 ? (
                <>
                  <IconAlertTriangle className="h-3 w-3" />
                  Urgent
                </>
              ) : (
                <>
                  <IconTrendingUp className="h-3 w-3" />
                  On Track
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {stats.overdueTasks > 0
              ? "Segera selesaikan tugas yang terlambat"
              : "Semua tugas on track!"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
