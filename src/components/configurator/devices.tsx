"use client";
import { Circle, Ellipse, Group, Line, Path, Rect, Text } from "react-konva";
import type { KeyboardId, PeripheralId } from "@/types/config";
import { KEY_LAYOUTS, KEY_UNIT_CM, KEYBOARD_BEZEL_CM, NUMPAD_LAYOUT, type KeyLayout } from "@/config/keyboardLayouts";
import { grainTexture } from "@/lib/textures";

/* Matériaux (vue du dessus, lumière venant du haut-gauche). Toutes les cotes sont en cm. */
const CASE_TOP = ["#2e3136", "#1b1d21"];
const CASE_EDGE = "#0c0d0f";
const KEY_SKIRT = "#1d1f23";
const KEY_TOP = ["#3a3d44", "#2c2f35"];
const MOD_SKIRT = "#17191c";
const MOD_TOP = ["#2d3035", "#222429"];
const LEGEND = "#e6e8ec";
const LEGEND_MOD = "#b6bac2";
const FONT = "Helvetica, Arial, sans-serif";

/** Deux ombres : une large et diffuse, une de contact serrée — c'est ce qui « pose » l'objet. */
function Shadows({ w, h, r, lift = 1 }: { w: number; h: number; r: number | number[]; lift?: number }) {
  return (
    <>
      <Rect width={w} height={h} cornerRadius={r} fill="#000" shadowColor="#000" shadowBlur={1.6 * lift} shadowOffsetX={0.3 * lift} shadowOffsetY={0.9 * lift} shadowOpacity={0.45} listening={false} />
      <Rect width={w} height={h} cornerRadius={r} fill="#000" shadowColor="#000" shadowBlur={0.25} shadowOffsetX={0.05} shadowOffsetY={0.15} shadowOpacity={0.7} listening={false} />
    </>
  );
}

function Keys({ layout, w, h, pad }: { layout: KeyLayout; w: number; h: number; pad: number }) {
  const sx = (w - pad * 2) / layout.units.w;
  const sy = (h - pad * 2) / layout.units.h;
  const u = Math.min(sx, sy) / KEY_UNIT_CM; // 1 = taille réelle
  const gap = 0.1 * u;
  return (
    <>
      {layout.keys.map((k, i) => {
        const x = pad + k.x * sx + gap / 2, y = pad + k.y * sy + gap / 2;
        const kw = k.w * sx - gap, kh = k.h * sy - gap;
        // Face supérieure en retrait : plus de jupe en bas (profil de touche incliné)
        const tl = 0.24 * u, tr = 0.24 * u, tt = 0.14 * u, tb = 0.42 * u;
        const fw = kw - tl - tr, fh = kh - tt - tb;
        const top = k.mod ? MOD_TOP : KEY_TOP;
        const single = k.label.length <= 2;
        return (
          <Group key={i} listening={false}>
            <Rect x={x} y={y} width={kw} height={kh} cornerRadius={0.22 * u} fill={k.mod ? MOD_SKIRT : KEY_SKIRT}
              stroke="#0b0c0e" strokeWidth={0.04} />
            <Rect x={x + tl} y={y + tt} width={fw} height={fh} cornerRadius={0.16 * u}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: fh }}
              fillLinearGradientColorStops={[0, top[0], 1, top[1]]} />
            <Line points={[x + tl + 0.12 * u, y + tt + 0.03, x + tl + fw - 0.12 * u, y + tt + 0.03]} stroke="#fff" strokeWidth={0.03} opacity={0.12} />
            {k.label && (
              <Text text={k.label} x={x + tl} y={y + tt} width={fw} height={fh} align="center" verticalAlign="middle"
                fontFamily={FONT} fontStyle={single ? "normal" : "bold"} fontSize={(single ? 0.42 : 0.26) * u}
                fill={k.mod ? LEGEND_MOD : LEGEND} opacity={0.88} wrap="none" ellipsis />
            )}
          </Group>
        );
      })}
    </>
  );
}

function KeyboardCase({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  return (
    <>
      <Shadows w={w} h={h} r={0.6} />
      <Rect width={w} height={h} cornerRadius={0.6} stroke={CASE_EDGE} strokeWidth={0.06}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: w * 0.2, y: h }}
        fillLinearGradientColorStops={[0, CASE_TOP[0], 1, CASE_TOP[1]]} />
      {/* Chanfrein lumineux sur l'arête haute */}
      <Rect x={0.12} y={0.12} width={w - 0.24} height={h - 0.24} cornerRadius={0.5} stroke="#fff" strokeWidth={0.05} opacity={0.08} listening={false} />
      {/* Plaque intérieure légèrement plus sombre */}
      <Rect x={KEYBOARD_BEZEL_CM * 0.7} y={KEYBOARD_BEZEL_CM * 0.7} width={w - KEYBOARD_BEZEL_CM * 1.4} height={h - KEYBOARD_BEZEL_CM * 1.4}
        cornerRadius={0.3} fill="#0f1012" opacity={0.85} listening={false} />
      {children}
    </>
  );
}

