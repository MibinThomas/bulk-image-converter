# Bulk Product Image Converter

A Next.js App Router application for bulk processing ecommerce product images.

Features:

- Bulk upload of product images
- Format conversion: JPG, PNG, WEBP, AVIF, or keep original
- Resize by presets or custom dimensions
- Compression control (low, medium, high)
- Optional background removal and background replacement (solid color)
- File naming rules with suffix, lowercase, and space replacement
- Batch processing on the server with Sharp
- Download processed images as a single ZIP

## Tech stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Sharp for server side image processing
- JSZip for ZIP generation

## Getting started

```bash
pnpm install   # or npm install / yarn
pnpm dev       # or npm run dev
