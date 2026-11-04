import type Konva from "konva";

/** Registre minimal pour accéder au Stage depuis les boutons d'export. */
export const stageRegistry: { stage: Konva.Stage | null; matRect: { x: number; y: number; w: number; h: number } | null } = {
  stage: null,
  matRect: null,
};

/**
 * Export de l'aperçu CLIENT : le tapis imprimé uniquement.
 * Les calques "scene" (bureau/ombre) et "visual" (périphériques, cartes, RGB, repères), ainsi que la finition
 * photoréaliste "finish" (grain, reflets), sont masqués :
 * ils n'apparaissent jamais dans ce fichier. Ce n'est PAS un fichier de production.
 */
export function exportPreviewPng(): string | null {
  const { stage, matRect } = stageRegistry;
  if (!stage || !matRect) return null;
  const hidden = stage.find(".scene, .visual, .finish");
  hidden.forEach((n) => n.visible(false));
  stage.draw();
  const url = stage.toDataURL({ x: matRect.x, y: matRect.y, width: matRect.w, height: matRect.h, pixelRatio: 3, mimeType: "image/png" });
  hidden.forEach((n) => n.visible(true));
  stage.draw();
  return url;
}

export function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
}

export function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  download(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
