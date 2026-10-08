"use client";

import { useEffect, useState } from "react";
import type { Acompanhamento, RespostaRascunho } from "./types";

const INTERVALO_MS = 10_000;

// Evolução das revisões dos responsáveis, atualizada a cada 10 s enquanto a aba
// está visível. Só busca quando `ativo` (quem tem acesso a todos os pilares).
export function useAcompanhamento(pid: string | undefined, ativo: boolean, pilar?: string) {
  const [dados, setDados] = useState<Acompanhamento | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!pid || !ativo) return;
    let vivo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const url = `/api/acompanhar?pid=${encodeURIComponent(pid)}${pilar ? `&pilar=${encodeURIComponent(pilar)}` : ""}`;

    async function buscar() {
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch(url, { cache: "no-store" });
          const body = (await res.json()) as Acompanhamento & { error?: string };
          if (!vivo) return;
          if (!res.ok) throw new Error(body.error ?? "Falha ao atualizar o acompanhamento");
          setDados(body);
          setErro(null);
        } catch (e) {
          if (vivo) setErro((e as Error).message);
        }
      }
      if (vivo) timer = setTimeout(buscar, INTERVALO_MS);
    }
    const aoVoltar = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        buscar();
      }
    };
    buscar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      vivo = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [pid, ativo, pilar]);

  return { dados, erro };
}

export function idade(agoraIso: string, iso: string): string {
  const s = Math.max(0, Math.round((Date.parse(agoraIso) - Date.parse(iso)) / 1000));
  if (s < 10) return "agora";
  if (s < 60) return `há ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `há ${m} min`;
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Envia em segundo plano o que o responsável está preenchendo (rascunho), agrupando
// as mudanças por 2,5 s. `null` = voltou a ficar igual ao salvo (apaga o rascunho).
// Falhas são silenciosas: é só acompanhamento, o rascunho local continua guardado.
export function criarSincronizador(participanteId: string) {
  const pendentes = new Map<string, RespostaRascunho | null>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function enviar(keepalive = false) {
    clearTimeout(timer);
    if (!pendentes.size) return;
    const itens = [...pendentes].map(([objetivoId, dados]) => ({ objetivoId, dados }));
    pendentes.clear();
    fetch("/api/rascunhos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participanteId, itens }),
      keepalive,
    }).catch(() => undefined);
  }

  return {
    mudou(objetivoId: string, dados: RespostaRascunho | null) {
      pendentes.set(objetivoId, dados);
      clearTimeout(timer);
      timer = setTimeout(() => enviar(), 2500);
    },
    // Ao sair da página/fechar o app: envia o que falta sem esperar.
    descarregar() {
      enviar(true);
    },
    cancelar() {
      clearTimeout(timer);
      pendentes.clear();
    },
  };
}
