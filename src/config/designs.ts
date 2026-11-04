import type { ProductType } from "@/types/config";

/**
 * DESIGNS DE DÉMONSTRATION.
 * Pour utiliser vos propres visuels : remplacez `src` par une URL (ex. "/designs/marbre.jpg" placée dans /public)
 * et renseignez `pixelWidth`/`pixelHeight` pour le calcul de résolution.
 * Les visuels de démo ci-dessous sont des SVG générés, entièrement originaux.
 */
export interface Design {
  id: string;
  name: string;
  products: ProductType[];
  src: string;
  pixelWidth: number;
  pixelHeight: number;
  /** Couleur de repli / vignette */
  swatch: string;
  /** Onglet : « basic » = unis / matières, « gallery » = illustrations. */
  category: "basic" | "gallery";
}

const W = 2400, H = 1200;
const toUrl = (body: string, defs = "") =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`,
  );

const rnd = (seed: number) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

function stars(n: number, seed: number, maxY = 700) {
  const r = rnd(seed);
  return Array.from({ length: n }, () => `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * maxY).toFixed(0)}" r="${(r() * 2.2 + 0.4).toFixed(1)}" fill="#fff" opacity="${(r() * 0.7 + 0.2).toFixed(2)}"/>`).join("");
}

function skyline() {
  const r = rnd(42);
  let x = 0, out = "";
  while (x < W) {
    const w = 60 + r() * 120, h = 160 + r() * 420;
    out += `<rect x="${x.toFixed(0)}" y="${(H - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#120a24"/>`;
    for (let i = 0; i < 6; i++) if (r() > 0.55) out += `<rect x="${(x + 10 + r() * (w - 30)).toFixed(0)}" y="${(H - h + 20 + r() * (h - 60)).toFixed(0)}" width="10" height="6" fill="${r() > 0.5 ? "#ff3df2" : "#22e0ff"}" opacity=".8"/>`;
    x += w + 8;
  }
  return out;
}

function gridLines(color: string, step: number, op: number) {
  let o = "";
  for (let x = 0; x <= W; x += step) o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${color}" stroke-width="2" opacity="${op}"/>`;
  for (let y = 0; y <= H; y += step) o += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${color}" stroke-width="2" opacity="${op}"/>`;
  return o;
}

export const DESIGNS: Design[] = [
  {
    id: "minimal-black", category: "basic", name: "Minimaliste noir", products: ["deskmat", "playmat"], swatch: "#151618", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="url(#g)"/>`,
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b1c1f"/><stop offset="1" stop-color="#0c0c0d"/></linearGradient>`),
  },
  {
    id: "beige", category: "basic", name: "Beige", products: ["deskmat", "playmat"], swatch: "#e6dccb", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="url(#g)"/><circle cx="1750" cy="420" r="260" fill="#d9c8ad" opacity=".55"/><circle cx="1750" cy="420" r="180" fill="#cdb894" opacity=".5"/>`,
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#dcd0bb"/></linearGradient>`),
  },
  {
    id: "white", category: "basic", name: "Blanc", products: ["deskmat", "playmat"], swatch: "#f4f4f1", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="#f6f6f3"/>${gridLines("#1f2328", 120, 0.05)}`),
  },
  {
    id: "marble", category: "basic", name: "Marbre", products: ["deskmat", "playmat"], swatch: "#d9dadb", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="#eceded"/><rect width="${W}" height="${H}" filter="url(#m)" opacity=".85"/>`,
      `<filter id="m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0035 0.011" numOctaves="5" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.27  0 0 0 0 0.3  0 0 -9 0 4.6"/></filter>`),
  },
  {
    id: "abstract", category: "gallery", name: "Abstrait", products: ["deskmat", "playmat"], swatch: "#c9806a", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="#f1e8e0"/><circle cx="600" cy="480" r="520" fill="url(#a)"/><circle cx="1500" cy="760" r="620" fill="url(#b)" opacity=".9"/><circle cx="2050" cy="260" r="300" fill="#2f3a4a" opacity=".85"/><path d="M0 1000 Q 600 760 1200 980 T 2400 880 V1200 H0Z" fill="#1f2630" opacity=".9"/>`,
      `<radialGradient id="a"><stop offset="0" stop-color="#e59a7d"/><stop offset="1" stop-color="#e59a7d" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop offset="0" stop-color="#7f9fbf"/><stop offset="1" stop-color="#7f9fbf" stop-opacity="0"/></radialGradient>`),
  },
  {
    id: "japan", category: "gallery", name: "Japonais minimaliste", products: ["deskmat", "playmat"], swatch: "#efe9dd", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="#efe9dd"/><circle cx="1700" cy="470" r="230" fill="#b5352b"/><path d="M0 950 L420 620 L760 860 L1180 500 L1650 940 L2000 720 L2400 960 V1200 H0Z" fill="#2a2d33" opacity=".92"/><path d="M0 1050 Q 600 960 1200 1060 T 2400 1040 V1200 H0Z" fill="#3a3e46"/><line x1="180" y1="180" x2="180" y2="520" stroke="#2a2d33" stroke-width="4" opacity=".7"/>`),
  },
  {
    id: "fantasy", category: "gallery", name: "Fantasy originale", products: ["deskmat", "playmat"], swatch: "#1d3c4a", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="url(#s)"/>${stars(160, 11)}<circle cx="1800" cy="360" r="200" fill="#f3ecd2"/><circle cx="1860" cy="330" r="190" fill="#1d3c4a" opacity=".28"/><path d="M0 900 L300 640 L560 820 L900 520 L1300 860 L1700 640 L2100 840 L2400 700 V1200 H0Z" fill="#0f2430"/><path d="M0 1010 L400 850 L800 990 L1300 820 L1800 990 L2400 880 V1200 H0Z" fill="#08161e"/><path d="M1180 640 l40 -160 l40 160z M1160 640 h120 v40 h-120z" fill="#0b1c25"/>`,
      `<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1f33"/><stop offset=".7" stop-color="#2a5a66"/><stop offset="1" stop-color="#6d9a8d"/></linearGradient>`),
  },
  {
    id: "cyberpunk", category: "gallery", name: "Cyberpunk original", products: ["deskmat", "playmat"], swatch: "#2a1250", pixelWidth: W, pixelHeight: H,
    src: toUrl(`<rect width="${W}" height="${H}" fill="url(#c)"/>${stars(60, 5, 500)}<circle cx="1200" cy="560" r="260" fill="url(#sun)"/>${skyline()}<rect y="1080" width="${W}" height="120" fill="#0a0518"/><line x1="0" y1="1080" x2="${W}" y2="1080" stroke="#22e0ff" stroke-width="4" opacity=".9"/>`,
      `<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0620"/><stop offset=".65" stop-color="#3a1068"/><stop offset="1" stop-color="#7a1f8f"/></linearGradient><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd35c"/><stop offset="1" stop-color="#ff3d9a"/></linearGradient>`),
  },
];

export const getDesign = (id: string) => DESIGNS.find((d) => d.id === id) ?? DESIGNS[0];