function Keyboard({ w, h, id }: { w: number; h: number; id: KeyboardId }) {
  return <KeyboardCase w={w} h={h}><Keys layout={KEY_LAYOUTS[id]} w={w} h={h} pad={KEYBOARD_BEZEL_CM} /></KeyboardCase>;
}

function Numpad({ w, h }: { w: number; h: number }) {
  return <KeyboardCase w={w} h={h}><Keys layout={NUMPAD_LAYOUT} w={w} h={h} pad={KEYBOARD_BEZEL_CM} /></KeyboardCase>;
}

/* Souris gaming vue de dessus : coordonnées normalisées 0–100, mises à l'échelle sur (w, h). */
const MOUSE_BODY = "M50 0 C76 0 94 12 97 38 C100 60 98 80 89 92 C81 100 64 100 50 100 C36 100 19 100 11 92 C2 80 0 60 3 38 C6 12 24 0 50 0 Z";

function Mouse({ w, h }: { w: number; h: number }) {
  const k = 100 / w; // cm → unités normalisées (axe x)
  return (
    <Group scaleX={w / 100} scaleY={h / 100}>
      <Path data={MOUSE_BODY} fill="#000" shadowColor="#000" shadowBlur={1.4 * k} shadowOffsetX={0.3 * k} shadowOffsetY={0.8 * k} shadowOpacity={0.5} listening={false} />
      <Path data={MOUSE_BODY} fill="#000" shadowColor="#000" shadowBlur={0.25 * k} shadowOffsetY={0.12 * k} shadowOpacity={0.7} listening={false} />
      <Path data={MOUSE_BODY} stroke={CASE_EDGE} strokeWidth={0.6}
        fillRadialGradientStartPoint={{ x: 40, y: 32 }} fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 50, y: 52 }} fillRadialGradientEndRadius={70}
        fillRadialGradientColorStops={[0, "#4a4d54", 0.45, "#2b2d32", 1, "#141518"]} />
      {/* Grips latéraux texturés */}
      <Path data="M4 46 C3 60 4 74 10 86" stroke="#0e0f11" strokeWidth={3.2} lineCap="round" opacity={0.7} listening={false} />
      <Path data="M96 46 C97 60 96 74 90 86" stroke="#0e0f11" strokeWidth={3.2} lineCap="round" opacity={0.7} listening={false} />
      {/* Séparation des clics et de la paume */}
      <Line points={[50, 2, 50, 41]} stroke="#08090a" strokeWidth={0.8} listening={false} />
      <Path data="M5 42 Q50 50 95 42" stroke="#08090a" strokeWidth={0.7} opacity={0.8} listening={false} />
      {/* Molette */}
      <Rect x={45} y={11} width={10} height={21} cornerRadius={4} stroke="#060607" strokeWidth={0.5}
        fillLinearGradientStartPoint={{ x: 45, y: 0 }} fillLinearGradientEndPoint={{ x: 55, y: 0 }}
        fillLinearGradientColorStops={[0, "#0d0e10", 0.5, "#3a3c41", 1, "#0d0e10"]} listening={false} />
      {Array.from({ length: 7 }, (_, i) => (
        <Line key={i} points={[46, 13.5 + i * 2.6, 54, 13.5 + i * 2.6]} stroke="#000" strokeWidth={0.5} opacity={0.6} listening={false} />
      ))}
      {/* Reflet spéculaire */}
      <Ellipse x={34} y={30} radiusX={11} radiusY={20} rotation={-12} fill="#fff" opacity={0.07} listening={false} />
      {/* Témoin lumineux */}
      <Circle x={50} y={80} radius={2} fill="#22e06a" shadowColor="#22e06a" shadowBlur={3} shadowOpacity={0.9} listening={false} />
    </Group>
  );
}

function WristRest({ w, h }: { w: number; h: number }) {
  const r = [1.2, 1.2, 2.6, 2.6];
  return (
    <>
      <Shadows w={w} h={h} r={r} lift={0.8} />
      <Rect width={w} height={h} cornerRadius={r} fill="#202226" stroke={CASE_EDGE} strokeWidth={0.06} />
      <Rect width={w} height={h} cornerRadius={r} fillPatternImage={grainTexture() as unknown as HTMLImageElement}
        fillPatternScale={{ x: 0.03, y: 0.03 }} globalCompositeOperation="overlay" opacity={0.5} listening={false} />
      {/* Bombé : lumière en haut, ombre en bas */}
      <Rect width={w} height={h} cornerRadius={r} listening={false}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: h }}
        fillLinearGradientColorStops={[0, "rgba(255,255,255,0.14)", 0.45, "rgba(255,255,255,0)", 1, "rgba(0,0,0,0.35)"]} />
      <Rect x={0.45} y={0.45} width={w - 0.9} height={h - 0.9} cornerRadius={[0.8, 0.8, 2.2, 2.2]} stroke="#4a4d54" dash={[0.3, 0.18]} strokeWidth={0.06} opacity={0.9} listening={false} />
    </>
  );
}

