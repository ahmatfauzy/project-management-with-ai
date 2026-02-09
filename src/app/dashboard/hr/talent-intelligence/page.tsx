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
import {
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  Calendar,
} from "lucide-react";

// --- Mock Data ---

const churnRiskData = [
  { subject: "Workload", A: 120, fullMark: 150 },
  { subject: "Overtime", A: 98, fullMark: 150 },
  { subject: "Satisfaction", A: 40, fullMark: 150 },
  { subject: "Tenure", A: 85, fullMark: 150 },
  { subject: "Engagement", A: 65, fullMark: 150 },
  { subject: "Growth", A: 50, fullMark: 150 },
];

const workloadData = [
  { name: "Dev Team", tasks: 45, intensity: "High" },
  { name: "Design", tasks: 32, intensity: "Medium" },
  { name: "Marketing", tasks: 28, intensity: "Medium" },
  { name: "Sales", tasks: 50, intensity: "Critical" },
  { name: "HR", tasks: 20, intensity: "Low" },
];

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

import { useEffect, useState } from "react";

interface ApiUser {
  id: string;
  name: string;
  role: string;
  department?: string;
  image?: string;
}

interface Performer {
  id: string;
  name: string;
  role: string;
  image?: string;
  completionRate: number;
  qualityScore: string;
}

export default function TalentIntelligencePage() {
  const [performers, setPerformers] = useState<Performer[]>([]);

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          const mapped = data
            .filter((u: ApiUser) => u.role === "employee")
            .slice(0, 5)
            .map((u: ApiUser) => ({
              id: u.id,
              name: u.name,
              role: u.department || "Employee",
              image: u.image,
              completionRate: Math.floor(Math.random() * (100 - 80) + 80),
              qualityScore: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
            }));
          setPerformers(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTalent();
  }, []);

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
            <div className="space-y-6">
              {performers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 border-2 border-indigo-100">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {user.qualityScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Quality Score
                      </span>
                    </div>
                    <div className="w-32 h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${user.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Churn Prediction Radar */}
        <Card className="lg:col-span-3 border-indigo-100 dark:border-indigo-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Churn Risk Radar
            </CardTitle>
            <CardDescription>
              Analysis of risk factors for at-risk employees.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
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
                    stroke="#ef4444"
                    fill="#ef4444"
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
            <div className="absolute bottom-6 right-6">
              <Badge variant="destructive" className="animate-pulse">
                High Risk Detected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Workload Heatmap/Chart */}
      <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
        <CardHeader>
          <CardTitle>Workload Distribution Heatmap</CardTitle>
          <CardDescription>
            Current task load intensity across different departments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workloadData}
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
                />
                <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={32}>
                  {workloadData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getIntensityColor(entry.intensity)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
