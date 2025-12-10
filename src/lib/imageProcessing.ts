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
  // If no resize requested, return null and keep original dimensions
  if (!resize.usePreset && !resize.width && !resize.height) {
    return null;
  }

  // Determine target width and height based on preset or custom values
  let width = resize.width ?? undefined;
  let height = resize.height ?? undefined;

  if (resize.usePreset) {
    const presetDims = getPresetDimensions(resize.preset);
    if (presetDims) {
      width = presetDims.width;
      height = presetDims.height;
    }
  }

  // When using "fit" mode we want to contain the image within the box.
  // We also need to set a canvas colour: white by default, user-specified if solid
  // background removal is enabled, or transparent if transparent mode is enabled.
  if (resize.mode === "fit") {
    let bg: string | { r: number; g: number; b: number; alpha: number };
    if (background.enabled && background.mode === "solid") {
      // Use the provided colour for solid backgrounds or fallback to white
      bg = background.color || "#ffffff";
    } else if (background.enabled && background.mode === "transparent") {
      // Create a fully transparent canvas
      bg = { r: 0, g: 0, b: 0, alpha: 0 };
    } else {
      // Default to white when no background removal is enabled
      bg = "#ffffff";
    }
    return {
      width,
      height,
      fit: "contain" as const,
      background: bg
    };
  }

  // For "exact" mode we crop to fill the box, preserving aspect ratio
  return {
    width,
    height,
    fit: "cover" as const,
    position: "centre"
  } as const;
}

/**
 * Process a list of image files with the provided settings. When only a single file
 * is processed the result includes the processed image buffer and filename. When
 * multiple files are processed, the result includes a ZIP archive containing all
 * processed images and a default filename. This function leaves the legacy
 * processImagesToZip function untouched for backwards compatibility.
 */
export async function processImages(
  files: { buffer: Buffer; name: string; type: string }[],
  settings: ProcessingSettings
): Promise<
  | { type: "single"; buffer: Buffer; filename: string }
  | { type: "zip"; buffer: Buffer; filename: string }
> {
  const processedFiles: { name: string; buffer: Buffer }[] = [];

  for (const file of files) {
    try {
      // Apply background removal or replacement
      const bgProcessedBuffer = await applyBackgroundRemoval(
        file.buffer,
        settings.background as BackgroundSettings
      );
      // Create a Sharp instance and auto-rotate
      let instance = sharp(bgProcessedBuffer).rotate();
      // Resize using settings and background options
      const resizeOptions = getResizeOptions(
        settings.resize as ResizeSettings,
        settings.background as BackgroundSettings
      );
      if (resizeOptions) {
        instance = instance.resize(resizeOptions);
      }
      // If solid background selected, flatten the image against the chosen colour
      if (settings.background.enabled && settings.background.mode === "solid") {
        instance = instance.flatten({ background: settings.background.color });
      }
      // Apply output format and compression
      instance = configureFormat(
        instance,
        settings.outputFormat as OutputFormat,
        settings.compression as CompressionSettings
      );
      const outputBuffer = await instance.toBuffer();
      // Build filename from original name and naming settings
      const outputName = buildOutputFilename(
        file.name,
        settings.fileNaming.suffix,
        settings.outputFormat,
        settings.fileNaming.toLowercase,
        settings.fileNaming.replaceSpaces
      );
      processedFiles.push({ name: outputName, buffer: outputBuffer });
    } catch (err) {
      console.error("Error processing file", file.name, err);
      continue;
    }
  }

  // If exactly one file processed return it directly
  if (processedFiles.length === 1) {
    return {
      type: "single",
      buffer: processedFiles[0].buffer,
      filename: processedFiles[0].name
    };
  }

  // Otherwise build a ZIP for all files
  const zip = new JSZip();
  for (const f of processedFiles) {
    zip.file(f.name, f.buffer);
  }
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return {
    type: "zip",
    buffer: zipBuffer,
    filename: "processed_images.zip"
  };
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
