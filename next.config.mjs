/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Konva tente de résoudre "canvas" côté Node : inutile dans le navigateur.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
