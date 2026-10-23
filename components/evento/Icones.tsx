import type { Icone } from "./conteudo";

// Ícones de traço (24×24), na linha do material do Conselho.
const PATHS: Record<Icone, React.ReactNode> = {
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="16.5" cy="9" r="2.6" />
      <path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" />
      <path d="M14.8 14.2c2.6-.4 4.9 1 5.6 4.3" />
    </>
  ),
  processos: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  negocio: (
    <>
      <path d="M4 20h16" />
      <path d="M6.5 20v-5M10.5 20v-7M14.5 20v-5M18.5 20v-8" />
      <path d="M4 11l5-4 4 3 7-5" />
      <path d="M16.5 5H20v3.5" />
    </>
  ),
  coracao: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />,
  casa: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-9l6-5 6 5v9" />
      <path d="M10 20v-5h4v5" />
      <path d="M12 6V3.5" />
    </>
  ),
  banco: (
    <>
      <path d="M3.5 9.5L12 4l8.5 5.5z" />
      <path d="M5.5 10.5v7M9.8 10.5v7M14.2 10.5v7M18.5 10.5v7" />
      <path d="M3.5 20h17" />
    </>
  ),
  maleta: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      <path d="M8 13.5h2M12 13.5h2M8 16.5h2" />
    </>
  ),
  ciclo: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4h-4" />
    </>
  ),
  painel: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M8.5 16v-4M12 16V8.5M15.5 16v-6" />
    </>
  ),
  alvo: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  pessoa: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20c.7-3.7 3.2-5.6 6.5-5.6s5.8 1.9 6.5 5.6" />
    </>
  ),
};

export function Ico({ nome, className }: { nome: Icone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[nome]}
    </svg>
  );
}

export function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
