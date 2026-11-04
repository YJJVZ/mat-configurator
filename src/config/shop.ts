/**
 * Engagements affichés sous le bouton « Ajouter au panier » et dans le récapitulatif.
 * N'ajouter ici que des promesses réelles (délai d'expédition, retours, fabrication…).
 */
export type GuaranteeIcon = "truck" | "shield" | "lock" | "return" | "flag" | "clock";

export const GUARANTEES: { icon: GuaranteeIcon; text: string; short: string }[] = [
  { icon: "truck", text: "Livraison gratuite en France métropolitaine", short: "Livraison gratuite" },
  { icon: "clock", text: "Expédié sous 48 h", short: "Expédié sous 48 h" },
  { icon: "shield", text: "Fichier vérifié par notre équipe avant impression", short: "Fichier vérifié" },
  // À compléter avec vos vraies conditions, par exemple :
  // { icon: "return", text: "Retours sous 30 jours", short: "Retours 30 j" },
  // { icon: "lock", text: "Paiement sécurisé", short: "Paiement sécurisé" },
];
