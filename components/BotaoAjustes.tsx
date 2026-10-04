"use client";

import { useState } from "react";
import { reabrirRevisao } from "@/lib/respostas-client";
import type { Participante } from "@/lib/types";

// Destrava uma revisão já enviada. A pessoa precisa reenviar depois dos ajustes.
export function BotaoAjustes({ participanteId, onReaberto, className = "btn btn-secundario" }: {
  participanteId: string;
  onReaberto: (p: Participante) => void;
  className?: string;
}) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function reabrir() {
    const ok = window.confirm(
      "Reabrir sua revisão para ajustes?\n\nVocê poderá alterar qualquer pilar. Depois de salvar os ajustes, " +
        "será preciso tocar em \"Reenviar revisão\" no mapa para concluir.",
    );
    if (!ok) return;
    setAbrindo(true);
    setErro(null);
    try {
      onReaberto(await reabrirRevisao(participanteId));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setAbrindo(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={reabrir} disabled={abrindo}>
        {abrindo ? "Reabrindo…" : "Realizar ajustes"}
      </button>
      {erro && <p className="status status-erro" role="alert">{erro}</p>}
    </>
  );
}
