"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { geralId, objetivosVisiveis, PILARES } from "@/lib/data";
import { useParticipante } from "@/lib/participante";
import { useMinhasRespostas } from "@/lib/respostas-client";
import { MapaEstrategico, type Progresso } from "./MapaEstrategico";
import { TopBar } from "./TopBar";

export function MapaPage() {
  const router = useRouter();
  const p = useParticipante();
  const { respostas } = useMinhasRespostas(p?.id);

  useEffect(() => {
    if (p === null) router.replace("/");
  }, [p, router]);

  const progresso = useMemo(() => {
    if (!respostas) return null;
    const out: Record<string, Progresso> = {};
    for (const pilar of PILARES) {
      const objs = objetivosVisiveis(pilar);
      out[pilar.slug] = { total: objs.length, feitos: objs.filter((o) => respostas[o.id]).length };
    }
    return out;
  }, [respostas]);

  if (!p) return <div className="pagina" />;

  const total = progresso ? Object.values(progresso).reduce((a, b) => a + b.total, 0) : 0;
  const feitos = progresso ? Object.values(progresso).reduce((a, b) => a + b.feitos, 0) : 0;

  return (
    <div className="pagina">
      <TopBar />
      <main className="mapa-main">
        <div className="mapa-head">
          <div>
            <p className="eyebrow">Avança Cooplivre 27–30</p>
            <h1>Mapa Estratégico Cooplivre</h1>
            <p className="mapa-sub">
              Olá, {p.nome.split(" ")[0]}! Toque em um pilar para revisar seus objetivos, indicadores, metas e iniciativas.
            </p>
          </div>
          {progresso && (
            <div className="mapa-prog" aria-live="polite">
              <b>{feitos}<small>/{total}</small></b>
              <span>objetivos revisados</span>
              <div className="barra"><i style={{ width: `${total ? (feitos / total) * 100 : 0}%` }} /></div>
            </div>
          )}
        </div>

        <div className="mapa-wrap">
          <MapaEstrategico comTemas progresso={progresso} />
          <MapaEstrategico comTemas={false} progresso={progresso} />
        </div>

        <ul className="pilar-lista">
          {PILARES.map((pilar) => {
            const prog = progresso?.[pilar.slug];
            const sugeriu = respostas?.[geralId(pilar.slug)];
            return (
              <li key={pilar.slug}>
                <Link href={`/pilar/${pilar.slug}`} className="pilar-item" style={{ "--cor": pilar.cor } as React.CSSProperties}>
                  <span className="pilar-item-nome">{pilar.nome}</span>
                  <span className="pilar-item-temas">{pilar.temas.join(" · ")}</span>
                  {prog && (
                    <span className="pilar-item-prog">
                      {prog.feitos}/{prog.total} objetivos revisados{sugeriu ? " · sugestão geral enviada" : ""}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
