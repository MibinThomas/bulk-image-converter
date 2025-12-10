"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadArea } from "@/components/UploadArea";
import { FileList } from "@/components/FileList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { PreviewPane } from "@/components/PreviewPane";
import { ProgressBar } from "@/components/ProgressBar";
import {
  BackgroundSettings,
  CompressionSettings,
  FileNamingSettings,
  OutputFormat,
  ProcessingSettings,
  ResizeSettings,
  UploadItem
} from "@/lib/types";
import { useUploadQueue, updateFileStatuses } from "@/hooks/useUploadQueue";

const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 1000 * 1024 * 1024;

export default function HomePage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");

  const [resize, setResize] = useState<ResizeSettings>({
    usePreset: true,
    preset: "square",
    width: null,
    height: null,
    keepAspectRatio: true,
    mode: "fit"
  });

  const [compression, setCompression] = useState<CompressionSettings>({
    level: "medium"
  });

  const [background, setBackground] = useState<BackgroundSettings>({
    enabled: false,
    mode: "none",
    color: "#ffffff"
  });

  const [fileNaming, setFileNaming] = useState<FileNamingSettings>({
    suffix: "_web",
    toLowercase: true,
    replaceSpaces: true
  });

  const { isProcessing, zipBlob, startProcessing, clearResult } =
    useUploadQueue();

  const totalBytes = useMemo(
    () => items.reduce((sum, f) => sum + f.size, 0),
    [items]
  );

  function handleFilesAdded(files: FileList | File[]) {
    const arr = Array.from(files);

    const incomingBytes = arr.reduce((sum, f) => sum + f.size, 0);
    const incomingCount = arr.length;

    if (items.length + incomingCount > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed per batch.`);
      return;
    }

    if (totalBytes + incomingBytes > MAX_TOTAL_BYTES) {
      alert("Total size limit exceeded.");
      return;
    }

    const newItems: UploadItem[] = arr.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      name: file.name,
      size: file.size,
      status: "pending"
    }));

    setItems((prev) => [...prev, ...newItems]);
    if (!selectedId && newItems.length) {
      setSelectedId(newItems[0].id);
    }

    // Optional: get dimensions lazily.
    newItems.forEach((item) => {
      const img = new Image();
      img.onload = () => {
        setItems((current) =>
          current.map((f) =>
            f.id === item.id
              ? { ...f, width: img.width, height: img.height }
              : f
          )
        );
      };
      img.src = URL.createObjectURL(item.file);
    });
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function handleSelect(id: string) {
    setSelectedId(id);
  }

  const selectedItem =
    items.find((i) => i.id === selectedId) ?? items[0] ?? null;

  const settings: ProcessingSettings = {
    outputFormat,
    resize,
    compression,
    background,
    fileNaming
  };

  async function handleStartProcessing() {
    if (!items.length) return;
    clearResult();

    setItems((prev) => updateFileStatuses(prev, "processing"));
    try {
      await startProcessing(items, settings);
      setItems((prev) => updateFileStatuses(prev, "done"));
    } catch (err) {
      console.error(err);
      alert("Processing failed. Check console for details.");
      setItems((prev) => updateFileStatuses(prev, "error"));
    }
  }

  function handleClearAll() {
    clearResult();
    setItems([]);
    setSelectedId(null);
  }

  function handleDownloadZip() {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed-images.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Simple sticky bar on mobile
  const hasFiles = items.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-blue-500">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-sm font-semibold tracking-tight text-slate-900">
            MTDEVBulk Product Image Converter
          </h1>
          <span className="text-[11px] text-slate-500">
            Resize, convert, compress, remove background
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <UploadArea onFilesAdded={handleFilesAdded} />
            <ProgressBar items={items} isProcessing={isProcessing} />
            <FileList
              items={items}
              onRemove={handleRemove}
              onSelect={handleSelect}
              selectedId={selectedId}
            />
          </div>

          <div className="space-y-4">
            <SettingsPanel
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
              resize={resize}
              onResizeChange={setResize}
              compression={compression}
              onCompressionChange={setCompression}
              background={background}
              onBackgroundChange={setBackground}
              fileNaming={fileNaming}
              onFileNamingChange={setFileNaming}
            />
            <PreviewPane selected={selectedItem} settings={settings} />
          </div>
        </div>
      </main>

      {/* Mobile sticky action bar */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-2 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <button
            type="button"
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            onClick={handleClearAll}
            disabled={!hasFiles}
          >
            Clear All
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            disabled={!hasFiles || isProcessing}
            onClick={zipBlob ? handleDownloadZip : handleStartProcessing}
          >
            {zipBlob ? "Download ZIP" : isProcessing ? "Processing..." : "Start Processing"}
          </button>
        </div>
      </div>

      {/* Desktop actions */}
      <div className="hidden border-t border-slate-200 bg-white px-4 py-3 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            onClick={handleClearAll}
            disabled={!hasFiles}
          >
            Clear All
          </button>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-slate-500">
              {items.length
                ? `${items.length} files, ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
                : "No files selected"}
            </p>
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              disabled={!hasFiles || isProcessing}
              onClick={zipBlob ? handleDownloadZip : handleStartProcessing}
            >
              {zipBlob ? "Download ZIP" : isProcessing ? "Processing..." : "Start Processing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
