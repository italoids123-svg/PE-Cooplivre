"use client";

import Link from "next/link";
import { ehAgencia } from "@/lib/orcamento/agencias";
import { ANO_ORCAMENTO } from "@/lib/orcamento/tipos";
import { TopBarOrc, useExigirParticipante } from "./TopBarOrc";

// Os valores por agência ainda não existem na base: nesta etapa só há a visão global.
export function AgenciaOrc() {
  const p = useExigirParticipante();
  if (!p) return <div className="pagina" />;
  return (
    <div className="pagina">
      <TopBarOrc voltar />
      <main className="orc-visoes">
        <p className="eyebrow">Orçamento minha agência · {ANO_ORCAMENTO}</p>
        <h1>{ehAgencia(p.agencia) ? p.agencia : "Sem agência vinculada"}</h1>
        <div className="instrucao orc-breve">
          <b>Visão em preparação</b>
          Os valores orçados por agência ainda não foram carregados. Nesta primeira etapa, a revisão acontece no orçamento
          global da cooperativa; quando a base por agência estiver pronta, ela aparece aqui com os mesmos blocos e botões de
          contribuição.
        </div>
        <Link href="/orcamento/global" className="btn btn-primario">Ir para o orçamento global</Link>
      </main>
    </div>
  );
}
