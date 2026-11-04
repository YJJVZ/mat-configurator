"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Move, ShieldCheck, Trash2 } from "lucide-react";
import { DESIGNS } from "@/config/designs";
import { imageQuality, readImageFile, validateImageFile } from "@/lib/imageQuality";
import { cn } from "@/lib/utils";
import { IDENTITY, useConfigurator } from "@/store/useConfigurator";
import { Button } from "@/components/ui/button";
import { Alert, Section, Segmented } from "@/components/ui/controls";

export function DesignSection() {
  const c = useConfigurator((s) => s.config);
  const framing = useConfigurator((s) => s.framing);
  const { patch, setUpload } = useConfigurator.getState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    const v = validateImageFile(file);
    if (!v.ok) return setError(v.error ?? "Fichier invalide.");
    setBusy(true);
    try {
      const img = await readImageFile(file);
      setUpload({ dataUrl: img.dataUrl, name: file.name, width: img.width, height: img.height, sizeBytes: file.size });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import impossible.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const currentCategory = DESIGNS.find((d) => d.id === c.designId)?.category ?? "basic";
  const [tab, setTab] = useState<"basic" | "gallery" | "upload">(c.designSource === "upload" ? "upload" : currentCategory);
  // Suit les changements venus d'ailleurs (import d'image, chargement de projet, « Retirer »).
  useEffect(() => {
    setTab((t) => (c.designSource === "upload" ? "upload" : t === "upload" ? currentCategory : t));
  }, [c.designSource, currentCategory]);

  const onTab = (v: "basic" | "gallery" | "upload") => {
    if (v === "upload") {
      if (!up) return inputRef.current?.click();
      setTab("upload");
      return patch({ designSource: "upload" });
    }
    setTab(v);
    patch({ designSource: "preset" });
  };

  const designs = DESIGNS.filter((d) => d.products.includes(c.product) && d.category === tab);
  const up = c.upload;
  const q = up && c.designSource === "upload" ? imageQuality({ w: up.width, h: up.height }, { w: c.width, h: c.depth }, c.imageTransform) : null;

  return (
    <Section title="Design" step="02">
      {/* Personnaliser : action principale, mise en avant au-dessus des designs prêts à l'emploi */}
      <button type="button" onClick={() => onTab("upload")} aria-pressed={tab === "upload"}
        className={cn(
          "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-accent px-5 py-5 text-left text-accent-foreground transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40",
          "shadow-[0_12px_28px_-12px_hsl(var(--accent)/0.9)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_32px_-12px_hsl(var(--accent)/1)] active:scale-[0.98]",
          tab === "upload" && "ring-4 ring-accent/30",
        )}>
        {/* reflet qui balaie le bouton au survol */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <ImagePlus className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="font-display block text-xl font-bold leading-tight">Personnaliser</span>
          <span className="block text-sm opacity-90">Importez votre propre image</span>
        </span>
      </button>

      <Segmented
        label="Designs prêts à l'emploi" value={tab} cols={2} onChange={onTab} className="mt-4"
        options={[{ value: "basic", label: "Couleur" }, { value: "gallery", label: "Galerie" }]}
      />

      {tab !== "upload" && (
        <div key={tab} className="animate-fade-up mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Designs prédéfinis">
          {designs.map((d) => {
            const active = d.id === c.designId;
            return (
              <button
                key={d.id} role="radio" aria-checked={active} type="button" title={d.name} onClick={() => patch({ designId: d.id })}
                className={cn("group text-left focus-visible:outline-none")}
              >
                <span className={cn("relative block aspect-[3/2] overflow-hidden rounded-xl border-[3px] transition-all duration-200 group-focus-visible:ring-4 group-focus-visible:ring-accent/30",
                  active ? "border-accent shadow-[0_8px_20px_-10px_hsl(var(--accent)/0.8)]" : "border-border/60 group-hover:-translate-y-0.5 group-hover:border-accent/40 group-hover:shadow-lg")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.src} alt={d.name} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" draggable={false} />
                  {active && (
                    <span className="animate-pop absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground shadow">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className={cn("mt-1.5 block truncate text-[13px]", active ? "font-semibold" : "text-muted-foreground")}>{d.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Importer une image" onChange={(e) => onFile(e.target.files?.[0])} />

      {c.designSource === "upload" && (
        <div className="mt-4 space-y-3">
          {/* Une fois l'image validée, le cadrage n'est plus modifiable ici : seulement via « Modifier le cadrage ». */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              <ImagePlus className="h-4 w-4" />{up ? "Remplacer l'image" : "Importer une image"}
            </Button>
            {up && (
              <Button variant="outline" size="sm" disabled={framing} onClick={() => useConfigurator.getState().ui({ framing: true, view: "product" })}>
                <Move className="h-4 w-4" />{framing ? "Cadrage en cours…" : "Modifier le cadrage"}
              </Button>
            )}
            {up && (
              <Button variant="ghost" size="sm" onClick={() => patch({ upload: null, designSource: "preset", imageTransform: IDENTITY })}>
                <Trash2 className="h-4 w-4" />Retirer
              </Button>
            )}
          </div>
          {up && <p className="truncate text-xs text-muted-foreground">{up.name} · {up.width}×{up.height} px</p>}
          {!up && <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Plus votre image est grande, meilleure sera l'impression.</p>}
          {up && (
            <div className="flex items-start gap-2.5 rounded-xl bg-accent/[0.07] px-4 py-3 text-[13px] leading-relaxed">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span><strong className="font-semibold">Votre fichier sera vérifié par notre équipe avant impression.</strong></span>
            </div>
          )}
          {up && q && <Alert tone={q.level === "good" ? "success" : q.level === "low" ? "warning" : "danger"}>{q.message}</Alert>}
        </div>
      )}
      {error && <div className="mt-3"><Alert tone="danger">{error}</Alert></div>}
    </Section>
  );
}
