import { CAPABILITIES, SIZE_LIMITS } from "@/config/catalog";
import type { ConfigState, EdgeId, Thickness } from "@/types/config";

type Reason = string | null;

export interface Constraints {
  edge: Record<EdgeId, Reason>;
  thickness: Record<Thickness, Reason>;
  rgb: Reason;
  wristRest: Reason;
}

/** Renvoie, pour chaque option, la raison de son indisponibilité (null = disponible). */
export function getConstraints(c: ConfigState): Constraints {
  // Pour l'instant toutes les options sont disponibles dans toutes les tailles et épaisseurs.
  // Les limites de fabrication (CAPABILITIES dans config/catalog.ts) ne sont plus appliquées ;
  // remettre ici les règles quand les contraintes réelles du fabricant seront connues.
  const edge: Record<EdgeId, Reason> = { black: null, white: null, custom: null, none: null };
  const thickness: Record<Thickness, Reason> = { 3: null, 4: null, 5: null };
  const rgb: Reason = null;

  const wristRest: Reason = CAPABILITIES.wristRestProducts.includes(c.product) ? null : "Réservé aux tapis de souris.";
  return { edge, thickness, rgb, wristRest };
}

/** Corrige une configuration devenue incohérente (ex. après changement de dimensions) et liste les ajustements. */
export function sanitize(c: ConfigState): { config: ConfigState; notices: string[] } {
  const notices: string[] = [];
  const next = { ...c };
  const lim = SIZE_LIMITS[c.product];
  const w = Math.min(lim.maxW, Math.max(lim.minW, c.width));
  const d = Math.min(lim.maxD, Math.max(lim.minD, c.depth));
  if (w !== c.width || d !== c.depth) {
    notices.push(`Dimensions ajustées aux limites de fabrication (${lim.minW}–${lim.maxW} × ${lim.minD}–${lim.maxD} cm).`);
    next.width = w; next.depth = d;
  }
  if (next.edge === "custom") next.edge = "black"; // option retirée (anciens projets)
  let k = getConstraints(next);
  if (next.wristRest && k.wristRest) { next.wristRest = false; }
  if (next.rgb && k.rgb) { notices.push(`RGB désactivé : ${k.rgb}`); next.rgb = false; k = getConstraints(next); }
  if (next.edge === "none" && k.edge.none) { notices.push(`« Sans couture » retiré : ${k.edge.none}`); next.edge = "black"; k = getConstraints(next); }
  return { config: next, notices };
}
