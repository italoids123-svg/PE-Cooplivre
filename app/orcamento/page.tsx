import { Suspense } from "react";
import { IdentificacaoOrc } from "@/components/orcamento/IdentificacaoOrc";

export default function Page() {
  return (
    <Suspense>
      <IdentificacaoOrc />
    </Suspense>
  );
}