/** Écran vu de dessus : dalle fine en haut, pied central et socle en aluminium brossé. */
function Monitor({ w, h }: { w: number; h: number }) {
  // Pied : toute l'empreinte sauf les 2 cm arrière (sous la dalle). Dalle 27" ≈ 61 cm de large.
  const PANEL_W = 61, PANEL_D = 2.2;
  const bx = 0, by = 2, bw = w, bh = h - 2;
  const alu = [0, "#8e939a", 0.25, "#c9ccd1", 0.5, "#e3e5e8", 0.75, "#bfc3c8", 1, "#888c93"];
  return (
    <>
      <Group x={bx} y={by}>
        <Shadows w={bw} h={bh} r={1.6} lift={0.6} />
        <Rect width={bw} height={bh} cornerRadius={1.6} stroke="#6f737a" strokeWidth={0.06}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: bw, y: 0 }} fillLinearGradientColorStops={alu} />
      </Group>
      {/* Colonne */}
      <Rect x={w / 2 - 2.4} y={1} width={4.8} height={bh * 0.5} cornerRadius={0.8}
        fillLinearGradientStartPoint={{ x: w / 2 - 2.4, y: 0 }} fillLinearGradientEndPoint={{ x: w / 2 + 2.4, y: 0 }}
        fillLinearGradientColorStops={[0, "#5d6168", 0.5, "#a9adb3", 1, "#55595f"]}
        shadowColor="#000" shadowBlur={2.5} shadowOffsetX={0.4} shadowOffsetY={1.6} shadowOpacity={0.45} />
      {/* Dalle (bord supérieur de l'écran, surélevé : ombre plus large) */}
      <Rect x={(w - PANEL_W) / 2} y={0} width={PANEL_W} height={PANEL_D} cornerRadius={0.5}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: PANEL_D }}
        fillLinearGradientColorStops={[0, "#2a2c31", 1, "#121316"]}
        shadowColor="#000" shadowBlur={5} shadowOffsetX={0.6} shadowOffsetY={3.5} shadowOpacity={0.4} />
    </>
  );
}

export function DeviceShape({ id, w, h, keyboard }: { id: PeripheralId; w: number; h: number; keyboard: KeyboardId }) {
  switch (id) {
    case "keyboard": return <Keyboard w={w} h={h} id={keyboard} />;
    case "numpad": return <Numpad w={w} h={h} />;
    case "mouse": return <Mouse w={w} h={h} />;
    case "wristrest": return <WristRest w={w} h={h} />;
    case "monitor": return <Monitor w={w} h={h} />;
  }
}

/** Carte fictive : illustration entièrement originale, aucun personnage ni logo. */
const CARD_PALETTES: [string, string, string][] = [
  ["#264653", "#2a9d8f", "#e9c46a"],
  ["#4a2c5a", "#9b5de5", "#f1c0e8"],
  ["#7a2e2e", "#e07a5f", "#f2cc8f"],
];
export function FictionalCard({ w, h, variant }: { w: number; h: number; variant: number }) {
  const [a, b, c] = CARD_PALETTES[variant % CARD_PALETTES.length];
  return (
    <>
      <Rect width={w} height={h} cornerRadius={0.35} fill="#111" shadowColor="#000" shadowBlur={0.6} shadowOffsetX={0.1} shadowOffsetY={0.3} shadowOpacity={0.45} />
      <Rect x={0.25} y={0.25} width={w - 0.5} height={h - 0.5} cornerRadius={0.25} fill={a} />
      <Rect x={0.5} y={0.55} width={w - 1} height={0.7} cornerRadius={0.15} fill="#fff" opacity={0.85} />
      <Rect x={0.5} y={1.5} width={w - 1} height={h * 0.45} cornerRadius={0.15} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: h * 0.45 }} fillLinearGradientColorStops={[0, b, 1, c]} />
      <Circle x={w / 2} y={1.5 + h * 0.22} radius={w * 0.17} fill="#fff" opacity={0.55} />
      <Line points={[0.5, 1.5 + h * 0.45, w * 0.4, 1.5 + h * 0.2, w * 0.65, 1.5 + h * 0.45]} closed fill={a} opacity={0.7} />
      <Rect x={0.5} y={h * 0.62} width={w - 1} height={h * 0.3} cornerRadius={0.15} fill="#fff" opacity={0.85} />
      <Line points={[0.9, h * 0.7, w - 0.9, h * 0.7]} stroke="#555" strokeWidth={0.1} opacity={0.6} />
      <Line points={[0.9, h * 0.78, w - 1.8, h * 0.78]} stroke="#555" strokeWidth={0.1} opacity={0.4} />
      {/* Brillance de la pochette plastique */}
      <Rect width={w} height={h} cornerRadius={0.35} listening={false}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: w, y: h }}
        fillLinearGradientColorStops={[0, "rgba(255,255,255,0.22)", 0.35, "rgba(255,255,255,0)", 1, "rgba(255,255,255,0.05)"]} />
    </>
  );
}
