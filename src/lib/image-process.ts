import imageCompression from "browser-image-compression";

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.75;
const MAX_IMAGES = 5;

export { MAX_IMAGES };

export async function processImageForUpload(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
    initialQuality: WEBP_QUALITY,
    fileType: "image/webp",
  });

  const webpBlob = await toWebP(compressed, WEBP_QUALITY);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([webpBlob], `${baseName}.webp`, { type: "image/webp" });
}

function toWebP(blob: Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (result) => {
          URL.revokeObjectURL(url);
          if (result) resolve(result);
          else reject(new Error("WebP conversion failed"));
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };

    img.src = url;
  });
}

export interface PreviewImage {
  id: string;
  file: File;
  previewUrl: string;
  sortOrder: number;
}

export function createPreviewImage(file: File, sortOrder: number): PreviewImage {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    sortOrder,
  };
}

export function revokePreviewUrl(previewUrl: string) {
  URL.revokeObjectURL(previewUrl);
}
