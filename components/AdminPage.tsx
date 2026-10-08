"use client";

import { useMemo, useState } from "react";
import { geralId, objetivosVisiveis, PILARES } from "@/lib/data";
import { RESPONSAVEIS } from "@/lib/acesso";
import {
  AVALIACAO_LABEL, AVALIACOES, STATUS_LABEL, statusRevisao,
  type Alteracao, type Participante, type Resposta, type StatusRevisao,
} from "@/lib/types";
import { Brand } from "./Brand";

interface Dados {
  participantes: Participante[];
  respostas: Resposta[];
  historico: Alteracao[];
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

  const [baixando, setBaixando] = useState(false);
  async function baixar() {
    setBaixando(true);
    setErro(null);
    try {
      const res = await fetch("/api/admin/export", { method: "POST", headers: { "x-admin-key": chave } });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Falha ao gerar a planilha");
      const nome = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "contribuicoes.xlsx";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(await res.blob());
      a.download = nome;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setBaixando(false);
    }
  }

  const porObjetivo = useMemo(() => {
    const m: Record<string, Resposta[]> = {};
    for (const r of dados?.respostas ?? []) (m[r.objetivoId] ??= []).push(r);
    return m;
  }, [dados]);
  const edicoes = useMemo(() => {
    const m: Record<string, number> = {};
    for (const h of dados?.historico ?? []) m[`${h.participante.id}|${h.objetivoId}`] = (m[`${h.participante.id}|${h.objetivoId}`] ?? 0) + 1;
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

  const porStatus = (st: StatusRevisao[]) => dados.participantes.filter((p) => st.includes(statusRevisao(p))).length;
  const comResposta = new Set(dados.respostas.map((r) => r.participanteId));
  const emAndamento = dados.participantes.filter((p) => statusRevisao(p) === "em-andamento" && comResposta.has(p.id)).length;
  const porId = Object.fromEntries(dados.participantes.map((p) => [p.id, p]));
  const nomePilar = (slug: string) => PILARES.find((p) => p.slug === slug)?.nome ?? slug;

  return (
    <div className="pagina">
      <header className="top">
        <Brand claro />
        <div className="top-user">
          <button type="button" className="top-sair" onClick={() => carregar()} disabled={carregando}>{carregando ? "Atualizando…" : "Atualizar"}</button>
          <button type="button" className="top-sair top-destaque" onClick={baixar} disabled={baixando}>{baixando ? "Gerando…" : "Baixar base (Excel)"}</button>
        </div>
      </header>
      <main className="admin-main">
        <h1>Painel de respostas</h1>
        {erro && <div className="aviso aviso-erro">{erro}</div>}
        <div className="admin-kpis">
          <div><b>{RESPONSAVEIS.filter((r) => porId[r.id]).length}<small>/{RESPONSAVEIS.length}</small></b><span>responsáveis que entraram</span></div>
          <div><b>{emAndamento}</b><span>em andamento</span></div>
          <div><b>{porStatus(["reaberta"])}</b><span>reabertas (sem reenviar)</span></div>
          <div className="admin-kpi-destaque"><b>{porStatus(["enviada", "reenviada"])}</b><span>revisões enviadas</span></div>
          <div><b>{dados.respostas.length}</b><span>respostas</span></div>
          <div><b>{dados.historico.length}</b><span>envios (com edições)</span></div>
        </div>

        <section className="admin-pilar admin-resp">
          <h2>Responsáveis</h2>
          <table className="admin-tabela">
            <thead>
              <tr><th>Nome</th><th>Pilares</th><th>Status</th></tr>
            </thead>
            <tbody>
              {RESPONSAVEIS.map((r) => {
                const pe = porId[r.id];
                const st = pe ? statusRevisao(pe) : null;
                return (
                  <tr key={r.id}>
                    <td><b>{r.nome}</b>{pe?.cargo && <span className="admin-cargo"> · {pe.cargo}</span>}</td>
                    <td>{r.pilares.length === PILARES.length ? "Todos" : r.pilares.map(nomePilar).join(", ")}</td>
                    <td>
                      <span className={`chip${st === "enviada" || st === "reenviada" ? " chip-concordo" : st ? "" : " chip-discordo"}`}>
                        {st ? STATUS_LABEL[st].toLowerCase() : "não acessou"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

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
                              <b>{pe?.nome ?? "?"}</b> · {pe?.cargo}
                              {pe && <span className={`chip${pe.enviadoEm ? " chip-concordo" : ""}`}>{STATUS_LABEL[statusRevisao(pe)].toLowerCase()}</span>}
                              {r.avaliacao && <span className={`chip chip-${r.avaliacao}`}>{AVALIACAO_LABEL[r.avaliacao]}</span>}
                              {(edicoes[`${r.participanteId}|${r.objetivoId}`] ?? 1) > 1 && (
                                <span className="chip">editado {edicoes[`${r.participanteId}|${r.objetivoId}`] - 1}×</span>
                              )}
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
