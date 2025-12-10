import { NextRequest } from "next/server";
import { ProcessingSettings } from "../../../lib/types";
import { processImages } from "@/lib/imageProcessing";


export const runtime = "nodejs";


const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 1000 * 1024 * 1024; // 1000 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const settingsJson = formData.get("settings");

    if (typeof settingsJson !== "string") {
      return new Response("Missing settings", { status: 400 });
    }

    const settings = JSON.parse(settingsJson) as ProcessingSettings;

    const fileEntries = formData.getAll("files");
    if (!fileEntries.length) {
      return new Response("No files uploaded", { status: 400 });
    }

    if (fileEntries.length > MAX_FILES) {
      return new Response(
        `Too many files. Maximum is ${MAX_FILES}.`,
        { status: 400 }
      );
    }

    let totalBytes = 0;
    const files: { buffer: Buffer; name: string; type: string }[] = [];

    for (const entry of fileEntries) {
      if (!(entry instanceof File)) continue;

      totalBytes += entry.size;
      if (totalBytes > MAX_TOTAL_BYTES) {
        return new Response(
          `Total size exceeds ${MAX_TOTAL_BYTES / (1024 * 1024)} MB`,
          { status: 400 }
        );
      }

      const supportedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/tiff",
        "image/heic",
        "image/heif"
      ];

      if (!supportedTypes.includes(entry.type)) {
        return new Response(
          `Unsupported file type: ${entry.type || "unknown"}`,
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await entry.arrayBuffer());

      files.push({
        buffer,
        name: entry.name,
        type: entry.type
      });
    }

    // Process files and decide if we return a single image or a ZIP
    const result = await processImages(files, settings);

    // Normalise filename to ASCII safe characters. This avoids issues
    // when a header contains Unicode or control characters (see Node header limitation).
    function normalizeFilename(name: string): string {
      return (
        name
          // Replace non-ASCII with underscores
          .replace(/[^\x20-\x7E]/g, "_")
          // Remove quotes and backslashes
          .replace(/["\\]/g, "_") || "file"
      );
    }

    if (result.type === "single") {
      const headers = new Headers();
      headers.set("Content-Type", "application/octet-stream");
      const safeName = normalizeFilename(result.filename);
      headers.set(
        "Content-Disposition",
        `attachment; filename="${safeName}"`
      );
      return new Response(result.buffer, { status: 200, headers });
    }

    // ZIP case when multiple files processed
    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    const safeName = normalizeFilename(result.filename || "processed_images.zip");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeName}"`
    );
    return new Response(result.buffer, { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response("Failed to process images", { status: 500 });
  }
}
