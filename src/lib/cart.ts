import type { CartItem, ConfigState } from "@/types/config";
import { computePrice } from "@/lib/pricing";
import { imageQuality } from "@/lib/imageQuality";
import { peripheralSize, playmatZones } from "@/lib/geometry";
import { uid } from "@/lib/utils";

/**
 * Transforme la configuration en objet JSON exploitable par un futur backend e-commerce.
 * L'image importée n'est pas embarquée (poids) : seule sa référence/ses métadonnées sont conservées.
 */
export function buildCartItem(c: ConfigState): CartItem {
  const price = computePrice(c);
  const isPlay = c.product === "playmat";
  const up = c.designSource === "upload" ? c.upload : null;
  return {
    id: uid(),
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    product: c.product,
    dimensions: { widthCm: c.width, depthCm: c.depth, thicknessMm: c.thickness },
    design: {
      source: c.designSource,
      presetId: c.designSource === "preset" ? c.designId : null,
      upload: up
        ? {
            fileName: up.name, pixelWidth: up.width, pixelHeight: up.height,
            effectiveDpi: imageQuality({ w: up.width, h: up.height }, { w: c.width, h: c.depth }, c.imageTransform).dpi,
            transform: c.imageTransform,
          }
        : null,
    },
    finishes: { edge: c.edge, edgeColor: c.edge === "custom" ? c.edgeColor : null, corners: c.corners },
    options: { rgb: c.rgb, wristRest: c.product === "deskmat" && c.wristRest, wristRestWidthCm: c.product === "deskmat" && c.wristRest ? peripheralSize(c, "wristrest").w : null },
    price: { currency: price.currency, total: price.total, lines: price.lines },
    playmat: isPlay
      ? {
          layoutId: c.playmat.layoutId,
          printedZones: c.playmat.printZones,
          zoneColor: c.playmat.zoneColor,
          zones: c.playmat.printZones ? playmatZones(c).map((z) => ({ id: z.id, label: z.label, xCm: r(z.x), yCm: r(z.y), wCm: r(z.w), hCm: r(z.h) })) : [],
          printedText:
            c.playmat.printText && c.playmat.text.trim()
              ? { value: c.playmat.text, xCm: r((c.playmat.textPos ?? { x: c.width / 2, y: c.depth - 4 }).x), yCm: r((c.playmat.textPos ?? { x: c.width / 2, y: c.depth - 4 }).y), color: c.playmat.textColor }
              : null,
        }
      : null,
    production: { status: "not_generated", bleedMm: null, colorProfile: null, resolutionDpi: null },
  };
}
const r = (n: number) => Math.round(n * 10) / 10;
