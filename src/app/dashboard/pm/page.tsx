"use client";

import { ProjectStatusChart } from "@/components/dashboard/pm/project-status-chart";
import { TeamWorkloadChart } from "@/components/dashboard/pm/team-workload-chart";
import { useEffect, useState } from "react";
import type { Project } from "@/types/common";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban,
  ListTodo,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  BarChart3,
  FileWarning,
} from "lucide-react";
import Link from "next/link";

interface AuditTask {
  id: string;
  title: string;
  assignee: {
    name: string;
    image: string;
    role: string;
  };
  submittedAt: string;
  aiScore: number;
  status: string;
  riskLevel: string;
}

interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    completionRate: string | number;
  };
  workload: Array<{
    userId: string;
    name: string;
    activeTaskCount: number;
    status: string;
  }>;
}

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
  const [auditQueue, setAuditQueue] = useState<AuditTask[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [statsRes, projectsRes, auditRes, analyticsRes] =
          await Promise.all([
            fetch("/api/dashboard/pm/stats"),
            fetch("/api/projects"),
            fetch("/api/audit"),
            fetch("/api/analytics"),
          ]);

        // 1. Process Stats & Chart Data
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setWorkloadData(data.workload);
          setProjectStatusData(data.projectStatus);
        }

        // 2. Process Recent Projects
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          // Sort by start date descending and take top 5
          const sorted = (data as Project[])
            .sort(
              (a: Project, b: Project) =>
                new Date(b.createdAt || b.startDate || 0).getTime() -
                new Date(a.createdAt || a.startDate || 0).getTime()
            )
            .slice(0, 5);
          setRecentProjects(sorted);
        }

        // 3. Process Audit Queue
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditQueue(auditData.slice(0, 5));
        }

        // 4. Process Analytics
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "on_hold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "planning":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
      case "High":
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Risk
          </Badge>
        );
      case "medium":
      case "Medium":
        return (
          <Badge className="bg-yellow-500 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 text-xs"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Low
          </Badge>
        );
    }
  };

  const overloadedUsers =
    analytics?.workload.filter((w) => w.status === "Overloaded").length || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Overview</h2>
          <p className="text-muted-foreground text-sm">
            Manage your projects, tasks, and team performance.
          </p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Projects */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-purple-500" />
                Total Projects
              </h3>
            </div>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Across all scopes</p>
          </div>
        )}

        {/* Card 2: Active Tasks */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-blue-500" />
                Active Tasks
              </h3>
            </div>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks in progress</p>
          </div>
        )}

        {/* Card 3: Pending Review */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Review
              </h3>
            </div>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingReview > 0 ? (
                <span className="text-amber-600 font-medium">
                  Needs attention
                </span>
              ) : (
                <span className="text-green-600">All reviewed</span>
              )}
            </p>
          </div>
        )}

        {/* Card 4: Completion Rate */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Completion Rate
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {analytics?.overview.completionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.overview.completedTasks || 0} of{" "}
              {analytics?.overview.totalTasks || 0} tasks done
            </p>
          </div>
        )}
      </div>

      {/* Secondary Stats Row */}
      {!loading && analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Completed Tasks
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {analytics.overview.completedTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed tasks
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Team Members
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {analytics.workload.length}
            </div>
            <p className="text-xs text-muted-foreground">With assigned tasks</p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Overloaded
              </h3>
            </div>
            <div className="text-2xl font-bold">{overloadedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {overloadedUsers > 0 ? (
                <span className="text-red-600">Team members need help</span>
              ) : (
                <span className="text-green-600">Workload balanced</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-3">
          {loading ? (
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[250px]">
                <Skeleton className="h-48 w-48 rounded-full" />
              </CardContent>
            </Card>
          ) : (
            <ProjectStatusChart data={projectStatusData} />
          )}
        </div>
        <div className="col-span-3 lg:col-span-4">
          {loading ? (
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 flex-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <TeamWorkloadChart data={workloadData} />
          )}
        </div>
      </div>

      {/* Bottom Section: Projects & Audit Queue */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-purple-500" />
              Recent Projects
            </CardTitle>
            <CardDescription>
              Latest projects across the organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent projects found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/pm/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={project.progress || 0}
                          className="h-1.5 w-24"
                        />
                        <span className="text-xs text-muted-foreground">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize ml-2 ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </Link>
                ))}
                <Link
                  href="/dashboard/pm/projects"
                  className="flex items-center justify-center text-sm text-primary hover:underline mt-2"
                >
                  View all projects →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-amber-500" />
              Pending Reviews
            </CardTitle>
            <CardDescription>
              Tasks waiting for quality review and approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : auditQueue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                No pending reviews. All caught up!
              </div>
            ) : (
              <div className="space-y-4">
                {auditQueue.map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/pm/audit/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {task.assignee.name}
                      </p>
                    </div>
                    {getRiskBadge(task.riskLevel)}
                  </Link>
                ))}
                <Link
                  href="/dashboard/pm/audit"
                  className="flex items-center justify-center text-sm text-primary hover:underline mt-2"
                >
                  View all reviews →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton Component
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
