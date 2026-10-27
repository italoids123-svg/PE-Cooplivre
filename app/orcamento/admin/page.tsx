import type { Metadata } from "next";
import { AdminOrc } from "@/components/orcamento/AdminOrc";

export const metadata: Metadata = { title: "Painel | Orçamento Cooplivre", robots: { index: false } };

export default function Page() {
  return <AdminOrc />;
}
