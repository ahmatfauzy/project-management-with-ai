"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, FileText, Eye } from "lucide-react";

export function DeliverablesPreview({
  evidences,
}: {
  evidences: {
    id: string;
    fileType: string;
    description: string;
    submittedAt: string;
    createdAt: string;
    fileUrl: string;
    updatedAt: string;
    name?: string;
    path?: string;
  }[];
}) {
  if (!evidences || evidences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No evidence submitted yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Deliverables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {evidences.map((evidence, index) => (
            <div
              key={evidence.id || index}
              className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 text-blue-600 flex items-center justify-center bg-blue-50 rounded">
                  {evidence.fileType === "image" ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {evidence.description || "No description provided"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Submitted on{" "}
                    {evidence.submittedAt
                      ? new Date(evidence.submittedAt).toLocaleDateString()
                      : "Unknown date"}
                  </div>
                  {evidence.fileUrl && (
                    <a
                      href={evidence.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      View File
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
