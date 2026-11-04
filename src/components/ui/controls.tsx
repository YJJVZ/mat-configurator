"use client";
import * as React from "react";
import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Segmented (radiogroup accessible, grandes cibles tactiles) ---------- */
export interface SegOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  reason?: string | null;
  /** Petit visuel (icône, aperçu de matière…) affiché avec le libellé. */
  visual?: React.ReactNode;
  /** Pastille posée sur le bord haut (ex. « Le plus populaire »). */
  badge?: string;
}

export function Segmented<T extends string | number>({
  value, onChange, options, label, className, cols, stacked,
}: {
  value: T; onChange: (v: T) => void; options: SegOption<T>[]; label: string; className?: string; cols?: number;
  /** Visuel au-dessus du libellé (cartes compactes) plutôt qu'à gauche. */
  stacked?: boolean;
}) {
  const n = cols ?? options.length;
  const vertical = stacked ?? n >= 3;
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Navigation clavier type « radiogroup » : flèches pour changer de choix.
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    for (let k = 1; k <= options.length; k++) {
      const j = (i + dir * k + options.length) % options.length;
      const o = options[j];
      if (!o.disabled && !o.reason) { onChange(o.value); refs.current[j]?.focus(); break; }
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-2.5", className)} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {options.map((o, i) => {
        const active = o.value === value;
        const disabled = o.disabled || !!o.reason;
        return (
          <button
            key={String(o.value)} ref={(el) => { refs.current[i] = el; }}
            type="button" role="radio" aria-checked={active} disabled={disabled}
            tabIndex={active || (!options.some((x) => x.value === value) && i === 0) ? 0 : -1}
            title={o.reason ?? undefined}
            onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "group relative flex min-h-[3.5rem] rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30",
              vertical ? "flex-col items-center justify-center gap-2 text-center" : "items-center gap-3",
              active
                ? "border-accent bg-accent/[0.06] shadow-[0_6px_18px_-8px_hsl(var(--accent)/0.55)]"
                : "border-border bg-card hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
              disabled && "cursor-not-allowed opacity-40 hover:translate-y-0 hover:border-border hover:shadow-none",
            )}
          >
            {o.visual && (
              <span className={cn("grid shrink-0 place-items-center transition-transform duration-200", !disabled && "group-hover:scale-110", active ? "text-accent" : "text-foreground/70")}>
                {o.visual}
              </span>
            )}
            <span className={cn("min-w-0", vertical ? "" : "flex-1 pr-5")}>
              <span className="block text-[15px] font-semibold leading-tight">{o.label}</span>
              {o.hint && <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{o.hint}</span>}
            </span>
            {o.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background shadow">
                {o.badge}
              </span>
            )}
            <span aria-hidden className={cn(
              "absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground transition-all duration-200",
              active ? "scale-100 opacity-100 animate-pop" : "scale-0 opacity-0",
            )}>
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Intitulé d'un groupe de choix à l'intérieur d'une étape. */
export function FieldLabel({ children, className, aside }: { children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <div className={cn("mb-3 flex items-baseline justify-between gap-3", className)}>
      <div className="text-sm font-semibold">{children}</div>
      {aside && <div className="text-xs text-muted-foreground">{aside}</div>}
    </div>
  );
}

/** Message d'explication affiché sous un groupe quand des options sont désactivées. */
export function ReasonList({ reasons }: { reasons: (string | null | undefined)[] }) {
  const list = reasons.filter(Boolean) as string[];
  if (!list.length) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-muted-foreground" aria-live="polite">
      {list.map((r) => <li key={r}>• {r}</li>)}
    </ul>
  );
}

/* ---------- Switch : toute la ligne est cliquable ---------- */
export function Switch({ checked, onChange, label, description, disabled, reason }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean; reason?: string | null;
}) {
  const off = disabled || !!reason;
  return (
    <button
      type="button" role="switch" aria-checked={checked} disabled={off} onClick={() => onChange(!checked)}
      className={cn(
        "group -mx-2 flex min-h-[3rem] w-[calc(100%+1rem)] items-center justify-between gap-4 rounded-xl px-2 py-1.5 text-left transition-colors duration-200",
        "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {(reason || description) && <span className="mt-0.5 block text-[13px] text-muted-foreground">{reason ?? description}</span>}
      </span>
      <span className={cn("relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300", checked ? "bg-accent" : "bg-foreground/15 group-hover:bg-foreground/25")}>
        <span className={cn(
          "absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]",
          checked && "translate-x-6",
        )}>
          <Check className={cn("h-3.5 w-3.5 text-accent transition-opacity duration-200", checked ? "opacity-100" : "opacity-0")} strokeWidth={3} />
        </span>
      </span>
    </button>
  );
}

/* ---------- Slider avec boutons − / + ---------- */
export function Slider({ label, value, min, max, step = 1, onChange, format }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
  const id = React.useId();
  const pct = ((value - min) / (max - min)) * 100;
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const stepBtn = "grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-border bg-card transition-all duration-150 hover:border-accent/60 hover:text-accent active:scale-90 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold">{label}</label>
        <span className="font-tech rounded-lg bg-accent/10 px-2.5 py-1 text-sm font-medium text-accent">{format ? format(value) : value}</span>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={stepBtn} onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`${label} : diminuer`}><Minus className="h-4 w-4" /></button>
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
          style={{ "--p": `${pct}%` } as React.CSSProperties} />
        <button type="button" className={stepBtn} onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`${label} : augmenter`}><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/* ---------- Section (étape numérotée) ---------- */
export function Section({ title, step, children, aside, id }: { title: string; step?: string; children: React.ReactNode; aside?: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="animate-fade-up border-b border-border/70 py-8 first:pt-2 last:border-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 font-display text-xl font-bold">
          {step && (
            <span className="font-tech grid h-8 w-8 place-items-center rounded-full bg-foreground text-[13px] font-medium normal-case tracking-normal text-background">
              {Number(step)}
            </span>
          )}
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/* ---------- NumberField ---------- */
export function NumberField({ label, value, onCommit, min, max, unit = "cm", step = 0.5 }: {
  label: string; value: number; onCommit: (v: number) => void; min: number; max: number; unit?: string; step?: number;
}) {
  const id = React.useId();
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => setText(String(value)), [value]);
  const n = Number(text.replace(",", "."));
  const invalid = text.trim() === "" || Number.isNaN(n) || n < min || n > max;
  const commit = () => { if (!invalid) onCommit(Math.round(n * 10) / 10); else setText(String(value)); };
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          id={id} inputMode="decimal" value={text} step={step}
          aria-invalid={invalid} aria-describedby={`${id}-r`}
          onChange={(e) => setText(e.target.value)} onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
          className={cn("h-12 w-full rounded-xl border-2 bg-card px-4 pr-12 font-tech text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20", invalid ? "border-destructive" : "border-border")}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span>
      </div>
      <p id={`${id}-r`} className={cn("mt-1 text-xs", invalid ? "text-destructive" : "text-muted-foreground")}>
        {invalid ? `Entre ${min} et ${max} ${unit}` : `${min}–${max} ${unit}`}
      </p>
    </div>
  );
}

/* ---------- Alert ---------- */
export function Alert({ tone = "info", children }: { tone?: "info" | "warning" | "danger" | "success"; children: React.ReactNode }) {
  const tones = {
    info: "bg-muted text-foreground",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  } as const;
  return <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("animate-fade-up rounded-xl px-4 py-3 text-[13px] leading-relaxed", tones[tone])}>{children}</div>;
}
