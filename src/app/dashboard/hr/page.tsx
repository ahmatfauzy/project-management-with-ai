"use client";

import { PendingApprovals } from "@/components/dashboard/hr/pending-approvals";
import { EmployeeDistributionChart } from "@/components/dashboard/hr/employee-distribution-chart";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"; // Reusing the area chart for "Hiring Trends" simulation
import { useEffect, useState } from "react";

export default function HRDashboardPage() {
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    const fetchTotalEmployee = async () => {
      const response = await fetch("/api/users");
      const data = await response.json();

      setTotalEmployees(data.length);
    };
    fetchTotalEmployee();
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">HR Overview</h2>
        {/* <Button>Add New Employee</Button> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Employees
            </h3>
          </div>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">+12 this month</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Retention Rate
            </h3>
          </div>
          <div className="text-2xl font-bold">96%</div>
          <p className="text-xs text-muted-foreground">+2% from average</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Open Positions
            </h3>
          </div>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">3 urgent hires</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Training Hours
            </h3>
          </div>
          <div className="text-2xl font-bold">450h</div>
          <p className="text-xs text-muted-foreground">Total this quarter</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
          {/* Using the area chart but conceptually representing Hiring Trends or similar */}
          {/* Note: The component title is hardcoded inside ChartAreaInteractive to 'Task Activity' now. 
                 In a real refactor we should make title prop-driven. 
                 For this demo, we can just use it or wrap it. 
                 To keep it clean, let's use the PendingApprovals prominent here. */}
          <PendingApprovals />
        </div>
        <div className="col-span-3 lg:col-span-3">
          <EmployeeDistributionChart />
        </div>
      </div>
    </div>
  );
}
