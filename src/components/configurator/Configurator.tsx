"use client";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useConfigurator } from "@/store/useConfigurator";
import { Button } from "@/components/ui/button";
import { PreviewPane } from "./PreviewPane";
import { DesignSection } from "./DesignSection";
import { FinishSection, Notices, ProductSection, SizeSection, OptionsSection } from "./sections";
import { CartDrawer, PriceBar, ProjectsBar, RecapDialog } from "./commerce";

export function Configurator() {
  const product = useConfigurator((s) => s.config.product);
  const cartCount = useConfigurator((s) => s.cart.length);
  const ui = useConfigurator((s) => s.ui);
  const hydrate = useConfigurator((s) => s.hydrate);
  useEffect(() => hydrate(), [hydrate]);

  const headerActions = (
    <div className="flex items-center gap-2">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="h-4 w-4" />Retour à l'accueil
      </Link>
      <Button variant="outline" size="sm" onClick={() => ui({ cartOpen: true })} aria-label={`Ouvrir le panier, ${cartCount} article(s)`}>
        <ShoppingBag className="h-4 w-4" />{cartCount}
      </Button>
    </div>
  );

  return (
    <>
    <SiteHeader wide action={headerActions} />
    {/* Sous la barre du site (4rem) : l'aperçu et le panneau remplissent le reste de l'écran */}
    <div className="lg:grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[65fr_35fr] lg:overflow-hidden">
      {/* Aperçu : 65 % sur desktop, au-dessus des options sur mobile */}
      <div className="relative h-[58vh] min-h-[340px] lg:h-full">
        <PreviewPane />
      </div>

      {/* Panneau d'options : 35 % */}
      <div className="flex min-h-0 flex-col border-t border-border bg-background lg:h-full lg:border-l lg:border-t-0">
        <header className="px-6 pb-2 pt-6 sm:px-8">
          <h1 className="font-display text-2xl font-bold">{product === "deskmat" ? "Tapis de souris" : "Playmat"}</h1>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-4 sm:px-8 lg:pb-6">
          <Notices />
          <ProductSection />
          <DesignSection />
          <SizeSection />
          <FinishSection />
          <OptionsSection />
          <ProjectsBar />
          <p className="pb-4 text-[11px] leading-relaxed text-muted-foreground">
            Aperçu non contractuel : de légères variations de couleur peuvent apparaître à l'impression.
          </p>
        </div>

        {/* Desktop : prix et CTA collés en bas du panneau */}
        <div className="hidden border-t border-border bg-card/80 px-8 py-5 backdrop-blur lg:block"><PriceBar /></div>
      </div>

      {/* Mobile : barre fixe prix + action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <PriceBar compact />
      </div>

      <CartDrawer />
      <RecapDialog />
    </div>
    </>
  );
}
