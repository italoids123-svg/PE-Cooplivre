"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { geralId, getPilar, objetivosVisiveis, PILARES } from "@/lib/data";
import { sair, useParticipante } from "@/lib/participante";
import { enviarRevisao, ErroApi, temRascunho, useMinhaRevisao } from "@/lib/respostas-client";
import { enviosDe } from "@/lib/types";
import { useAcompanhamento } from "@/lib/acompanhamento";
import { PainelAcompanhamento } from "./Acompanhamento";
import { BotaoAjustes } from "./BotaoAjustes";
import { MapaEstrategico, rotuloProgresso, type Progresso } from "./MapaEstrategico";
import { TopBar } from "./TopBar";

const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function MapaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const salvoAgora = getPilar(params.get("salvo") ?? "");
  const retomada = params.get("retomada") === "1";
  const p = useParticipante();
  const { respostas, servidor, setServidor, pilares, enviadoEm } = useMinhaRevisao(p?.id);
  const veTodos = pilares.length === PILARES.length;
  const acomp = useAcompanhamento(p?.id, veTodos);
  const reaberta = !enviadoEm && !!servidor && enviosDe(servidor).length > 0;
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  useEffect(() => {
    if (p === null) router.replace("/");
  }, [p, router]);

  const progresso = useMemo(() => {
    if (!respostas || !p) return null;
    const out: Record<string, Progresso> = {};
    for (const pilar of PILARES) {
      if (!pilares.includes(pilar.slug)) {
        out[pilar.slug] = { salvo: false, pendente: false, concluido: false, bloqueado: true };
        continue;
      }
      const ids = objetivosVisiveis(pilar).map((o) => o.id);
      const salvo = ids.every((id) => !!respostas[id]?.avaliacao);
      const pendente = !enviadoEm && temRascunho(p.id, [...ids, geralId(pilar.slug)]);
      out[pilar.slug] = veTodos
        ? { salvo: false, pendente: false, concluido: false, bloqueado: false, monitor: true }
        : { salvo, pendente, concluido: !enviadoEm && salvo && !pendente, bloqueado: false };
    }
    return out;
  }, [respostas, p, enviadoEm, pilares, veTodos]);

  if (!p) return <div className="pagina" />;

  const total = pilares.length;
  const salvos = PILARES.filter((pl) => progresso?.[pl.slug]?.salvo).length;
  const comPendencia = PILARES.filter((pl) => progresso?.[pl.slug]?.pendente);
  const prontoParaEnviar = !!progresso && total > 0 && salvos === total && comPendencia.length === 0 && !enviadoEm;
  const nPilares = total === 1 ? "o pilar" : `os ${total} pilares`;
  // Identificação antiga (antes da lista de responsáveis) ou pessoa removida da lista.
  const semAcesso = !!respostas && total === 0;

  async function enviar() {
    if (!p) return;
    const ok = window.confirm(
      `${reaberta ? "Reenviar" : "Enviar"} sua revisão?\n\nDepois do envio, para alterar de novo será preciso tocar em "Realizar ajustes".`,
    );
    if (!ok) return;
    setEnviando(true);
    setErroEnvio(null);
    try {
      setServidor(await enviarRevisao(p.id));
    } catch (e) {
      // 422: o servidor achou objetivo sem avaliação (ex.: salvo em outro aparelho e apagado).
      setErroEnvio(e instanceof ErroApi && e.status === 422 ? `${e.message} Recarregue a página para ver o que falta.` : (e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina">
      <TopBar />
      <main className="mapa-main">
        <div className="mapa-head">
          <div>
            <p className="eyebrow">Avança Cooplivre 27–30</p>
            <h1>Mapa Estratégico Cooplivre</h1>
            <p className="mapa-sub">
              {enviadoEm
                ? `Obrigado, ${p.nome.split(" ")[0]}! Sua revisão foi enviada.`
                : reaberta
                  ? `${p.nome.split(" ")[0]}, sua revisão está aberta para ajustes. Altere o que quiser, salve os pilares e reenvie.`
                : veTodos
                  ? `Olá, ${p.nome.split(" ")[0]}! Acesse os objetivos, indicadores, metas e iniciativas de cada pilar.`
                : `Olá, ${p.nome.split(" ")[0]}! Revise ${total === 1 ? "o pilar destacado" : "os pilares destacados"} — ${total === 1 ? "é o que está" : "são os que estão"} sob sua responsabilidade. Depois de salvar ${nPilares}, envie sua revisão.`}
            </p>
          </div>
          {progresso && !enviadoEm && total > 0 && !veTodos && (
            <div className="mapa-prog" aria-live="polite">
              <b>{salvos}<small>/{total}</small></b>
              <span>{total === 1 ? "pilar salvo" : "pilares salvos"}</span>
              <div className="barra"><i style={{ width: `${(salvos / total) * 100}%` }} /></div>
            </div>
          )}
        </div>

        {semAcesso && (
          <div className="aviso aviso-erro" role="alert">
            Não encontramos seus pilares de revisão. Saia e entre de novo com seu nome e sobrenome.{" "}
            <button
              type="button"
              className="btn btn-secundario"
              onClick={() => {
                sair();
                router.push("/");
              }}
            >
              Sair e entrar de novo
            </button>
          </div>
        )}

        {retomada && !salvoAgora && respostas && Object.keys(respostas).length > 0 && (
          <div className="aviso aviso-ok" role="status">
            Bem-vindo(a) de volta! Encontramos a revisão que você começou.
          </div>
        )}

        {salvoAgora && !enviadoEm && progresso?.[salvoAgora.slug]?.salvo && (
          <div className="aviso aviso-ok" role="status">
            ✓ Pilar <b>{salvoAgora.nome}</b> salvo.{" "}
            {salvos < total ? "Escolha o próximo pilar para continuar." : total === 1 ? "Agora é só enviar." : "Todos os seus pilares estão salvos — agora é só enviar."}
          </div>
        )}

        {enviadoEm ? (
          <div className="envio envio-feito">
            <b>✓ Revisão {servidor && enviosDe(servidor).length > 1 ? "reenviada" : "enviada"} em {dataHora(enviadoEm)}</b>
            <span>Suas respostas foram registradas. Abra os pilares para consultar o que respondeu.</span>
            <div className="envio-acoes">
              <BotaoAjustes participanteId={p.id} onReaberto={setServidor} />
              <span>Precisa mudar algo? Reabra, ajuste e reenvie.</span>
            </div>
          </div>
        ) : prontoParaEnviar ? (
          <div className="envio">
            <div>
              <b>{reaberta ? "Revisão aberta para ajustes" : total === 1 ? "Pilar salvo" : "Todos os seus pilares foram salvos"}</b>
              <span>
                {reaberta
                  ? "Abra o pilar que quer mudar, altere e salve. Quando terminar, reenvie — até lá sua revisão fica registrada como “em ajuste”."
                  : "Confira se está tudo certo antes de enviar."}
              </span>
            </div>
            <button type="button" className="btn btn-primario btn-enviar" onClick={enviar} disabled={enviando}>
              {enviando ? "Enviando…" : reaberta ? "Reenviar revisão" : "Enviar revisão"}
            </button>
            {erroEnvio && <p className="status status-erro" role="alert">{erroEnvio}</p>}
          </div>
        ) : progresso && comPendencia.length > 0 ? (
          <div className="aviso aviso-alerta">
            Há alterações não salvas em: <b>{comPendencia.map((x) => x.nome).join(", ")}</b>. Abra o pilar e clique em salvar.
          </div>
        ) : null}

        {veTodos && <PainelAcompanhamento dados={acomp.dados} erro={acomp.erro} />}

        <div className="mapa-wrap">
          <MapaEstrategico comTemas progresso={progresso} />
          <MapaEstrategico comTemas={false} progresso={progresso} />
        </div>

        <ul className="pilar-lista">
          {PILARES.map((pilar) => {
            const prog = progresso?.[pilar.slug];
            const conteudo = (
              <>
                <span className="pilar-item-nome">{pilar.nome}</span>
                <span className="pilar-item-temas">{pilar.temas.join(" · ")}</span>
                {prog && (
                  <span className={`pilar-item-prog${prog.salvo && !prog.pendente ? "" : " pilar-item-prog-pend"}`}>
                    {rotuloProgresso(prog)}
                  </span>
                )}
              </>
            );
            const estilo = { "--cor": pilar.cor } as React.CSSProperties;
            return (
              <li key={pilar.slug}>
                {!prog || prog.bloqueado ? (
                  <div className={`pilar-item${prog ? " pilar-item-bloqueado" : ""}`} style={estilo} aria-disabled="true">
                    {conteudo}
                  </div>
                ) : (
                  <Link href={`/pilar/${pilar.slug}`} className={`pilar-item${prog.concluido ? " pilar-item-concluido" : ""}`} style={estilo}>
                    {conteudo}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
