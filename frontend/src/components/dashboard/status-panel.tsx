"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { ProcessStatus } from "@/lib/types";

interface StatusPanelProps {
  status: ProcessStatus;
}

export function StatusPanel({ status }: StatusPanelProps) {
  if (status.state === "idle") return null;

  return (
    <div className="mb-8 rounded-2xl p-6 glass border">
      <div className="flex items-center gap-4 mb-4">
        {status.state === "processing" && (
          <div className="relative">
            <Loader2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin" />
          </div>
        )}
        {status.state === "error" && <span className="text-2xl">❌</span>}
        <p
          className={`text-lg font-semibold ${
            status.state === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-foreground"
          }`}
        >
          {status.message}
        </p>
      </div>

      {status.state === "processing" && (
        <>
          <Progress value={status.progress} />
          <p className="text-muted-foreground text-sm mt-2 text-center">
            {Math.round(status.progress)}%
          </p>
        </>
      )}
    </div>
  );
}