"use client";

import { useEffect, useState } from "react";
import { PILARES } from "@/lib/data";
import { Ico } from "./Icones";
import {
  ACOMPANHAMENTO, CALENDARIO, CALENDARIO_NOTA, ESTRUTURA, MATRIZ, MOMENTOS, PAPEIS, PAPEL_COMITE, PILAR_PAPEIS, SECRETARIA,
} from "./rituais";
import s from "./evento.module.css";

// Caixa "Rituais de acompanhamento" (tela Governança): ao clicar, abre o painel.
export function CaixaRituais({ abrir }: { abrir: () => void }) {
  return (
    <button type="button" className={s.rituaisCaixa} onClick={abrir}>
      <span className={s.rituaisIco}><Ico nome="ciclo" /></span>
      <span className={s.rituaisTexto}>
        <b>Rituais de acompanhamento</b>
        <span>Como o plano é acompanhado e desdobrado, da Diretoria até o time.</span>
      </span>
      <span className={s.rituaisMomentos} aria-hidden="true">
        {MOMENTOS.map((m) => (
          <span key={m.numero}>
            <i>{m.numero}</i>
            {m.nome}
            <small>{m.freq.split(" · ")[0]}</small>
          </span>
        ))}
      </span>
      <span className={s.rituaisVer}>Ver como funciona →</span>
    </button>
  );
}

const ABAS = [
  { id: "papel", titulo: "Papel dos comitês" },
  { id: "estrutura", titulo: "Estrutura" },
  { id: "momentos", titulo: "Os quatro momentos" },
  { id: "papeis", titulo: "Papéis" },
  { id: "matriz", titulo: "Quem faz o quê" },
  { id: "acompanhamento", titulo: "Como acompanhamos" },
  { id: "calendario", titulo: "Calendário 2027" },
] as const;
type Aba = (typeof ABAS)[number]["id"];

