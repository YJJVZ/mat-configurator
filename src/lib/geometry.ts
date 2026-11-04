import { CARD_SIZE, KEYBOARDS, PERIPHERAL_DEFS, PLAYMAT_LAYOUTS, WRIST_REST_SIZES } from "@/config/catalog";
import type { ConfigState, PeripheralId, Point, Size } from "@/types/config";

export interface Rect { x: number; y: number; w: number; h: number }

export function peripheralSize(c: ConfigState, id: PeripheralId): Size {
  if (id === "keyboard") {
    const k = KEYBOARDS.find((k) => k.id === c.setup.keyboard) ?? KEYBOARDS[1];
    return { w: k.w, h: k.h };
  }
  if (id === "wristrest") {
    const s = WRIST_REST_SIZES.find((s) => s.w === c.wristRestW)
      ?? WRIST_REST_SIZES.find((s) => s.keyboards.includes(c.setup.keyboard))
      ?? WRIST_REST_SIZES[1];
    return { w: s.w, h: s.h };
  }
  return PERIPHERAL_DEFS[id].size;
}

/**
 * BUREAU DE RÉFÉRENCE (vue « En situation »).
 * Le bureau et le setup restent fixes, à la même échelle, quelle que soit la taille du tapis :
 * c'est le tapis qui grandit ou rétrécit dessous, ce qui rend sa taille immédiatement lisible.
 * Repère bureau (cm) : x = 0 au centre de l'utilisateur, y = 0 au bord avant du tapis.
 */
export const DESK_VIEW = { x0: -64, x1: 64, y0: -63, y1: 6 };
const MOUSE_GAP_CM = 8;

export interface DeskLayout {
  /** Coin haut-gauche du tapis, repère bureau. */
  mat: Point;
  /** Périphériques (haut-gauche), repère bureau. */
  devices: Record<PeripheralId, Point>;
  /** Tapis trop petit pour le clavier : il se place sous la souris seule, le clavier reste sur le bureau. */
  mouseOnly: boolean;
}

export function deskLayout(c: ConfigState): DeskLayout {
  const W = c.width, D = c.depth;
  const kb = peripheralSize(c, "keyboard");
  const wr = peripheralSize(c, "wristrest");
  const np = peripheralSize(c, "numpad");
  const ms = peripheralSize(c, "mouse");
  const mon = peripheralSize(c, "monitor");
  const hasNp = c.setup.show.numpad;
  const kbGroupW = kb.w + (hasNp ? np.w + 1.5 : 0);
  const fullW = kbGroupW + MOUSE_GAP_CM + ms.w;

  // Le clavier ne bouge jamais : c'est le repère d'échelle.
  const kbX = -fullW / 2;
  const wristY = -wr.h - 2;
  const kbY = c.setup.show.wristrest ? wristY - kb.h - 0.8 : -kb.h - 4;

  const mouseOnly = c.product === "deskmat" && W < fullW + 4;
  const mat = c.product !== "deskmat" || !mouseOnly
    ? { x: -W / 2, y: -D }
    : { x: kbX + kbGroupW + 3, y: -D };

  const mouse = mouseOnly
    ? { x: mat.x + (W - ms.w) / 2, y: -D / 2 - ms.h / 2 }
    : { x: kbX + kbGroupW + MOUSE_GAP_CM, y: kbY + kb.h - ms.h };

  return {
    mat, mouseOnly,
    devices: {
      // Écran en haut du tapis (1,5 cm du bord arrière) sur les tapis profonds ; position de référence sinon.
      monitor: { x: -mon.w / 2, y: Math.min(-38.5, -D + 1.5) },
      wristrest: { x: kbX + (kb.w - wr.w) / 2, y: wristY },
      keyboard: { x: kbX, y: kbY },
      numpad: { x: kbX + kb.w + 1.5, y: kbY },
      mouse,
    },
  };
}

/** Positions par défaut (haut-gauche) en repère tapis : celles du bureau de référence. */
export function defaultPositions(c: ConfigState): Record<PeripheralId, Point> {
  const { mat, devices } = deskLayout(c);
  const out = {} as Record<PeripheralId, Point>;
  for (const id of Object.keys(devices) as PeripheralId[]) out[id] = { x: devices[id].x - mat.x, y: devices[id].y - mat.y };
  return out;
}

