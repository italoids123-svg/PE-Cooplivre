"use client";

import { idade } from "@/lib/acompanhamento";
import { PILARES } from "@/lib/data";
import { AVALIACAO_LABEL, STATUS_LABEL, type Acompanhamento, type ResponsavelAcompanhado, type RespostaRascunho } from "@/lib/types";

const primeiroNome = (nome: string) => nome.split(" ")[0];

function Conteudo({ r }: { r: RespostaRascunho }) {
  const linhas: [string, string][] = [
    ["Indicador", r.indicador],
    ["Meta", r.meta],
    ["Iniciativas", r.iniciativas],
    ["Comentário", r.comentario],
  ];
  return (
    <>
      {r.avaliacao && <span className={`chip chip-${r.avaliacao}`}>{AVALIACAO_LABEL[r.avaliacao]}</span>}
      {linhas.filter(([, v]) => v.trim()).map(([k, v]) => (
        <p key={k}><i>{k}:</i> {v}</p>
      ))}
      {!r.avaliacao && !linhas.some(([, v]) => v.trim()) && <p className="acomp-vazio">Sem conteúdo ainda.</p>}
    </>
  );
}

// Quadro dentro de cada objetivo: o que cada responsável do pilar marcou/escreveu.
export function QuadroObjetivo({ objetivoId, responsaveis, geradoEm }: {
  objetivoId: string;
  responsaveis: ResponsavelAcompanhado[];
  geradoEm: string;
}) {
  if (!responsaveis.length) return null;
  return (
    <div className="acomp">
      <p className="acomp-titulo">Revisão do responsável <span>· atualiza a cada 10 s</span></p>
      {responsaveis.map((resp) => {
        const o = resp.objetivos[objetivoId];
        const atual = o?.emEdicao ?? o?.salvo;
        return (
          <div key={resp.id} className="acomp-resp">
            <div className="acomp-quem">
              <b>{primeiroNome(resp.nome)}</b>
              {o?.emEdicao ? (
                <span className="acomp-tag acomp-editando">em edição · {idade(geradoEm, o.emEdicao.atualizadoEm)}</span>
              ) : o?.salvo ? (
                <span className="acomp-tag acomp-salvo">✓ salvo · {idade(geradoEm, o.salvo.atualizadoEm)}</span>
              ) : (
                <span className="acomp-tag">{resp.acessou ? "ainda não preencheu" : "ainda não acessou"}</span>
              )}
            </div>
            {atual && <Conteudo r={atual} />}
          </div>
        );
      })}
    </div>
  );
}

function resumo(r: ResponsavelAcompanhado, geradoEm: string): string {
  if (!r.acessou) return "ainda não acessou";
  if (r.status === "enviada" || r.status === "reenviada") return STATUS_LABEL[r.status].toLowerCase();
  const partes = [`${r.salvos}/${r.total} salvos`];
  if (r.emEdicao) partes.push(`${r.emEdicao} em edição`);
  if (r.ultimaAtividade) partes.push(`última atividade ${idade(geradoEm, r.ultimaAtividade)}`);
  return partes.join(" · ");
}

// Painel do mapa: andamento de cada responsável, por pilar.
export function PainelAcompanhamento({ dados, erro }: { dados: Acompanhamento | null; erro: string | null }) {
  return (
    <section className="acomp-painel" aria-live="polite">
      <h2>Acompanhamento dos responsáveis <span>· atualiza a cada 10 s</span></h2>
      {erro && <p className="status status-erro">{erro}</p>}
      {!dados ? (
        <p className="acomp-vazio">Carregando…</p>
      ) : (
        <ul>
          {dados.pilares.filter((p) => p.responsaveis.length).map((p) => {
            const pilar = PILARES.find((x) => x.slug === p.slug)!;
            return (
              <li key={p.slug} style={{ "--cor": pilar.cor } as React.CSSProperties}>
                <span className="acomp-pilar">{pilar.nome}</span>
                {p.responsaveis.map((r) => (
                  <span key={r.id} className={`acomp-linha${r.emEdicao ? " acomp-linha-ativa" : ""}`}>
                    <b>{primeiroNome(r.nome)}</b> {resumo(r, dados.geradoEm)}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
