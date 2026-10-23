import type { Metadata } from "next";
import { Asap } from "next/font/google";
import { VisaoEvento } from "@/components/evento/VisaoEvento";

// Fonte do material "Plano Estratégico 2027–2030", só nesta visão.
const asap = Asap({ variable: "--font-asap", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Plano Estratégico 2027–2030 | Cooplivre",
};

export default function Page() {
  return <VisaoEvento fonte={asap.variable} />;
}
