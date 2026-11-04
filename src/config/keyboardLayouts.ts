/**
 * Dispositions de clavier ANSI standard, touche par touche.
 * Unité : 1u = 19,05 mm (pas standard d'une touche).
 *
 * Notation d'une rangée : jetons séparés par des espaces
 *   "1"      touche 1u          "2.25"   touche 2,25u
 *   "1*12"   12 touches de 1u   "g0.5"   espace vide de 0,5u
 *   suffixe "m" = touche de modification (couleur différente)
 *   suffixe "t" = touche double hauteur (Entrée / + du pavé)
 * Inscriptions : une par touche, séparées par des espaces ("·" = touche sans inscription).
 */
import type { KeyboardId } from "@/types/config";

export interface KeyCap { x: number; y: number; w: number; h: number; mod: boolean; label: string }
export interface KeyLayout { units: { w: number; h: number }; keys: KeyCap[] }

export const KEY_UNIT_CM = 1.905;
/** Bordure du boîtier autour des touches, en cm. */
export const KEYBOARD_BEZEL_CM = 0.7;

function row(y: number, x: number, spec: string, labels = ""): KeyCap[] {
  const names = labels.trim() ? labels.trim().split(/\s+/) : [];
  const keys: KeyCap[] = [];
  for (const tok of spec.trim().split(/\s+/)) {
    const m = /^(g)?([\d.]+)(?:\*(\d+))?([mt]*)$/.exec(tok);
    if (!m) throw new Error(`Jeton de disposition invalide : ${tok}`);
    const [, gap, w, n, flags] = m;
    const width = Number(w);
    for (let i = 0; i < Number(n ?? 1); i++) {
      if (!gap) {
        const name = names[keys.length] ?? "";
        keys.push({ x, y, w: width, h: flags.includes("t") ? 2 : 1, mod: flags.includes("m"), label: name === "·" ? "" : name });
      }
      x += width;
    }
  }
  return keys;
}

const F_KEYS = "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12";
const R_NUM = "` 1 2 3 4 5 6 7 8 9 0 - =";
const R_TOP = "Tab Q W E R T Y U I O P [ ] \\";
const R_HOME = "Caps A S D F G H J K L ; ' Enter";
const R_LOW = "Z X C V B N M , . /";

/* Bloc alphanumérique 60 % (15u × 5 rangées) */
const alpha = (y0: number) => [
  ...row(y0, 0, "1*13 2m", `${R_NUM} ⌫`),
  ...row(y0 + 1, 0, "1.5m 1*12 1.5", R_TOP),
  ...row(y0 + 2, 0, "1.75m 1*11 2.25m", R_HOME),
  ...row(y0 + 3, 0, "2.25m 1*10 2.75m", `Shift ${R_LOW} Shift`),
  ...row(y0 + 4, 0, "1.25*3m 6.25 1.25*4m", "Ctrl Win Alt · Alt Win Menu Ctrl"),
];

/* Rangée de fonctions espacée (claviers 100 % et TKL) */
const frow = () => row(0, 0, "1m g1 1*4 g0.5 1*4 g0.5 1*4", `Esc ${F_KEYS}`);

/* Bloc navigation + flèches en T inversé, à 15,25u */
function navCluster(): KeyCap[] {
  const x = 15.25;
  return [
    ...row(0, x, "1*3m", "PrtSc ScrLk Pause"),
    ...row(1.5, x, "1*3m", "Ins Home PgUp"),
    ...row(2.5, x, "1*3m", "Del End PgDn"),
    ...row(4.5, x, "g1 1m", "↑"),
    ...row(5.5, x, "1*3m", "← ↓ →"),
  ];
}

function numpad(x: number, y0: number): KeyCap[] {
  return [
    ...row(y0, x, "1*4m", "Num / * -"),
    ...row(y0 + 1, x, "1*3 1mt", "7 8 9 +"),
    ...row(y0 + 2, x, "1*3", "4 5 6"),
    ...row(y0 + 3, x, "1*3 1mt", "1 2 3 Ent"),
    ...row(y0 + 4, x, "2 1", "0 ."),
  ];
}

/** Pavé numérique indépendant (accessoire). */
export const NUMPAD_LAYOUT: KeyLayout = { units: { w: 4, h: 5 }, keys: numpad(0, 0) };

