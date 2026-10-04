"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AMBICAO, LOCALIDADES } from "@/lib/data";
import { salvarParticipante, useParticipante } from "@/lib/participante";
import { Brand } from "./Brand";

const OUTRA = "__outra__";

export function Identificacao() {
  const router = useRouter();
  const editar = useSearchParams().get("editar") === "1";
  const atual = useParticipante();

  useEffect(() => {
    if (atual && !editar) router.replace("/mapa");
  }, [atual, editar, router]);

  if (atual === undefined || (atual && !editar)) return <div className="ident-bg" />;
  // key remonta o formulário com os dados atuais ao editar.
  return <Formulario key={atual?.id ?? "novo"} inicial={atual} />;
}

function Formulario({ inicial }: { inicial: { nome: string; cargo: string; localidade: string } | null }) {
  const router = useRouter();
  const localConhecida = !inicial || LOCALIDADES.includes(inicial.localidade);
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [cargo, setCargo] = useState(inicial?.cargo ?? "");
  const [local, setLocal] = useState(inicial ? (localConhecida ? inicial.localidade : OUTRA) : "");
  const [outra, setOutra] = useState(localConhecida ? "" : (inicial?.localidade ?? ""));
  const [tentou, setTentou] = useState(false);

  const localidade = local === OUTRA ? outra.trim() : local;
  const valido = nome.trim().length >= 3 && cargo.trim().length >= 2 && localidade.length >= 2;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (!valido) return;
    const p = salvarParticipante({ nome: nome.trim().replace(/\s+/g, " "), cargo: cargo.trim(), localidade });
    // Registra a presença já na identificação (sem respostas), para o painel contar
    // quem entrou e não respondeu. Falha aqui não bloqueia: o próximo envio registra.
    fetch("/api/respostas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participante: p, respostas: [] }),
      keepalive: true,
    }).catch(() => undefined);
    router.push("/mapa");
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

        <button type="submit" className="btn btn-primario btn-bloco">Acessar o mapa</button>
      </form>
    </main>
  );
}
