"use client";

import { EmployeeKanban } from "@/components/dashboard/employee-kanban";

export default function EmployeeTasksPage() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-2rem)] p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Task Board</h2>
        <p className="text-muted-foreground">
          Manage responsibilities and track progress.
        </p>
      </div>
      <div className="flex-1">
        <EmployeeKanban />
      </div>
    </div>
  );
}
