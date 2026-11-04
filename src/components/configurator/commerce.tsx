"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Clock, Code2, Flag, FolderOpen, Link2, Lock, RotateCcw, Save, ShieldCheck, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { getDesign } from "@/config/designs";
import { GUARANTEES, type GuaranteeIcon } from "@/config/shop";
import { peripheralSize } from "@/lib/geometry";
import { shareUrl } from "@/lib/share";
import { exportPreviewPng } from "@/lib/stageRegistry";
import { PLAYMAT_LAYOUTS } from "@/config/catalog";
import { formatPrice, computePrice } from "@/lib/pricing";
import { downloadJson } from "@/lib/stageRegistry";
import { useConfigurator } from "@/store/useConfigurator";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

/** Total qui défile jusqu'à sa nouvelle valeur, avec une pastille « +12 € » éphémère. */
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const [delta, setDelta] = useState<{ v: number; key: number } | null>(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return;
    setDelta({ v: to - from, key: Date.now() });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(to); return; }
    const t0 = performance.now(), dur = 450;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="relative inline-block">
      <span key={delta?.key} className={cn("inline-block", delta && "animate-bump", className)} aria-live="polite">{formatPrice(shown)}</span>
      {delta && (
        <span key={`d${delta.key}`} aria-hidden
          className={cn("animate-float-up font-tech absolute -top-5 right-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
            delta.v > 0 ? "bg-accent/15 text-accent" : "bg-foreground/10 text-foreground")}>
          {delta.v > 0 ? "+" : "−"}{formatPrice(Math.abs(delta.v))}
        </span>
      )}
    </span>
  );
}

export function PriceBar({ compact = false }: { compact?: boolean }) {
  const c = useConfigurator((s) => s.config);
  const addToCart = useConfigurator((s) => s.addToCart);
  const price = computePrice(c);
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(!compact && "space-y-3")}>
      {!compact && (
        <>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="min-h-[44px] text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-accent">
            {open ? "Masquer le détail" : "Voir le détail du prix"}
          </button>
          {open && (
            <ul className="space-y-1 text-xs">
              {price.lines.map((l) => (
                <li key={l.id} className="flex justify-between"><span className="text-muted-foreground">{l.label}</span><span className="tabular-nums">{l.amount < 0 ? "−" : ""}{formatPrice(Math.abs(l.amount))}</span></li>
              ))}
            </ul>
          )}
        </>
      )}
      <div className="flex items-end justify-between gap-4">
        <div className="shrink-0">
          <div className="font-tech mb-1 text-[11px] uppercase tracking-wider text-accent">Total</div>
          <div className={cn("font-display font-bold leading-none text-foreground", compact ? "text-4xl" : "text-6xl")}><AnimatedPrice value={price.total} /></div>
        </div>
        <Button size="default" className={cn(compact ? "px-5" : "flex-1")} onClick={() => useConfigurator.getState().ui({ recapOpen: true })}>
          <ShoppingBag className="h-4 w-4" />Ajouter au panier
        </Button>
      </div>
      <Guarantees compact={compact} />
    </div>
  );
}

const GUARANTEE_ICONS: Record<GuaranteeIcon, typeof Truck> = { truck: Truck, shield: ShieldCheck, lock: Lock, return: RotateCcw, flag: Flag, clock: Clock };

