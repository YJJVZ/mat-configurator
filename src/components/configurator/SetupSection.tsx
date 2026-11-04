"use client";
import { RotateCcw, X } from "lucide-react";
import { KEYBOARDS, MOUSE_COMFORT_CM, PERIPHERAL_DEFS } from "@/config/catalog";
import { cn } from "@/lib/utils";
import { mouseSpace, overflowing, peripheralRect, visiblePeripherals } from "@/lib/geometry";
import { useConfigurator } from "@/store/useConfigurator";
import { Button } from "@/components/ui/button";
import { Alert, Switch } from "@/components/ui/controls";
import type { KeyboardId, PeripheralId } from "@/types/config";

/** Change le format de clavier et replace les périphériques autour. */
export function selectKeyboard(id: KeyboardId) {
  const { config, patchSetup, ui } = useConfigurator.getState();
  patchSetup({ keyboard: id, keyboardCustom: null, pos: { ...config.setup.pos, keyboard: undefined, numpad: undefined, mouse: undefined, wristrest: undefined } });
  ui({ setupMode: true, view: "scene" });
}

/**
 * Réglages du visualiseur de setup, affichés dans l'aperçu (et non dans la liste des options du produit) :
 * les périphériques servent seulement à juger la taille du tapis, ils ne sont jamais imprimés ni vendus.
 */
export function SetupPanel({ onClose }: { onClose: () => void }) {
  const c = useConfigurator((s) => s.config);
  const { patchSetup, toggleDevice } = useConfigurator.getState();
  const ms = mouseSpace(c);
  const out = visiblePeripherals(c).filter((id) => overflowing(c, peripheralRect(c, id)));
  const label = (id: PeripheralId) => (id === "keyboard" ? "Clavier" : PERIPHERAL_DEFS[id].label);

  return (
    <div className="w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-card p-5 shadow-2xl ring-1 ring-border">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-display text-lg font-bold">Mon setup</div>
        <button type="button" onClick={onClose} aria-label="Fermer les réglages du setup" className="grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">À l'échelle réelle. Glissez les éléments sur le tapis. Ils ne sont jamais imprimés.</p>

      <div className="space-y-1">
        <div>
          <Switch label="Clavier" checked={c.setup.show.keyboard} onChange={(v) => toggleDevice("keyboard", v)} />
          {
            <div role="radiogroup" aria-label="Taille du clavier" className="mb-2 mt-1 grid grid-cols-3 gap-2">
              {KEYBOARDS.map((k) => {
                const on = c.setup.show.keyboard && c.setup.keyboard === k.id;
                return (
                  <button key={k.id} type="button" role="radio" aria-checked={on} title={`${k.label} · ${k.w} × ${k.h} cm`} onClick={() => { selectKeyboard(k.id); if (!c.setup.show.keyboard) toggleDevice("keyboard", true); }}
                    className={cn("font-tech h-11 rounded-xl border-2 text-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30",
                      on ? "border-accent bg-accent text-accent-foreground shadow" : "border-border bg-card hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent")}>
                    {k.short}
                  </button>
                );
              })}
            </div>
          }
        </div>
        <Switch label="Souris" checked={c.setup.show.mouse} onChange={(v) => toggleDevice("mouse", v)} />
        <Switch label="Pavé numérique indépendant" checked={c.setup.show.numpad} onChange={(v) => toggleDevice("numpad", v)} />
        <Switch label="Repose-poignet" checked={c.setup.show.wristrest} onChange={(v) => toggleDevice("wristrest", v)} />
        <Switch label="Écran / pied d'écran" checked={c.setup.show.monitor} onChange={(v) => toggleDevice("monitor", v)} />
      </div>

      <div className="mt-4 space-y-2">
        {out.length > 0 && <Alert tone="danger">Dépasse du tapis : {out.map(label).join(", ")}.</Alert>}
        {c.setup.show.mouse && (
          <Alert tone={ms.best >= MOUSE_COMFORT_CM ? "success" : "warning"}>
            Espace souris : {ms.rightCm} cm à droite, {ms.leftCm} cm à gauche.
            {ms.best >= MOUSE_COMFORT_CM ? " Confortable." : ` Un peu juste (confort ≥ ${MOUSE_COMFORT_CM} cm).`}
          </Alert>
        )}
      </div>
      <Button variant="outline" size="sm" className="mt-3" onClick={() => patchSetup({ pos: {} })}><RotateCcw className="h-4 w-4" />Replacer les périphériques</Button>
    </div>
  );
}
