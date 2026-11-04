import type { Metadata } from "next";
import { Configurator } from "@/components/configurator/Configurator";

export const metadata: Metadata = { title: "Configurer mon tapis — Atelier" };

export default function ConfigurerPage() {
  return <Configurator />;
}
