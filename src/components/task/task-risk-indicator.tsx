/**
 * @module TaskRiskIndicator
 * @description Reusable component for displaying task risk levels
 * Follows Single Responsibility Principle
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface TaskRiskIndicatorProps {
  riskLevel: RiskLevel;
  analysis?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  animate?: boolean;
  className?: string;
}

/**
 * Get risk configuration (color, icon, label)
 */
function getRiskConfig(level: RiskLevel) {
  const configs = {
    low: {
      variant: "secondary" as const,
      icon: Info,
      label: "Low Risk",
      colorClass: "text-green-600 dark:text-green-400",
    },
    medium: {
      variant: "secondary" as const,
      icon: AlertCircle,
      label: "Medium Risk",
      colorClass: "text-yellow-600 dark:text-yellow-400",
    },
    high: {
      variant: "destructive" as const,
      icon: AlertTriangle,
      label: "High Risk",
      colorClass: "text-orange-600 dark:text-orange-400",
    },
    critical: {
      variant: "destructive" as const,
      icon: AlertTriangle,
      label: "Critical Risk",
      colorClass: "text-red-600 dark:text-red-400",
    },
  };

  return configs[level] || configs.low;
}

export function TaskRiskIndicator({
  riskLevel,
  analysis,
  size = "md",
  showIcon = true,
  animate = false,
  className,
}: TaskRiskIndicatorProps) {
  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  // Only show badge for medium and above
  if (riskLevel === "low") return null;

  return (
    <div className={cn("space-y-1", className)}>
      <Badge
        variant={config.variant}
        className={cn(
          sizeClasses[size],
          "font-semibold",
          animate &&
            (riskLevel === "high" || riskLevel === "critical") &&
            "animate-pulse",
        )}
      >
        {showIcon && <Icon className="mr-1 h-3 w-3" />}
        <span className={config.colorClass}>{config.label}</span>
      </Badge>
      {analysis && <p className="text-xs text-muted-foreground">{analysis}</p>}
    </div>
  );
}

/**
 * Compact risk indicator for table/card views
 */
export function CompactRiskIndicator({ riskLevel }: { riskLevel: RiskLevel }) {
  if (riskLevel === "low") return null;

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1">
      <Icon className={cn("h-4 w-4", config.colorClass)} />
      <span className={cn("text-xs font-medium", config.colorClass)}>
        {config.label}
      </span>
    </div>
  );
}
