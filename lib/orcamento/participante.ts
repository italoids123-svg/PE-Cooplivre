"use client";

import { useSyncExternalStore } from "react";
import type { ParticipanteOrc } from "./tipos";

// Identificação guardada só no navegador (mesmo esquema do mapa estratégico,
// chave separada para não misturar as duas revisões).
const KEY = "orc-cooplivre:participante:v1";
const EVENTO = "orc-cooplivre:participante";

let memoria: string | null = null;

function ler(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memoria;
  }
}

let cacheRaw: string | null = null;
let cacheVal: ParticipanteOrc | null = null;
function snapshot(): ParticipanteOrc | null {
  const raw = ler();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheVal = raw ? (JSON.parse(raw) as ParticipanteOrc) : null;
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
export function useParticipanteOrc(): ParticipanteOrc | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}

export function definirParticipanteOrc(p: ParticipanteOrc) {
  const raw = JSON.stringify(p);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    memoria = raw;
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function sairOrc() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  memoria = null;
  window.dispatchEvent(new Event(EVENTO));
}
