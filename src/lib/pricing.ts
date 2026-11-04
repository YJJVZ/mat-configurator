import { PRICING } from "@/config/pricing";
import { CURRENCY, LOCALE } from "@/config/catalog";
import { peripheralSize } from "@/lib/geometry";
import type { ConfigState } from "@/types/config";

export interface PriceLine { id: string; label: string; amount: number }
export interface PriceBreakdown { currency: string; lines: PriceLine[]; total: number }


/** Moteur de tarification : fonction pure, toutes les valeurs viennent de config/pricing.ts. */
export function computePrice(c: ConfigState): PriceBreakdown {
  const lines: PriceLine[] = [];
  const areaM2 = (c.width * c.depth) / 10000;
  const base = Math.max(PRICING.minimumBase[c.product], areaM2 * PRICING.basePerM2[c.product]);
  lines.push({ id: "base", label: `Tapis ${c.width} × ${c.depth} cm`, amount: base });

  const mult = PRICING.thicknessMultiplier[c.thickness];
  if (mult !== 1) lines.push({ id: "thickness", label: `Épaisseur ${c.thickness} mm`, amount: base * (mult - 1) });

  const edge = PRICING.edgeSurcharge[c.edge];
  if (edge) lines.push({ id: "edge", label: c.edge === "none" ? "Sans couture" : "Bords cousus couleur", amount: edge });
  if (c.corners === "rounded" && PRICING.roundedCorners) lines.push({ id: "corners", label: "Coins arrondis", amount: PRICING.roundedCorners });

  if (c.presetId === "custom") lines.push({ id: "custom-size", label: "Taille personnalisée", amount: PRICING.customSize });
  if (c.designSource === "upload") lines.push({ id: "upload", label: "Impression de votre image", amount: PRICING.uploadedImage });

  if (c.rgb) {
    const perimM = (2 * (c.width + c.depth)) / 100;
    lines.push({ id: "rgb", label: "Éclairage RGB", amount: PRICING.rgb.fixed + perimM * PRICING.rgb.perMeterOfEdge });
  }
  if (c.product === "deskmat" && c.wristRest) {
    lines.push({ id: "wrist", label: "Repose-poignet séparé", amount: PRICING.wristRest.fixed + peripheralSize(c, "wristrest").w * PRICING.wristRest.perCm });
  }
  if (c.product === "playmat") {
    if (c.playmat.printZones && c.playmat.layoutId !== "blank") lines.push({ id: "zones", label: "Zones imprimées", amount: PRICING.printedZones });
    if (c.playmat.printText && c.playmat.text.trim()) lines.push({ id: "text", label: "Texte imprimé", amount: PRICING.printedText });
  }
  // Prix affichés en euros ronds : chaque ligne est arrondie, le total reste égal à leur somme.
  const rounded = lines.map((l) => ({ ...l, amount: Math.round(l.amount) }));
  return { currency: CURRENCY, lines: rounded, total: rounded.reduce((s, l) => s + l.amount, 0) };
}

export const formatPrice = (n: number, currency = CURRENCY) =>
  new Intl.NumberFormat(LOCALE, { style: "currency", currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n));
