import type { Metadata } from "next";
import { AdminPage } from "@/components/AdminPage";

export const metadata: Metadata = { title: "Painel | Mapa Estratégico Cooplivre", robots: { index: false } };

export default function Page() {
  return <AdminPage />;
}