export function PainelRituais({ fechar }: { fechar: () => void }) {
  const [aba, setAba] = useState<Aba>("papel");
  const [momento, setMomento] = useState(0);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fechar]);

  return (
    <div className={s.rituaisFundo} onClick={fechar}>
      <section className={s.rituaisPainel} role="dialog" aria-modal="true" aria-label="Rituais de acompanhamento" onClick={(e) => e.stopPropagation()}>
        <header className={s.rituaisTopo}>
          <div>
            <p className={s.rituaisEtiqueta}>Plano Estratégico 2027–2030</p>
            <h2>Rituais de acompanhamento</h2>
          </div>
          <button type="button" className={s.rituaisFechar} onClick={fechar} aria-label="Fechar">×</button>
        </header>
        <nav className={s.rituaisAbas} role="tablist">
          {ABAS.map((a) => (
            <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={aba === a.id ? s.rituaisAbaAtiva : undefined} onClick={() => setAba(a.id)}>
              {a.titulo}
            </button>
          ))}
        </nav>

        <div className={s.rituaisCorpo} key={aba}>
          {aba === "papel" && (
            <>
              <h3>Para que servem os comitês</h3>
              <div className={s.rGrade4}>
                {PAPEL_COMITE.map((p, i) => (
                  <div key={p.titulo} className={s.rCartao}>
                    <i className={s.rNum}>{i + 1}</i>
                    <b>{p.titulo}</b>
                    <span>{p.texto}</span>
                  </div>
                ))}
              </div>
              <div className={s.rPilares}>
                <p>{PILAR_PAPEIS}</p>
                <div>
                  {PILARES.map((pl) => (
                    <span key={pl.slug} style={{ background: pl.cor }}>{pl.nome}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {aba === "estrutura" && (
            <>
              <h3>Quem aprova, quem decide, quem conduz e onde o plano chega ao time</h3>
              <div className={s.rEstrutura}>
                <ol className={s.rCascata}>
                  {ESTRUTURA.map((e, i) => (
                    <li key={e.nome} style={{ "--nivel": i } as React.CSSProperties}>
                      <b>{e.nome}{e.freq && <small>{e.freq}</small>}</b>
                      <span>{e.texto}</span>
                    </li>
                  ))}
                </ol>
                <aside className={s.rSecretaria}>
                  <b>{SECRETARIA.nome}</b>
                  <span>{SECRETARIA.texto}</span>
                  <p>Cada um dos cinco pilares tem um líder e um suplente nos comitês.</p>
                </aside>
              </div>
            </>
          )}

          {aba === "momentos" && (
            <>
              <h3>Os quatro momentos</h3>
              <div className={s.rMomentosLista} role="tablist">
                {MOMENTOS.map((m, i) => (
                  <button key={m.numero} type="button" role="tab" aria-selected={momento === i} className={momento === i ? s.rMomentoAtivo : undefined} onClick={() => setMomento(i)}>
                    <i className={s.rNum}>{m.numero}</i>
                    <b>{m.nome}</b>
                    <span>{m.freq}</span>
                  </button>
                ))}
              </div>
              <DetalheMomento indice={momento} />
            </>
          )}

          {aba === "papeis" && (
            <>
              <h3>Papéis e responsabilidades</h3>
              <div className={s.rGrade4}>
                {PAPEIS.map((p) => (
                  <div key={p.papel} className={s.rCartao}>
                    <b>{p.papel}</b>
                    <em>{p.verbo}</em>
                    <ul>{p.itens.map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                ))}
              </div>
            </>
          )}

          {aba === "matriz" && (
            <>
              <h3>Quem faz o quê em cada momento</h3>
              <table className={s.rMatriz}>
                <thead>
                  <tr>
                    <th />
                    {MOMENTOS.map((m) => <th key={m.numero}>{m.numero} · {m.nome}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MATRIZ.map((l) => (
                    <tr key={l.papel}>
                      <th>{l.papel}</th>
                      {l.celulas.map((c, i) => (
                        <td key={i} className={c.startsWith("Decide") ? s.rDecide : c === "Conduz" || c.startsWith("Conduz") ? s.rConduz : undefined}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={s.rRegra}>Regra simples: cada reunião tem um só condutor e, quando há decisão, um só decisor.</p>
            </>
          )}

          {aba === "acompanhamento" && (
            <>
              <h3>Um painel, um semáforo e uma página por pilar</h3>
              <div className={s.rGrade3}>
                <div className={s.rCartao}>
                  <b>Painel único</b>
                  <ul>{ACOMPANHAMENTO.painel.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
                <div className={s.rCartao}>
                  <b>Semáforo</b>
                  <ul className={s.rSemaforo}>
                    {ACOMPANHAMENTO.semaforo.map((x) => (
                      <li key={x.cor}><i data-cor={x.cor} /> <strong>{x.nome}</strong> {x.texto}</li>
                    ))}
                  </ul>
                </div>
                <div className={s.rCartao}>
                  <b>Uma página por pilar</b>
                  <ol className={s.rPassos}>
                    {ACOMPANHAMENTO.pagina.map((x) => <li key={x.titulo}><strong>{x.titulo}</strong> {x.texto}</li>)}
                  </ol>
                </div>
              </div>
            </>
          )}

          {aba === "calendario" && (
            <>
              <h3>Calendário 2027</h3>
              <p className={s.rLegenda}><span className={s.rE}>E</span> Comitê Estratégico <span className={s.rT}>T</span> Comitê Tático · os desdobramentos acontecem todo mês, após cada comitê.</p>
              <ol className={s.rCalendario}>
                {CALENDARIO.map((c) => (
                  <li key={c.mes} className={c.tipo === "E" ? s.rMesE : undefined}>
                    <b>{c.mes}</b>
                    <span className={c.tipo === "E" ? s.rE : s.rT}>{c.tipo}</span>
                    {c.nota && <small>{c.nota}</small>}
                  </li>
                ))}
              </ol>
              <p className={s.rRegra}>{CALENDARIO_NOTA}</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function DetalheMomento({ indice }: { indice: number }) {
  const m = MOMENTOS[indice];
  return (
    <div className={s.rMomento}>
      <div className={s.rMomentoCab}>
        <i className={s.rNumG}>{m.numero}</i>
        <div>
          <b>{m.nome}</b>
          <span>{m.freq} · {m.quando}</span>
        </div>
      </div>
      <div className={s.rMomentoGrade}>
        <div>
          <p className={s.rRotulo}>Quem</p>
          <ul>{m.quem.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className={s.rRotulo}>Para quê</p>
          <p>{m.paraQue}</p>
        </div>
        <div>
          <p className={s.rRotulo}>Pauta</p>
          <ol className={s.rPassos}>{m.pauta.map((t) => <li key={t}>{t}</li>)}</ol>
        </div>
        <div>
          <p className={s.rRotulo}>O que sai da reunião</p>
          <ul>{m.sai.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className={s.rImporta}><strong>Por que importa:</strong> {m.importa}</p>
        </div>
      </div>
    </div>
  );
}
