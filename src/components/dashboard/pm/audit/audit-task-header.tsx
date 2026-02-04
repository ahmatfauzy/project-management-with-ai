"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditTaskHeaderProps {
  task: {
    id: string;
    title: string;
    status: string;
    submittedAt: string;
    assignee: {
      name: string;
      image?: string;
    };
  };
}

export function AuditTaskHeader({ task }: AuditTaskHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="font-mono">
            {task.id}
          </Badge>
          <Badge variant={task.status === "Review" ? "secondary" : "default"}>
            {task.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {task.title}
        </h1>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={task.assignee.image} />
            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {task.assignee.name}
            </span>
            <span className="text-xs">Assignee</span>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {formatDate(task.submittedAt)}
            </span>
          </div>
          <span className="text-xs">Submitted</span>
        </div>
      </div>
    </div>
  );
}
