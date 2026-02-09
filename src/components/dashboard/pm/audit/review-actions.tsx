"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare } from "lucide-react";
import { useState } from "react";

interface ReviewActionsProps {
  onApprove?: () => void;
  onReject?: () => void;
}

export function ReviewActions({ onApprove, onReject }: ReviewActionsProps) {
  const [comment, setComment] = useState("");

  return (
    <div className="space-y-4 w-full bg-card p-6 rounded-lg border shadow-sm">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Decision & Feedback
      </h3>

      <Textarea
        placeholder="Add comments or feedback for the assignee..."
        className="min-h-[120px] resize-none"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={onReject}
        >
          <X className="mr-2 h-4 w-4" />
          Reject & Request Changes
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={onApprove}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve Task
        </Button>
      </div>
    </div>
  );
}
