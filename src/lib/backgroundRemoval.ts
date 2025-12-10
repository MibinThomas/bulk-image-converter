// src/lib/backgroundRemoval.ts
import sharp from "sharp";
import { BackgroundSettings } from "./types";

// Lower = more conservative, higher = more aggressive
const LUMA_THRESHOLD = 240;

/**
 * Simple heuristic background removal:
 * - Treat very bright pixels as background
 * - Remove them (alpha = 0)
 *
 * Works best on white / very light studio backgrounds.
 */
export async function applyBackgroundRemoval(
  inputBuffer: Buffer,
  settings: BackgroundSettings
): Promise<Buffer> {
  if (!settings.enabled || settings.mode === "none") {
    return inputBuffer;
  }

  try {
    const image = sharp(inputBuffer);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    if (channels < 4) {
      // unexpected, bail out
      return inputBuffer;
    }

    const pixels = Buffer.from(data); // mutable copy

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        const luma = (r + g + b) / 3;

        if (luma >= LUMA_THRESHOLD) {
          // bright background pixel -> fully transparent
          pixels[idx + 3] = 0;
        } else {
          // keep product opaque
          pixels[idx + 3] = 255;
        }
      }
    }

    const maskedPng = await sharp(pixels, {
      raw: { width, height, channels }
    })
      .png()
      .toBuffer();

    if (settings.mode === "transparent") {
      return maskedPng;
    }

    if (settings.mode === "solid") {
      const color = settings.color || "#ffffff";

      const flattened = await sharp(maskedPng)
        .flatten({ background: color })
        .png()
        .toBuffer();

      return flattened;
    }

    return maskedPng;
  } catch (err) {
    console.error("[backgroundRemoval] error:", err);
    return inputBuffer;
  }
}
