"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { definirParticipante } from "@/lib/participante";
import type { Participante } from "@/lib/types";
import { Brand } from "./Brand";

// Link do Conselho (/conselho?chave=…): valida a chave no servidor, guarda a identidade
// de visualização e abre direto a visão evento.
export function EntradaConselho() {
  const router = useRouter();
  const chave = useSearchParams().get("chave") ?? "";
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/conselho", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chave }) })
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { participante?: Participante; error?: string };
        if (!vivo) return;
        if (!res.ok || !body.participante) throw new Error(body.error ?? "Não foi possível abrir o acesso agora.");
        definirParticipante(body.participante);
        router.replace("/evento");
      })
      .catch((e: Error) => {
        if (vivo) setErro(e.message);
      });
    return () => {
      vivo = false;
    };
  }, [chave, router]);

  return (
    <div className="pagina conselho-entrada">
      <Brand />
      {erro ? <p className="aviso aviso-erro" role="alert">{erro}</p> : <p>Abrindo o Plano Estratégico 2027–2030…</p>}
    </div>
  );
}
