"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sairOrc, useParticipanteOrc } from "@/lib/orcamento/participante";
import { Brand } from "../Brand";

export function TopBarOrc({ voltar }: { voltar?: boolean }) {
  const p = useParticipanteOrc();
  const router = useRouter();
  return (
    <header className="top">
      {voltar ? (
        <Link href="/orcamento/visoes" className="top-voltar" aria-label="Voltar às visões">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Visões
        </Link>
      ) : (
        <Brand claro />
      )}
      {p && (
        <div className="top-user">
          <span className="top-user-nome">{p.nome}</span>
          <span className="top-user-meta">{p.cargo} · {p.agencia}</span>
          <button type="button" className="top-sair" onClick={() => router.push("/orcamento?editar=1")}>
            Editar
          </button>
          <button
            type="button"
            className="top-sair"
            onClick={() => {
              sairOrc();
              router.push("/orcamento");
            }}
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
}

// Redireciona para a identificação quem chega sem estar identificado.
export function useExigirParticipante() {
  const p = useParticipanteOrc();
  const router = useRouter();
  useEffect(() => {
    if (p === null) router.replace("/orcamento");
  }, [p, router]);
  return p;
}
