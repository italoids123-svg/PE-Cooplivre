"use client";

import { idade } from "@/lib/acompanhamento";
import { PILARES } from "@/lib/data";
import { STATUS_LABEL, type Acompanhamento, type ResponsavelAcompanhado } from "@/lib/types";

const primeiroNome = (nome: string) => nome.split(" ")[0];

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
