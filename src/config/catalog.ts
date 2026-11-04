import type { KeyboardId, PeripheralId, ProductType, Size, Thickness, EdgeId } from "@/types/config";
import { layoutSizeCm } from "./keyboardLayouts";

/**
 * CATALOGUE CENTRALISÉ — tout ce qui dépend du fabricant se règle ici.
 */

export const CURRENCY = "EUR";
export const LOCALE = "fr-FR";

export interface SizePreset { id: string; label: string; w: number; d: number; use?: string; popular?: boolean }

export const SIZE_PRESETS: Record<ProductType, SizePreset[]> = {
  deskmat: [
    // Calé sur les gammes du marché (SteelSeries QcK, Razer Gigantus, Logitech G, HyperX Fury)
    { id: "s", label: "S", w: 30, d: 25, use: "Souris seule" },
    { id: "m", label: "M", w: 36, d: 30, use: "Souris, grands gestes" },
    { id: "l", label: "L", w: 45, d: 40, use: "Low sens / FPS" },
    { id: "xl", label: "XL", w: 90, d: 40, use: "Clavier + souris", popular: true },
    { id: "xxl", label: "XXL", w: 120, d: 60, use: "Bureau complet" },
  ],
  playmat: [
    { id: "60x35", label: "60 × 35 cm", w: 60, d: 35 },
    { id: "70x35", label: "70 × 35 cm", w: 70, d: 35 },
    { id: "90x40", label: "90 × 40 cm", w: 90, d: 40 },
  ],
};

/** Limites de fabrication pour la taille personnalisée (cm). */
export const SIZE_LIMITS: Record<ProductType, { minW: number; maxW: number; minD: number; maxD: number }> = {
  deskmat: { minW: 30, maxW: 140, minD: 20, maxD: 70 },
  playmat: { minW: 40, maxW: 120, minD: 25, maxD: 70 },
};

export const THICKNESSES: Thickness[] = [3, 4, 5];
export const CORNER_RADIUS_CM = 1.5;

export interface EdgeOption { id: EdgeId; label: string; description: string }
export const EDGES: EdgeOption[] = [
  { id: "black", label: "Noirs", description: "Bords cousus noirs" },
  { id: "white", label: "Blancs", description: "Bords cousus blancs" },
  { id: "none", label: "Sans couture", description: "Bords coupés, sans surpiqûre" },
];
export const DEFAULT_EDGE_COLOR = "#8a6f4d";

/** Capacités du fabricant : chaque règle renvoie un message si l'option est indisponible. */
export const CAPABILITIES = {
  seamlessMaxThickness: 4,
  seamlessMaxDepth: 50,
  rgbMinThickness: 4,
  rgbMaxWidth: 100,
  rgbRequiresStitchedEdge: true,
  wristRestProducts: ["deskmat"] as ProductType[],
};

/** Qualité d'image : dpi effectif minimal. */
export const IMAGE_RULES = {
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 25 * 1024 * 1024,
  minPixels: 600,
  dpiGood: 150,
  dpiMin: 100,
};

/* ---------- Setup PC ---------- */
export interface KeyboardModel { id: KeyboardId; label: string; short: string; w: number; h: number; numpad: boolean }
export const KEYBOARDS: KeyboardModel[] = [
  { id: "100", label: "100 % (104 touches)", short: "100 %", numpad: true },
  { id: "96", label: "96 % compact", short: "96 %", numpad: true },
  { id: "tkl", label: "TKL / 80 % (87 touches)", short: "TKL", numpad: false },
  { id: "75", label: "75 % (84 touches)", short: "75 %", numpad: false },
  { id: "65", label: "65 % (68 touches)", short: "65 %", numpad: false },
  { id: "60", label: "60 % (61 touches)", short: "60 %", numpad: false },
].map((k) => ({ ...k, ...layoutSizeCm(k.id as KeyboardId) })) as KeyboardModel[];

