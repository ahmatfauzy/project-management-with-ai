"use client";

import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { department: "Engineering", visitors: 45, fill: "var(--color-engineering)" },
  { department: "Design", visitors: 20, fill: "var(--color-design)" },
  { department: "Marketing", visitors: 15, fill: "var(--color-marketing)" },
  { department: "HR", visitors: 8, fill: "var(--color-hr)" },
  { department: "Product", visitors: 12, fill: "var(--color-product)" },
];

const chartConfig = {
  visitors: {
    label: "Employees",
  },
  engineering: {
    label: "Engineering",
    color: "var(--chart-1)",
  },
  design: {
    label: "Design",
    color: "var(--chart-2)",
  },
  marketing: {
    label: "Marketing",
    color: "var(--chart-3)",
  },
  hr: {
    label: "HR",
    color: "var(--chart-4)",
  },
  product: {
    label: "Product",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function EmployeeDistributionChart() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Department Distribution</CardTitle>
        <CardDescription>Employee count by department</CardDescription>
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
              dataKey="visitors"
              nameKey="department"
              innerRadius={60}
              strokeWidth={5}
            ></Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
