/**
 * Textures procédurales pour l'aperçu photoréaliste (générées une seule fois côté navigateur).
 * Toutes sont raccordables (tuilables) pour être répétées sans couture visible.
 */

const cache = new Map<string, HTMLCanvasElement>();

function makeCanvas(w: number, h: number) {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  return cv;
}

/** Générateur pseudo-aléatoire déterministe. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Bruit de valeur 2D périodique (px, py = période en cellules). */
function valueNoise(seed: number, px: number, py: number) {
  const r = rng(seed);
  const grid = Array.from({ length: px * py }, () => r());
  const at = (i: number, j: number) => grid[(((j % py) + py) % py) * px + (((i % px) + px) % px)];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const i = Math.floor(x), j = Math.floor(y);
    const fx = fade(x - i), fy = fade(y - j);
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/**
 * Micro-texture de tissu (surface « speed/control » d'un tapis).
 * Gris neutre centré sur 128 : à utiliser en mode de fusion « overlay ».
 */
export function fabricTexture(): HTMLCanvasElement {
  const hit = cache.get("fabric");
  if (hit) return hit;
  const S = 256;
  const cv = makeCanvas(S, S);
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const r = rng(7);
  const n = valueNoise(11, 32, 32);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const weave = ((x >> 1) + (y >> 1)) % 2 === 0 ? 10 : -10; // tissage serré (renforcé pour le réalisme)
      const v = 128 + weave + (r() - 0.5) * 36 + (n(x / 8, y / 8) - 0.5) * 18;
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  cache.set("fabric", cv);
  return cv;
}

/** Échelle du bois : pixels de texture par cm réel. */
export const WOOD_PX_PER_CM = 10;

/** Plateau de bureau en chêne clair, veinage horizontal (2048 × 1024 px ≈ 205 × 102 cm), raccordable. */
export function woodTexture(): HTMLCanvasElement {
  const hit = cache.get("wood");
  if (hit) return hit;
  const W = 2048, H = 1024;
  const cv = makeCanvas(W, H);
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  // Le veinage du chêne : de longues stries quasi droites, de largeurs et teintes irrégulières.
  const broad = valueNoise(3, 6, 3);      // variations de teinte très larges
  const warp = valueNoise(5, 8, 4);       // légère dérive des veines
  const streak = valueNoise(9, 10, 160);  // stries longues (étirées en x)
  const fine = valueNoise(13, 48, 700);   // fibres fines
  const pore = valueNoise(15, 512, 1024); // pores
  const r = rng(21);
  const light = [201, 165, 122], dark = [158, 117, 79];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      const vv = v + 0.018 * (warp(u * 8, v * 4) - 0.5);
      const s1 = streak(u * 10, vv * 160);
      const s2 = fine(u * 48, vv * 700);
      const p = pore(u * 512, v * 1024);
      const b = broad(u * 6, v * 3);
      let t = 0.38 * Math.pow(s1, 1.6) + 0.22 * s2 + 0.25 * b + 0.15 * (p > 0.78 ? 1 : 0);
      t += (r() - 0.5) * 0.05;
      t = Math.min(1, Math.max(0, t));
      const i = (y * W + x) * 4;
      img.data[i] = light[0] + (dark[0] - light[0]) * t;
      img.data[i + 1] = light[1] + (dark[1] - light[1]) * t;
      img.data[i + 2] = light[2] + (dark[2] - light[2]) * t;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  cache.set("wood", cv);
  return cv;
}

/** Texture de similicuir / tissu sombre pour le repose-poignet. */
export function grainTexture(): HTMLCanvasElement {
  const hit = cache.get("grain");
  if (hit) return hit;
  const S = 128;
  const cv = makeCanvas(S, S);
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const n = valueNoise(17, 32, 32);
  const r = rng(4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const v = 128 + (n(x / 4, y / 4) - 0.5) * 40 + (r() - 0.5) * 14;
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  cache.set("grain", cv);
  return cv;
}
