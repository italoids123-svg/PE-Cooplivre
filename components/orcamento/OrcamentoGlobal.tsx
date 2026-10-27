"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { BLOCOS } from "@/lib/orcamento/dados";
import { linhasDoBloco, POR_ID, TOTAL_LINHAS, type ItemCatalogo } from "@/lib/orcamento/catalogo";
import { fmtCompleto, fmtTabela, fmtVariacao } from "@/lib/orcamento/formato";
import {
  ANO_ORCAMENTO, de2026, de2027, MESES, ROTULO_ANUAL, ULTIMO_MES_REALIZADO_2026, valorAnual,
  type Bloco, type Contribuicao, type Linha, type Natureza, type ParticipanteOrc, type RevisaoLinha, type StatusLinha,
} from "@/lib/orcamento/tipos";
import { ModalContribuicao } from "./ModalContribuicao";
import { TopBarOrc, useExigirParticipante } from "./TopBarOrc";

const VISAO = "global";
const ANO2 = String(ANO_ORCAMENTO).slice(2);

const NOTA_NATUREZA: Record<Natureza, string> = {
  saldo: "Saldos no fim de cada mês, em R$ mil.",
  fluxo: "Resultado de cada mês, em R$ mil.",
  taxa: "Taxas em % ao mês.",
};
const ROTULO_REF: Record<Natureza, string> = { saldo: "Dez/26", fluxo: "Total 2026", taxa: "Média 2026" };

type Mudanca = { linhaId: string; status: StatusLinha | null; contribuicoes: Contribuicao[] };

export function OrcamentoGlobal() {
  const p = useExigirParticipante();
  if (!p) return <div className="pagina" />;
  return <Painel p={p} />;
}

