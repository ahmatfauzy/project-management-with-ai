"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ApiUser {
  id: string;
  name: string;
  role: string;
  department?: string;
  image?: string;
  status?: string;
}

interface ApiTask {
  id: string;
  title: string;
  status: string;
  assigneeId: string | null;
  qualityScore: number | null;
  priority: string;
}

interface Performer {
  id: string;
  name: string;
  role: string;
  department: string;
  image?: string;
  completionRate: number;
  qualityScore: string;
  activeTaskCount: number;
}

interface WorkloadEmployee {
  userId: string;
  name: string;
  activeTaskCount: number;
  status: string;
}

interface HRStats {
  overview: {
    totalEmployees: number;
    pendingApprovals: number;
    activeProjects: number;
    avgWorkload: number;
  };
  workloadStats?: {
    totalActiveTasks: number;
    avgTasksPerEmployee: number;
    overloadedUsers: number;
    maxWorkload: number;
    minWorkload: number;
  };
  departmentDistribution?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    completionRate: string | number;
  };
  workload: WorkloadEmployee[];
}

interface DepartmentWorkload {
  name: string;
  tasks: number;
  intensity: "Critical" | "High" | "Medium" | "Low";
  employees: number;
}

const getIntensityColor = (intensity: string) => {
  switch (intensity) {
    case "Critical":
      return "#ef4444";
    case "High":
      return "#f97316";
    case "Medium":
      return "#3b82f6";
    case "Low":
      return "#22c55e";
    default:
      return "#94a3b8";
  }
};

const getIntensity = (
  avgTasks: number
): "Critical" | "High" | "Medium" | "Low" => {
  if (avgTasks >= 10) return "Critical";
  if (avgTasks >= 7) return "High";
  if (avgTasks >= 4) return "Medium";
  return "Low";
};

