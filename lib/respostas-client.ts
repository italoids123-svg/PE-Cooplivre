"use client";

import { useCallback, useEffect, useState } from "react";
import type { Participante, Resposta, RespostaRascunho } from "./types";

export type MapaRespostas = Record<string, Resposta>;

export class ErroApi extends Error {
  constructor(message: string, public status: number, public faltando?: string[]) {
    super(message);
  }
}

async function chamar<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new ErroApi("Sem conexão. Verifique a internet e tente de novo — nada do que você preencheu foi perdido.", 0);
  }
  const body = (await res.json().catch(() => ({}))) as T & { error?: string; faltando?: string[] };
  if (!res.ok) throw new ErroApi(body.error ?? "Não foi possível concluir agora. Tente novamente.", res.status, body.faltando);
  return body;
}

// Estado salvo no servidor para este participante: respostas e data de envio final.
export function useMinhaRevisao(pid: string | undefined) {
  const [respostas, setRespostas] = useState<MapaRespostas | null>(null);
  // Registro do participante no servidor (status de envio/reabertura).
  const [servidor, setServidor] = useState<Participante | null>(null);
  // Pilares sob responsabilidade da pessoa (definidos no servidor, lib/acesso.ts).
  const [pilares, setPilares] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) return;
    let vivo = true;
    chamar<{ participante: Participante | null; respostas: Resposta[]; pilares: string[] }>(`/api/respostas?pid=${encodeURIComponent(pid)}`)
      .then((body) => {
        if (!vivo) return;
        setRespostas(Object.fromEntries(body.respostas.map((r) => [r.objetivoId, r])));
        setServidor(body.participante);
        setPilares(body.pilares ?? []);
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

  const registrar = useCallback((lista: Resposta[]) => {
    setRespostas((atual) => ({ ...(atual ?? {}), ...Object.fromEntries(lista.map((r) => [r.objetivoId, r])) }));
  }, []);

  return { respostas, servidor, setServidor, pilares, enviadoEm: servidor?.enviadoEm ?? null, erro, registrar };
}

export async function salvarPilar(
  participante: Participante,
  itens: { objetivoId: string; dados: RespostaRascunho }[],
): Promise<Resposta[]> {
  const body = await chamar<{ respostas: Resposta[] }>("/api/respostas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participante, respostas: itens.map((i) => ({ objetivoId: i.objetivoId, ...i.dados })) }),
  });
  return body.respostas;
}

export async function enviarRevisao(participanteId: string): Promise<Participante> {
  const body = await chamar<{ participante: Participante }>("/api/enviar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participanteId }),
  });
  return body.participante;
}

export async function reabrirRevisao(participanteId: string): Promise<Participante> {
  const body = await chamar<{ participante: Participante }>("/api/reabrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participanteId }),
  });
  return body.participante;
}

// Rascunho local por participante+objetivo: o que foi digitado e ainda não salvo
// sobrevive a recarregar a página, sair do pilar ou queda de conexão no evento.
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

export function temRascunho(pid: string, ids: string[]): boolean {
  return ids.some((id) => lerRascunho(pid, id) !== null);
}
