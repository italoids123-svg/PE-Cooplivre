import type { Metadata } from "next";
import { Suspense } from "react";
import { EntradaConselho } from "@/components/EntradaConselho";

export const metadata: Metadata = {
  title: "Plano Estratégico 2027–2030 | Cooplivre",
};

export default function Page() {
  return (
    <Suspense>
      <EntradaConselho />
    </Suspense>
  );
}
