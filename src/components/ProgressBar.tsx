"use client";

import React from "react";
import { UploadItem } from "@/lib/types";

interface ProgressBarProps {
  items: UploadItem[];
  isProcessing: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  items,
  isProcessing
}) => {
  if (!items.length) return null;

  const done = items.filter((i) => i.status === "done").length;
  const total = items.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-xs">
      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>
          {isProcessing ? "Processing batch" : "Ready"}
        </span>
        <span>
          {done}/{total} done
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-slate-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
