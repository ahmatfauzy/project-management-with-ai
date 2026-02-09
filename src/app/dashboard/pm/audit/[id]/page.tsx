"use client";

import { useEffect, useState } from "react";
import { AuditTaskHeader } from "@/components/dashboard/pm/audit/audit-task-header";
import { AIAnalysisCard } from "@/components/dashboard/pm/audit/ai-analysis-card";
import { DeliverablesPreview } from "@/components/dashboard/pm/audit/deliverables-preview";
import { ReviewActions } from "@/components/dashboard/pm/audit/review-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  assigneeId: string;
  creatorId: string;
  dueDate: string;
  priority: string;
  aiBreakdown: string;
  aiRiskAnalysis: string;
  qualityAnalysis?: string;
  qualityScore: number;
  riskLevel: "Low" | "Medium" | "High";
  assignee: {
    name: string;
  };
  submittedAt: string;
  evidences: {
    id: string;
    fileUrl: string;
    fileType: string;
    description: string;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
    // Legacy fields if needed, but safer to use optional or remove
    name?: string;
    path?: string;
  }[];
};
export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTask = async () => {
      try {
        const decodedId = decodeURIComponent(id);
        const res = await fetch(`/api/tasks/${decodedId}`);
        if (res.ok) {
          const data = await res.json();
          setTask({
            ...data,
            // Map or ensure fields exist
            aiScore: data.qualityScore || 0, // Fallback
            riskLevel:
              data.riskLevel === "high" || data.riskLevel === "critical"
                ? "High"
                : "Low",
            aiAnalysis: data.aiRiskAnalysis || "AI Analysis pending...",
            qualityAnalysis: data.qualityAnalysis,
            assignee: data.assignee || { name: "Unknown" }, // Expand in API if needed
            submittedAt: data.updatedAt,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleApprove = async () => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "done" }),
      });
      toast.success("Task Approved");
      router.push("/dashboard/pm/audit");
    } catch (e) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async () => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        // Send back to In Progress
        body: JSON.stringify({ status: "in_progress" }),
      });
      toast.success("Task Rejected (Sent back to In Progress)");
      router.push("/dashboard/pm/audit");
    } catch (e) {
      toast.error("Failed to reject");
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Back Nav */}
      <div>
        <Link href="/dashboard/pm/audit">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Button>
        </Link>
      </div>

      <AuditTaskHeader task={task} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analysis & Actions ( Sticky on desktop ideally ) */}
        <div className="space-y-6">
          <AIAnalysisCard
            score={task.qualityScore}
            riskLevel={task.riskLevel}
            analysis={
              task.qualityAnalysis ||
              task.aiRiskAnalysis ||
              "AI analysis pending..."
            }
          />
        </div>

        {/* Right Column: Deliverables & Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Task Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          </div>

          <DeliverablesPreview evidences={task.evidences || []} />

          <ReviewActions onApprove={handleApprove} onReject={handleReject} />
        </div>
      </div>
    </div>
  );
}
