/**
 * @module TaskQualityBadge
 * @description Reusable component for displaying AI quality scores
 * Follows Open/Closed Principle - extensible without modification
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface TaskQualityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * Get badge variant based on quality score
 * @param score - Quality score (0-100)
 */
function getQualityVariant(
  score: number,
): "default" | "secondary" | "destructive" {
  if (score >= 80) return "default"; // Green/Success
  if (score >= 60) return "secondary"; // Yellow/Warning
  return "destructive"; // Red/Danger
}

/**
 * Get color classes for score display
 */
function getScoreColorClass(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export function TaskQualityBadge({
  score,
  size = "md",
  showIcon = true,
  className,
}: TaskQualityBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge
      variant={getQualityVariant(score)}
      className={cn(sizeClasses[size], "font-semibold", className)}
    >
      {showIcon && <Sparkles className="mr-1 h-3 w-3" />}
      <span className={getScoreColorClass(score)}>{score}/100</span>
    </Badge>
  );
}

/**
 * Full quality assessment display with analysis text
 */
interface QualityAssessmentProps {
  score: number;
  analysis: string;
  className?: string;
}

export function QualityAssessment({
  score,
  analysis,
  className,
}: QualityAssessmentProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Quality Assessment
        </h4>
        <TaskQualityBadge score={score} size="md" showIcon={false} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {analysis}
      </p>
    </div>
  );
}
