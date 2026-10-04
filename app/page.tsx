import { Suspense } from "react";
import { Identificacao } from "@/components/Identificacao";

export default function Page() {
  return (
    <Suspense>
      <Identificacao />
    </Suspense>
  );
}
