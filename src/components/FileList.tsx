"use client";

import React from "react";
import { UploadItem } from "@/lib/types";

interface FileListProps {
  items: UploadItem[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const FileList: React.FC<FileListProps> = ({
  items,
  onRemove,
  onSelect,
  selectedId
}) => {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        No files added yet.
      </div>
    );
  }

  const totalSize = items.reduce((sum, f) => sum + f.size, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{items.length} files</span>
        <span>Total size: {totalMB} MB</span>
      </div>
      <div className="max-h-[360px] overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">File</th>
              <th className="px-3 py-2">Dimensions</th>
              <th className="px-3 py-2">Size</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sizeKB = (item.size / 1024).toFixed(1);
              const isSelected = item.id === selectedId;

              return (
                <tr
                  key={item.id}
                  className={`cursor-pointer border-t text-[11px] hover:bg-slate-50 ${
                    isSelected ? "bg-slate-100" : ""
                  }`}
                  onClick={() => onSelect(item.id)}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 flex-none overflow-hidden rounded bg-slate-100">
                        <img
                          src={URL.createObjectURL(item.file)}
                          className="h-full w-full object-cover"
                          alt={item.name}
                        />
                      </div>
                      <span className="line-clamp-1">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {item.width && item.height
                      ? `${item.width} × ${item.height}`
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{sizeKB} KB</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-red-500 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
