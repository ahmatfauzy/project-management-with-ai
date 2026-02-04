"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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

export const description = "A radar chart showing employee skills";

const chartData = [
  { subject: "Communication", score: 85, fullMark: 100 },
  { subject: "Teamwork", score: 90, fullMark: 100 },
  { subject: "Technical", score: 75, fullMark: 100 },
  { subject: "Creativity", score: 80, fullMark: 100 },
  { subject: "Problem Solving", score: 88, fullMark: 100 },
  { subject: "Management", score: 65, fullMark: 100 },
];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartRadarSimple() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-2">
        <CardTitle>Skill Competency</CardTitle>
        <CardDescription>Current Assessment</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid className="fill-white opacity-20" />
            <PolarAngleAxis dataKey="subject" />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-auto">
        <div className="flex items-center gap-2 leading-none font-medium">
          Strong in Teamwork <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Identify areas for training
        </div>
      </CardFooter>
    </Card>
  );
}
