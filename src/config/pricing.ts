import type { EdgeId, Thickness } from "@/types/config";

/**
 * TARIFS FICTIFS — à remplacer par les vrais tarifs du fabricant.
 * Le moteur (src/lib/pricing.ts) ne contient aucune valeur en dur.
 */
export const PRICING = {
  basePerM2: { deskmat: 190, playmat: 160 },
  minimumBase: { deskmat: 19, playmat: 17 },
  thicknessMultiplier: { 3: 1, 4: 1.12, 5: 1.25 } as Record<Thickness, number>,
  edgeSurcharge: { black: 0, white: 0, custom: 4, none: -3 } as Record<EdgeId, number>,
  roundedCorners: 0, // même prix pour coins carrés et arrondis
  customSize: 5,
  uploadedImage: 2,
  rgb: { fixed: 14, perMeterOfEdge: 18 },
  wristRest: { fixed: 12, perCm: 0.18 },
  printedZones: 3,
  printedText: 2,
};
