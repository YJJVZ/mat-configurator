"use client";
import { X } from "lucide-react";
import { PLAYMAT_LAYOUTS, ZONE_COLORS } from "@/config/catalog";
import { useConfigurator } from "@/store/useConfigurator";
import { Segmented, Switch } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

/**
 * Réglages des zones de jeu, affichés dans l'aperçu (comme « Mon setup » pour le tapis de souris)
 * et non dans la liste des options du produit.
 */
export function PlaymatPanel({ onClose }: { onClose: () => void }) {
  const c = useConfigurator((s) => s.config);
  const { patchPlaymat } = useConfigurator.getState();
  const p = c.playmat;
  const layout = PLAYMAT_LAYOUTS.find((l) => l.id === p.layoutId) ?? PLAYMAT_LAYOUTS[0];

  return (
    <div className="w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-card p-5 shadow-2xl ring-1 ring-border">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-display text-lg font-bold">Zones de jeu</div>
        <button type="button" onClick={onClose} aria-label="Fermer les réglages des zones" className="grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{layout.note} Modèles indicatifs, pas des gabarits officiels.</p>

      <Segmented label="Disposition" value={p.layoutId} cols={2} onChange={(v) => patchPlaymat({ layoutId: v, cardPos: {} })}
        options={PLAYMAT_LAYOUTS.map((l) => ({ value: l.id, label: l.label.replace("Disposition ", "") }))} />

      <div className="mt-4 space-y-1">
        <Switch label="Afficher les zones" checked={p.zonesVisible} onChange={(v) => patchPlaymat({ zonesVisible: v })} />
        <Switch label="Imprimer les zones sur le tapis" description={p.printZones ? "Les zones feront partie du visuel imprimé." : "Aide visuelle seulement, non imprimée."}
          checked={p.printZones} onChange={(v) => patchPlaymat({ printZones: v })} />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-medium">Couleur des zones</div>
        <div className="flex flex-wrap items-center gap-2">
          {ZONE_COLORS.map((col) => (
            <button key={col} type="button" aria-label={`Couleur ${col}`} aria-pressed={p.zoneColor === col} onClick={() => patchPlaymat({ zoneColor: col })}
              className={cn("h-11 w-11 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2", p.zoneColor === col ? "ring-2 ring-accent ring-offset-2" : "")}
              style={{ background: col }} />
          ))}
          <input type="color" value={p.zoneColor} onChange={(e) => patchPlaymat({ zoneColor: e.target.value })} aria-label="Couleur personnalisée des zones" className="h-11 w-14 cursor-pointer rounded-xl border-2 border-border bg-card p-1" />
        </div>
      </div>
    </div>
  );
}
