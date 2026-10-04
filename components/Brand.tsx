export function Brand({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`brand${claro ? " brand-claro" : ""}`} aria-label="Sicoob Cooplivre">
      <svg viewBox="0 0 24 20" aria-hidden="true">
        <path d="M2 2h20L12 18z" fill="#7db61c" />
        <path d="M7 2h10l-5 9z" fill="#00ae9d" />
      </svg>
      <b>SICOOB</b>
      <span>COOPLIVRE</span>
    </span>
  );
}
