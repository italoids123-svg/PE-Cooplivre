"use client";

import { useMemo, useState } from "react";
import { geralId, objetivosVisiveis, PILARES } from "@/lib/data";
import { AVALIACAO_LABEL, AVALIACOES, type Participante, type Resposta } from "@/lib/types";
import { Brand } from "./Brand";

interface Dados {
  participantes: Participante[];
  respostas: Resposta[];
}

function titulosPorId(): Record<string, { pilar: string; objetivo: string; responsavel: string }> {
  const out: Record<string, { pilar: string; objetivo: string; responsavel: string }> = {};
  for (const p of PILARES) {
    for (const o of p.objetivos) out[o.id] = { pilar: p.nome, objetivo: o.titulo, responsavel: o.responsavel };
    out[geralId(p.slug)] = { pilar: p.nome, objetivo: "(Falta algo neste pilar?)", responsavel: "" };
  }
  return out;
}

function csv(dados: Dados): string {
  const titulos = titulosPorId();
  const pessoas = Object.fromEntries(dados.participantes.map((p) => [p.id, p]));
  const cab = ["Pilar", "Objetivo", "Responsável", "Nome", "Cargo", "Localidade", "Avaliação", "Sugestão indicador", "Sugestão meta", "Sugestão iniciativas", "Comentário", "Atualizado em"];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const linhas = dados.respostas.map((r) => {
    const t = titulos[r.objetivoId];
    const p = pessoas[r.participanteId];
    return [
      t?.pilar ?? r.pilar, t?.objetivo ?? r.objetivoId, t?.responsavel ?? "",
      p?.nome ?? "", p?.cargo ?? "", p?.localidade ?? "",
      r.avaliacao ? AVALIACAO_LABEL[r.avaliacao] : "", r.indicador, r.meta, r.iniciativas, r.comentario,
      new Date(r.atualizadoEm).toLocaleString("pt-BR"),
    ].map(esc).join(";");
  });
  // BOM + ";" para o Excel em pt-BR abrir com acentos e colunas certas.
  return "﻿" + [cab.map(esc).join(";"), ...linhas].join("\r\n");
}

export function AdminPage() {
  const [chave, setChave] = useState("");
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregar(e?: React.FormEvent) {
    e?.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-key": chave }, cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao carregar");
      setDados(body as Dados);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  function baixar() {
    if (!dados) return;
    const blob = new Blob([csv(dados)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mapa-estrategico-respostas-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const porObjetivo = useMemo(() => {
    const m: Record<string, Resposta[]> = {};
    for (const r of dados?.respostas ?? []) (m[r.objetivoId] ??= []).push(r);
    return m;
  }, [dados]);
  const pessoas = useMemo(() => Object.fromEntries((dados?.participantes ?? []).map((p) => [p.id, p])), [dados]);

  if (!dados) {
    return (
      <main className="ident-bg">
        <form className="ident-card" onSubmit={carregar}>
          <Brand />
          <h1>Painel de respostas</h1>
          <label className="campo">
            <span>Chave de acesso</span>
            <input type="password" value={chave} onChange={(e) => setChave(e.target.value)} autoComplete="current-password" />
          </label>
          {erro && <div className="aviso aviso-erro">{erro}</div>}
          <button className="btn btn-primario btn-bloco" disabled={!chave || carregando}>{carregando ? "Carregando…" : "Entrar"}</button>
        </form>
      </main>
    );
  }

  const comResposta = new Set(dados.respostas.map((r) => r.participanteId)).size;

  return (
    <div className="pagina">
      <header className="top">
        <Brand claro />
        <div className="top-user">
          <button type="button" className="top-sair" onClick={() => carregar()} disabled={carregando}>{carregando ? "Atualizando…" : "Atualizar"}</button>
          <button type="button" className="top-sair top-destaque" onClick={baixar}>Baixar CSV</button>
        </div>
      </header>
      <main className="admin-main">
        <h1>Painel de respostas</h1>
        {erro && <div className="aviso aviso-erro">{erro}</div>}
        <div className="admin-kpis">
          <div><b>{dados.participantes.length}</b><span>identificados</span></div>
          <div><b>{comResposta}</b><span>com ao menos 1 resposta</span></div>
          <div><b>{dados.respostas.length}</b><span>respostas</span></div>
        </div>

        {PILARES.map((p) => (
          <section key={p.slug} className="admin-pilar" style={{ "--cor": p.cor } as React.CSSProperties}>
            <h2>{p.nome}</h2>
            {[...objetivosVisiveis(p).map((o) => ({ id: o.id, titulo: o.titulo })), { id: geralId(p.slug), titulo: "Falta algo neste pilar?" }].map((o) => {
              const rs = porObjetivo[o.id] ?? [];
              const cont = Object.fromEntries(AVALIACOES.map((a) => [a, rs.filter((r) => r.avaliacao === a).length]));
              const textos = rs.filter((r) => r.indicador || r.meta || r.iniciativas || r.comentario);
              return (
                <details key={o.id} className="admin-obj">
                  <summary>
                    <span className="admin-obj-tit">{o.titulo}</span>
                    <span className="admin-cont">
                      {AVALIACOES.map((a) => (
                        <span key={a} className={`chip chip-${a}`} title={AVALIACAO_LABEL[a]}>{cont[a]}</span>
                      ))}
                      <span className="chip">{textos.length} sugest.</span>
                    </span>
                  </summary>
                  {textos.length === 0 ? (
                    <p className="admin-vazio">Sem sugestões escritas.</p>
                  ) : (
                    <ul className="admin-sug">
                      {textos.map((r) => {
                        const pe = pessoas[r.participanteId];
                        return (
                          <li key={r.participanteId}>
                            <div className="admin-sug-quem">
                              <b>{pe?.nome ?? "?"}</b> · {pe?.cargo} · {pe?.localidade}
                              {r.avaliacao && <span className={`chip chip-${r.avaliacao}`}>{AVALIACAO_LABEL[r.avaliacao]}</span>}
                            </div>
                            {r.indicador && <p><i>Indicador:</i> {r.indicador}</p>}
                            {r.meta && <p><i>Meta:</i> {r.meta}</p>}
                            {r.iniciativas && <p><i>Iniciativas:</i> {r.iniciativas}</p>}
                            {r.comentario && <p><i>Comentário:</i> {r.comentario}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </details>
              );
            })}
          </section>
        ))}
      </main>
    </div>
  );
}
