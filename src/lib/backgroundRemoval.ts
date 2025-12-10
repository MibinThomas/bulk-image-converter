// src/lib/backgroundRemoval.ts
import sharp from "sharp";
import { BackgroundSettings } from "./types";

export async function applyBackgroundRemoval(
  inputBuffer: Buffer,
  settings: BackgroundSettings
): Promise<Buffer> {
  if (!settings.enabled || settings.mode === "none") {
    return inputBuffer;
  }

  // Very simple placeholder:
  // - transparent mode: convert to PNG with alpha
  // - solid mode: flatten against given color

  if (settings.mode === "transparent") {
    const buf = await sharp(inputBuffer)
      .png({ force: true })
      .toBuffer();
    return buf;
  }

  if (settings.mode === "solid") {
    const color = settings.color || "#ffffff";
    const buf = await sharp(inputBuffer)
      .removeAlpha()
      .flatten({ background: color })
      .toBuffer();
    return buf;
  }

  return inputBuffer;
}
