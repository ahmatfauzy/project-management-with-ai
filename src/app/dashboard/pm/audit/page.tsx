"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  assignee: { name: string; image?: string; role?: string };
  submittedAt: string;
  aiScore: number;
  status: string;
  riskLevel: string;
  aiAnalysis: string;
};

export default function AuditPage() {
  const [auditQueue, setAuditQueue] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const scanRisk = async () => {
    const toastId = toast.loading("Scanning for risks...");
    try {
      const res = await fetch("/api/audit/scan", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Scan complete. Found ${data.risksFound} risks.`);
        window.location.reload();
      } else {
        toast.error("Scan failed");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    const fetchAuditTasks = async () => {
      try {
        const res = await fetch("/api/audit"); // We need to create this or use filtered /api/tasks
        if (res.ok) {
          const data = await res.json();
          setAuditQueue(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditTasks();
  }, []);

  const highRiskTasks = auditQueue.filter((t) => t.riskLevel === "High");

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading)
    return <div className="p-8 text-center">Loading audit queue...</div>;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Audit Queue
          </h2>
          <p className="text-muted-foreground">
            AI-assisted quality control and task approval.
          </p>
        </div>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => scanRisk()}
        >
          <Bot className="h-4 w-4" />
          Scan for Risks
        </Button>
      </div>

      {highRiskTasks.length > 0 && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900"
        >
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-700 dark:text-red-400">
            High Risk Tasks Detected
          </AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-300">
            The AI Auditor found {highRiskTasks.length} tasks with potential
            quality issues.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Tasks waiting for PM validation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>AI Quality Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditQueue.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground pt-8 pb-8"
                  >
                    No tasks pending review.
                  </TableCell>
                </TableRow>
              ) : (
                auditQueue.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {task.id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee?.image} />
                          <AvatarFallback>
                            {task.assignee?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {task.assignee?.name || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.submittedAt
                        ? new Date(task.submittedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${getScoreColor(task.aiScore || 0)}`}
                        >
                          {task.aiScore || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / 100
                        </span>
                        {task.riskLevel === "High" && (
                          <Badge
                            variant="destructive"
                            className="ml-2 text-[10px] h-5"
                          >
                            High Risk
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/pm/audit/${encodeURIComponent(task.id)}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
