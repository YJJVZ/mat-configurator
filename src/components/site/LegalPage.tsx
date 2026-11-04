import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <p className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          Modèle à compléter et à faire relire avant la mise en ligne.
        </p>
        <div className="mt-8 space-y-6 leading-relaxed [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_p]:text-muted-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
