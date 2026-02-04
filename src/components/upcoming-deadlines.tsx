"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const deadlines = [
  {
    id: 1,
    title: "Finalize Project Proposal",
    due: "Today, 5:00 PM",
    urgent: true,
  },
  {
    id: 2,
    title: "Team Sync Meeting",
    due: "Tomorrow, 10:00 AM",
    urgent: false,
  },
  {
    id: 3,
    title: "Submit Expense Report",
    due: "Feb 5, 2024",
    urgent: false,
  },
  {
    id: 4,
    title: "Submit Expense Report",
    due: "Feb 5, 2024",
    urgent: false,
  },
];

export function UpcomingDeadlines() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {deadlines.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.due}</p>
            </div>
            {task.urgent && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
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
      </CardContent>
    </Card>
  );
}
