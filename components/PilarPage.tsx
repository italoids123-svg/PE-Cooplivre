"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { geralId, getPilar, objetivosVisiveis, type Pilar } from "@/lib/data";
import { useParticipante } from "@/lib/participante";
import { gravarRascunho, lerRascunho, salvarPilar, useMinhaRevisao, type MapaRespostas } from "@/lib/respostas-client";
import { CAMPOS_RESPOSTA, type Participante, type Resposta, type RespostaRascunho } from "@/lib/types";
import { ObjetivoCard, problemaDe, SugestaoGeralCard, VAZIO, type Mudar } from "./ObjetivoCard";
import { BotaoAjustes } from "./BotaoAjustes";
import { TopBar } from "./TopBar";

const deResposta = (r: Resposta | undefined): RespostaRascunho =>
  r ? { avaliacao: r.avaliacao, indicador: r.indicador, meta: r.meta, iniciativas: r.iniciativas, comentario: r.comentario } : VAZIO;

const igual = (a: RespostaRascunho, b: RespostaRascunho) => CAMPOS_RESPOSTA.every((c) => a[c] === b[c]);

export function PilarPage({ slug }: { slug: string }) {
  const router = useRouter();
  const p = useParticipante();
  const { respostas, enviadoEm, setServidor, erro, registrar } = useMinhaRevisao(p?.id);
  const pilar = getPilar(slug)!;

  useEffect(() => {
    if (p === null) router.replace("/");
  }, [p, router]);

  if (!p) return <div className="pagina" />;

  const objetivos = objetivosVisiveis(pilar);
  const salvos = respostas ? objetivos.filter((o) => respostas[o.id]?.avaliacao).length : 0;

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
            {!respostas
              ? "Carregando suas respostas…"
              : salvos === objetivos.length
                ? "✓ Pilar salvo"
                : `${objetivos.length} objetivos para revisar`}
          </p>
        </div>
      </section>

      <main className="pilar-main">
        {enviadoEm ? (
          <div className="aviso aviso-ok">
            Sua revisão foi enviada em {new Date(enviadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
            As respostas abaixo estão disponíveis só para consulta.
            <div className="envio-acoes">
              <BotaoAjustes participanteId={p.id} onReaberto={setServidor} />
            </div>
          </div>
        ) : (
          <div className="instrucao">
            <b>Como revisar</b>
            Avalie todos os objetivos deste pilar e clique em <b className="inline">Salvar pilar</b> no fim da página. Se algo
            pode melhorar, escreva sua sugestão — seja específico: qual número, qual ação, por quê. Depois de salvar os 5
            pilares, o botão <b className="inline">Enviar revisão</b> aparece no mapa.
          </div>
        )}
        {erro && <div className="aviso aviso-erro">{erro}</div>}

        {!respostas ? (
          <div className="carregando">Carregando…</div>
        ) : (
          // key: remonta o formulário com os dados do servidor assim que chegam.
          <FormularioPilar
            key={`${p.id}:${enviadoEm ?? "aberta"}`}
            pilar={pilar}
            participante={p}
            respostas={respostas}
            bloqueado={!!enviadoEm}
            onSalvo={(lista) => {
              registrar(lista);
              router.push(`/mapa?salvo=${pilar.slug}`);
            }}
          />
        )}
      </main>
    </div>
  );
}

function FormularioPilar({ pilar, participante, respostas, bloqueado, onSalvo }: {
  pilar: Pilar;
  participante: Participante;
  respostas: MapaRespostas;
  bloqueado: boolean;
  onSalvo: (r: Resposta[]) => void;
}) {
  const objetivos = objetivosVisiveis(pilar);
  const gid = geralId(pilar.slug);
  const ids = [...objetivos.map((o) => o.id), gid];

  // Rascunho local tem prioridade sobre o que está no servidor (é mais recente).
  const [forms, setForms] = useState<Record<string, RespostaRascunho>>(() =>
    Object.fromEntries(ids.map((id) => [id, (!bloqueado && lerRascunho(participante.id, id)) || deResposta(respostas[id])])),
  );
  const [mostrarProblemas, setMostrarProblemas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const sujos = ids.filter((id) => !igual(forms[id], deResposta(respostas[id])));
  const completo = objetivos.every((o) => respostas[o.id]?.avaliacao);
  const problemas = Object.fromEntries(objetivos.map((o) => [o.id, problemaDe(forms[o.id])]));
  const pendentes = objetivos.filter((o) => problemas[o.id]).length;

  const mudarDe = (id: string): Mudar => (k, v) => {
    setForms((atual) => {
      const novo = { ...atual[id], [k]: v };
      gravarRascunho(participante.id, id, igual(novo, deResposta(respostas[id])) ? null : novo);
      return { ...atual, [id]: novo };
    });
    setErro(null);
  };

  async function salvar() {
    setMostrarProblemas(true);
    const primeiro = objetivos.find((o) => problemas[o.id]);
    if (primeiro) {
      document.getElementById(primeiro.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      // Todos os objetivos vão juntos; o campo geral só se tiver algo ou já existia.
      const itens = objetivos.map((o) => ({ objetivoId: o.id, dados: forms[o.id] }));
      if (forms[gid].comentario.trim() || respostas[gid]) itens.push({ objetivoId: gid, dados: forms[gid] });
      const gravadas = await salvarPilar(participante, itens);
      for (const id of ids) gravarRascunho(participante.id, id, null);
      onSalvo(gravadas);
    } catch (e) {
      setErro((e as Error).message);
      setSalvando(false);
    }
  }

  return (
    <>
      {objetivos.map((o, i) => (
        <ObjetivoCard
          key={o.id}
          numero={i + 1}
          objetivo={o}
          form={forms[o.id]}
          mudar={mudarDe(o.id)}
          problema={mostrarProblemas ? problemas[o.id] : null}
          bloqueado={bloqueado}
        />
      ))}
      <SugestaoGeralCard pilar={pilar} form={forms[gid]} mudar={mudarDe(gid)} bloqueado={bloqueado} />

      {bloqueado ? (
        <div className="salvar-barra">
          <Link href="/mapa" className="btn btn-primario">Voltar ao mapa</Link>
        </div>
      ) : (
        <div className="salvar-barra">
          <div className="salvar-status">
            {erro ? (
              <span className="status status-erro" role="alert">{erro}</span>
            ) : pendentes > 0 ? (
              <span className="status status-pendente">
                {pendentes === 1 ? "Falta 1 objetivo" : `Faltam ${pendentes} objetivos`} para concluir este pilar
              </span>
            ) : sujos.length > 0 ? (
              <span className="status status-pendente">{completo ? "Alterações ainda não salvas" : "Pronto para salvar"}</span>
            ) : (
              <span className="status status-ok">✓ Pilar salvo</span>
            )}
          </div>
          {completo && sujos.length === 0 ? (
            <Link href="/mapa" className="btn btn-primario">Voltar ao mapa</Link>
          ) : (
            <button type="button" className="btn btn-primario" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : completo ? "Salvar alterações" : "Salvar pilar"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
