"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AMBICAO } from "@/lib/data";
import { definirParticipante, useParticipante } from "@/lib/participante";
import type { Participante } from "@/lib/types";
import { Brand } from "./Brand";

export function Identificacao() {
  const router = useRouter();
  const editar = useSearchParams().get("editar") === "1";
  const atual = useParticipante();

  // Quem já está identificado neste aparelho vai direto ao mapa — exceto logo
  // após enviar o formulário, quando o próprio formulário escolhe o destino.
  const [enviouAgora, setEnviouAgora] = useState(false);
  useEffect(() => {
    if (atual && !editar && !enviouAgora) router.replace("/mapa");
  }, [atual, editar, enviouAgora, router]);

  if (atual === undefined || (atual && !editar && !enviouAgora)) return <div className="ident-bg" />;
  // key remonta o formulário com os dados atuais ao editar.
  return <Formulario key={editar ? (atual?.id ?? "novo") : "novo"} inicial={editar ? atual : null} onEntrou={() => setEnviouAgora(true)} />;
}

function Formulario({ inicial, onEntrou }: { inicial: { nome: string; cargo: string } | null; onEntrou: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [cargo, setCargo] = useState(inicial?.cargo ?? "");
  const [tentou, setTentou] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Nome + ao menos um sobrenome: a regra completa (lista de responsáveis) é do servidor.
  const nomeOk = nome.trim().split(/\s+/).length >= 2;
  const valido = nomeOk && cargo.trim().length >= 2;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (!valido || entrando) return;
    setEntrando(true);
    setErro(null);
    try {
      const res = await fetch("/api/identificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim().replace(/\s+/g, " "), cargo: cargo.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as { participante?: Participante; retomou?: boolean; error?: string };
      if (!res.ok || !body.participante) throw new Error(body.error ?? "Não foi possível entrar agora. Tente novamente.");
      onEntrou();
      definirParticipante(body.participante);
      router.push(body.retomou ? "/mapa?retomada=1" : "/mapa");
    } catch (err) {
      setErro(err instanceof TypeError ? "Sem conexão. Verifique a internet e tente de novo." : (err as Error).message);
      setEntrando(false);
    }
  }

  return (
    <main className="ident-bg">
      <form className="ident-card" onSubmit={enviar} noValidate>
        <Brand />
        <p className="eyebrow">Mapa Estratégico 2027–2030</p>
        <h1>Revisão dos pilares estratégicos</h1>
        <p className="ident-ambicao">“{AMBICAO}”</p>
        <p className="ident-intro">
          Identifique-se para revisar os objetivos, indicadores, metas e iniciativas dos pilares sob sua
          responsabilidade.
        </p>

        <label className="campo">
          <span>Nome e sobrenome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} />
          {tentou && !nomeOk && <em>Informe seu nome e pelo menos um sobrenome.</em>}
        </label>

        <label className="campo">
          <span>Cargo</span>
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} autoComplete="organization-title" maxLength={120} />
          {tentou && cargo.trim().length < 2 && <em>Informe seu cargo.</em>}
        </label>

        {erro && <div className="aviso aviso-erro" role="alert">{erro}</div>}
        <button type="submit" className="btn btn-primario btn-bloco" disabled={entrando}>
          {entrando ? "Entrando…" : "Acessar o mapa"}
        </button>
        <p className="ident-nota">Já começou em outro aparelho? Entre com o mesmo nome para continuar de onde parou.</p>
      </form>
    </main>
  );
}
