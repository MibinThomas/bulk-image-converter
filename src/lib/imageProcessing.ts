// src/lib/imageProcessing.ts
import sharp from "sharp";
import JSZip from "jszip";
import { applyBackgroundRemoval } from "./backgroundRemoval";
import {
  BackgroundSettings,
  CompressionSettings,
  OutputFormat,
  ProcessingSettings,
  ResizeSettings
} from "./types";
import { buildOutputFilename } from "./filename";

function mapCompressionToQuality(level: CompressionSettings["level"]): number {
  switch (level) {
    case "low":
      return 40;
    case "medium":
      return 70;
    case "high":
      return 90;
    default:
      return 70;
  }
}

function getPresetDimensions(
  preset: ResizeSettings["preset"]
): { width: number; height: number } | null {
  switch (preset) {
    case "square":
      return { width: 1000, height: 1000 };
    case "fourFive":
      return { width: 1200, height: 1500 };
    case "threeFour":
      return { width: 1200, height: 1600 };
    case "landscape":
      return { width: 1920, height: 1080 };
    default:
      return null;
  }
}

function getResizeOptions(
  resize: ResizeSettings,
  background: BackgroundSettings
) {
  if (!resize.usePreset && !resize.width && !resize.height) {
    return null;
  }

  let width = resize.width ?? undefined;
  let height = resize.height ?? undefined;

  if (resize.usePreset) {
    const presetDims = getPresetDimensions(resize.preset);
    if (presetDims) {
      width = presetDims.width;
      height = presetDims.height;
    }
  }

  // For "fit", produce a fixed canvas with padding.
  if (resize.mode === "fit") {
    const bgColor =
      background.mode === "solid" ? background.color : "#ffffff";

    return {
      width,
      height,
      fit: "contain" as const,
      background: bgColor
    };
  }

  // For "exact", crop to fill the box.
  return {
    width,
    height,
    fit: "cover" as const,
    position: "centre"
  } as const;
}

function configureFormat(
  instance: sharp.Sharp,
  outputFormat: OutputFormat,
  compression: CompressionSettings
) {
  const quality = mapCompressionToQuality(compression.level);

  switch (outputFormat) {
    case "jpg":
      return instance.jpeg({ quality, mozjpeg: true });
    case "png":
      return instance.png({ compressionLevel: 9 });
    case "webp":
      return instance.webp({ quality });
    case "avif":
      return instance.avif({ quality });
    case "original":
    default:
      // default to jpeg if we don't know
      return instance.jpeg({ quality });
  }
}

export async function processImagesToZip(
  files: { buffer: Buffer; name: string; type: string }[],
  settings: ProcessingSettings
): Promise<Buffer> {
  const zip = new JSZip();

  for (const file of files) {
    try {
      // 1. Background removal / replacement (heuristic)
      const bgProcessedBuffer = await applyBackgroundRemoval(
        file.buffer,
        settings.background as BackgroundSettings
      );

      // 2. Create sharp instance and auto-rotate
      let instance = sharp(bgProcessedBuffer).rotate();

      // 3. Resize
      const resizeOptions = getResizeOptions(
        settings.resize as ResizeSettings,
        settings.background as BackgroundSettings
      );
      if (resizeOptions) {
        instance = instance.resize(resizeOptions);
      }

      // 4. If solid background, ensure flattening again
      if (settings.background.enabled && settings.background.mode === "solid") {
        instance = instance.flatten({ background: settings.background.color });
      }

      // 5. Format and compression
      instance = configureFormat(
        instance,
        settings.outputFormat as OutputFormat,
        settings.compression as CompressionSettings
      );

      const outputBuffer = await instance.toBuffer();

      // 6. Build filename
      const outputName = buildOutputFilename(
        file.name,
        settings.fileNaming.suffix,
        settings.outputFormat,
        settings.fileNaming.toLowercase,
        settings.fileNaming.replaceSpaces
      );

      // 7. Add to ZIP
      zip.file(outputName, outputBuffer);
    } catch (err) {
      console.error("Error processing file", file.name, err);
      continue;
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return zipBuffer;
}
