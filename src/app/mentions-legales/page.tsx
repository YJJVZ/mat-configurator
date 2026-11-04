import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: `Mentions légales — ${SITE.name}` };

export default function Page() {
  const c = SITE.company;
  return (
    <LegalPage title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <p>{c.legalName} — {c.status}<br />SIRET : {c.siret}<br />{c.address}<br />{c.vat}<br />Contact : {SITE.email}</p>
      </section>
      <section>
        <h2>Directeur de la publication</h2>
        <p>{c.director}</p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>{SITE.host}</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>Les contenus du site (textes, visuels, designs de la galerie) sont protégés. Les images importées par les clients restent leur propriété ; elles ne sont utilisées que pour fabriquer leur commande.</p>
      </section>
    </LegalPage>
  );
}
