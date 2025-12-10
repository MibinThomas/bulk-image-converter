import { useState } from "react";
import { ProcessingSettings, UploadItem, FileStatus } from "@/lib/types";

interface UseUploadQueueResult {
  isProcessing: boolean;
  zipBlob: Blob | null;
  startProcessing: (files: UploadItem[], settings: ProcessingSettings) => Promise<void>;
  clearResult: () => void;
}

export function useUploadQueue(): UseUploadQueueResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  async function startProcessing(
    files: UploadItem[],
    settings: ProcessingSettings
  ) {
    if (!files.length) return;
    setIsProcessing(true);
    setZipBlob(null);

    // Local optimistic status change, caller should update.
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

      const blob = await res.blob();
      setZipBlob(blob);
    } finally {
      setIsProcessing(false);
    }
  }

  function clearResult() {
    setZipBlob(null);
  }

  return { isProcessing, zipBlob, startProcessing, clearResult };
}

export function updateFileStatuses(
  items: UploadItem[],
  status: FileStatus
): UploadItem[] {
  return items.map((item) => ({ ...item, status }));
}
