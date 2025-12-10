import { useState } from "react";
import { ProcessingSettings, UploadItem, FileStatus } from "@/lib/types";

interface UseUploadQueueResult {
  /** Whether a processing request is currently in flight */
  isProcessing: boolean;
  /** The blob returned from the API: either a single image or a ZIP */
  resultBlob: Blob | null;
  /** The filename suggested by the API for downloading */
  resultName: string | null;
  /** Kick off processing of the provided files with settings */
  startProcessing: (files: UploadItem[], settings: ProcessingSettings) => Promise<void>;
  /** Clear previously processed results */
  clearResult: () => void;
}

export function useUploadQueue(): UseUploadQueueResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string | null>(null);

  async function startProcessing(
    files: UploadItem[],
    settings: ProcessingSettings
  ) {
    if (!files.length) return;
    setIsProcessing(true);
    setResultBlob(null);
    setResultName(null);

    try {
      const formData = new FormData();
      formData.set("settings", JSON.stringify(settings));
      for (const item of files) {
        formData.append("files", item.file, item.name);
      }
      const res = await fetch("/api/process", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to process images");
      }
      // Parse the response blob
      const blob = await res.blob();
      // Extract filename from header if present
      const dispo = res.headers.get("Content-Disposition") || "";
      let filename: string | null = null;
      const match = dispo.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        filename = match[1];
      }
      setResultBlob(blob);
      setResultName(filename);
    } finally {
      setIsProcessing(false);
    }
  }

  function clearResult() {
    setResultBlob(null);
    setResultName(null);
  }

  return { isProcessing, resultBlob, resultName, startProcessing, clearResult };
}

export function updateFileStatuses(
  items: UploadItem[],
  status: FileStatus
): UploadItem[] {
  return items.map((item) => ({ ...item, status }));
}
