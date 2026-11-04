"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Check, Keyboard, LayoutGrid, Move, RotateCcw, SlidersHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/controls";
import { cn } from "@/lib/utils";
import { computePrice, formatPrice } from "@/lib/pricing";
import { overflowing, peripheralRect, visiblePeripherals } from "@/lib/geometry";
import { useConfigurator } from "@/store/useConfigurator";
import { KEYBOARDS, PERIPHERAL_DEFS, SIZE_PRESETS } from "@/config/catalog";
import { SetupPanel, selectKeyboard } from "./SetupSection";
import { PlaymatPanel } from "./PlaymatSection";

const PreviewStage = dynamic(() => import("./PreviewStage").then((m) => m.PreviewStage), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Chargement de l'aperçu…</div>,
});

function Toggle({ active, onClick, icon, children, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode; label?: string }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active} aria-label={label}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm backdrop-blur transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-[0.96]",
        active ? "bg-accent text-accent-foreground shadow-[0_8px_20px_-8px_hsl(var(--accent)/0.8)]" : "bg-card/90 text-foreground ring-1 ring-border hover:-translate-y-0.5 hover:text-accent hover:shadow-md hover:ring-accent/50",
      )}
    >
      {icon}<span className="whitespace-nowrap">{children}</span>
    </button>
  );
}

