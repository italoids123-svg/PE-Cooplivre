"use client";

import { useMemo, useState } from "react";
import { CATALOGO, TOTAL_LINHAS } from "@/lib/orcamento/catalogo";
import { fmtCompleto } from "@/lib/orcamento/formato";
import { de2027, rotuloEscopo, valorAnual, type ParticipanteOrc, type RevisaoLinha } from "@/lib/orcamento/tipos";
import { Brand } from "../Brand";

interface Dados {
  participantes: ParticipanteOrc[];
  revisoes: RevisaoLinha[];
}

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function AdminOrc() {
  const [chave, setChave] = useState("");
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [baixando, setBaixando] = useState(false);

  async function carregar(e?: React.FormEvent) {
    e?.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/orcamento/admin", { headers: { "x-admin-key": chave }, cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao carregar");
      setDados(body as Dados);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  async function baixar() {
    setBaixando(true);
    setErro(null);
    try {
      const res = await fetch("/api/orcamento/admin/export", { method: "POST", headers: { "x-admin-key": chave } });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Falha ao gerar a planilha");
      const nome = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "orcamento-contribuicoes.xlsx";
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

  const pessoas = useMemo(() => Object.fromEntries((dados?.participantes ?? []).map((p) => [p.id, p])), [dados]);
  // Linhas com contribuição, na ordem da planilha.
  const porLinha = useMemo(() => {
    const m = new Map<string, RevisaoLinha[]>();
    for (const r of dados?.revisoes ?? []) if (r.contribuicoes.length) m.set(r.linhaId, [...(m.get(r.linhaId) ?? []), r]);
    return CATALOGO.filter((x) => m.has(x.linha.id)).map((x) => ({ item: x, revisoes: m.get(x.linha.id)! }));
  }, [dados]);

  if (!dados) {
    return (
      <main className="ident-bg">
        <form className="ident-card" onSubmit={carregar}>
          <Brand />
          <h1>Painel do orçamento</h1>
          <label className="campo">
            <span>Chave de acesso</span>
            <input type="password" value={chave} onChange={(e) => setChave(e.target.value)} autoComplete="current-password" />
          </label>
          {erro && <div className="aviso aviso-erro">{erro}</div>}
          <button className="btn btn-primario btn-bloco" disabled={carregando || !chave}>
            {carregando ? "Carregando…" : "Entrar"}
          </button>
        </form>
      </main>
    );
  }

  const contribs = dados.revisoes.reduce((n, r) => n + r.contribuicoes.length, 0);
  const globais = dados.revisoes.filter((r) => r.visao === "global");

  return (
    <div className="pagina">
      <header className="top"><Brand claro /></header>
      <main className="admin-main">
        <div className="mapa-head">
          <h1>Contribuições ao orçamento</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secundario" onClick={() => carregar()} disabled={carregando}>Atualizar</button>
            <button className="btn btn-primario" onClick={baixar} disabled={baixando}>{baixando ? "Gerando…" : "Baixar base (Excel)"}</button>
          </div>
        </div>
        {erro && <div className="aviso aviso-erro">{erro}</div>}
        <div className="admin-kpis">
          <div><b>{dados.participantes.length}</b><span>pessoas identificadas</span></div>
          <div><b>{contribs}</b><span>contribuições</span></div>
          <div><b>{porLinha.length}</b><small> / {TOTAL_LINHAS}</small><span> linhas com contribuição</span></div>
          <div><b>{globais.filter((r) => r.status === "sem-contribuicao").length}</b><span>marcações “sem contribuição”</span></div>
        </div>

        <section className="admin-pilar admin-resp">
          <h2>Participantes</h2>
          <table className="admin-tabela">
            <thead><tr><th>Nome</th><th>Cidade</th><th>Revisadas</th><th>Contribuições</th></tr></thead>
            <tbody>
              {[...dados.participantes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((p) => {
                const rs = globais.filter((r) => r.participanteId === p.id);
                return (
                  <tr key={p.id}>
                    <td>{p.nome}<br /><span className="admin-cargo">{p.cargo}</span></td>
                    <td>{p.agencia}</td>
                    <td>{rs.length}/{TOTAL_LINHAS}</td>
                    <td>{rs.reduce((n, r) => n + r.contribuicoes.length, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="admin-pilar admin-resp">
          <h2>Contribuições por linha</h2>
          {porLinha.length === 0 && <p className="admin-vazio">Nenhuma contribuição ainda.</p>}
          {porLinha.map(({ item, revisoes }) => {
            const nat = item.bloco.natureza;
            const v = de2027(item.linha);
            const n = revisoes.reduce((k, r) => k + r.contribuicoes.length, 0);
            return (
              <details key={item.linha.id} className="admin-obj">
                <summary>
                  <span>
                    <small className="admin-cargo">{item.bloco.nome}{item.tipo === "detalhe" && item.grupo?.nome ? ` › ${item.grupo.nome}` : ""}</small><br />
                    {item.tipo === "total-grupo" ? `Total – ${item.linha.nome}` : item.linha.nome}
                  </span>
                  <span className="chip chip-ajustes">{n}</span>
                </summary>
                <ul className="admin-sug">
                  {revisoes.flatMap((r) =>
                    r.contribuicoes.map((c) => {
                      const p = pessoas[r.participanteId];
                      const atual = c.escopo === "mes" && c.mes ? v[c.mes - 1] : valorAnual(v, nat);
                      return (
                        <li key={`${r.participanteId}-${c.id}`}>
                          <span className="admin-sug-quem"><b>{p?.nome ?? r.participanteId}</b> · {p?.cargo} · {p?.agencia} · {dataHora(c.criadoEm)}</span>
                          <p><i>{rotuloEscopo(c)}:</i> orçado {fmtCompleto(atual, nat)}{c.valorSugerido != null && <> → sugerido <b>{fmtCompleto(c.valorSugerido, nat)}</b></>}</p>
                          <p>{c.motivo}</p>
                        </li>
                      );
                    }),
                  )}
                </ul>
              </details>
            );
          })}
        </section>
        <p className="admin-vazio">Horários de Brasília.</p>
      </main>
    </div>
  );
}
