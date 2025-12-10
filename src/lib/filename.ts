// src/lib/filename.ts
export function buildOutputFilename(
  originalName: string,
  suffix: string,
  outputFormat: string,
  toLowercase: boolean,
  replaceSpaces: boolean
): string {
  const lastDot = originalName.lastIndexOf(".");
  const base = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;

  let slug = base;
  if (toLowercase) slug = slug.toLowerCase();
  if (replaceSpaces) slug = slug.replace(/\s+/g, "-");

  const ext =
    outputFormat === "original"
      ? originalName.split(".").pop() ?? "jpg"
      : outputFormat;

  const cleanedExt = ext.replace(/^\./, "");
  const finalSuffix = suffix ?? "";

  return `${slug}${finalSuffix}.${cleanedExt}`;
}
