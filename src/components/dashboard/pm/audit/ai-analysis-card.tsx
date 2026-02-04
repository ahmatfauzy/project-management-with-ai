"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AIAnalysisCardProps {
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  analysis: string;
}

export function AIAnalysisCard({
  score,
  riskLevel,
  analysis,
}: AIAnalysisCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-emerald-600 dark:text-emerald-400"; // Changed to emerald for a more premium green
    if (s >= 70) return "text-blue-600 dark:text-blue-400";
    if (s >= 50) return "text-amber-600 dark:text-amber-400"; // Changed to amber
    return "text-red-600 dark:text-red-400";
  };

  const getRiskColor = (r: string) => {
    if (r === "High")
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
  };

  return (
    <Card className="h-full shadow-sm border overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Automated Quality Assessment
          </CardTitle>
          <Badge
            variant="outline"
            className="font-normal text-xs bg-background"
          >
            v2.4 Model
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quality Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Progress
              value={score}
              className="h-1.5 mt-2"
              indicatorClassName={
                score >= 90
                  ? "bg-emerald-500"
                  : score >= 70
                    ? "bg-blue-500"
                    : "bg-amber-500"
              }
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Risk Level
            </span>
            <div className="flex items-center h-9">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getRiskColor(riskLevel)}`}
              >
                {riskLevel === "High" ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {riskLevel} Risk
              </div>
            </div>
          </div>
        </div>

        {/* Insight Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span>Impact Analysis</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-6 border-l-2 border-muted ml-2">
            {analysis}
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-muted/20 rounded-lg p-3 border space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>SECURITY & PERFORMANCE</span>
            <span>STATUS</span>
          </div>
          {[
            "Vulnerability Scan",
            "Dependency Audit",
            "Code Style (Lint)",
            "Unit Test Coverage",
          ].map((check, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 border-b last:border-0 border-dashed border-muted-foreground/20"
            >
              <span className="text-sm text-foreground/80">{check}</span>
              <div className="flex items-center text-emerald-600 dark:text-emerald-500 text-xs font-medium">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Pass
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
