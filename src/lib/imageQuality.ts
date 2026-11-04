import { IMAGE_RULES } from "@/config/catalog";
import type { ImageTransform, Size } from "@/types/config";

/**
 * Échelle (cm par pixel) pour que l'image COUVRE le tapis, sans déformation,
 * même après rotation de `rotationDeg`.
 */
export function coverScale(img: Size, mat: Size, rotationDeg: number): number {
  const a = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(a)), sin = Math.abs(Math.sin(a));
  const bw = mat.w * cos + mat.h * sin;
  const bh = mat.w * sin + mat.h * cos;
  return Math.max(bw / img.w, bh / img.h);
}

export type QualityLevel = "good" | "low" | "bad";
export interface ImageQuality { dpi: number; level: QualityLevel; message: string }

/** Résolution effective d'impression de l'image telle qu'elle est cadrée. */
export function imageQuality(img: Size, mat: Size, t: ImageTransform): ImageQuality {
  const cmPerPx = coverScale(img, mat, t.rotation) * t.scale;
  const dpi = Math.round(2.54 / cmPerPx);
  if (dpi >= IMAGE_RULES.dpiGood) return { dpi, level: "good", message: `Résolution effective ${dpi} dpi : bonne pour l'impression.` };
  if (dpi >= IMAGE_RULES.dpiMin) return { dpi, level: "low", message: `Résolution effective ${dpi} dpi : correcte mais le rendu peut manquer de finesse (idéal ≥ ${IMAGE_RULES.dpiGood} dpi).` };
  return { dpi, level: "bad", message: `Résolution effective ${dpi} dpi : insuffisante, l'impression sera floue. Utilisez une image plus grande.` };
}

export interface FileCheck { ok: boolean; error?: string }
export function validateImageFile(file: File): FileCheck {
  if (!IMAGE_RULES.acceptedTypes.includes(file.type)) return { ok: false, error: "Format non supporté. Utilisez JPG, PNG ou WebP." };
  if (file.size > IMAGE_RULES.maxBytes) return { ok: false, error: `Fichier trop lourd (max ${IMAGE_RULES.maxBytes / 1024 / 1024} Mo).` };
  return { ok: true };
}

export function readImageFile(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new window.Image();
      img.onerror = () => reject(new Error("Image illisible ou corrompue."));
      img.onload = () => {
        if (Math.min(img.naturalWidth, img.naturalHeight) < IMAGE_RULES.minPixels)
          reject(new Error(`Image trop petite (min ${IMAGE_RULES.minPixels} px de côté).`));
        else resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
