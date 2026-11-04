/**
 * GitHub Pages (provisoire) : site 100 % statique, servi sous /mat-configurator/.
 * BASE_PATH est fourni par le workflow .github/workflows/pages.yml ; en local il reste vide.
 * Pour passer sur un hébergeur avec serveur (Vercel…), retirer `output`, `basePath` et `trailingSlash`.
 */
const basePath = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config) => {
    // Konva tente de résoudre "canvas" côté Node : inutile dans le navigateur.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
