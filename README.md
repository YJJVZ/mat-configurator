# Atelier — configurateur desk mats & playmats

```bash
npm install
npm run dev     # http://localhost:3000
```

Configuration centralisée :
- `src/config/catalog.ts` : formats, limites, capacités du fabricant, claviers, dispositions playmat
- `src/config/pricing.ts` : tarifs fictifs
- `src/config/designs.ts` : designs (remplacez `src` par vos visuels placés dans `/public`)
- `src/lib/compat.ts` : règles d'incompatibilité
- `src/lib/pricing.ts` : moteur de prix

Calques du canvas : `scene` / `mat` / `print` / `visual`. Seuls `mat` et `print` sont exportés ;
les périphériques, cartes, RGB et repères (`visual`) n'apparaissent jamais dans l'export.
