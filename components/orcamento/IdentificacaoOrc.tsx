"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AMBICAO } from "@/lib/data";
import { LOCAIS } from "@/lib/orcamento/agencias";
import { definirParticipanteOrc, useParticipanteOrc } from "@/lib/orcamento/participante";
import { ANO_ORCAMENTO, type ParticipanteOrc } from "@/lib/orcamento/tipos";
import { Brand } from "../Brand";

export function IdentificacaoOrc() {
  const router = useRouter();
  const editar = useSearchParams().get("editar") === "1";
  const atual = useParticipanteOrc();
  const [enviouAgora, setEnviouAgora] = useState(false);

  useEffect(() => {
    if (atual && !editar && !enviouAgora) router.replace("/orcamento/visoes");
  }, [atual, editar, enviouAgora, router]);

  if (atual === undefined || (atual && !editar && !enviouAgora)) return <div className="ident-bg" />;
  return <Formulario key={editar ? (atual?.id ?? "novo") : "novo"} inicial={editar ? atual : null} onEntrou={() => setEnviouAgora(true)} />;
}

function Formulario({ inicial, onEntrou }: { inicial: ParticipanteOrc | null; onEntrou: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [cargo, setCargo] = useState(inicial?.cargo ?? "");
  const [agencia, setAgencia] = useState(inicial?.agencia ?? "");
  const [tentou, setTentou] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const nomeOk = nome.trim().split(/\s+/).length >= 2;
  const cargoOk = cargo.trim().length >= 2;
  const valido = nomeOk && cargoOk && !!agencia;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (!valido || entrando) return;
    setEntrando(true);
    setErro(null);
    try {
      const res = await fetch("/api/orcamento/identificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim().replace(/\s+/g, " "), cargo: cargo.trim(), agencia }),
      });
      const body = (await res.json().catch(() => ({}))) as { participante?: ParticipanteOrc; error?: string };
      if (!res.ok || !body.participante) throw new Error(body.error ?? "Não foi possível entrar agora. Tente novamente.");
      onEntrou();
      definirParticipanteOrc(body.participante);
      router.push("/orcamento/visoes");
    } catch (err) {
      setErro(err instanceof TypeError ? "Sem conexão. Verifique a internet e tente de novo." : (err as Error).message);
      setEntrando(false);
    }
  }

  return (
    <main className="ident-bg">
      <form className="ident-card" onSubmit={enviar} noValidate>
        <Brand />
        <p className="eyebrow">Planejamento Orçamentário {ANO_ORCAMENTO}</p>
        <h1>Revisão do orçamento</h1>
        <p className="ident-ambicao">“{AMBICAO}”</p>
        <p className="ident-intro">
          Identifique-se para conferir o orçamento proposto e registrar suas contribuições, linha a linha.
        </p>

        <label className="campo">
          <span>Nome e sobrenome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} />
          {tentou && !nomeOk && <em>Informe seu nome e pelo menos um sobrenome.</em>}
        </label>

        <label className="campo">
          <span>Cargo</span>
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} autoComplete="organization-title" maxLength={120} />
          {tentou && !cargoOk && <em>Informe seu cargo.</em>}
        </label>

        <label className="campo">
          <span>Cidade</span>
          <select value={agencia} onChange={(e) => setAgencia(e.target.value)}>
            <option value="" disabled>Selecione a cidade da sua agência</option>
            {LOCAIS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {tentou && !agencia && <em>Selecione sua cidade.</em>}
        </label>

        {erro && <div className="aviso aviso-erro" role="alert">{erro}</div>}
        <button type="submit" className="btn btn-primario btn-bloco" disabled={entrando}>
          {entrando ? "Entrando…" : "Acessar o orçamento"}
        </button>
        <p className="ident-nota">Já começou em outro aparelho? Entre com o mesmo nome para continuar de onde parou.</p>
      </form>
    </main>
  );
}