export const PERIPHERAL_DEFS: Record<Exclude<PeripheralId, "keyboard">, { label: string; size: Size }> = {
  numpad: { label: "Pavé numérique indépendant", size: { w: 11, h: 13.5 } },
  mouse: { label: "Souris", size: { w: 6.8, h: 12.2 } },
  wristrest: { label: "Repose-poignet", size: { w: 36, h: 8.5 } },
  // Empreinte = pied d'écran (22 × 17 cm, Dell/LG 27") + 2 cm derrière pour la dalle.
  monitor: { label: "Pied d'écran", size: { w: 22, h: 19 } },
};

/** Tailles de repose-poignet proposées (cm) et formats de clavier correspondants. */
export const WRIST_REST_SIZES: { w: number; h: number; keyboards: KeyboardId[] }[] = [
  { w: 30, h: 8.5, keyboards: ["60", "65", "75"] },
  { w: 36, h: 8.5, keyboards: ["tkl", "96"] },
  { w: 44, h: 8.5, keyboards: ["100"] },
];

export const MOUSE_COMFORT_CM = 20;

/* ---------- Playmat ---------- */
export const CARD_SIZE: Size = { w: 6.3, h: 8.8 };

export interface ZoneTemplate { id: string; label: string; ax: number; ay: number; w: number; h: number }
export interface PlaymatLayout {
  id: string;
  label: string;
  note: string;
  zones: ZoneTemplate[];
}

const row = (prefix: string, label: string, n: number, ay: number, ax0: number, ax1: number): ZoneTemplate[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}${i + 1}`, label: `${label} ${i + 1}`,
    ax: n === 1 ? (ax0 + ax1) / 2 : ax0 + ((ax1 - ax0) * i) / (n - 1), ay, w: CARD_SIZE.w, h: CARD_SIZE.h,
  }));

/**
 * Modèles INDICATIFS et configurables : ils ne reproduisent pas de dispositions officielles.
 * ax/ay = centre de la zone en fraction du tapis, w/h en cm.
 */
export const PLAYMAT_LAYOUTS: PlaymatLayout[] = [
  { id: "blank", label: "Surface vierge", note: "Aucune zone.", zones: [] },
  {
    id: "pokemon", label: "Disposition Pokémon", note: "Modèle indicatif, à valider.",
    zones: [
      ...row("bench", "Banc", 5, 0.22, 0.3, 0.7),
      { id: "active", label: "Actif", ax: 0.5, ay: 0.68, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "deck", label: "Deck", ax: 0.9, ay: 0.68, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "discard", label: "Défausse", ax: 0.9, ay: 0.3, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "prize1", label: "Récomp. 1", ax: 0.08, ay: 0.3, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "prize2", label: "Récomp. 2", ax: 0.08, ay: 0.68, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "prize3", label: "Récomp. 3", ax: 0.19, ay: 0.3, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "prize4", label: "Récomp. 4", ax: 0.19, ay: 0.68, w: CARD_SIZE.w, h: CARD_SIZE.h },
    ],
  },
  {
    id: "yugioh", label: "Disposition Yu-Gi-Oh!", note: "Modèle indicatif, à valider.",
    zones: [
      ...row("mon", "Monstre", 5, 0.4, 0.28, 0.72),
      ...row("st", "Magie/Piège", 5, 0.75, 0.28, 0.72),
      { id: "deck", label: "Deck", ax: 0.9, ay: 0.75, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "extra", label: "Extra", ax: 0.1, ay: 0.75, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "gy", label: "Cimetière", ax: 0.9, ay: 0.4, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "field", label: "Terrain", ax: 0.1, ay: 0.4, w: CARD_SIZE.w, h: CARD_SIZE.h },
    ],
  },
  {
    id: "magic", label: "Disposition Magic", note: "Modèle indicatif, à valider.",
    zones: [
      { id: "library", label: "Bibliothèque", ax: 0.92, ay: 0.72, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "graveyard", label: "Cimetière", ax: 0.92, ay: 0.38, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "exile", label: "Exil", ax: 0.08, ay: 0.38, w: CARD_SIZE.w, h: CARD_SIZE.h },
      { id: "command", label: "Commandant", ax: 0.08, ay: 0.72, w: CARD_SIZE.w, h: CARD_SIZE.h },
    ],
  },
];

export const ZONE_COLORS = ["#ffffff", "#d4b483", "#7aa5d2", "#b0a8c9", "#e07a6d", "#6aa67a"];