function Painel({ p }: { p: ParticipanteOrc }) {
  const [revisoes, setRevisoes] = useState<Record<string, RevisaoLinha> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const res = await fetch(`/api/orcamento/revisoes?pid=${encodeURIComponent(p.id)}&visao=${VISAO}`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as { revisoes?: RevisaoLinha[]; error?: string };
      if (!res.ok || !body.revisoes) throw new Error(body.error ?? "Não foi possível carregar suas contribuições.");
      setRevisoes(Object.fromEntries(body.revisoes.map((r) => [r.linhaId, r])));
    } catch (e) {
      setErro(e instanceof TypeError ? "Sem conexão. Verifique a internet e tente de novo." : (e as Error).message);
    }
  }, [p.id]);

  useEffect(() => {
    // Busca inicial das contribuições já gravadas; o estado é atualizado quando a resposta chega.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  // Grava já na tela e desfaz se o servidor recusar.
  const gravar = useCallback(
    async (mudancas: Mudanca[]) => {
      if (!revisoes) return false;
      const antes = revisoes;
      const agora = new Date().toISOString();
      const depois = { ...revisoes };
      for (const m of mudancas) {
        if (m.status) depois[m.linhaId] = { participanteId: p.id, visao: VISAO, linhaId: m.linhaId, status: m.status, contribuicoes: m.contribuicoes, atualizadoEm: agora };
        else delete depois[m.linhaId];
      }
      setRevisoes(depois);
      setAviso(null);
      try {
        const res = await fetch("/api/orcamento/revisoes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participanteId: p.id, itens: mudancas.map((m) => ({ visao: VISAO, ...m })) }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? "Não foi possível salvar agora. Tente novamente.");
        return true;
      } catch (e) {
        setRevisoes(antes);
        setAviso(e instanceof TypeError ? "Sem conexão: a alteração não foi salva." : (e as Error).message);
        return false;
      }
    },
    [revisoes, p.id],
  );

  function semContribuicao(linhaId: string) {
    const r = revisoes?.[linhaId];
    if (r?.status === "sem-contribuicao") return gravar([{ linhaId, status: null, contribuicoes: [] }]);
    if (r?.contribuicoes.length) {
      const n = r.contribuicoes.length;
      if (!window.confirm(`Esta linha tem ${n} contribuiç${n > 1 ? "ões" : "ão"}. Marcar como "sem contribuição" apaga ${n > 1 ? "todas" : "a contribuição"}. Continuar?`)) return;
    }
    return gravar([{ linhaId, status: "sem-contribuicao", contribuicoes: [] }]);
  }

  function semContribuicaoNoBloco(b: Bloco) {
    const pendentes = linhasDoBloco(b).filter((x) => !revisoes?.[x.linha.id]);
    if (!pendentes.length) return;
    if (!window.confirm(`Marcar as ${pendentes.length} linha(s) pendentes de "${b.nome}" como sem contribuição?`)) return;
    gravar(pendentes.map((x) => ({ linhaId: x.linha.id, status: "sem-contribuicao", contribuicoes: [] })));
  }

  const alternar = (id: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const gruposComDetalhe = (b: Bloco) => b.grupos.filter((g) => g.total && g.linhas.length).map((g) => g.id);

  const revisadas = revisoes ? Object.keys(revisoes).filter((id) => POR_ID.has(id)).length : 0;
  const pct = Math.round((revisadas / TOTAL_LINHAS) * 100);
  const item = modal ? POR_ID.get(modal) : undefined;

  return (
    <div className="pagina">
      <TopBarOrc voltar />
      <main className="orc-main">
        <div className="mapa-head">
          <div>
            <p className="eyebrow">Orçamento global · Sicoob Cooplivre</p>
            <h1 className="orc-titulo">Planejamento Orçamentário {ANO_ORCAMENTO}</h1>
            <p className="mapa-sub">
              Abra cada total para ver o detalhamento. Em cada linha, use <b>Contribuir</b> para sugerir uma alteração (mês
              ou valor global, com o motivo) ou <b>Sem contribuição</b> para registrar que está de acordo.
            </p>
          </div>
          <div className="mapa-prog">
            <b>{revisadas}</b> <small>/ {TOTAL_LINHAS}</small>
            <span>linhas revisadas</span>
            <div className="barra"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </div>

        <nav className="orc-nav" aria-label="Blocos do orçamento">
          {BLOCOS.map((b) => {
            const itens = linhasDoBloco(b);
            const feitas = itens.filter((x) => revisoes?.[x.linha.id]).length;
            return (
              <a key={b.id} href={`#${b.id}`} className={feitas === itens.length ? "orc-nav-ok" : undefined}>
                {b.nome} <span>{feitas}/{itens.length}</span>
              </a>
            );
          })}
        </nav>

        {aviso && <div className="aviso aviso-erro orc-aviso-fixo" role="alert">{aviso}</div>}
        {erro && (
          <div className="aviso aviso-erro" role="alert">
            {erro} <button type="button" className="btn btn-secundario" onClick={carregar}>Tentar de novo</button>
          </div>
        )}
        {!revisoes && !erro && <p className="carregando">Carregando…</p>}

        {revisoes &&
          BLOCOS.map((b) => {
            const itens = linhasDoBloco(b);
            const feitas = itens.filter((x) => revisoes[x.linha.id]).length;
            const expansiveis = gruposComDetalhe(b);
            const tudoAberto = expansiveis.length > 0 && expansiveis.every((id) => abertos.has(id));
            return (
              <section key={b.id} id={b.id} className="orc-bloco">
                <header className="orc-bloco-head">
                  <div>
                    <h2>{b.nome}</h2>
                    <p>{NOTA_NATUREZA[b.natureza]} <span>{feitas} de {itens.length} linhas revisadas</span></p>
                  </div>
                  <div className="orc-bloco-acoes">
                    {expansiveis.length > 0 && (
                      <button
                        type="button"
                        className="orc-link"
                        onClick={() =>
                          setAbertos((s) => {
                            const n = new Set(s);
                            for (const id of expansiveis) {
                              if (tudoAberto) n.delete(id);
                              else n.add(id);
                            }
                            return n;
                          })
                        }
                      >
                        {tudoAberto ? "Recolher tudo" : "Expandir tudo"}
                      </button>
                    )}
                    {feitas < itens.length && (
                      <button type="button" className="orc-link" onClick={() => semContribuicaoNoBloco(b)}>
                        Marcar pendentes sem contribuição
                      </button>
                    )}
                  </div>
                </header>
                <div className="orc-tabela-wrap">
                  <table className="orc-tabela">
                    <thead>
                      <tr>
                        <th className="orc-col-desc">Descrição</th>
                        <th className="orc-col-ref" title="2026: realizado até agosto e projeção de setembro a dezembro">{ROTULO_REF[b.natureza]}</th>
                        <th className="orc-col-anual">{ROTULO_ANUAL[b.natureza]} {ANO_ORCAMENTO}</th>
                        <th className="orc-var">Var.</th>
                        {MESES.map((m) => (
                          <th key={m}>{m}/{ANO2}</th>
                        ))}
                        <th className="orc-col-acoes">Contribuições</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.grupos.map((g) => {
                        const aberto = abertos.has(g.id);
                        return (
                          <Fragment key={g.id}>
                            {g.total ? (
                              <LinhaOrc
                                linha={g.total}
                                natureza={b.natureza}
                                tipo="total-grupo"
                                revisao={revisoes[g.total.id]}
                                expandir={g.linhas.length ? { aberto, alternar: () => alternar(g.id), n: g.linhas.length } : undefined}
                                onContribuir={() => setModal(g.total!.id)}
                                onSem={() => semContribuicao(g.total!.id)}
                              />
                            ) : (
                              g.nome && (
                                <tr className="orc-subtitulo">
                                  <th colSpan={17} scope="colgroup">{g.nome}</th>
                                </tr>
                              )
                            )}
                            {(!g.total || aberto) &&
                              g.linhas.map((l) => (
                                <LinhaOrc
                                  key={l.id}
                                  linha={l}
                                  natureza={b.natureza}
                                  tipo="detalhe"
                                  recuo={!!g.total}
                                  revisao={revisoes[l.id]}
                                  onContribuir={() => setModal(l.id)}
                                  onSem={() => semContribuicao(l.id)}
                                />
                              ))}
                          </Fragment>
                        );
                      })}
                      {b.total && (
                        <LinhaOrc
                          linha={b.total}
                          natureza={b.natureza}
                          tipo="total-bloco"
                          revisao={revisoes[b.total.id]}
                          onContribuir={() => setModal(b.total!.id)}
                          onSem={() => semContribuicao(b.total!.id)}
                        />
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        {revisoes && (
          <p className="orc-rodape">
            {ROTULO_REF.saldo}, {ROTULO_REF.fluxo} e {ROTULO_REF.taxa}: 2026 com realizado até {MESES[ULTIMO_MES_REALIZADO_2026 - 1]}/26 e
            projeção nos meses seguintes. Var.: {ANO_ORCAMENTO} sobre 2026 (em p.p. para taxas).
          </p>
        )}
      </main>
      {item && revisoes && (
        <ModalContribuicao
          item={item}
          revisao={revisoes[item.linha.id]}
          onFechar={() => setModal(null)}
          onSalvar={(contribuicoes) =>
            gravar([{ linhaId: item.linha.id, status: contribuicoes.length ? "com-contribuicao" : null, contribuicoes }])
          }
        />
      )}
    </div>
  );
}

function LinhaOrc({
  linha, natureza, tipo, recuo, revisao, expandir, onContribuir, onSem,
}: {
  linha: Linha;
  natureza: Natureza;
  tipo: ItemCatalogo["tipo"];
  recuo?: boolean;
  revisao: RevisaoLinha | undefined;
  expandir?: { aberto: boolean; alternar: () => void; n: number };
  onContribuir: () => void;
  onSem: () => void;
}) {
  const v27 = de2027(linha);
  const ref = valorAnual(de2026(linha), natureza);
  const anual = valorAnual(v27, natureza);
  const n = revisao?.contribuicoes.length ?? 0;
  const sem = revisao?.status === "sem-contribuicao";
  const meses = useMemo(() => new Set(revisao?.contribuicoes.map((c) => c.mes).filter(Boolean)), [revisao]);
  const global = !!revisao?.contribuicoes.some((c) => c.escopo === "global");

  const acoes = (
    <div className="orc-acoes">
      <button type="button" className={`orc-btn orc-btn-contrib${n ? " ativo" : ""}`} onClick={onContribuir}>
        {n ? `${n} contribuiç${n > 1 ? "ões" : "ão"}` : "Contribuir"}
      </button>
      <button type="button" className={`orc-btn orc-btn-sem${sem ? " ativo" : ""}`} onClick={onSem} aria-pressed={sem}>
        {sem ? "✓ Sem contribuição" : "Sem contribuição"}
      </button>
    </div>
  );

  const estado = n ? " orc-com" : sem ? " orc-sem" : "";
  return (
    <tr className={`orc-linha orc-${tipo}${recuo ? " orc-recuo" : ""}${estado}`}>
      <th scope="row" className="orc-col-desc">
        <div className="orc-desc">
          {expandir ? (
            <button type="button" className="orc-expandir" onClick={expandir.alternar} aria-expanded={expandir.aberto}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
              <span>{linha.nome}</span>
              <small>{expandir.aberto ? "recolher" : `${expandir.n} itens`}</small>
            </button>
          ) : (
            <span className="orc-nome">{linha.nome}</span>
          )}
        </div>
        <div className="orc-acoes-mobile">{acoes}</div>
      </th>
      <td className="orc-col-ref" title={fmtCompleto(ref, natureza)}>{fmtTabela(ref, natureza)}</td>
      <td className={`orc-col-anual${global ? " orc-marcado" : ""}`} title={fmtCompleto(anual, natureza)}>{fmtTabela(anual, natureza)}</td>
      <td className="orc-var">{fmtVariacao(anual, ref, natureza)}</td>
      {v27.map((x, i) => (
        <td key={i} title={fmtCompleto(x, natureza)} className={meses.has(i + 1) ? "orc-marcado" : undefined}>
          {fmtTabela(x, natureza)}
        </td>
      ))}
      <td className="orc-col-acoes">{acoes}</td>
    </tr>
  );
}
