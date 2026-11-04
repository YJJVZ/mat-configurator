import Link from "next/link";
import { Check, ImageUp, Ruler, Sparkles, Truck } from "lucide-react";
import { getDesign } from "@/config/designs";
import { GUARANTEES } from "@/config/shop";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FromPrice, LegacyShareRedirect } from "@/components/site/HomeClient";
import { buttonVariants } from "@/components/ui/button";

const STEPS = [
  { icon: Ruler, title: "Choisissez la taille", text: "Du petit tapis de souris au tapis de bureau XXL, ou vos dimensions exactes au centimètre." },
  { icon: ImageUp, title: "Ajoutez votre visuel", text: "Un design de notre galerie ou votre propre image, cadrée directement sur l'aperçu." },
  { icon: Sparkles, title: "Finitions", text: "Bords cousus, coins arrondis ou carrés, épaisseur, et bords lumineux RGB en option." },
];

const FAQ = [
  { q: "Quelle image puis-je utiliser ?", a: "Une image JPG, PNG ou WebP. Le configurateur vous indique tout de suite si sa résolution est suffisante pour la taille choisie, et notre équipe vérifie chaque fichier avant impression." },
  { q: "Comment fonctionne l'éclairage RGB ?", a: "Une bande LED est intégrée dans le bord du tapis. Elle se branche en USB à votre ordinateur, et un petit boîtier sur le bord arrière permet de changer d'effet." },
  { q: "Quels sont les délais ?", a: "Votre tapis est expédié sous 48 h, et la livraison est gratuite en France métropolitaine." },
  { q: "Faites-vous aussi des playmats ?", a: "Oui : le configurateur propose aussi des playmats pour jeux de cartes, avec zones de jeu et texte personnalisé." },
];

export default function Home() {
  const hero = getDesign("cyberpunk");
  const thumbs = ["japan", "marble", "fantasy", "abstract"].map(getDesign);

  return (
    <>
      <LegacyShareRedirect />
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="studio-backdrop">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:py-20">
            <div>
              <p className="font-tech text-xs font-medium uppercase tracking-[0.28em] text-accent">Fabriqué à la commande</p>
              <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] sm:text-6xl">Votre tapis de souris,<br />sur mesure.</h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Choisissez la taille, l'image et les finitions. Vous voyez le résultat en direct sur votre bureau avant de commander.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link href="/configurer" className={buttonVariants()}>Créer mon tapis</Link>
                <span className="text-sm text-muted-foreground">
                  à partir de <span className="font-tech text-base font-medium text-foreground"><FromPrice /></span>
                </span>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {GUARANTEES.map((g) => (
                  <li key={g.text} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-accent" />{g.short}</li>
                ))}
              </ul>
            </div>

            {/* Visuel : tapis RGB + câble */}
            <div className="relative pt-10">
              <span aria-hidden className="absolute left-[12%] top-0 h-12 w-[5px] -translate-x-1/2 rounded-full bg-neutral-900" />
              <div className="rgb-ring relative rounded-[18px] p-[3px] shadow-[0_30px_60px_-25px_rgba(60,30,140,.55),0_0_40px_rgba(120,90,255,.35)]">
                <div className="aspect-[90/40] overflow-hidden rounded-[15px] bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hero.src} alt="Tapis de souris XL avec bords lumineux RGB" className="h-full w-full object-cover" />
                </div>
                <span aria-hidden className="absolute left-[12%] top-[-9px] h-[18px] w-9 -translate-x-1/2 rounded-md bg-neutral-900 shadow-md" />
              </div>
              <div className="mt-6 grid grid-cols-4 gap-3">
                {thumbs.map((d) => (
                  <div key={d.id} className="aspect-[90/40] overflow-hidden rounded-lg ring-2 ring-neutral-900/80 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.src} alt={`Design ${d.name}`} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ÉTAPES */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">Comment ça marche</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bevel bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-tech text-sm text-accent">0{i + 1}</span>
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-3xl font-bold">Questions fréquentes</h2>
            <div className="mt-6 divide-y divide-border">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                    {f.q}<span className="text-2xl font-light text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <Truck className="mx-auto h-7 w-7 text-accent" />
          <h2 className="mt-3 font-display text-4xl font-bold">Prêt à créer le vôtre ?</h2>
          <p className="mt-2 text-muted-foreground">Ça prend deux minutes, et l'aperçu est gratuit.</p>
          <Link href="/configurer" className={buttonVariants({ className: "mt-6" })}>Créer mon tapis</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
