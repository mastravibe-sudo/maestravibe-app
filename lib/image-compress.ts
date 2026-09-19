// lib/image-compress.ts
// Browser-only utility. Compresses an image File down to a target size
// (default 100KB) by progressively lowering JPEG/WebP quality and, if
// still too big, shrinking dimensions — all client-side via <canvas>, so
// no server-side dependency (e.g. sharp) is needed.

export type CompressOptions = {
  /** Target max size in kilobytes. Default 100. */
  maxSizeKB?: number;
  /** Max width/height in px — large photos get downscaled first. Default 1600. */
  maxDimension?: number;
  /** Output mime type. Default 'image/webp' (smaller than JPEG at same quality). */
  outputType?: 'image/webp' | 'image/jpeg';
};

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = url;
    });
    return img;
  } finally {
    // Revoked after the image has decoded — object URL is only needed
    // during load, keeping it around after would leak memory.
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      type,
      quality
    );
  });
}

/**
 * Compress an image file to under `maxSizeKB`. Returns a new File (same
 * name, new extension matching outputType) ready to upload.
 *
 * Strategy: draw at maxDimension, then step quality down from 0.9 → 0.3 in
 * increments; if still over budget at the lowest quality, shrink the
 * canvas dimensions by 20% and repeat. Bails out after a bounded number of
 * attempts so it can never hang on a pathological image.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxSizeKB = 100, maxDimension = 1600, outputType = 'image/webp' } = options;
  const maxBytes = maxSizeKB * 1024;

  // Nothing to do if it's already small enough.
  if (file.size <= maxBytes) return file;

  const img = await loadImage(file);
  let { width, height } = img;

  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  let blob: Blob | null = null;
  let attempts = 0;
  const maxAttempts = 12;

  while (attempts < maxAttempts) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Quality sweep at the current dimensions.
    for (const quality of [0.9, 0.75, 0.6, 0.45, 0.3]) {
      attempts++;
      blob = await canvasToBlob(canvas, outputType, quality);
      if (blob.size <= maxBytes) {
        const ext = outputType === 'image/webp' ? 'webp' : 'jpg';
        const newName = file.name.replace(/\.[^.]+$/, '') + `.${ext}`;
        return new File([blob], newName, { type: outputType });
      }
      if (attempts >= maxAttempts) break;
    }

    // Still too big even at the lowest quality — shrink dimensions and
    // try the quality sweep again.
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
    if (width < 100 || height < 100) break; // don't compress into uselessness
  }

  // Best effort: return whatever the smallest attempt produced, even if it
  // didn't quite hit the target — better than failing the whole upload.
  if (blob) {
    const ext = outputType === 'image/webp' ? 'webp' : 'jpg';
    const newName = file.name.replace(/\.[^.]+$/, '') + `.${ext}`;
    return new File([blob], newName, { type: outputType });
  }
  return file;
}