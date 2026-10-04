"use client";

import { useCallback, useEffect, useState } from "react";
import type { Participante, Resposta, RespostaRascunho } from "./types";

export type MapaRespostas = Record<string, Resposta>;

// Respostas já gravadas no servidor por este participante.
export function useMinhasRespostas(pid: string | undefined) {
  const [respostas, setRespostas] = useState<MapaRespostas | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) return;
    let vivo = true;
    fetch(`/api/respostas?pid=${encodeURIComponent(pid)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as { respostas?: Resposta[]; error?: string };
        if (!res.ok) throw new Error(body.error ?? "Falha ao carregar suas respostas");
        return body.respostas ?? [];
      })
      .then((lista) => {
        if (!vivo) return;
        setRespostas(Object.fromEntries(lista.map((r) => [r.objetivoId, r])));
        setErro(null);
      })
      .catch((e: Error) => {
        if (!vivo) return;
        setRespostas({});
        setErro(e.message);
      });
    return () => {
      vivo = false;
    };
  }, [pid]);

  const registrar = useCallback((r: Resposta) => {
    setRespostas((atual) => ({ ...(atual ?? {}), [r.objetivoId]: r }));
  }, []);

  return { respostas, erro, registrar };
}

export async function enviarResposta(
  participante: Participante,
  objetivoId: string,
  dados: RespostaRascunho,
): Promise<Resposta> {
  const res = await fetch("/api/respostas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participante, respostas: [{ objetivoId, ...dados }] }),
  });
  const body = (await res.json().catch(() => ({}))) as { respostas?: Resposta[]; error?: string };
  if (!res.ok || !body.respostas?.[0]) throw new Error(body.error ?? "Não foi possível salvar. Verifique a conexão.");
  return body.respostas[0];
}

// Rascunho local por participante+objetivo: o que foi digitado e ainda não enviado
// sobrevive a recarregar a página ou à queda de conexão no evento.
const rascunhoKey = (pid: string, oid: string) => `pe-cooplivre:rascunho:${pid}:${oid}`;

export function lerRascunho(pid: string, oid: string): RespostaRascunho | null {
  try {
    const raw = window.localStorage.getItem(rascunhoKey(pid, oid));
    return raw ? (JSON.parse(raw) as RespostaRascunho) : null;
  } catch {
    return null;
  }
}

export function gravarRascunho(pid: string, oid: string, r: RespostaRascunho | null) {
  try {
    if (r) window.localStorage.setItem(rascunhoKey(pid, oid), JSON.stringify(r));
    else window.localStorage.removeItem(rascunhoKey(pid, oid));
  } catch {}
}
