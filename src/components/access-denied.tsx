"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  backUrl?: string;
  backLabel?: string;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  backUrl = "/dashboard",
  backLabel = "Go to Dashboard",
}: AccessDeniedProps) {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>

        <Alert variant="destructive" className="border-destructive/50">
          <ShieldX className="h-4 w-4" />
          <AlertTitle className="text-lg">{title}</AlertTitle>
          <AlertDescription className="mt-2">{message}</AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact your administrator.
        </p>

        <Link href={backUrl}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
