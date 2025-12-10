"use client";

import React, { useRef } from "react";

interface UploadAreaProps {
  onFilesAdded: (files: FileList | File[]) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFilesAdded }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      onFilesAdded(e.target.files);
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center"
      >
        <p className="text-sm font-medium text-slate-700">
          Drop images or folders here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Supported formats: JPG, PNG, WEBP, HEIC, GIF, TIFF
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => folderInputRef.current?.click()}
          >
            Select Folder
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // Folder upload, supported in Chromium based browsers
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        webkitdirectory="true"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
