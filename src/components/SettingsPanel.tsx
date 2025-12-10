"use client";

import React from "react";
import {
  BackgroundSettings,
  CompressionLevel,
  CompressionSettings,
  FileNamingSettings,
  OutputFormat,
  ResizeMode,
  ResizePreset,
  ResizeSettings
} from "@/lib/types";

interface SettingsPanelProps {
  outputFormat: OutputFormat;
  onOutputFormatChange: (value: OutputFormat) => void;

  resize: ResizeSettings;
  onResizeChange: (value: ResizeSettings) => void;

  compression: CompressionSettings;
  onCompressionChange: (value: CompressionSettings) => void;

  background: BackgroundSettings;
  onBackgroundChange: (value: BackgroundSettings) => void;

  fileNaming: FileNamingSettings;
  onFileNamingChange: (value: FileNamingSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  outputFormat,
  onOutputFormatChange,
  resize,
  onResizeChange,
  compression,
  onCompressionChange,
  background,
  onBackgroundChange,
  fileNaming,
  onFileNamingChange
}) => {
  const compressionOptions: CompressionLevel[] = ["low", "medium", "high"];

  function updateResize<K extends keyof ResizeSettings>(
    key: K,
    value: ResizeSettings[K]
  ) {
    onResizeChange({ ...resize, [key]: value });
  }

  function updateBackground<K extends keyof BackgroundSettings>(
    key: K,
    value: BackgroundSettings[K]
  ) {
    onBackgroundChange({ ...background, [key]: value });
  }

  function updateFileNaming<K extends keyof FileNamingSettings>(
    key: K,
    value: FileNamingSettings[K]
  ) {
    onFileNamingChange({ ...fileNaming, [key]: value });
  }

  return (
    <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 text-xs">
      {/* Output format */}
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Output Format
        </h3>
        <select
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={outputFormat}
          onChange={(e) =>
            onOutputFormatChange(e.target.value as OutputFormat)
          }
        >
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="webp">WEBP</option>
          <option value="avif">AVIF</option>
          <option value="original">Same as original</option>
        </select>
      </section>

      {/* Resize */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Resize and Dimensions
        </h3>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={resize.usePreset}
              onChange={() => updateResize("usePreset", true)}
            />
            Preset
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={!resize.usePreset}
              onChange={() => updateResize("usePreset", false)}
            />
            Custom
          </label>
        </div>

        {resize.usePreset ? (
          <div className="flex flex-wrap gap-2">
            {[
              { id: "square", label: "Square 1:1" },
              { id: "fourFive", label: "4:5" },
              { id: "threeFour", label: "3:4" },
              { id: "landscape", label: "Landscape" }
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`rounded-full border px-2 py-1 text-[11px] ${
                  resize.preset === preset.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700"
                }`}
                onClick={() =>
                  updateResize("preset", preset.id as ResizePreset)
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-1 flex flex-wrap gap-2">
            <div>
              <label className="block text-[11px] text-slate-600">
                Width (px)
              </label>
              <input
                type="number"
                className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={resize.width ?? ""}
                onChange={(e) =>
                  updateResize(
                    "width",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600">
                Height (px)
              </label>
              <input
                type="number"
                className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={resize.height ?? ""}
                onChange={(e) =>
                  updateResize(
                    "height",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>
            <div className="mt-5 flex items-center gap-1">
              <input
                type="checkbox"
                checked={resize.keepAspectRatio}
                onChange={(e) =>
                  updateResize("keepAspectRatio", e.target.checked)
                }
              />
              <span className="text-[11px] text-slate-600">
                Keep aspect ratio
              </span>
            </div>
          </div>
        )}

        <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={resize.mode === "fit"}
              onChange={() => updateResize("mode", "fit" as ResizeMode)}
            />
            Fit within box
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={resize.mode === "exact"}
              onChange={() => updateResize("mode", "exact" as ResizeMode)}
            />
            Exact with crop
          </label>
        </div>
      </section>

      {/* Compression */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Compression
        </h3>
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
          value={compression.level}
          onChange={(e) =>
            onCompressionChange({
              level: e.target.value as CompressionLevel
            })
          }
        >
          {compressionOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </section>

      {/* Background removal */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Background Remover
          </h3>
          <label className="inline-flex cursor-pointer items-center gap-1 text-[11px]">
            <span className="text-slate-600">On</span>
            <input
              type="checkbox"
              checked={background.enabled}
              onChange={(e) =>
                updateBackground("enabled", e.target.checked)
              }
            />
          </label>
        </div>

        {background.enabled && (
          <>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={background.mode === "transparent"}
                  onChange={() =>
                    updateBackground("mode", "transparent")
                  }
                />
                Transparent
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={background.mode === "solid"}
                  onChange={() =>
                    updateBackground("mode", "solid")
                  }
                />
                Solid color
              </label>
            </div>

            {background.mode === "solid" && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={background.color}
                  onChange={(e) =>
                    updateBackground("color", e.target.value)
                  }
                />
                <input
                  type="text"
                  value={background.color}
                  onChange={(e) =>
                    updateBackground("color", e.target.value)
                  }
                  className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
                <div className="flex gap-2 text-[11px] text-slate-600">
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5"
                    onClick={() =>
                      updateBackground("color", "#ffffff")
                    }
                  >
                    White
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5"
                    onClick={() =>
                      updateBackground("color", "#f3f4f6")
                    }
                  >
                    Light grey
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              Transparent output works best with PNG or WEBP.
            </p>
          </>
        )}
      </section>

      {/* File naming */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          File Naming
        </h3>
        <div>
          <label className="block text-[11px] text-slate-600">
            Suffix
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            placeholder="_web or _1000x1000"
            value={fileNaming.suffix}
            onChange={(e) =>
              updateFileNaming("suffix", e.target.value)
            }
          />
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={fileNaming.toLowercase}
              onChange={(e) =>
                updateFileNaming("toLowercase", e.target.checked)
              }
            />
            Convert to lowercase
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={fileNaming.replaceSpaces}
              onChange={(e) =>
                updateFileNaming("replaceSpaces", e.target.checked)
              }
            />
            Replace spaces with -
          </label>
        </div>
      </section>
    </div>
  );
};