export const KEY_LAYOUTS: Record<KeyboardId, KeyLayout> = {
  /* 100 % : 104 touches — fonctions, alpha, navigation, pavé numérique */
  "100": {
    units: { w: 22.5, h: 6.5 },
    keys: [...frow(), ...alpha(1.5), ...navCluster(), ...numpad(18.5, 1.5)],
  },
  /* 96 % (1800 compact) : presque tout le 100 % resserré, sans espaces entre blocs — 100 touches */
  "96": {
    units: { w: 19, h: 6 },
    keys: [
      ...row(0, 0, "1m 1*12 1*6m", `Esc ${F_KEYS} Del Ins Home End PgUp PgDn`),
      ...row(1, 0, "1*13 2m 1*4m", `${R_NUM} ⌫ Num / * -`),
      ...row(2, 0, "1.5m 1*12 1.5 1*3 1mt", `${R_TOP} 7 8 9 +`),
      ...row(3, 0, "1.75m 1*11 2.25m 1*3", `${R_HOME} 4 5 6`),
      ...row(4, 0, "2.25m 1*10 1.75m 1m 1*3 1mt", `Shift ${R_LOW} Shift ↑ 1 2 3 Ent`),
      ...row(5, 0, "1.25*3m 6.25 1*3m 1*3m 1*2", "Ctrl Win Alt · Alt Fn Ctrl ← ↓ → 0 ."),
    ],
  },
  /* TKL (80 %, tenkeyless) : 100 % sans le pavé numérique — 87 touches */
  tkl: {
    units: { w: 18.25, h: 6.5 },
    keys: [...frow(), ...alpha(1.5), ...navCluster()],
  },
  /* 75 % : rangée de fonctions collée, colonne de navigation à droite — 84 touches */
  "75": {
    units: { w: 16, h: 6 },
    keys: [
      ...row(0, 0, "1m 1*12 1*3m", `Esc ${F_KEYS} PrtSc Ins Del`),
      ...row(1, 0, "1*13 2m 1m", `${R_NUM} ⌫ Home`),
      ...row(2, 0, "1.5m 1*12 1.5 1m", `${R_TOP} PgUp`),
      ...row(3, 0, "1.75m 1*11 2.25m 1m", `${R_HOME} PgDn`),
      ...row(4, 0, "2.25m 1*10 1.75m 1m 1m", `Shift ${R_LOW} Shift ↑ End`),
      ...row(5, 0, "1.25*3m 6.25 1*3m 1*3m", "Ctrl Win Alt · Alt Fn Ctrl ← ↓ →"),
    ],
  },
  /* 65 % : 75 % sans rangée de fonctions — 68 touches */
  "65": {
    units: { w: 16, h: 5 },
    keys: [
      ...row(0, 0, "1*13 2m 1m", `${R_NUM} ⌫ Del`),
      ...row(1, 0, "1.5m 1*12 1.5 1m", `${R_TOP} PgUp`),
      ...row(2, 0, "1.75m 1*11 2.25m 1m", `${R_HOME} PgDn`),
      ...row(3, 0, "2.25m 1*10 1.75m 1m 1m", `Shift ${R_LOW} Shift ↑ End`),
      ...row(4, 0, "1.25*3m 6.25 1*3m 1*3m", "Ctrl Win Alt · Alt Fn Ctrl ← ↓ →"),
    ],
  },
  /* 60 % : bloc alphanumérique seul — 61 touches */
  "60": { units: { w: 15, h: 5 }, keys: alpha(0) },
  /* 40 % : sans rangée de chiffres — 40 touches */
  "40": {
    units: { w: 12.75, h: 4 },
    keys: [
      ...row(0, 0, "1m 1*10 1.75m", "Esc Q W E R T Y U I O P ⌫"),
      ...row(1, 0, "1.25m 1*9 2.5m", "Tab A S D F G H J K L Enter"),
      ...row(2, 0, "1.75m 1*9 2m", "Shift Z X C V B N M , . Shift"),
      ...row(3, 0, "1.25*3m 6.25 1.25m 1.5m", "Ctrl Win Alt · Fn Ctrl"),
    ],
  },
};

/** Dimensions extérieures du clavier (cm), déduites de la disposition. */
export function layoutSizeCm(id: KeyboardId) {
  const u = KEY_LAYOUTS[id].units;
  const r = (v: number) => Math.round(v * 10) / 10;
  return { w: r(u.w * KEY_UNIT_CM + 2 * KEYBOARD_BEZEL_CM), h: r(u.h * KEY_UNIT_CM + 2 * KEYBOARD_BEZEL_CM) };
}