export function PreviewPane() {
  const c = useConfigurator((s) => s.config);
  const view = useConfigurator((s) => s.view);
  const setupMode = useConfigurator((s) => s.setupMode);
  // Le cadrage n'a de sens qu'avec une image importée active.
  const framing = useConfigurator((s) => s.framing && s.config.designSource === "upload" && !!s.config.upload);
  const resetTransform = useConfigurator((s) => s.resetTransform);
  const setTransform = useConfigurator((s) => s.setTransform);
  const ui = useConfigurator((s) => s.ui);
  const setPreset = useConfigurator((s) => s.setPreset);
  const setSize = useConfigurator((s) => s.setSize);
  // « Personnalisé » : passe en taille libre puis fait défiler le panneau jusqu'aux curseurs Largeur / Profondeur.
  const goCustomSize = () => {
    setSize(c.width, c.depth);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => requestAnimationFrame(() =>
      document.getElementById("custom-size")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" })));
  };
  const isDesk = c.product === "deskmat";
  // Le setup n'existe qu'« En situation » ; la vue produit montre le tapis seul.
  const setupOn = setupMode && view === "scene" && !framing;

  const outOf = setupOn && isDesk
    ? visiblePeripherals(c).filter((id) => overflowing(c, peripheralRect(c, id))).map((id) => (id === "keyboard" ? "Le clavier" : PERIPHERAL_DEFS[id].label))
    : [];

  const [panelOpen, setPanelOpen] = useState(false);
  const showPanelButton = setupOn;

  return (
    <div className="relative h-full w-full">
      <PreviewStage />

      {framing && (
        <div className="animate-fade-up pointer-events-none absolute inset-x-0 top-0 flex justify-center p-3 sm:p-5">
          <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-card/95 p-3 pl-4 shadow-xl ring-1 ring-border backdrop-blur">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Move className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">Cadrez votre image</span>
              <span className="block text-[13px] text-muted-foreground">Glissez l'image pour la déplacer, molette pour zoomer. Pointillés = zone d'impression.</span>
            </span>
          </div>
        </div>
      )}
      {framing && (
        <div className="animate-fade-up pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-5">
          <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-card/95 p-4 shadow-2xl ring-1 ring-border backdrop-blur sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <Slider label="Zoom" value={c.imageTransform.scale} min={1} max={5} step={0.01} onChange={(v) => setTransform({ scale: v })} format={(v) => `${Math.round(v * 100)} %`} />
              <Slider label="Rotation" value={c.imageTransform.rotation} min={-180} max={180} step={1} onChange={(v) => setTransform({ rotation: v })} format={(v) => `${v}°`} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={resetTransform}><RotateCcw className="h-4 w-4" />Recentrer</Button>
              <Button className="flex-1 font-sans text-base sm:flex-none sm:px-10" onClick={() => ui({ framing: false })}><Check className="h-5 w-5" />Valider le cadrage</Button>
            </div>
          </div>
        </div>
      )}

      {!framing && (<>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-5">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <Toggle active={view === "product"} onClick={() => ui({ view: "product" })} icon={<Square className="h-4 w-4" />}>Vue produit</Toggle>
          {/* « En situation » = sur le bureau AVEC le setup (clavier, souris…) ou les zones de jeu */}
          <Toggle active={view === "scene"} onClick={() => ui({ view: "scene", setupMode: true })} icon={isDesk ? <Keyboard className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}>En situation</Toggle>
          {setupOn && isDesk && (
            <div role="radiogroup" aria-label="Taille du clavier" className="flex basis-full flex-wrap items-center gap-1 rounded-xl bg-card/90 p-1 shadow-sm ring-1 ring-border backdrop-blur sm:basis-auto">
              <span className="font-tech px-2 text-[11px] uppercase tracking-wider text-muted-foreground">Clavier</span>
              {KEYBOARDS.map((k) => {
                const on = c.setup.keyboard === k.id;
                return (
                  <button key={k.id} type="button" role="radio" aria-checked={on} title={`${k.label} · ${k.w} × ${k.h} cm`}
                    onClick={() => selectKeyboard(k.id)}
                    className={cn("font-tech h-9 min-w-[2.75rem] rounded-lg px-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-95",
                      on ? "bg-accent text-accent-foreground shadow" : "text-foreground hover:bg-muted hover:text-accent")}>
                    {k.short}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-3 sm:p-5">
        <div className="pointer-events-auto font-tech rounded-xl bg-card/90 px-4 py-2.5 text-sm text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur">
          {c.width} × {c.depth} cm · {c.thickness} mm
        </div>
        {showPanelButton && (
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            {panelOpen && <div className="animate-fade-up max-h-[calc(100vh-14rem)] overflow-y-auto rounded-2xl">{isDesk ? <SetupPanel onClose={() => setPanelOpen(false)} /> : <PlaymatPanel onClose={() => setPanelOpen(false)} />}</div>}
            <Button variant={panelOpen ? "default" : "outline"} size="sm" className={panelOpen ? "font-sans text-sm" : ""} onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}>
              <SlidersHorizontal className="h-4 w-4" />{isDesk ? "Réglages du setup" : "Zones de jeu"}
            </Button>
          </div>
        )}
      </div>

      {outOf.length > 0 && (
        <div role="alert" className="animate-fade-up pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 rounded-xl bg-destructive px-4 py-2 text-xs font-medium text-white shadow-lg sm:top-20">
          {outOf.join(", ")} {outOf.length > 1 ? "dépassent" : "dépasse"} du tapis
        </div>
      )}
      {/* Changement de taille direct sur l'aperçu : le setup reste fixe, seul le tapis change */}
      <div role="radiogroup" aria-label="Taille du tapis"
        className="absolute bottom-20 left-1/2 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center overflow-x-auto rounded-2xl bg-card/95 p-1.5 shadow-lg ring-1 ring-border backdrop-blur sm:bottom-24">
        {[
          ...SIZE_PRESETS[c.product].map((p) => ({ id: p.id, label: p.label, popular: p.popular, title: `${p.w} × ${p.d} cm${p.popular ? " · le plus populaire" : ""}`, cfg: { ...c, presetId: p.id, width: p.w, depth: p.d } })),
          { id: "custom", label: "Personnalisé", popular: false, title: "Taille au centimètre près (réglable dans l'étape Dimensions)", cfg: { ...c, presetId: "custom" } },
        ].map((o, i) => {
          const on = c.presetId === o.id;
          // Prix total de la configuration actuelle dans cette taille (options comprises).
          const price = formatPrice(computePrice(o.cfg).total);
          return (
            <span key={o.id} className="flex items-center">
              {i > 0 && <span aria-hidden className="mx-0.5 h-8 w-px shrink-0 bg-border" />}
              <button type="button" role="radio" aria-checked={on} title={o.title}
                onClick={() => (o.id === "custom" ? goCustomSize() : setPreset(o.id))}
                className={cn("relative flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-95 sm:px-4",
                  on ? "bg-accent text-accent-foreground shadow-[0_8px_20px_-8px_hsl(var(--accent)/0.8)]" : "text-foreground hover:-translate-y-0.5 hover:bg-muted hover:text-accent")}>
                {o.popular && <span aria-hidden className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-card" />}
                <span className={cn("font-tech whitespace-nowrap text-xs leading-tight", on ? "opacity-90" : "text-muted-foreground")}>{price}</span>
                <span className={cn("font-display whitespace-nowrap font-semibold leading-tight", o.id === "custom" ? "text-sm sm:text-base" : "text-base sm:text-lg")}>{o.label}</span>
              </button>
            </span>
          );
        })}
      </div>
      </>)}
    </div>
  );
}
