"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getPilar, objetivosVisiveis } from "@/lib/data";
import { useParticipante } from "@/lib/participante";
import { useMinhaRevisao } from "@/lib/respostas-client";
import { BotaoTelaCheia } from "../BotaoTelaCheia";
import { AGENDA, COR, DIRECIONADOR, GOVERNANCA, PAINEL_2030, PILARES_EVENTO, PRINCIPIO, type Icone } from "./conteudo";
import { Check, Ico } from "./Icones";
import s from "./evento.module.css";

// Navegação por hash (#estrategia, #pilar-2…): o botão voltar do navegador funciona
// e cada tela pode ser aberta direto por link.
type Secao = "estrategia" | "caminho" | "governanca" | "chegar";
const SECOES: { id: Secao; titulo: string; texto: string; icone: Icone; cor: string; tinta: string }[] = [
  { id: "estrategia", titulo: "Nossa estratégia", texto: "Os 5 pilares e o direcionador", icone: "alvo", cor: COR.lima, tinta: COR.escuro },
  { id: "caminho", titulo: "Nosso caminho", texto: "A agenda de 2027 a 2030", icone: "calendario", cor: COR.teal, tinta: "#ffffff" },
  { id: "governanca", titulo: "Governança", texto: "Quem acompanha e como", icone: "banco", cor: COR.verde, tinta: "#ffffff" },
  { id: "chegar", titulo: "Onde queremos chegar", texto: "Painel de sucesso 2030", icone: "negocio", cor: COR.roxo, tinta: "#ffffff" },
];

function assinarHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const lerHash = () => window.location.hash.replace(/^#/, "");

function ir(tela: string) {
  if (tela) window.location.hash = tela;
  else history.pushState(null, "", window.location.pathname);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  window.scrollTo({ top: 0 });
}

// "Texto com [destaque]" → destaque em negrito.
function Destaque({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\[[^\]]+\])/).map((t, i) =>
        t.startsWith("[") ? <strong key={i}>{t.slice(1, -1)}</strong> : <span key={i}>{t}</span>,
      )}
    </>
  );
}

export function VisaoEvento({ fonte }: { fonte: string }) {
  const router = useRouter();
  const p = useParticipante();
  const { respostas, evento } = useMinhaRevisao(p?.id);
  const tela = useSyncExternalStore(assinarHash, lerHash, () => "");

  useEffect(() => {
    if (p === null) router.replace("/");
  }, [p, router]);

  if (!p || !respostas) return <div className={`${s.evento} ${fonte}`} />;
  if (!evento) {
    return (
      <div className={`${s.evento} ${fonte}`}>
        <div className={s.semAcesso}>
          <p>A visão evento não está disponível para o seu acesso.</p>
          <Link href="/mapa" className={s.btnLima}>Voltar ao mapa</Link>
        </div>
      </div>
    );
  }

  const pilarN = /^pilar-([1-5])$/.exec(tela)?.[1];
  let conteudo: React.ReactNode;
  if (pilarN) conteudo = <TelaPilar indice={Number(pilarN) - 1} />;
  else if (tela === "estrategia") conteudo = <TelaEstrategia />;
  else if (tela === "caminho") conteudo = <TelaCaminho />;
  else if (tela === "governanca") conteudo = <TelaGovernanca />;
  else if (tela === "chegar") conteudo = <TelaChegar />;
  else conteudo = <TelaCapa />;

  const ativa = pilarN ? "estrategia" : tela;
  return (
    <div className={`${s.evento} ${fonte}`}>
      <nav className={s.barra} aria-label="Navegação da visão evento">
        <button type="button" className={s.marca} onClick={() => ir("")} aria-label="Início da visão evento">
          <span className={s.marcaSelo} aria-hidden="true">
            <svg viewBox="0 0 24 20"><path d="M2 2h20L12 18z" fill={COR.verde} /><path d="M7 2h10l-5 9z" fill={COR.teal} /></svg>
          </span>
          <b>Plano Estratégico</b>
          <span>2027–2030</span>
        </button>
        <div className={s.barraLinks}>
          {SECOES.map((x) => (
            <button key={x.id} type="button" className={`${s.barraLink}${ativa === x.id ? ` ${s.barraLinkAtivo}` : ""}`} onClick={() => ir(x.id)}>
              {x.titulo}
            </button>
          ))}
        </div>
        <div className={s.barraAcoes}>
          <BotaoTelaCheia />
          <Link href="/mapa" className={s.barraMapa}>Mapa estratégico</Link>
        </div>
      </nav>
      <div key={tela} className={s.entrada}>
        {conteudo}
      </div>
    </div>
  );
}

// ---------------- Capa (imagem 1) + 5 acessos

