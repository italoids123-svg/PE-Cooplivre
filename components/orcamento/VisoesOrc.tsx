"use client";

import Link from "next/link";
import { ehAgencia } from "@/lib/orcamento/agencias";
import { ANO_ORCAMENTO } from "@/lib/orcamento/tipos";
import { TopBarOrc, useExigirParticipante } from "./TopBarOrc";

export function VisoesOrc() {
  const p = useExigirParticipante();
  if (!p) return <div className="pagina" />;
  const agencia = ehAgencia(p.agencia);
  return (
    <div className="pagina">
      <TopBarOrc />
      <main className="orc-visoes">
        <p className="eyebrow">Planejamento Orçamentário {ANO_ORCAMENTO}</p>
        <h1>Olá, {p.nome.split(" ")[0]}. Qual visão você quer revisar?</h1>
        <p className="mapa-sub">
          Em cada linha, registre uma contribuição (mês ou valor global, com o motivo) ou marque que não há contribuições.
          Tudo é salvo na hora.
        </p>
        <div className="orc-visoes-grid">
          <Link href="/orcamento/global" className="orc-visao">
            <span className="orc-visao-icone" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>
            </span>
            <b>Orçamento global</b>
            <span>O orçamento da cooperativa como um todo: origem e aplicação de recursos, taxas e DRE.</span>
            <i>Revisar</i>
          </Link>
          <Link href="/orcamento/agencia" className="orc-visao">
            <span className="orc-visao-icone" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>
            </span>
            <b>Orçamento minha agência</b>
            <span>{agencia ? <>Somente os valores da agência de <strong>{p.agencia}</strong>.</> : <>Disponível para quem está lotado em uma agência.</>}</span>
            <i className="orc-visao-breve">Em breve</i>
          </Link>
        </div>
      </main>
    </div>
  );
}
