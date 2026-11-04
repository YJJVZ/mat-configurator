import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: `Conditions générales de vente — ${SITE.name}` };

export default function Page() {
  return (
    <LegalPage title="Conditions générales de vente">
      <section>
        <h2>1. Objet</h2>
        <p>Les présentes conditions régissent la vente de tapis de souris et playmats personnalisés par {SITE.company.legalName} sur ce site.</p>
      </section>
      <section>
        <h2>2. Commande et personnalisation</h2>
        <p>Le client configure son produit (taille, visuel, finitions) et garantit disposer des droits sur toute image qu'il importe. L'aperçu est non contractuel : de légères variations de couleur peuvent apparaître à l'impression. Chaque fichier est vérifié avant fabrication ; nous pouvons refuser une image illicite ou de qualité insuffisante.</p>
      </section>
      <section>
        <h2>3. Prix et paiement</h2>
        <p>Les prix sont indiqués en euros TTC. [Moyens de paiement acceptés.]</p>
      </section>
      <section>
        <h2>4. Livraison</h2>
        <p>Expédition sous 48 h. Livraison gratuite en France métropolitaine. [Autres zones, transporteur, délais de livraison.]</p>
      </section>
      <section>
        <h2>5. Droit de rétractation</h2>
        <p>Les produits étant fabriqués selon les spécifications du client et nettement personnalisés, le droit de rétractation ne s'applique pas (article L221-28, 3° du Code de la consommation).</p>
      </section>
      <section>
        <h2>6. Garanties</h2>
        <p>Les produits bénéficient de la garantie légale de conformité (articles L217-3 et suivants du Code de la consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil). En cas de défaut, contactez-nous à {SITE.email}.</p>
      </section>
      <section>
        <h2>7. Médiation</h2>
        <p>[Nom et coordonnées du médiateur de la consommation.]</p>
      </section>
    </LegalPage>
  );
}