function TelaCapa() {
  return (
    <>
      <section className={s.capa}>
        <div className={s.capaIn}>
          <span className={s.pilula}>Ciclo 2027–2030</span>
          <h1 className={s.capaTitulo}>
            Plano
            <br />
            Estratégico<i className={s.ponto}>.</i>
          </h1>
          <p className={s.capaSub}>Cinco pilares conectados para gerar valor ao cooperado, à cooperativa e à comunidade.</p>
        </div>
        <div className={s.capaArte} aria-hidden="true">
          <span className={`${s.bola} ${s.bolaTeal}`}><Check className={s.bolaCheck} /></span>
          <span className={`${s.bola} ${s.bolaVerde}`}><Check className={s.bolaCheck} /></span>
          <span className={`${s.bola} ${s.bolaRoxa}`} />
          <span className={`${s.bola} ${s.bolaLima}`} />
        </div>
        <Onda className={s.capaOnda} />
      </section>

      <section className={s.acessos} aria-label="Explore o plano">
        <p className={s.eyebrow}>Explore o plano</p>
        <div className={s.acessosGrade}>
          {SECOES.map((x, i) => (
            <button key={x.id} type="button" className={s.acesso} onClick={() => ir(x.id)}>
              <span className={s.acessoNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.acessoIco} style={{ background: x.cor, color: x.tinta }}><Ico nome={x.icone} /></span>
              <b>{x.titulo}</b>
              <span>{x.texto}</span>
            </button>
          ))}
          <Link href="/mapa" className={`${s.acesso} ${s.acessoEscuro}`}>
            <span className={s.acessoNum}>05</span>
            <span className={s.acessoIco} style={{ background: COR.lima, color: COR.escuro }}><Ico nome="painel" /></span>
            <b>Mapa estratégico</b>
            <span>Objetivos, indicadores e metas</span>
          </Link>
        </div>
      </section>
    </>
  );
}

// ---------------- Cabeçalho escuro com onda (imagens 3 e 4)

function Onda({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 40 C 300 0, 520 0, 760 30 S 1180 70, 1440 10 L1440 90 L0 90 Z" fill="currentColor" />
    </svg>
  );
}

function Cabecalho({ etiqueta, titulo, pontos }: { etiqueta: string; titulo: string; pontos?: React.ReactNode }) {
  return (
    <header className={s.cab}>
      <div className={s.cabIn}>
        <div>
          <span className={s.pilula}>{etiqueta}</span>
          <h1 className={s.cabTitulo}>
            {titulo}
            <i className={s.ponto}>.</i>
          </h1>
        </div>
        {pontos}
      </div>
      <Onda className={s.cabOnda} />
    </header>
  );
}

function Seguir({ atual }: { atual: Secao }) {
  const i = SECOES.findIndex((x) => x.id === atual);
  const ant = SECOES[i - 1];
  const prox = SECOES[i + 1];
  return (
    <div className={s.seguir}>
      <button type="button" className={s.btnLinha} onClick={() => ir(ant ? ant.id : "")}>
        ← {ant ? ant.titulo : "Início"}
      </button>
      {prox ? (
        <button type="button" className={s.btnLima} onClick={() => ir(prox.id)}>
          {prox.titulo} →
        </button>
      ) : (
        <button type="button" className={s.btnLima} onClick={() => ir("")}>
          Voltar ao início
        </button>
      )}
    </div>
  );
}

// ---------------- Nossa estratégia (imagem 2)

function TelaEstrategia() {
  return (
    <>
      <Cabecalho etiqueta="Nossa estratégia" titulo="Os 5 pilares" />
      <main className={s.pagina}>
        <p className={s.dica}>Toque em um pilar para ver prioridades, indicadores e objetivos.</p>
        <div className={s.zigue}>
          <svg className={s.zigueLinha} viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="100,80 300,195 500,80 700,195 900,80" />
          </svg>
          {PILARES_EVENTO.map((pl, i) => (
            <button
              key={pl.slug}
              type="button"
              className={`${s.zigueItem}${i % 2 ? ` ${s.zigueBaixo}` : ""}`}
              onClick={() => ir(`pilar-${i + 1}`)}
            >
              <span className={s.zigueAro}>
                <span className={s.zigueBola} style={{ background: pl.cor, color: pl.tinta }}>
                  <Ico nome={pl.icone} />
                </span>
                <span className={s.zigueNum} style={i === 4 ? { background: COR.lima, color: COR.escuro } : undefined}>{i + 1}</span>
              </span>
              <b>{pl.curto}</b>
              <span>{pl.lema}</span>
            </button>
          ))}
        </div>

        <div className={s.direcionador}>
          <span className={s.aspas} aria-hidden="true">“</span>
          <div>
            <p className={s.direcionadorEtiqueta}>Direcionador estratégico</p>
            <p className={s.direcionadorTexto}>{DIRECIONADOR}</p>
          </div>
        </div>
        <Seguir atual="estrategia" />
      </main>
    </>
  );
}

