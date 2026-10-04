"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { geralId, getPilar, objetivosVisiveis, PILARES } from "@/lib/data";
import { useParticipante } from "@/lib/participante";
import { enviarRevisao, ErroApi, temRascunho, useMinhaRevisao } from "@/lib/respostas-client";
import { MapaEstrategico, rotuloProgresso, type Progresso } from "./MapaEstrategico";
import { TopBar } from "./TopBar";

const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function MapaPage() {
  const router = useRouter();
  const salvoAgora = getPilar(useSearchParams().get("salvo") ?? "");
  const p = useParticipante();
  const { respostas, enviadoEm, setEnviadoEm } = useMinhaRevisao(p?.id);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  useEffect(() => {
    if (p === null) router.replace("/");
  }, [p, router]);

  const progresso = useMemo(() => {
    if (!respostas || !p) return null;
    const out: Record<string, Progresso> = {};
    for (const pilar of PILARES) {
      const ids = objetivosVisiveis(pilar).map((o) => o.id);
      out[pilar.slug] = {
        salvo: ids.every((id) => respostas[id]?.avaliacao),
        pendente: !enviadoEm && temRascunho(p.id, [...ids, geralId(pilar.slug)]),
      };
    }
    return out;
  }, [respostas, p, enviadoEm]);

  if (!p) return <div className="pagina" />;

  const lista = progresso ? Object.values(progresso) : [];
  const salvos = lista.filter((x) => x.salvo).length;
  const comPendencia = PILARES.filter((pl) => progresso?.[pl.slug]?.pendente);
  const prontoParaEnviar = !!progresso && salvos === PILARES.length && comPendencia.length === 0 && !enviadoEm;

  async function enviar() {
    if (!p) return;
    const ok = window.confirm(
      "Enviar sua revisão final?\n\nDepois de enviada, ela não poderá mais ser alterada.",
    );
    if (!ok) return;
    setEnviando(true);
    setErroEnvio(null);
    try {
      const atualizado = await enviarRevisao(p.id);
      setEnviadoEm(atualizado.enviadoEm ?? new Date().toISOString());
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
                : `Olá, ${p.nome.split(" ")[0]}! Toque em cada pilar, revise os objetivos e salve. Depois de salvar os 5 pilares, envie sua revisão.`}
            </p>
          </div>
          {progresso && !enviadoEm && (
            <div className="mapa-prog" aria-live="polite">
              <b>{salvos}<small>/{PILARES.length}</small></b>
              <span>pilares salvos</span>
              <div className="barra"><i style={{ width: `${(salvos / PILARES.length) * 100}%` }} /></div>
            </div>
          )}
        </div>

        {salvoAgora && !enviadoEm && progresso?.[salvoAgora.slug]?.salvo && (
          <div className="aviso aviso-ok" role="status">
            ✓ Pilar <b>{salvoAgora.nome}</b> salvo.{" "}
            {salvos < PILARES.length ? "Escolha o próximo pilar para continuar." : "Todos os pilares estão salvos — agora é só enviar."}
          </div>
        )}

        {enviadoEm ? (
          <div className="envio envio-feito">
            <b>✓ Revisão enviada em {dataHora(enviadoEm)}</b>
            <span>Suas respostas foram registradas. Você pode abrir os pilares para consultar o que respondeu.</span>
          </div>
        ) : prontoParaEnviar ? (
          <div className="envio">
            <div>
              <b>Todos os pilares foram salvos</b>
              <span>Confira se está tudo certo. Depois do envio, a revisão não poderá mais ser alterada.</span>
            </div>
            <button type="button" className="btn btn-primario btn-enviar" onClick={enviar} disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar revisão"}
            </button>
            {erroEnvio && <p className="status status-erro" role="alert">{erroEnvio}</p>}
          </div>
        ) : progresso && comPendencia.length > 0 ? (
          <div className="aviso aviso-alerta">
            Há alterações não salvas em: <b>{comPendencia.map((x) => x.nome).join(", ")}</b>. Abra o pilar e clique em salvar.
          </div>
        ) : null}

        <div className="mapa-wrap">
          <MapaEstrategico comTemas progresso={progresso} />
          <MapaEstrategico comTemas={false} progresso={progresso} />
        </div>

        <ul className="pilar-lista">
          {PILARES.map((pilar) => {
            const prog = progresso?.[pilar.slug];
            return (
              <li key={pilar.slug}>
                <Link href={`/pilar/${pilar.slug}`} className="pilar-item" style={{ "--cor": pilar.cor } as React.CSSProperties}>
                  <span className="pilar-item-nome">{pilar.nome}</span>
                  <span className="pilar-item-temas">{pilar.temas.join(" · ")}</span>
                  {prog && (
                    <span className={`pilar-item-prog${prog.salvo && !prog.pendente ? "" : " pilar-item-prog-pend"}`}>
                      {rotuloProgresso(prog)}
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
