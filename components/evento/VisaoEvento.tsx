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
        {tela === "" || tela === "estrategia" || tela === "governanca" || tela === "caminho" || tela === "chegar" ? <Palco>{conteudo}</Palco> : conteudo}
      </div>
    </div>
  );
}

// ---------------- Palco: tela inteira sem rolagem

// Capa, Nossa estratégia, Nosso caminho, Governança e Onde queremos chegar são desenhadas como um slide de 1180×840 e
// escaladas para caber na janela (abaixo da barra), como numa apresentação. A largura
// acompanha a janela, então os fundos vão de ponta a ponta. Em telas pequenas
// (celular ou janela muito baixa) a página volta a rolar normalmente.
const PALCO = { largura: 1180, altura: 840, barra: 56 };

function assinarJanela(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
const lerJanela = () => `${window.innerWidth}x${window.innerHeight}`;

function Palco({ children }: { children: React.ReactNode }) {
  const janela = useSyncExternalStore(assinarJanela, lerJanela, () => "");
  const [w, h] = janela.split("x").map(Number);
  const util = h - PALCO.barra;
  if (!janela || w < 760 || util < 460) return <>{children}</>;
  const escala = Math.min(util / PALCO.altura, w / PALCO.largura);
  return (
    <div className={s.palco} style={{ height: util }}>
      <div className={s.palcoIn} style={{ width: w / escala, height: util / escala, transform: `scale(${escala})` }}>
        {children}
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
        <p className={s.dica}>Toque em um pilar para ver prioridades e objetivos.</p>
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
                <span className={s.zigueBola} style={{ background: pl.cor, color: "#ffffff" }}>
                  <Ico nome={pl.icone} />
                </span>
                <span className={s.zigueNum}>{i + 1}</span>
              </span>
              <b>{pl.nome}</b>
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

// Prioridade clicada: abre o objetivo correspondente na lista e rola até ele.
function abrirObjetivo(id: string) {
  const el = document.getElementById(`obj-${id}`) as HTMLDetailsElement | null;
  if (!el) return;
  el.open = true;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.remove(s.objetivoDestaque);
  void el.offsetWidth;
  el.classList.add(s.objetivoDestaque);
}

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
                style={{ background: x.cor }}
                onClick={() => ir(`pilar-${i + 1}`)}
              />
            ))}
          </div>
        }
      />
      <main className={s.pagina}>
        <article className={s.pilarCard}>
          <aside className={s.pilarLado} style={{ background: pl.cor, color: "#ffffff" }}>
            <span className={s.pilarNum}>{pl.numero}</span>
            <span className={s.pilarIco} style={{ color: pl.cor }}><Ico nome={pl.icone} /></span>
            <span className={s.pilarLema}>{pl.lema}</span>
          </aside>
          <div className={s.pilarCorpo}>
            <h2>{pl.nome}</h2>
            <p className={s.pilarIntencao}><Destaque texto={pl.intencao} /></p>
            <p className={s.rotulo} style={{ color: pl.cor }}>Prioridades</p>
            <ul className={s.prioridades}>
              {pl.prioridades.map((pr) => (
                <li key={pr.texto}>
                  <button type="button" className={s.prioridade} onClick={() => abrirObjetivo(pr.objetivo)}>
                    <span className={s.checkMini} style={{ background: pl.cor }}><Check /></span>
                    <span className={s.prioridadeTexto}>{pr.texto}</span>
                    <span className={s.prioridadeCodigo} style={{ color: pl.cor, borderColor: pl.cor }}>
                      {getPilar(pl.slug)!.objetivos.find((o) => o.id === pr.objetivo)?.codigo}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <section className={s.objetivos}>
          <p className={s.eyebrow}>No plano 2027–2030</p>
          <h2 className={s.secTitulo}>Objetivos do pilar</h2>
          {objetivos.map((o) => (
            <details key={o.id} id={`obj-${o.id}`} className={s.objetivo}>
              <summary>
                <span className={s.objCodigo} style={{ background: pl.cor, color: "#ffffff" }}>{o.codigo}</span>
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
            ← {indice ? PILARES_EVENTO[indice - 1].nome : "Os 5 pilares"}
          </button>
          {indice < 4 ? (
            <button type="button" className={s.btnLima} onClick={() => ir(`pilar-${indice + 2}`)}>
              {PILARES_EVENTO[indice + 1].nome} →
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


// ---------------- Nosso caminho (imagem 4)

// Estrada horizontal (viewBox 1000×460): marcos alternando acima e abaixo da linha
// central, com o texto do lado de fora da curva.
const MARCOS = [
  { x: 13, y: 190, cima: true },
  { x: 37.5, y: 270, cima: false },
  { x: 62.5, y: 190, cima: true },
  { x: 87, y: 270, cima: false },
];
const ESTRADA =
  "M -20 270 C 50 270, 80 190, 130 190 C 230 190, 280 270, 375 270 C 470 270, 530 190, 625 190 C 720 190, 770 270, 870 270 C 940 270, 960 230, 1020 230";

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
          <svg className={s.estradaSvg} viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true">
            <path className={s.estradaPista} d={ESTRADA} />
            <path className={s.estradaFaixa} d={ESTRADA} />
          </svg>
          {AGENDA.map((a, i) => {
            const m = MARCOS[i];
            const topo = (m.y / 460) * 100;
            return (
              <div key={a.ano} className={s.marco} style={{ "--atraso": `${i * 0.15}s` } as React.CSSProperties}>
                <span className={s.marcoBola} style={{ left: `${m.x}%`, top: `${topo}%`, background: a.cor, color: a.tinta }}>{a.ano}</span>
                <div
                  className={s.marcoTexto}
                  style={m.cima ? { left: `${m.x}%`, bottom: `calc(${100 - topo}% + 74px)` } : { left: `${m.x}%`, top: `calc(${topo}% + 74px)` }}
                >
                  <b className={s.marcoFase}>{a.fase}</b>
                  <p className={s.marcoCaixa}>{a.texto}</p>
                </div>
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
      <main className={`${s.pagina} ${s.paginaMedia}`}>
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

// Corrente de "infinitos": uma linha contínua que laça cada bola, alternando por cima
// e por baixo, e se cruza entre uma bola e a seguinte. viewBox 1000×300 esticado na
// largura (as bolas ficam no centro de cada uma das 5 colunas: x = 100, 300, …, 900).
// A bola fica centrada em y = 170px da área do SVG (340px de altura).
const ELOS = { cy: 170, rx: 80, ry: 112 };
function caminhoElos(n: number): string {
  const xs = Array.from({ length: n }, (_, i) => 100 + i * 200);
  // Lado do laço: na ida, bolas pares por cima e ímpares por baixo; na volta, o inverso.
  const lado = (i: number, volta: boolean) => ((i % 2 === 0) !== volta ? -1 : 1);
  const k = Math.SQRT1_2;
  const arco = (x: number, sy: number, dir: 1 | -1): [number, number][] => [
    [x - dir * ELOS.rx * k, ELOS.cy + sy * ELOS.ry * k],
    [x, ELOS.cy + sy * ELOS.ry],
    [x + dir * ELOS.rx * k, ELOS.cy + sy * ELOS.ry * k],
  ];
  const p: [number, number][] = [[xs[0] - ELOS.rx, ELOS.cy]];
  xs.forEach((x, i) => {
    p.push(...arco(x, lado(i, false), 1));
    if (i < n - 1) p.push([x + 100, ELOS.cy]);
  });
  p.push([xs[n - 1] + ELOS.rx, ELOS.cy]);
  for (let i = n - 1; i >= 0; i--) {
    p.push(...arco(xs[i], lado(i, true), -1));
    if (i > 0) p.push([xs[i] - 100, ELOS.cy]);
  }
  // Catmull-Rom fechado → Bézier cúbicas (curva suave passando por todos os pontos).
  const m = p.length;
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < m; i++) {
    const [p0, p1, p2, p3] = [p[(i - 1 + m) % m], p[i], p[(i + 1) % m], p[(i + 2) % m]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const CAMINHO_ELOS = caminhoElos(PAINEL_2030.length);

function TelaChegar() {
  return (
    <>
      <Cabecalho etiqueta="Onde queremos chegar" titulo="Painel de sucesso 2030" />
      <main className={`${s.pagina} ${s.paginaLarga}`}>
        <div className={s.elos}>
          <div className={s.elosIn}>
            <svg className={s.elosSvg} viewBox="0 0 1000 340" preserveAspectRatio="none" aria-hidden="true">
              <path d={CAMINHO_ELOS} />
            </svg>
            <div className={s.painel}>
              {PAINEL_2030.map((x) => (
                <div key={x.titulo} className={s.painelItem}>
                  <span className={s.painelBola} style={{ background: x.cor, color: x.tinta }}>
                    <Ico nome={x.icone} />
                    <span className={s.painelCheck} style={{ color: x.cor }}><Check /></span>
                  </span>
                  <b>{x.titulo}</b>
                  <span>{x.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Seguir atual="chegar" />
      </main>
    </>
  );
}
