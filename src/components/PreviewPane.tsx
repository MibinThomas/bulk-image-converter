"use client";

import React from "react";
import { UploadItem, ProcessingSettings } from "@/lib/types";
import { useImagePreview } from "@/hooks/useImagePreview";

interface PreviewPaneProps {
  selected: UploadItem | null;
  settings: ProcessingSettings;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  selected,
  settings
}) => {
  const previewUrl = useImagePreview(selected);

  if (!selected) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Select a file to see preview.
      </div>
    );
  }

  function estimateDimensions() {
    if (settings.resize.usePreset) {
      switch (settings.resize.preset) {
        case "square":
          return "1000 × 1000";
        case "fourFive":
          return "1200 × 1500";
        case "threeFour":
          return "1200 × 1600";
        case "landscape":
          return "1920 × 1080";
        default:
          break;
      }
    }
    if (settings.resize.width && settings.resize.height) {
      return `${settings.resize.width} × ${settings.resize.height}`;
    }
    return "Original like, constrained";
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-xs">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Preview
      </h3>
      {previewUrl && (
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-1 text-[11px] font-medium text-slate-600">
              Original
            </p>
            <div className="flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-2">
              <img
                src={previewUrl}
                alt={selected.name}
                className="max-h-56 max-w-full object-contain"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {selected.width && selected.height
                ? `${selected.width} × ${selected.height}px`
                : "Unknown size"}
            </p>
          </div>
          <div className="flex-1">
            <p className="mb-1 text-[11px] font-medium text-slate-600">
              Output (estimated)
            </p>
            <div className="flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-400">
              Processed preview is generated when you download, settings:
              <ul className="mt-1 list-disc pl-4">
                <li>Format: {settings.outputFormat}</li>
                <li>Dimensions: {estimateDimensions()}</li>
                <li>Compression: {settings.compression.level}</li>
                <li>
                  Background:{" "}
                  {settings.background.enabled
                    ? settings.background.mode
                    : "unchanged"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
