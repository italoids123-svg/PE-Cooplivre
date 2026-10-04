"use client";

import { useSyncExternalStore } from "react";
import type { Participante } from "./types";

// Identificação guardada só no navegador: o participante não precisa de login,
// e o id aleatório amarra as respostas dele no servidor (permite reabrir e editar).
const KEY = "pe-cooplivre:participante:v1";
const EVENTO = "pe-cooplivre:participante";

// Fallback quando o storage está bloqueado (navegação privada): vale só nesta aba.
let memoria: string | null = null;

function ler(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memoria;
  }
}

// useSyncExternalStore exige snapshot estável: cacheia o parse pela string crua.
let cacheRaw: string | null = null;
let cacheVal: Participante | null = null;
function snapshot(): Participante | null {
  const raw = ler();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheVal = raw ? (JSON.parse(raw) as Participante) : null;
    } catch {
      cacheVal = null;
    }
  }
  return cacheVal;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENTO, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENTO, cb);
  };
}

// undefined = ainda não leu (SSR / primeira renderização); null = não identificado.
export function useParticipante(): Participante | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function salvarParticipante(dados: Pick<Participante, "nome" | "cargo" | "localidade">): Participante {
  const atual = snapshot();
  const p: Participante = { id: atual?.id ?? novoId(), ...dados, atualizadoEm: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    memoria = JSON.stringify(p);
  }
  window.dispatchEvent(new Event(EVENTO));
  return p;
}

export function sair() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  memoria = null;
  window.dispatchEvent(new Event(EVENTO));
}
