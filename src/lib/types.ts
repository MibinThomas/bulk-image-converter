// src/lib/types.ts
export type OutputFormat = "jpg" | "png" | "webp" | "avif" | "original";

export type ResizeMode = "fit" | "exact";

export type ResizePreset =
  | "none"
  | "square"
  | "fourFive"
  | "threeFour"
  | "landscape";

export type CompressionLevel = "low" | "medium" | "high";

export type BackgroundMode = "none" | "transparent" | "solid";

export type FileStatus = "pending" | "processing" | "done" | "error";

export interface BackgroundSettings {
  enabled: boolean;
  mode: BackgroundMode;
  color: string;
}

export interface ResizeSettings {
  usePreset: boolean;
  preset: ResizePreset;
  width: number | null;
  height: number | null;
  keepAspectRatio: boolean;
  mode: ResizeMode;
}

export interface CompressionSettings {
  level: CompressionLevel;
}

export interface FileNamingSettings {
  suffix: string;
  toLowercase: boolean;
  replaceSpaces: boolean;
}

export interface ProcessingSettings {
  outputFormat: OutputFormat;
  resize: ResizeSettings;
  compression: CompressionSettings;
  background: BackgroundSettings;
  fileNaming: FileNamingSettings;
}

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width?: number;
  height?: number;
  status: FileStatus;
  error?: string;
}

export interface ProcessResponseMeta {
  fileCount: number;
}