export function peripheralRect(c: ConfigState, id: PeripheralId): Rect {
  const s = peripheralSize(c, id);
  const p = c.setup.pos[id] ?? defaultPositions(c)[id];
  return { x: p.x, y: p.y, w: s.w, h: s.h };
}

export const PERIPHERAL_ORDER: PeripheralId[] = ["monitor", "wristrest", "keyboard", "numpad", "mouse"];

export function visiblePeripherals(c: ConfigState): PeripheralId[] {
  return PERIPHERAL_ORDER.filter((id) => c.setup.show[id]);
}

/** Vrai si l'élément est à cheval sur le bord du tapis. Un élément entièrement posé à côté (sur le bureau) ne dépasse pas. */
export function overflowing(c: ConfigState, r: Rect): boolean {
  const e = 0.01;
  const inside = r.x >= -e && r.y >= -e && r.x + r.w <= c.width + e && r.y + r.h <= c.depth + e;
  const touches = r.x < c.width && r.x + r.w > 0 && r.y < c.depth && r.y + r.h > 0;
  return touches && !inside;
}

export interface MouseSpace { rightCm: number; leftCm: number; best: number; side: "droite" | "gauche" }

/** Espace libre latéral autour du clavier (et du pavé), utile pour le mouvement de la souris. */
export function mouseSpace(c: ConfigState): MouseSpace {
  const ids = (["keyboard", "numpad", "wristrest"] as PeripheralId[]).filter((i) => i === "keyboard" || c.setup.show[i]);
  const rects = ids.map((i) => peripheralRect(c, i));
  const right = Math.max(...rects.map((r) => r.x + r.w));
  const left = Math.min(...rects.map((r) => r.x));
  const clampW = (v: number) => Math.min(c.width, Math.max(0, Math.round(v * 10) / 10));
  const rightCm = clampW(c.width - Math.max(right, 0));
  const leftCm = clampW(Math.min(left, c.width));
  return rightCm >= leftCm ? { rightCm, leftCm, best: rightCm, side: "droite" } : { rightCm, leftCm, best: leftCm, side: "gauche" };
}

/* ---------- Playmat ---------- */
export interface PlacedZone { id: string; label: string; x: number; y: number; w: number; h: number }

export function playmatZones(c: ConfigState): PlacedZone[] {
  const { layoutId, customCols, customRows } = c.playmat;
  if (layoutId === "custom") {
    const gap = 1.2;
    const cols = customCols, rows = customRows;
    const totalW = cols * CARD_SIZE.w + (cols - 1) * gap;
    const totalH = rows * CARD_SIZE.h + (rows - 1) * gap;
    const out: PlacedZone[] = [];
    for (let r = 0; r < rows; r++)
      for (let k = 0; k < cols; k++)
        out.push({
          id: `c${r}-${k}`, label: `${r * cols + k + 1}`,
          x: (c.width - totalW) / 2 + k * (CARD_SIZE.w + gap), y: (c.depth - totalH) / 2 + r * (CARD_SIZE.h + gap), w: CARD_SIZE.w, h: CARD_SIZE.h,
        });
    return out;
  }
  const layout = PLAYMAT_LAYOUTS.find((l) => l.id === layoutId);
  return (layout?.zones ?? []).map((z) => ({ id: z.id, label: z.label, w: z.w, h: z.h, x: z.ax * c.width - z.w / 2, y: z.ay * c.depth - z.h / 2 }));
}

/** Position par défaut des cartes fictives : sur les 3 premières zones, sinon au centre. */
export function defaultCardPos(c: ConfigState, i: number): Point {
  const z = playmatZones(c)[i];
  if (z) return { x: z.x, y: z.y };
  return { x: c.width / 2 - CARD_SIZE.w / 2 + i * 8, y: c.depth / 2 - CARD_SIZE.h / 2 };
}
export const DEMO_CARD_IDS = ["card1", "card2", "card3"];
