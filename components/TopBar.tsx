"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { sair, useParticipante } from "@/lib/participante";
import { BotaoTelaCheia } from "./BotaoTelaCheia";
import { Brand } from "./Brand";

export function TopBar({ voltar }: { voltar?: boolean }) {
  const p = useParticipante();
  const router = useRouter();
  return (
    <header className="top">
      {voltar ? (
        <Link href="/mapa" className="top-voltar" aria-label="Voltar ao mapa">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Mapa
        </Link>
      ) : (
        <Brand claro />
      )}
      {p && (
        <div className="top-user">
          <span className="top-user-nome">{p.nome}</span>
          <span className="top-user-meta">{p.cargo}</span>
          <BotaoTelaCheia />
          <button
            type="button"
            className="top-sair"
            onClick={() => {
              router.push("/?editar=1");
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="top-sair"
            onClick={() => {
              sair();
              router.push("/");
            }}
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
