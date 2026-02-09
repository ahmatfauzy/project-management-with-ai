"use client";

import { ProjectStatusChart } from "@/components/dashboard/pm/project-status-chart";
import { TeamWorkloadChart } from "@/components/dashboard/pm/team-workload-chart";
import { useEffect, useState } from "react";
import type { Project } from "@/types/common";

export default function PMDashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    teamEfficiency: 0,
    pendingReview: 0,
  });
  const [workloadData, setWorkloadData] = useState<
    Array<{ name: string; tasks: number }>
  >([]);
  const [projectStatusData, setProjectStatusData] = useState<{
    active: number;
    completed: number;
    planning: number;
    on_hold: number;
  } | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Stats & Chart Data
        const statsRes = await fetch("/api/dashboard/pm/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setWorkloadData(data.workload);
          setProjectStatusData(data.projectStatus);
        }

        // 2. Fetch Recent Projects
        const projectsRes = await fetch("/api/projects");
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          // Sort by start date descending and take top 5
          const sorted = (data as Project[])
            .sort(
              (a: Project, b: Project) =>
                new Date(b.createdAt || b.startDate || 0).getTime() -
                new Date(a.createdAt || a.startDate || 0).getTime(),
            )
            .slice(0, 5);
          setRecentProjects(sorted);
        }
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold tracking-tight">Project Overview</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Projects */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Projects
            </h3>
          </div>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">Across all scopes</p>
        </div>

        {/* Card 2: Active Tasks */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Tasks</h3>
          </div>
          <div className="text-2xl font-bold">{stats.activeTasks}</div>
          <p className="text-xs text-muted-foreground">Tasks in progress</p>
        </div>

        {/* Card 3: Pending Review */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Pending Review
            </h3>
          </div>
          <div className="text-2xl font-bold">{stats.pendingReview}</div>
          <p className="text-xs text-muted-foreground">Waiting for approval</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-3">
          {/* Pass props if Chart components support them, else wrapping or context */}
          <ProjectStatusChart data={projectStatusData} />
        </div>
        <div className="col-span-3 lg:col-span-4">
          <TeamWorkloadChart data={workloadData} />
        </div>
      </div>

      {/* Recent Activity / Projects List */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Recent Projects
          </h3>
          <p className="text-sm text-muted-foreground">
            List of recently created or updated projects.
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Project Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Completion
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {recentProjects.length === 0 ? (
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td
                      colSpan={4}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No recent projects found.
                    </td>
                  </tr>
                ) : (
                  recentProjects.map((project: Project) => (
                    <tr
                      key={project.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">
                        {project.name}
                      </td>
                      <td className="p-4 align-middle capitalize">
                        <span
                          className={
                            project.status === "active"
                              ? "text-green-500"
                              : project.status === "completed"
                                ? "text-blue-500"
                                : project.status === "on_hold"
                                  ? "text-yellow-500"
                                  : "text-gray-500"
                          }
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        {project.progress || 0}%
                      </td>
                      <td className="p-4 align-middle text-right">
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