// ---------------- Detalhe do pilar (imagem 3)

function TelaPilar({ indice }: { indice: number }) {
  const pl = PILARES_EVENTO[indice];
  const objetivos = objetivosVisiveis(getPilar(pl.slug)!);
  const titulo = indice < 3 ? "Como vamos chegar lá" : "Perto do cooperado, junto da comunidade";
  return (
    <>
      <Cabecalho
        etiqueta={`Pilar ${pl.numero}`}
        titulo={titulo}
        pontos={
          <div className={s.pontos} role="tablist" aria-label="Pilares">
            {PILARES_EVENTO.map((x, i) => (
              <button
                key={x.slug}
                type="button"
                role="tab"
                aria-selected={i === indice}
                aria-label={x.nome}
                title={x.nome}
                className={`${s.pontinho}${i === indice ? ` ${s.pontinhoAtivo}` : ""}`}
                style={{ background: x.cor === COR.escuro ? "#5c7b82" : x.cor }}
                onClick={() => ir(`pilar-${i + 1}`)}
              />
            ))}
          </div>
        }
      />
      <main className={s.pagina}>
        <article className={s.pilarCard}>
          <aside className={s.pilarLado} style={{ background: pl.cor, color: pl.tinta }}>
            <span className={s.pilarNum} style={{ color: pl.destaque === "#ffffff" ? "#ffffff" : pl.destaque }}>{pl.numero}</span>
            <span className={s.pilarIco} style={{ color: COR.escuro }}><Ico nome={pl.icone} /></span>
            <span className={s.pilarLema}>{pl.lema}</span>
          </aside>
          <div className={s.pilarCorpo}>
            <h2>{pl.nome}</h2>
            <p className={s.pilarIntencao}><Destaque texto={pl.intencao} /></p>
            <div className={s.pilarColunas}>
              <div>
                <p className={s.rotulo} style={{ color: corRotulo(pl.cor) }}>Prioridades</p>
                <ul className={s.prioridades}>
                  {pl.prioridades.map((t) => (
                    <li key={t}>
                      <span className={s.checkMini} style={{ background: corMarca(pl.cor) }}><Check /></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={s.rotulo} style={{ color: corRotulo(pl.cor) }}>Indicadores</p>
                <ul className={s.chips}>
                  {pl.indicadores.map((t) => (
                    <li key={t} style={{ borderColor: corMarca(pl.cor) }}>
                      <i style={{ background: corMarca(pl.cor) }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>

        <section className={s.objetivos}>
          <p className={s.eyebrow}>No plano 2027–2030</p>
          <h2 className={s.secTitulo}>Objetivos do pilar</h2>
          {objetivos.map((o) => (
            <details key={o.id} className={s.objetivo}>
              <summary>
                <span className={s.objCodigo} style={{ background: corMarca(pl.cor), color: pl.cor === COR.lima ? COR.escuro : "#ffffff" }}>{o.codigo}</span>
                <span className={s.objTitulo}>{o.titulo}</span>
                <span className={s.objSeta} aria-hidden="true">+</span>
              </summary>
              <div className={s.objCorpo}>
                <table>
                  <thead>
                    <tr><th>Indicador</th><th>Meta</th></tr>
                  </thead>
                  <tbody>
                    {o.kpis.map((k, i) => (
                      <tr key={i}>
                        <td>{k.indicador ?? "Em definição"}</td>
                        <td>{k.meta ?? "Em definição"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {o.iniciativas.length > 0 && (
                  <>
                    <p className={s.rotulo}>Iniciativas</p>
                    <ul className={s.iniciativas}>
                      {o.iniciativas.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </details>
          ))}
        </section>

        <div className={s.seguir}>
          <button type="button" className={s.btnLinha} onClick={() => ir(indice ? `pilar-${indice}` : "estrategia")}>
            ← {indice ? PILARES_EVENTO[indice - 1].curto : "Os 5 pilares"}
          </button>
          {indice < 4 ? (
            <button type="button" className={s.btnLima} onClick={() => ir(`pilar-${indice + 2}`)}>
              {PILARES_EVENTO[indice + 1].curto} →
            </button>
          ) : (
            <button type="button" className={s.btnLima} onClick={() => ir("estrategia")}>
              Os 5 pilares
            </button>
          )}
        </div>
      </main>
    </>
  );
}

// Lima e escuro não contrastam como texto sobre fundo claro: usa tons legíveis.
const corRotulo = (cor: string) => (cor === COR.lima ? "#7f9220" : cor === COR.escuro ? COR.teal : cor);
const corMarca = (cor: string) => (cor === COR.escuro ? COR.teal : cor);

// ---------------- Nosso caminho (imagem 4)

// Posições (em % da área da estrada) de cada marco e do seu texto.
const MARCOS: { bola: [number, number]; fase: [number, number]; caixa: React.CSSProperties }[] = [
  { bola: [8, 12.2], fase: [14, 12.2], caixa: { left: "17%", top: "27%" } },
  { bola: [56, 23.8], fase: [62, 23.8], caixa: { left: "60%", top: "31%" } },
  { bola: [9, 65], fase: [15, 65], caixa: { left: "17%", top: "70%" } },
  { bola: [54, 83.7], fase: [60, 83.7], caixa: { right: "8%", top: "88.5%" } },
];

function TelaCaminho() {
  return (
    <>
      <Cabecalho
        etiqueta="Agenda estratégica"
        titulo="O caminho até 2030"
        pontos={
          <div className={s.pontos} aria-hidden="true">
            {AGENDA.map((a) => <span key={a.ano} className={s.pontinho} style={{ background: a.cor }} />)}
          </div>
        }
      />
      <main className={s.pagina}>
        <div className={s.estrada}>
          <svg className={s.estradaSvg} viewBox="0 0 1000 860" preserveAspectRatio="none" aria-hidden="true">
            <path className={s.estradaPista} d="M 80 105 C 150 175, 240 205, 340 205 L 760 205 C 910 205, 940 300, 940 340 C 940 430, 860 470, 760 470 L 220 470 C 110 470, 70 520, 70 600 C 70 690, 130 720, 230 720 L 900 720" />
            <path className={s.estradaFaixa} d="M 80 105 C 150 175, 240 205, 340 205 L 760 205 C 910 205, 940 300, 940 340 C 940 430, 860 470, 760 470 L 220 470 C 110 470, 70 520, 70 600 C 70 690, 130 720, 230 720 L 900 720" />
          </svg>
          {AGENDA.map((a, i) => {
            const m = MARCOS[i];
            return (
              <div key={a.ano} className={s.marco} style={{ "--atraso": `${i * 0.15}s` } as React.CSSProperties}>
                <span className={s.marcoBola} style={{ left: `${m.bola[0]}%`, top: `${m.bola[1]}%`, background: a.cor, color: a.tinta }}>{a.ano}</span>
                <b className={s.marcoFase} style={{ left: `${m.fase[0]}%`, top: `${m.fase[1]}%` }}>{a.fase}</b>
                <p className={s.marcoCaixa} style={m.caixa}>{a.texto}</p>
              </div>
            );
          })}
          <span className={s.bandeira} aria-hidden="true" />
        </div>

        {/* Versão em lista para telas estreitas */}
        <ol className={s.linhaTempo}>
          {AGENDA.map((a) => (
            <li key={a.ano}>
              <span className={s.marcoBolaLista} style={{ background: a.cor, color: a.tinta }}>{a.ano}</span>
              <div>
                <b>{a.fase}</b>
                <p>{a.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <Seguir atual="caminho" />
      </main>
    </>
  );
}

// ---------------- Governança (imagem 5)

function TelaGovernanca() {
  return (
    <>
      <Cabecalho etiqueta="Governança da execução" titulo="Quem acompanha e como" />
      <main className={s.pagina}>
        <div className={s.governanca}>
          <ol className={s.govLista}>
            {GOVERNANCA.map((g) => (
              <li key={g.titulo}>
                <span className={s.govIco} style={{ background: g.cor, color: g.tinta }}><Ico nome={g.icone} /></span>
                <b>{g.titulo}</b>
              </li>
            ))}
          </ol>
        </div>
        <div className={s.principio}>
          <span className={s.principioIco}><Ico nome="alvo" /></span>
          <div>
            <p className={s.principioEtiqueta}>Princípio orientador</p>
            <p className={s.principioTexto}><Destaque texto={PRINCIPIO} /></p>
          </div>
        </div>
        <Seguir atual="governanca" />
      </main>
    </>
  );
}

// ---------------- Onde queremos chegar (painel de sucesso 2030)

function TelaChegar() {
  return (
    <>
      <Cabecalho etiqueta="Onde queremos chegar" titulo="Painel de sucesso 2030" />
      <main className={s.pagina}>
        <div className={s.painel}>
          {PAINEL_2030.map((x) => (
            <div key={x.titulo} className={s.painelItem}>
              <span className={s.painelBola} style={{ background: x.cor, color: x.tinta }}>
                <Ico nome={x.icone} />
                <span className={s.painelCheck}><Check /></span>
              </span>
              <b>{x.titulo}</b>
              <span>{x.texto}</span>
            </div>
          ))}
        </div>
        <Seguir atual="chegar" />
      </main>
    </>
  );
}
