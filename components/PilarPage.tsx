"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { geralId, getPilar, objetivosVisiveis, PILARES } from "@/lib/data";
import { useParticipante } from "@/lib/participante";
import { useMinhasRespostas } from "@/lib/respostas-client";
import { ObjetivoCard, SugestaoGeralCard } from "./ObjetivoCard";
import { TopBar } from "./TopBar";

export function PilarPage({ slug }: { slug: string }) {
  const router = useRouter();
  const p = useParticipante();
  const { respostas, erro, registrar } = useMinhasRespostas(p?.id);
  const pilar = getPilar(slug)!;
  const objetivos = objetivosVisiveis(pilar);

  useEffect(() => {
    if (p === null) router.replace("/");
  }, [p, router]);

  if (!p) return <div className="pagina" />;

  const idx = PILARES.findIndex((x) => x.slug === slug);
  const anterior = PILARES[(idx - 1 + PILARES.length) % PILARES.length];
  const proximo = PILARES[(idx + 1) % PILARES.length];
  const feitos = respostas ? objetivos.filter((o) => respostas[o.id]).length : 0;

  return (
    <div className="pagina" style={{ "--cor": pilar.cor } as React.CSSProperties}>
      <TopBar voltar />
      <section className="pilar-hero">
        <div className="pilar-hero-in">
          <p className="eyebrow eyebrow-claro">Pilar estratégico</p>
          <h1>{pilar.nome}</h1>
          <ul className="pilar-temas">
            {pilar.temas.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <p className="pilar-hero-prog">
            {respostas ? `${feitos} de ${objetivos.length} objetivos revisados por você` : "Carregando suas respostas…"}
          </p>
        </div>
      </section>

      <main className="pilar-main">
        <div className="instrucao">
          <b>Como revisar</b>
          Para cada objetivo, diga se concorda com o indicador, a meta e as iniciativas propostas. Se algo pode
          melhorar, escreva sua sugestão — seja específico: qual número, qual ação, por quê. Você pode voltar e
          editar suas respostas até o fim do evento.
        </div>
        {erro && <div className="aviso aviso-erro">{erro}</div>}

        {!respostas ? (
          <div className="carregando">Carregando…</div>
        ) : (
          <>
            {objetivos.map((o, i) => (
              <ObjetivoCard
                key={o.id}
                numero={i + 1}
                objetivo={o}
                participante={p}
                salva={respostas[o.id]}
                onSalvo={registrar}
              />
            ))}
            <SugestaoGeralCard
              key={geralId(pilar.slug)}
              pilar={pilar}
              participante={p}
              salva={respostas[geralId(pilar.slug)]}
              onSalvo={registrar}
            />
          </>
        )}

        <nav className="pager">
          <Link href={`/pilar/${anterior.slug}`}>← {anterior.nome}</Link>
          <Link href="/mapa" className="pager-mapa">Voltar ao mapa</Link>
          <Link href={`/pilar/${proximo.slug}`}>{proximo.nome} →</Link>
        </nav>
      </main>
    </div>
  );
}
