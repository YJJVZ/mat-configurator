import Link from "next/link";
import { SITE } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <span className="font-tech text-xs font-medium uppercase tracking-[0.28em] text-accent">{SITE.name}</span>
          <span className="ml-3">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/configurer" className="hover:text-accent">Configurateur</Link>
          <Link href="/cgv" className="hover:text-accent">CGV</Link>
          <Link href="/mentions-legales" className="hover:text-accent">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-accent">Confidentialité</Link>
          <a href={`mailto:${SITE.email}`} className="hover:text-accent">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
