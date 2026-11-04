import Link from "next/link";
import { SITE } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Barre de navigation du site. `action` remplace le bouton « Créer mon tapis » (ex. panier dans le configurateur). */
export function SiteHeader({ wide = false, action }: { wide?: boolean; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className={cn("mx-auto flex h-full items-center justify-between px-4 sm:px-6", !wide && "max-w-6xl")}>
        <Link href="/" className="font-tech text-sm font-medium uppercase tracking-[0.28em] text-accent">{SITE.name}</Link>
        {action ?? <Link href="/configurer" className={buttonVariants({ size: "sm" })}>Créer mon tapis</Link>}
      </div>
    </header>
  );
}
