import type { Metadata } from "next";
import "./orcamento.css";

export const metadata: Metadata = {
  title: "Orçamento 2027 | Cooplivre",
  description: "Revisão colaborativa do Planejamento Orçamentário 2027 da Sicoob Cooplivre.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
