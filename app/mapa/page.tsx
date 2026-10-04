import { Suspense } from "react";
import { MapaPage } from "@/components/MapaPage";

export default function Page() {
  return (
    <Suspense>
      <MapaPage />
    </Suspense>
  );
}
