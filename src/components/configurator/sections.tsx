"use client";
import { Keyboard, LayoutGrid } from "lucide-react";
import { KEYBOARDS, WRIST_REST_SIZES, SIZE_LIMITS, SIZE_PRESETS, THICKNESSES, EDGES } from "@/config/catalog";
import { getConstraints } from "@/lib/compat";
import { peripheralSize } from "@/lib/geometry";
import { computePrice, formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { initialConfig, useConfigurator } from "@/store/useConfigurator";
import { Alert, FieldLabel, ReasonList, Section, Segmented, Slider } from "@/components/ui/controls";
import type { ConfigState, ProductType } from "@/types/config";

/* ---------- Petits visuels des choix ---------- */

/** Rectangle proportionnel au format du tapis. */
function MatShape({ w, d, max = 120 }: { w: number; d: number; max?: number }) {
  const k = 52 / max;
  return (
    <span className="grid h-9 w-14 place-items-center">
      <span className="block rounded-[3px] border-2 border-current transition-all duration-300" style={{ background: "color-mix(in srgb, currentColor 14%, transparent)", width: Math.max(10, w * k), height: Math.max(8, d * k) }} />
    </span>
  );
}

function CornerShape({ rounded }: { rounded: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
      <path d={rounded ? "M4 26 V14 Q4 4 14 4 H26" : "M4 26 V4 H26"} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Mini-tapis montrant le type de bord. */
function EdgeSwatch({ kind }: { kind: "black" | "white" | "none" | "rgb" }) {
  if (kind === "rgb")
    return (
      <span className="rgb-ring block rounded-md p-[3px] shadow-[0_0_12px_rgba(120,90,255,.45)]">
        <span className="block h-6 w-10 rounded-[4px] bg-neutral-800" />
      </span>
    );
  return (
    <span className={cn("relative block h-[30px] w-[46px] rounded-md bg-neutral-300", kind === "black" && "ring-[3px] ring-neutral-900", kind === "white" && "ring-[3px] ring-white shadow-[0_0_0_4px_rgba(0,0,0,.12)]")}>
      {kind !== "none" && <span className={cn("absolute inset-[3px] rounded-[3px] border border-dashed", kind === "black" ? "border-neutral-500" : "border-neutral-400")} />}
    </span>
  );
}

/** Couches empilées proportionnelles à l'épaisseur. */
function ThicknessShape({ mm }: { mm: number }) {
  return (
    <span className="flex h-8 w-14 items-end justify-center">
      <span className="block w-12 rounded-[3px] bg-current shadow-[inset_0_2px_0_rgba(255,255,255,.35)] transition-all duration-300" style={{ height: mm * 4.5 }} />
    </span>
  );
}

/** Prix le plus bas d'un produit : plus petite taille standard, options par défaut. */
function startingPrice(product: ProductType) {
  const base = initialConfig();
  return Math.min(...SIZE_PRESETS[product].map((p) => computePrice({ ...base, product, presetId: p.id, width: p.w, depth: p.d, wristRest: false, rgb: false }).total));
}

/* ---------- Étapes ---------- */

export function ProductSection() {
  const product = useConfigurator((s) => s.config.product);
  const setProduct = useConfigurator((s) => s.setProduct);
  const items: { id: ProductType; title: string; text: string; icon: React.ReactNode }[] = [
    { id: "deskmat", title: "Tapis de souris", text: "Pour les setups PC, bureaux et gamers.", icon: <Keyboard className="h-6 w-6" /> },
    { id: "playmat", title: "Playmat TCG", text: "Pour les joueurs de cartes à collectionner.", icon: <LayoutGrid className="h-6 w-6" /> },
  ];
  return (
    <Section title="Type" step="01">
      <div role="radiogroup" aria-label="Type de produit" className="grid grid-cols-2 gap-3">
        {items.map((it) => {
          const active = it.id === product;
          return (
            <button
              key={it.id} role="radio" aria-checked={active} type="button" onClick={() => setProduct(it.id)}
              className={cn("group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30",
                active ? "border-accent bg-accent/[0.06] shadow-[0_10px_24px_-12px_hsl(var(--accent)/0.6)]" : "border-border bg-card hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg active:scale-[0.98]")}
            >
              <span className={cn("mb-4 grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6",
                active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground")}>{it.icon}</span>
              <span className="font-display block text-lg font-bold">{it.title}</span>
              <span className="mt-0.5 block text-sm">
                <span className="text-muted-foreground">à partir de </span>
                <span className="font-tech font-semibold text-accent">{formatPrice(startingPrice(it.id))}</span>
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{it.text}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

export function SizeSection() {
  const c = useConfigurator((s) => s.config);
  const { setPreset, setSize } = useConfigurator.getState();
  const lim = SIZE_LIMITS[c.product];
  const presets = SIZE_PRESETS[c.product];
  const maxW = Math.max(...presets.map((p) => p.w), lim.maxW * 0.85);
  const priceAt = (cfg: ConfigState) => formatPrice(computePrice(cfg).total);
  return (
    <Section title="Dimensions" step="03">
      <Segmented
        label="Format" value={c.presetId} onChange={(v) => (v === "custom" ? setSize(c.width, c.depth) : setPreset(v))} cols={c.product === "deskmat" ? 3 : 2} stacked
        options={[
          ...presets.map((p) => ({
            value: p.id,
            badge: p.popular ? "Le plus populaire" : undefined,
            visual: <MatShape w={p.w} d={p.d} max={maxW} />,
            label: p.use ? <span className="font-display text-xl leading-none">{p.label}</span> : p.label,
            hint: (
              <>
                {p.use && <span className="block">{p.w} × {p.d} cm</span>}
                <span className="font-tech mt-0.5 block font-medium text-foreground">{priceAt({ ...c, presetId: p.id, width: p.w, depth: p.d })}</span>
              </>
            ),
          })),
          {
            value: "custom", visual: <span className="grid h-9 w-14 place-items-center text-2xl font-light leading-none">↔</span>,
            label: "Personnalisé", hint: "Au centimètre près",
          },
        ]}
      />
      {c.presetId === "custom" && (
        <div id="custom-size" className="animate-fade-up mt-5 scroll-mt-6 space-y-6 rounded-2xl border-2 border-accent/30 bg-card p-5">
          <Slider label="Largeur" value={c.width} min={lim.minW} max={lim.maxW} step={1} onChange={(w) => setSize(w, c.depth)} format={(v) => `${v} cm`} />
          <Slider label="Profondeur" value={c.depth} min={lim.minD} max={lim.maxD} step={1} onChange={(d) => setSize(c.width, d)} format={(v) => `${v} cm`} />
        </div>
      )}
    </Section>
  );
}

export function FinishSection() {
  const c = useConfigurator((s) => s.config);
  const patch = useConfigurator((s) => s.patch);
  // L'éclairage RGB est proposé comme un type de bord (il s'appuie sur une couture noire).
  // Les raisons sont calculées comme si l'on basculait, pour ne pas bloquer le passage RGB ↔ sans couture.
  const edgeReasons = getConstraints({ ...c, rgb: false }).edge;
  const rgbReason = getConstraints({ ...c, edge: "black" }).rgb;
  type EdgeChoice = "black" | "white" | "rgb" | "none";
  const edgeValue: EdgeChoice = c.rgb ? "rgb" : c.edge === "white" || c.edge === "none" ? c.edge : "black";
  const edgeOptions = [
    ...EDGES.map((e) => ({ value: e.id as EdgeChoice, label: e.label, hint: e.description, reason: edgeReasons[e.id], visual: <EdgeSwatch kind={e.id as EdgeChoice} /> })),
    { value: "rgb" as EdgeChoice, label: "Éclairage RGB", hint: "Bords lumineux animés", reason: rgbReason, visual: <EdgeSwatch kind="rgb" /> },
  ];
  const onEdge = (v: EdgeChoice) => (v === "rgb" ? patch({ rgb: true, edge: "black" }) : patch({ rgb: false, edge: v }));
  return (
    <Section title="Coins & bordures" step="04">
      <FieldLabel>Coins</FieldLabel>
      <Segmented label="Coins" value={c.corners} onChange={(v) => patch({ corners: v })} stacked={false}
        options={[
          { value: "rounded", label: "Arrondis", visual: <CornerShape rounded /> },
          { value: "square", label: "Carrés", visual: <CornerShape rounded={false} /> },
        ]} />
      <FieldLabel className="mt-7">Bordures</FieldLabel>
      <Segmented label="Bordures" value={edgeValue} onChange={onEdge} cols={2} stacked={false} options={edgeOptions} />
      <ReasonList reasons={[edgeReasons.none && `Sans couture : ${edgeReasons.none}`, rgbReason && `Éclairage RGB : ${rgbReason}`]} />
    </Section>
  );
}

/** Étape « Options » : épaisseur, et repose-poignet pour le tapis de souris (largeur suivant le clavier du setup). */
export function OptionsSection() {
  const c = useConfigurator((s) => s.config);
  const patch = useConfigurator((s) => s.patch);
  const k = getConstraints(c);
  const isDesk = c.product === "deskmat";
  const size = peripheralSize(c, "wristrest");
  const kb = KEYBOARDS.find((k) => k.id === c.setup.keyboard);
  const price = computePrice({ ...c, wristRest: true }).lines.find((l) => l.id === "wrist")?.amount;
  const maxWr = Math.max(...WRIST_REST_SIZES.map((s) => s.w));
  return (
    <Section title="Options" step="05">
      <FieldLabel>Épaisseur</FieldLabel>
      <Segmented
        label="Épaisseur" value={c.thickness} onChange={(v) => patch({ thickness: v })}
        options={THICKNESSES.map((t) => ({
          value: t, visual: <ThicknessShape mm={t} />, label: `${t} mm`,
          hint: t === 3 ? "Par défaut" : t === 4 ? "Plus moelleux" : "Confort max",
          reason: k.thickness[t],
        }))}
      />
      <ReasonList reasons={THICKNESSES.map((t) => k.thickness[t])} />
      {isDesk && (
        <>
          <FieldLabel className="mt-7">Repose-poignet</FieldLabel>
          <Segmented label="Repose-poignet" value={c.wristRest ? "yes" : "no"} cols={2}
            onChange={(v) => patch({ wristRest: v === "yes", wristRestW: v === "yes" ? size.w : c.wristRestW })}
            options={[
              { value: "no", label: "Non merci" },
              { value: "yes", label: "Oui", hint: price ? `+ ${formatPrice(price)}` : undefined },
            ]} />
          {c.wristRest && (
            <div className="animate-fade-up">
              <FieldLabel className="mt-6" aside={kb ? `Suggéré pour votre clavier ${kb.short}` : undefined}>Taille du repose-poignet</FieldLabel>
              <Segmented label="Taille du repose-poignet" value={size.w} cols={WRIST_REST_SIZES.length}
                onChange={(w) => patch({ wristRestW: w, setup: { ...c.setup, pos: { ...c.setup.pos, keyboard: undefined, wristrest: undefined } } })}
                options={WRIST_REST_SIZES.map((s) => ({
                  value: s.w,
                  visual: <span className="flex h-6 w-14 items-center justify-center"><span className="block h-3 rounded-full bg-current" style={{ width: (s.w / maxWr) * 56 }} /></span>,
                  label: `${s.w} cm`,
                  hint: <span className="font-tech text-[11px]">{s.keyboards.map((id) => KEYBOARDS.find((k) => k.id === id)?.short).filter(Boolean).join(" · ")}</span>,
                }))} />
            </div>
          )}
        </>
      )}
    </Section>
  );
}

export function Notices() {
  const notices = useConfigurator((s) => s.notices);
  const dismiss = useConfigurator((s) => s.dismissNotices);
  if (!notices.length) return null;
  return (
    <div className="mb-4 space-y-2">
      {notices.map((n) => <Alert key={n} tone="warning">{n}</Alert>)}
      <button type="button" onClick={dismiss} className="min-h-[44px] text-sm text-muted-foreground underline underline-offset-2">Masquer</button>
    </div>
  );
}
