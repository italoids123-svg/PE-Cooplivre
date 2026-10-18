"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { geralId, getPilar, objetivosVisiveis, PILARES, type Pilar } from "@/lib/data";
import { useParticipante } from "@/lib/participante";
import { criarSincronizador, useAcompanhamento } from "@/lib/acompanhamento";
import { gravarRascunho, lerRascunho, salvarPilar, useMinhaRevisao, type MapaRespostas } from "@/lib/respostas-client";
import { mesmosCampos, type Acompanhamento, type Participante, type Resposta, type RespostaRascunho } from "@/lib/types";
import { ObjetivoCard, problemaDe, SugestaoGeralCard, temTexto, VAZIO, type Mudar } from "./ObjetivoCard";
import { BotaoAjustes } from "./BotaoAjustes";
import { QuadroObjetivo } from "./Acompanhamento";
import { TopBar } from "./TopBar";

const deResposta = (r: Resposta | undefined): RespostaRascunho =>
  r
    ? { avaliacao: r.avaliacao, objetivo: r.objetivo ?? "", indicador: r.indicador, meta: r.meta, iniciativas: r.iniciativas, comentario: r.comentario }
    : VAZIO;

const igual = mesmosCampos;

export function PilarPage({ slug }: { slug: string }) {
  const router = useRouter();
  const p = useParticipante();
  const { respostas, enviadoEm, setServidor, pilares, erro, registrar } = useMinhaRevisao(p?.id);
  // Quem tem acesso a todos os pilares acompanha os responsáveis; os demais têm
  // o preenchimento sincronizado em segundo plano para esse acompanhamento.
  const veTodos = pilares.length === PILARES.length;
  const { dados: acomp } = useAcompanhamento(p?.id, veTodos, slug);
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
          <p className="pilar-intuito">{pilar.intuito}</p>
          <ul className="pilar-temas">
            {pilar.temas.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <p className="pilar-hero-prog">
            {!respostas
              ? "Carregando suas respostas…"
              : veTodos
                ? `${objetivos.length} objetivos · campos abertos para ajustes`
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
        ) : veTodos ? (
          <div className="instrucao">
            <b>Como ajustar</b>
            Cada objetivo tem campos abertos para ajustar o objetivo, os indicadores, as metas e as iniciativas. Use{" "}
            <b className="inline">Editar texto atual</b> para partir da redação do plano, ou escreva só o que muda. A
            avaliação é opcional. Clique em <b className="inline">Salvar ajustes</b> no fim da página — os campos em
            branco mantêm o texto atual.
          </div>
        ) : (
          <div className="instrucao">
            <b>Como revisar</b>
            Avalie todos os objetivos deste pilar e clique em <b className="inline">Salvar pilar</b> no fim da página. Se algo
            pode melhorar, escreva sua sugestão — seja específico: qual número, qual ação, por quê. Depois de salvar os
            pilares sob sua responsabilidade, o botão <b className="inline">Enviar revisão</b> aparece no mapa.
            <span className="instrucao-nota">
              <b className="inline">Linha de base 2026</b> é o valor atual do indicador. Caso esteja em aberto, insira o
              resultado nos comentários do objetivo. Metas <i>“em análise”</i> estão em aberto: sua contribuição é
              essencial nesses pontos.
            </span>
          </div>
        )}
        {erro && <div className="aviso aviso-erro">{erro}</div>}

        {!respostas ? (
          <div className="carregando">Carregando…</div>
        ) : !pilares.includes(pilar.slug) ? (
          <div className="aviso aviso-alerta" role="alert">
            Este pilar não está sob sua responsabilidade nesta revisão.{" "}
            <Link href="/mapa">Voltar ao mapa</Link>
          </div>
        ) : (
          // key: remonta o formulário com os dados do servidor assim que chegam.
          <FormularioPilar
            key={`${p.id}:${enviadoEm ?? "aberta"}`}
            pilar={pilar}
            participante={p}
            respostas={respostas}
            bloqueado={!!enviadoEm}
            livre={veTodos}
            sincronizar={!veTodos && !enviadoEm}
            acompanhamento={veTodos ? acomp : null}
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

function FormularioPilar({ pilar, participante, respostas, bloqueado, livre, sincronizar, acompanhamento, onSalvo }: {
  pilar: Pilar;
  participante: Participante;
  respostas: MapaRespostas;
  bloqueado: boolean;
  // Quem acompanha todos os pilares: ajustes livres, sem avaliação obrigatória.
  livre: boolean;
  sincronizar: boolean;
  acompanhamento: Acompanhamento | null;
  onSalvo: (r: Resposta[]) => void;
}) {
  const responsaveis = acompanhamento?.pilares.find((p) => p.slug === pilar.slug)?.responsaveis ?? [];
  const quadro = (oid: string) =>
    acompanhamento && responsaveis.length ? (
      <QuadroObjetivo objetivoId={oid} responsaveis={responsaveis} geradoEm={acompanhamento.geradoEm} />
    ) : undefined;

  // Sincronização do rascunho para o acompanhamento (só responsáveis de pilar específico).
  // Criado uma vez: o formulário é remontado (key) quando participante/envio mudam.
  const [sinc] = useState(() => (sincronizar ? criarSincronizador(participante.id) : null));
  useEffect(() => {
    if (!sinc) return;
    const aoEsconder = () => {
      if (document.visibilityState === "hidden") sinc.descarregar();
    };
    document.addEventListener("visibilitychange", aoEsconder);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      sinc.descarregar();
    };
  }, [sinc]);
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
  const problemas = Object.fromEntries(objetivos.map((o) => [o.id, problemaDe(forms[o.id], livre)]));
  const algumSalvo = ids.some((id) => respostas[id]);
  const pendentes = objetivos.filter((o) => problemas[o.id]).length;

  // Efeitos (rascunho local e sincronização) ficam no handler, fora do updater de
  // estado, que o React pode executar mais de uma vez.
  const mudarDe = (id: string): Mudar => (k, v) => {
    const novo = { ...forms[id], [k]: v };
    const semMudanca = igual(novo, deResposta(respostas[id]));
    gravarRascunho(participante.id, id, semMudanca ? null : novo);
    sinc?.mudou(id, semMudanca ? null : novo);
    setForms((atual) => ({ ...atual, [id]: novo }));
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
      // No modo livre só vai o que tem conteúdo ou já existia (para poder apagar).
      const itens = objetivos
        .filter((o) => !livre || forms[o.id].avaliacao || temTexto(forms[o.id]) || respostas[o.id])
        .map((o) => ({ objetivoId: o.id, dados: forms[o.id] }));
      if (forms[gid].comentario.trim() || respostas[gid]) itens.push({ objetivoId: gid, dados: forms[gid] });
      sinc?.cancelar();
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
          livre={livre}
          acompanhamento={quadro(o.id)}
        />
      ))}
      <SugestaoGeralCard pilar={pilar} form={forms[gid]} mudar={mudarDe(gid)} bloqueado={bloqueado} acompanhamento={quadro(gid)} />

      {bloqueado ? (
        <div className="salvar-barra">
          <Link href="/mapa" className="btn btn-primario">Voltar ao mapa</Link>
        </div>
      ) : livre ? (
        <div className="salvar-barra">
          <div className="salvar-status">
            {erro ? (
              <span className="status status-erro" role="alert">{erro}</span>
            ) : sujos.length > 0 ? (
              <span className="status status-pendente">Ajustes ainda não salvos</span>
            ) : algumSalvo ? (
              <span className="status status-ok">✓ Ajustes salvos</span>
            ) : (
              <span className="status">Nenhum ajuste neste pilar</span>
            )}
          </div>
          {sujos.length === 0 ? (
            <Link href="/mapa" className="btn btn-primario">Voltar ao mapa</Link>
          ) : (
            <button type="button" className="btn btn-primario" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar ajustes"}
            </button>
          )}
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
