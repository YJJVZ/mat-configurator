import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const tech = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-tech" });

export const metadata: Metadata = {
  title: "Atelier — Configurateur de tapis de souris & playmats",
  description: "Créez votre tapis de souris ou playmat sur mesure avec aperçu en temps réel.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${body.variable} ${display.variable} ${tech.variable}`}>
      <body>{children}</body>
    </html>
  );
}
