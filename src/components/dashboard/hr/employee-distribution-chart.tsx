"use client";

import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from "recharts";
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

interface DepartmentData {
  name: string;
  count: number;
  percentage: number;
}

interface EmployeeDistributionChartProps {
  data: DepartmentData[];
}

// Predefined colors for departments
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const chartConfig = {
  employees: {
    label: "Employees",
  },
} satisfies ChartConfig;

export function EmployeeDistributionChart({
  data,
}: EmployeeDistributionChartProps) {
  // Transform data for recharts
  const chartData = data.map((dept, index) => ({
    name: dept.name,
    value: dept.count,
    percentage: dept.percentage,
    fill: COLORS[index % COLORS.length],
  }));

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Department Distribution</CardTitle>
          <CardDescription>Employee count by department</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No department data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, props) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: props.payload.fill }}
                      />
                      <span className="font-medium">{name}:</span>
                      <span>
                        {value} ({props.payload.percentage}%)
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {chartData.map((dept, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dept.fill }}
                />
                <span className="text-muted-foreground">{dept.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{dept.value}</span>
                <span className="text-xs text-muted-foreground">
                  ({dept.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
