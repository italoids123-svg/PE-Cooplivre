"use client";

import { useSyncExternalStore } from "react";

// API de tela cheia com o prefixo webkit (Safari de iPad/desktop). O Safari de
// iPhone não oferece tela cheia para páginas: lá o botão nem aparece.
type DocTelaCheia = Document & { webkitFullscreenElement?: Element | null; webkitFullscreenEnabled?: boolean; webkitExitFullscreen?: () => void };
type ElTelaCheia = HTMLElement & { webkitRequestFullscreen?: () => void };

const doc = () => document as DocTelaCheia;
const suportado = () => !!(doc().fullscreenEnabled || doc().webkitFullscreenEnabled);
const ativo = () => !!(doc().fullscreenElement || doc().webkitFullscreenElement);

function assinar(cb: () => void) {
  document.addEventListener("fullscreenchange", cb);
  document.addEventListener("webkitfullscreenchange", cb);
  return () => {
    document.removeEventListener("fullscreenchange", cb);
    document.removeEventListener("webkitfullscreenchange", cb);
  };
}

function alternar() {
  if (ativo()) {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => undefined);
    else doc().webkitExitFullscreen?.();
    return;
  }
  const el = document.documentElement as ElTelaCheia;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => undefined);
  else el.webkitRequestFullscreen?.();
}

export function BotaoTelaCheia() {
  // false no servidor: o botão só aparece no navegador e se houver suporte.
  const pode = useSyncExternalStore(assinar, suportado, () => false);
  const cheia = useSyncExternalStore(assinar, ativo, () => false);
  if (!pode) return null;
  const rotulo = cheia ? "Sair da tela cheia" : "Tela cheia";
  return (
    <button type="button" className="top-sair top-tela-cheia" onClick={alternar} aria-label={rotulo} title={rotulo}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {cheia ? (
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        )}
      </svg>
      <span>{rotulo}</span>
    </button>
  );
}
