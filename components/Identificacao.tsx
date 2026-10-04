"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AMBICAO, LOCALIDADES } from "@/lib/data";
import { definirParticipante, propostaParticipante, useParticipante } from "@/lib/participante";
import type { Participante } from "@/lib/types";
import { Brand } from "./Brand";

const OUTRA = "__outra__";

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

function Formulario({ inicial, onEntrou }: { inicial: { nome: string; cargo: string; localidade: string } | null; onEntrou: () => void }) {
  const router = useRouter();
  const localConhecida = !inicial || LOCALIDADES.includes(inicial.localidade);
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [cargo, setCargo] = useState(inicial?.cargo ?? "");
  const [local, setLocal] = useState(inicial ? (localConhecida ? inicial.localidade : OUTRA) : "");
  const [outra, setOutra] = useState(localConhecida ? "" : (inicial?.localidade ?? ""));
  const [tentou, setTentou] = useState(false);

  const localidade = local === OUTRA ? outra.trim() : local;
  const valido = nome.trim().length >= 3 && cargo.trim().length >= 2 && localidade.length >= 2;

  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (!valido || entrando) return;
    setEntrando(true);
    setErro(null);
    try {
      const proposta = propostaParticipante({ nome: nome.trim().replace(/\s+/g, " "), cargo: cargo.trim(), localidade });
      const res = await fetch("/api/identificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participante: proposta }),
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
        <h1>Sua visão constrói a nossa estratégia</h1>
        <p className="ident-ambicao">“{AMBICAO}”</p>
        <p className="ident-intro">
          Identifique-se para revisar os objetivos, indicadores, metas e iniciativas de cada pilar. Suas
          contribuições serão consolidadas pela equipe do planejamento.
        </p>

        <label className="campo">
          <span>Nome completo</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} />
          {tentou && nome.trim().length < 3 && <em>Informe seu nome.</em>}
        </label>

        <label className="campo">
          <span>Cargo</span>
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} autoComplete="organization-title" maxLength={120} />
          {tentou && cargo.trim().length < 2 && <em>Informe seu cargo.</em>}
        </label>

        <label className="campo">
          <span>Localidade</span>
          <select value={local} onChange={(e) => setLocal(e.target.value)}>
            <option value="" disabled>Selecione…</option>
            {LOCALIDADES.map((l) => <option key={l} value={l}>{l}</option>)}
            <option value={OUTRA}>Outra…</option>
          </select>
          {local === OUTRA && (
            <input
              className="campo-extra"
              value={outra}
              onChange={(e) => setOutra(e.target.value)}
              placeholder="Digite sua localidade"
              maxLength={120}
              autoFocus
            />
          )}
          {tentou && localidade.length < 2 && <em>Informe sua localidade.</em>}
        </label>

        {erro && <div className="aviso aviso-erro">{erro}</div>}
        <button type="submit" className="btn btn-primario btn-bloco" disabled={entrando}>
          {entrando ? "Entrando…" : "Acessar o mapa"}
        </button>
        <p className="ident-nota">
          Já começou em outro aparelho? Use o mesmo nome e localidade para continuar de onde parou.
        </p>
      </form>
    </main>
  );
}
