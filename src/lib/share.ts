import type { ConfigState } from "@/types/config";

/**
 * Lien de partage : la configuration est encodée dans l'adresse (#c=…), sans serveur.
 * L'image importée n'y figure pas (trop lourde pour une URL).
 */
const KEY = "c";

const toB64Url = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64Url = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));

export function shareUrl(c: ConfigState): { url: string; imageDropped: boolean } {
  const imageDropped = c.designSource === "upload" && !!c.upload;
  const light: ConfigState = { ...c, upload: null, designSource: imageDropped ? "preset" : c.designSource };
  const url = `${location.origin}${location.pathname}#${KEY}=${toB64Url(JSON.stringify(light))}`;
  return { url, imageDropped };
}

export function readSharedConfig(): Partial<ConfigState> | null {
  try {
    const m = location.hash.match(new RegExp(`[#&]${KEY}=([^&]+)`));
    return m ? (JSON.parse(fromB64Url(m[1])) as Partial<ConfigState>) : null;
  } catch {
    return null;
  }
}
