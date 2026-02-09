"use client";

import { EmployeeKanban } from "@/components/dashboard/employee-kanban";
import { SectionCards } from "@/components/section-cards-employee";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { UpcomingDeadlines } from "@/components/upcoming-deadlines";

export default function EmployeeDashboardPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-6">
        <SectionCards />

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
          <div className="col-span-4 lg:col-span-5">
            <ChartAreaInteractive />
          </div>
          <div className="col-span-3 lg:col-span-2">
            <UpcomingDeadlines />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
            <p className="text-muted-foreground">
              Manage your assigned tasks and submit evidence.
            </p>
          </div>
          <EmployeeKanban />
        </div>
      </div>
    </div>
  );
}
