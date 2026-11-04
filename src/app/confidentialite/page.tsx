import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: `Confidentialité — ${SITE.name}` };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <section>
        <h2>Données collectées</h2>
        <p>Pour traiter une commande : nom, adresse de livraison, e-mail, téléphone, et l'image que vous importez. [Prestataire de paiement : les données bancaires ne transitent pas par nos serveurs.]</p>
      </section>
      <section>
        <h2>Stockage local</h2>
        <p>Votre panier et vos projets enregistrés sont conservés uniquement dans votre navigateur. Le site n'utilise pas de cookies publicitaires.</p>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>[Durées : données de commande, images importées après fabrication.]</p>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>Vous pouvez accéder à vos données, les rectifier ou les supprimer en écrivant à {SITE.email}. Vous pouvez aussi saisir la CNIL.</p>
      </section>
    </LegalPage>
  );
}