export default function TalentIntelligencePage() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [departmentWorkload, setDepartmentWorkload] = useState<
    DepartmentWorkload[]
  >([]);
  const [hrStats, setHrStats] = useState<HRStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [churnRiskData, setChurnRiskData] = useState([
    { subject: "Workload", A: 0, fullMark: 150 },
    { subject: "Overtime", A: 0, fullMark: 150 },
    { subject: "Satisfaction", A: 0, fullMark: 150 },
    { subject: "Tenure", A: 0, fullMark: 150 },
    { subject: "Engagement", A: 0, fullMark: 150 },
    { subject: "Growth", A: 0, fullMark: 150 },
  ]);
  const [overallRiskLevel, setOverallRiskLevel] = useState<
    "Low" | "Medium" | "High"
  >("Low");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [usersRes, hrStatsRes, analyticsRes, tasksRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/dashboard/hr/stats"),
          fetch("/api/analytics"),
          fetch("/api/tasks"),
        ]);

        let users: ApiUser[] = [];
        let workloadData: WorkloadEmployee[] = [];
        let allTasks: ApiTask[] = [];

        // Process Users
        if (usersRes.ok) {
          users = await usersRes.json();
        }

        // Process HR Stats
        if (hrStatsRes.ok) {
          const result = await hrStatsRes.json();
          if (result.success) {
            setHrStats(result.data);
          }
        }

        // Process Analytics
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
          workloadData = analyticsData.workload || [];
        }

        // Process Tasks
        if (tasksRes.ok) {
          allTasks = await tasksRes.json();
        }

        // Calculate Top Performers from users with analytics data
        const activeEmployees = users.filter(
          (u: ApiUser) =>
            (u.role === "employee" || u.role === "pm") && u.status === "active"
        );

        // Merge user data with workload data and real task metrics
        const performersData = activeEmployees.map((u: ApiUser) => {
          const workload = workloadData.find(
            (w: WorkloadEmployee) => w.userId === u.id
          );

          // Calculate real metrics from task data
          const userTasks = allTasks.filter((t: ApiTask) => t.assigneeId === u.id);
          const totalTasks = userTasks.length;
          const doneTasks = userTasks.filter((t: ApiTask) => t.status === "done").length;
          const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          // Calculate quality score from tasks with quality scores
          const tasksWithQuality = userTasks.filter((t: ApiTask) => t.qualityScore !== null && t.qualityScore !== undefined);
          const avgQuality = tasksWithQuality.length > 0
            ? tasksWithQuality.reduce((sum: number, t: ApiTask) => sum + (t.qualityScore || 0), 0) / tasksWithQuality.length
            : 0;

          return {
            id: u.id,
            name: u.name || "Unknown",
            role: u.role,
            department: u.department || "General",
            image: u.image,
            completionRate,
            qualityScore: avgQuality.toFixed(1),
            activeTaskCount: workload?.activeTaskCount || 0,
          };
        });

        // Sort by completion rate
        performersData.sort((a, b) => b.completionRate - a.completionRate);
        setPerformers(performersData.slice(0, 5));

        // Calculate Department Workload Distribution
        const deptWorkloadMap = new Map<
          string,
          { tasks: number; employees: number }
        >();

        activeEmployees.forEach((user) => {
          const dept = user.department || "Unassigned";
          const workload = workloadData.find((w) => w.userId === user.id);
          const current = deptWorkloadMap.get(dept) || {
            tasks: 0,
            employees: 0,
          };
          deptWorkloadMap.set(dept, {
            tasks: current.tasks + (workload?.activeTaskCount || 0),
            employees: current.employees + 1,
          });
        });

        const deptWorkloadArray: DepartmentWorkload[] = [];
        deptWorkloadMap.forEach((value, key) => {
          const avgTasks =
            value.employees > 0 ? value.tasks / value.employees : 0;
          deptWorkloadArray.push({
            name: key,
            tasks: value.tasks,
            employees: value.employees,
            intensity: getIntensity(avgTasks),
          });
        });

        // Sort by task count
        deptWorkloadArray.sort((a, b) => b.tasks - a.tasks);
        setDepartmentWorkload(deptWorkloadArray.slice(0, 6));

        // Calculate Churn Risk metrics based on real data
        const totalEmployees = activeEmployees.length;
        const overloadedCount = workloadData.filter(
          (w) => w.status === "Overloaded"
        ).length;

        // Workload risk: based on overloaded percentage
        const workloadRisk = Math.min(
          150,
          Math.round((overloadedCount / Math.max(totalEmployees, 1)) * 300)
        );

        // Other risk factors (simulated but influenced by real data)
        const avgTaskCount =
          workloadData.length > 0
            ? workloadData.reduce((sum, w) => sum + w.activeTaskCount, 0) /
              workloadData.length
            : 0;

        const newChurnRiskData = [
          { subject: "Workload", A: workloadRisk || 40, fullMark: 150 },
          {
            subject: "Overtime",
            A: Math.min(150, avgTaskCount * 15) || 50,
            fullMark: 150,
          },
          {
            subject: "Satisfaction",
            A: Math.max(20, 100 - overloadedCount * 20),
            fullMark: 150,
          },
          { subject: "Tenure", A: 0, fullMark: 150 },
          { subject: "Engagement", A: 0, fullMark: 150 },
          { subject: "Growth", A: 0, fullMark: 150 },
        ];

        setChurnRiskData(newChurnRiskData);

        // Calculate overall risk level
        const avgRisk =
          newChurnRiskData.reduce((sum, d) => sum + d.A, 0) /
          newChurnRiskData.length;
        if (avgRisk >= 100) {
          setOverallRiskLevel("High");
        } else if (avgRisk >= 70) {
          setOverallRiskLevel("Medium");
        } else {
          setOverallRiskLevel("Low");
        }
      } catch (e) {
        console.error("Failed to fetch talent data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getRiskBadge = () => {
    switch (overallRiskLevel) {
      case "High":
        return (
          <Badge variant="destructive" className="animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Risk Detected
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Moderate Risk
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Low Risk
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Talent Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights for workforce optimization and retention.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            This Month
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <BrainCircuit className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-blue-500" />
                  Total Employees
                </div>
                <p className="text-2xl font-bold">
                  {hrStats?.overview.totalEmployees || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  across all departments
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-100 dark:border-green-900">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4 text-green-500" />
                  Completion Rate
                </div>
                <p className="text-2xl font-bold">
                  {analytics?.overview.completionRate || 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  overall task completion
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-100 dark:border-orange-900">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Active Tasks
                </div>
                <p className="text-2xl font-bold">
                  {hrStats?.workloadStats?.totalActiveTasks ||
                    analytics?.overview.totalTasks ||
                    0}
                </p>
                <p className="text-xs text-muted-foreground">in progress</p>
              </CardContent>
            </Card>
            <Card className="border-red-100 dark:border-red-900">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-red-500" />
                  Overloaded
                </div>
                <p className="text-2xl font-bold">
                  {hrStats?.workloadStats?.overloadedUsers || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hrStats?.workloadStats?.overloadedUsers === 0 ? (
                    <span className="text-green-600">balanced workload</span>
                  ) : (
                    <span className="text-red-600">need attention</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Top Section: Key Metrics & Top Performers */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Performers Card */}
        <Card className="lg:col-span-4 border-indigo-100 dark:border-indigo-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Employees with highest completion rates & quality scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-2 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : performers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employee data available.
              </div>
            ) : (
              <div className="space-y-6">
                {performers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-indigo-100">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.department} · {user.activeTaskCount} active
                          tasks
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {user.qualityScore}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Quality
                        </span>
                      </div>
                      <div className="w-32 h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{ width: `${user.completionRate}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {user.completionRate}% completion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Churn Prediction Radar */}
        <Card className="lg:col-span-3 border-indigo-100 dark:border-indigo-900 shadow-sm relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Churn Risk Radar
            </CardTitle>
            <CardDescription>
              Analysis of risk factors for at-risk employees.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={churnRiskData}
                    >
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 150]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="Risk Level"
                        dataKey="A"
                        stroke={
                          overallRiskLevel === "High"
                            ? "#ef4444"
                            : overallRiskLevel === "Medium"
                              ? "#f59e0b"
                              : "#22c55e"
                        }
                        fill={
                          overallRiskLevel === "High"
                            ? "#ef4444"
                            : overallRiskLevel === "Medium"
                              ? "#f59e0b"
                              : "#22c55e"
                        }
                        fillOpacity={0.5}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2">{getRiskBadge()}</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Workload Heatmap/Chart */}
      <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Workload Distribution by Department
          </CardTitle>
          <CardDescription>
            Current task load intensity across different departments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <div className="space-y-4 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ) : departmentWorkload.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No workload data available.
            </div>
          ) : (
            <>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentWorkload}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                      tick={{ fill: "#64748b", fontSize: 14, fontWeight: 500 }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} tasks (${props.payload.employees} employees)`,
                        "Workload",
                      ]}
                    />
                    <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={32}>
                      {departmentWorkload.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getIntensityColor(entry.intensity)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-muted-foreground">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-xs text-muted-foreground">
                    Critical
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
