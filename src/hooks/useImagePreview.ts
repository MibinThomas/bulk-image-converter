import { useEffect, useState } from "react";
import { UploadItem } from "@/lib/types";

export function useImagePreview(selected?: UploadItem | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selected.file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selected]);

  return url;
}
