"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface DeadlineTask {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
}

export function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState<DeadlineTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const tasks = await res.json();

        // Filter tasks with upcoming deadlines (next 7 days) and not done
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        const upcomingTasks = tasks
          .filter((task: DeadlineTask) => {
            if (!task.dueDate || task.status === "done") return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= now && dueDate <= sevenDaysFromNow;
          })
          .sort((a: DeadlineTask, b: DeadlineTask) => {
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          })
          .slice(0, 5); // Show max 5 upcoming deadlines

        setDeadlines(upcomingTasks);
      }
    } catch (error) {
      console.error("Failed to fetch deadlines:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const daysUntil = differenceInDays(date, now);

    if (daysUntil === 0) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (daysUntil === 1) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else if (daysUntil <= 7) {
      return format(date, "EEE, MMM d");
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  const isUrgent = (dueDate: string, priority: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const hoursUntil = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Urgent if less than 24 hours or high priority and less than 48 hours
    return hoursUntil < 24 || (priority === "high" && hoursUntil < 48);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {deadlines.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming deadlines in the next 7 days</p>
            <p className="text-xs mt-1">You're all caught up! 🎉</p>
          </div>
        ) : (
          <>
            {deadlines.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none line-clamp-1">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDueDate(task.dueDate)}
                    </p>
                    {task.priority === "high" && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        High
                      </Badge>
                    )}
                  </div>
                </div>
                {isUrgent(task.dueDate, task.priority) && (
                  <Badge
                    variant="destructive"
                    className="h-5 px-1.5 text-[10px] ml-2"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
            ))}
            <Link
              href="/dashboard/employee/tasks"
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              View all tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
