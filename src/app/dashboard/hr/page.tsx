"use client";

import { PendingApprovals } from "@/components/dashboard/hr/pending-approvals";
import { EmployeeDistributionChart } from "@/components/dashboard/hr/employee-distribution-chart";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Briefcase, ListTodo } from "lucide-react";

interface HRStats {
  overview: {
    totalEmployees: number;
    employeeGrowth: number;
    pendingApprovals: number;
    activeProjects: number;
    projectGrowth: number;
    avgWorkload: number;
  };
  departmentDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export default function HRDashboardPage() {
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRStats();
  }, []);

  const fetchHRStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/hr/stats");

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch HR stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">HR Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Employees */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Total Employees
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {stats?.overview.totalEmployees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.employeeGrowth !== undefined &&
              stats.overview.employeeGrowth >= 0
                ? `+${stats.overview.employeeGrowth} this month`
                : `${stats?.overview.employeeGrowth || 0} this month`}
            </p>
          </div>
        )}

        {/* Card 2: Pending Approvals */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                Pending Approvals
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {stats?.overview.pendingApprovals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.pendingApprovals &&
              stats.overview.pendingApprovals > 0
                ? "Action required"
                : "All caught up"}
            </p>
          </div>
        )}

        {/* Card 3: Active Projects */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Active Projects
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {stats?.overview.activeProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.projectGrowth !== undefined &&
              stats.overview.projectGrowth >= 0
                ? `+${stats.overview.projectGrowth} new projects`
                : `${stats?.overview.projectGrowth || 0} projects`}
            </p>
          </div>
        )}

        {/* Card 4: Average Workload */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-muted-foreground" />
                Avg Workload
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {stats?.overview.avgWorkload || 0}
            </div>
            <p className="text-xs text-muted-foreground">tasks per employee</p>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
          <PendingApprovals />
        </div>
        <div className="col-span-3 lg:col-span-3">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <EmployeeDistributionChart
              data={stats?.departmentDistribution || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton Components
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
