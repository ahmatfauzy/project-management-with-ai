"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  "on-track": {
    label: "On Track",
    color: "var(--chart-2)",
  },
  delayed: {
    label: "Delayed",
    color: "var(--chart-3)",
  },
  completed: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  "at-risk": {
    label: "At Risk",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ProjectStatusChart({ data }: { data?: any }) {
  const chartData = [
    {
      status: "on-track",
      count: data?.active || 0,
      fill: "var(--color-on-track)",
    },
    {
      status: "delayed",
      count: data?.on_hold || 0,
      fill: "var(--color-delayed)",
    },
    {
      status: "completed",
      count: data?.completed || 0,
      fill: "var(--color-completed)",
    },
    {
      status: "at-risk",
      count: data?.planning || 0,
      fill: "var(--color-at-risk)",
    },
  ];

  const totalActive =
    (data?.active || 0) + (data?.planning || 0) + (data?.on_hold || 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Project Health</CardTitle>
        <CardDescription>Active Projects Status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              paddingAngle={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {totalActive} Active Projects <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {data?.on_hold || 0} projects require attention
        </div>
      </CardFooter>
    </Card>
  );
}