/** Ligne d'engagements (livraison, vérification du fichier…), définie dans config/shop.ts. */
export function Guarantees({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-muted-foreground", compact ? "mt-2 text-[11px]" : "text-[13px]", className)}>
      {GUARANTEES.map((g) => {
        const Icon = GUARANTEE_ICONS[g.icon];
        return <li key={g.text} className="flex items-center gap-1.5"><Icon className={cn("shrink-0 text-accent", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />{compact ? g.short : g.text}</li>;
      })}
    </ul>
  );
}

/** Récapitulatif avant l'ajout : vignette du tapis + toutes les options, pour éviter les erreurs de commande. */
export function RecapDialog() {
  const open = useConfigurator((s) => s.recapOpen);
  const c = useConfigurator((s) => s.config);
  const { ui, addToCart } = useConfigurator.getState();
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => { if (open) setThumb(exportPreviewPng()); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ui({ recapOpen: false });
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, ui]);
  if (!open) return null;

  const price = computePrice(c);
  const isDesk = c.product === "deskmat";
  const edge = c.rgb ? "Éclairage RGB" : c.edge === "black" ? "Cousus noirs" : c.edge === "white" ? "Cousus blancs" : "Sans couture";
  const rows: [string, string][] = [
    ["Produit", isDesk ? "Tapis de souris" : "Playmat TCG"],
    ["Design", c.designSource === "upload" && c.upload ? `Votre image (${c.upload.name})` : getDesign(c.designId).name],
    ["Dimensions", `${c.width} × ${c.depth} cm`],
    ["Coins", c.corners === "rounded" ? "Arrondis" : "Carrés"],
    ["Bordures", edge],
    ["Épaisseur", `${c.thickness} mm`],
  ];
  if (isDesk) rows.push(["Repose-poignet", c.wristRest ? `Oui, ${peripheralSize(c, "wristrest").w} cm` : "Non"]);
  if (!isDesk && c.playmat.printZones && c.playmat.layoutId !== "blank")
    rows.push(["Zones imprimées", PLAYMAT_LAYOUTS.find((l) => l.id === c.playmat.layoutId)?.label.replace("Disposition ", "") ?? "Oui"]);

  const confirm = () => { ui({ recapOpen: false }); addToCart(); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="recap-title">
      <div className="absolute inset-0 animate-fade-up bg-black/50 backdrop-blur-sm" onClick={() => ui({ recapOpen: false })} />
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg animate-fade-up overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recap-title" className="font-display text-xl font-bold">Votre création</h2>
          <Button variant="ghost" size="icon" aria-label="Fermer" onClick={() => ui({ recapOpen: false })}><X className="h-5 w-5" /></Button>
        </div>
        <div className="studio-backdrop grid place-items-center rounded-xl p-4">
          {thumb
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={thumb} alt="Aperçu de votre tapis" className={cn("max-h-56 w-auto max-w-full shadow-xl", c.corners === "rounded" ? "rounded-lg" : "")} />
            : <div className="h-32" />}
        </div>
        <dl className="mt-5 divide-y divide-border text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0 truncate text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t-2 border-foreground pt-4">
          <span className="font-tech text-xs uppercase tracking-wider text-accent">Total</span>
          <span className="font-display text-4xl font-bold">{formatPrice(price.total)}</span>
        </div>
        <Guarantees className="mt-3" />
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" className="h-14 sm:flex-none" onClick={() => ui({ recapOpen: false })}>Modifier</Button>
          <Button className="flex-1" onClick={confirm} autoFocus><Check className="h-5 w-5" />Confirmer et ajouter</Button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsBar() {
  const projects = useConfigurator((s) => s.projects);
  const { saveProject, loadProject, deleteProject } = useConfigurator.getState();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState(false);

  const config = useConfigurator((s) => s.config);
  const share = async () => {
    const { url, imageDropped } = shareUrl(config);
    try {
      await navigator.clipboard.writeText(url);
      setMsg({ ok: true, text: imageDropped ? "Lien copié. L'image importée n'est pas incluse dans le lien." : "Lien de partage copié dans le presse-papiers." });
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  };

  const save = () => {
    const ok = saveProject(name || `Projet ${projects.length + 1}`);
    setMsg(ok ? { ok, text: "Projet sauvegardé sur cet appareil." } : { ok, text: "Sauvegarde impossible : stockage local plein." });
    if (ok) setName("");
  };

  return (
    <div className="py-6">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="font-display flex min-h-[44px] w-full items-center justify-between text-[17px] font-semibold">
        <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" />Sauvegarder & partager <span className="text-xs font-normal text-muted-foreground">({projects.length})</span></span>
        <span className="text-xs font-normal text-muted-foreground">{open ? "Réduire" : "Ouvrir"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du projet" aria-label="Nom du projet" onKeyDown={(e) => e.key === "Enter" && save()}
              className="h-11 min-w-0 flex-1 rounded-xl border-2 border-border bg-card px-4 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/20" />
            <Button size="sm" className="font-sans text-sm" onClick={save}><Save className="h-4 w-4" />Sauvegarder</Button>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={share}><Link2 className="h-4 w-4" />Copier le lien de partage</Button>
          {msg && <Alert tone={msg.ok ? "success" : "danger"}>{msg.text}</Alert>}
          {projects.length === 0 && <p className="text-xs text-muted-foreground">Aucun projet sauvegardé.</p>}
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-sm border border-border bg-card px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.config.product === "deskmat" ? "Tapis de souris" : "Playmat"} · {p.config.width}×{p.config.depth} cm · {new Date(p.savedAt).toLocaleDateString("fr-FR")}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="outline" size="sm" onClick={() => loadProject(p.id)}>Ouvrir</Button>
                  <Button variant="ghost" size="icon" aria-label={`Supprimer ${p.name}`} onClick={() => deleteProject(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CartDrawer() {
  const open = useConfigurator((s) => s.cartOpen);
  const cart = useConfigurator((s) => s.cart);
  const lastAdded = useConfigurator((s) => s.lastAddedId);
  const ui = useConfigurator((s) => s.ui);
  const remove = useConfigurator((s) => s.removeFromCart);
  const [json, setJson] = useState<string | null>(null);
  if (!open) return null;
  const total = cart.reduce((s, i) => s + i.price.total, 0);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Panier">
      <div className="absolute inset-0 bg-black/40" onClick={() => ui({ cartOpen: false })} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-fade-up flex-col bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Panier ({cart.length})</h2>
          <Button variant="ghost" size="icon" aria-label="Fermer" onClick={() => ui({ cartOpen: false })}><X className="h-4 w-4" /></Button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <Alert>Prototype : aucune commande ni paiement réel. Le panier est conservé localement sur cet appareil.</Alert>
          {cart.length === 0 && <p className="text-sm text-muted-foreground">Votre panier est vide.</p>}
          {cart.map((i) => (
            <article key={i.id} className={cn("rounded border bg-card p-4", i.id === lastAdded ? "border-accent" : "border-border")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {i.id === lastAdded && <Check className="h-4 w-4 text-success" />}
                    {i.product === "deskmat" ? "Tapis de souris" : "Playmat TCG"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {i.dimensions.widthCm} × {i.dimensions.depthCm} cm · {i.dimensions.thicknessMm} mm · coins {i.finishes.corners === "rounded" ? "arrondis" : "carrés"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Design : {i.design.source === "upload" ? `image importée (${i.design.upload?.fileName})` : i.design.presetId} · bords {i.finishes.edge}
                    {i.options.rgb ? " · RGB" : ""}{i.options.wristRest ? " · repose-poignet" : ""}
                  </div>
                </div>
                <div className="font-tech text-sm font-medium">{formatPrice(i.price.total)}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadJson(i, `commande-${i.id}.json`)}><Code2 className="h-4 w-4" />Télécharger le JSON</Button>
                <Button variant="ghost" size="sm" onClick={() => setJson(json === i.id ? null : i.id)}>{json === i.id ? "Masquer" : "Voir"}</Button>
                <Button variant="ghost" size="icon" aria-label="Retirer" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              {json === i.id && <pre className="mt-3 max-h-64 overflow-auto rounded-sm bg-muted p-3 text-[11px] leading-relaxed">{JSON.stringify(i, null, 2)}</pre>}
            </article>
          ))}
        </div>
        <footer className="border-t border-border p-5">
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Sous-total</span><span className="font-tech font-medium">{formatPrice(total)}</span></div>
          <Button className="mt-3 w-full" disabled title="Non disponible dans ce prototype">Passer commande (indisponible)</Button>
        </footer>
      </aside>
    </div>
  );
}
