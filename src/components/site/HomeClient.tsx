"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SIZE_PRESETS } from "@/config/catalog";
import { computePrice, formatPrice } from "@/lib/pricing";
import { initialConfig } from "@/store/useConfigurator";

/** Prix d'appel : la plus petite taille standard, options par défaut (suit config/pricing.ts). */
export function FromPrice() {
  const base = initialConfig();
  const min = Math.min(
    ...(["deskmat", "playmat"] as const).flatMap((product) =>
      SIZE_PRESETS[product].map((p) => computePrice({ ...base, product, presetId: p.id, width: p.w, depth: p.d }).total),
    ),
  );
  return <>{formatPrice(min)}</>;
}

/** Les anciens liens de partage pointaient sur « / » : on les renvoie vers le configurateur. */
export function LegacyShareRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (/[#&]c=/.test(location.hash)) router.replace(`/configurer${location.hash}`);
  }, [router]);
  return null;
}
