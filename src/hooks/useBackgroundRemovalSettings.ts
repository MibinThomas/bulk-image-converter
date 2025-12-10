import { useState } from "react";
import { BackgroundSettings } from "@/lib/types";

export function useBackgroundRemovalSettings() {
  const [background, setBackground] = useState<BackgroundSettings>({
    enabled: false,
    mode: "none",
    color: "#ffffff"
  });

  return { background, setBackground };
}
