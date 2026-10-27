"use client";

import { useEffect, useRef, useState } from "react";
import type { ItemCatalogo } from "@/lib/orcamento/catalogo";
import { fmtCompleto, lerNumero } from "@/lib/orcamento/formato";
import {
  ANO_ORCAMENTO, de2027, MESES, ROTULO_ANUAL, rotuloEscopo, valorAnual,
  type Contribuicao, type Escopo, type RevisaoLinha,
} from "@/lib/orcamento/tipos";

interface Props {
  item: ItemCatalogo;
  revisao: RevisaoLinha | undefined;
  onFechar: () => void;
  // Lista final de contribuições da linha; vazia = linha volta a ficar pendente.
  onSalvar: (contribuicoes: Contribuicao[]) => Promise<boolean>;
}

const novoId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export function ModalContribuicao({ item, revisao, onFechar, onSalvar }: Props) {
  const { linha, bloco, grupo, tipo } = item;
  const natureza = bloco.natureza;
  const v27 = de2027(linha);
  const lista = revisao?.contribuicoes ?? [];

  const [editando, setEditando] = useState<string | null>(null);
  const [escopo, setEscopo] = useState<Escopo | null>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const primeiro = useRef<HTMLInputElement>(null);

  // onFechar muda a cada render do pai: guardado em ref para o efeito rodar só ao abrir.
  const fechar = useRef(onFechar);
  useEffect(() => {
    fechar.current = onFechar;
  });
  useEffect(() => {
    primeiro.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar.current();
    window.addEventListener("keydown", esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = overflow;
    };
  }, []);

  const numero = lerNumero(valor);
  const valorOk = numero === null || Number.isFinite(numero);
  const valido = !!escopo && (escopo === "global" || !!mes) && valorOk && motivo.trim().length >= 3;
  const atual = escopo === "mes" ? (mes ? v27[mes - 1] : null) : escopo === "global" ? valorAnual(v27, natureza) : null;
  const unidade = natureza === "taxa" ? "% a.m." : "R$";

  function limpar() {
    setEditando(null);
    setEscopo(null);
    setMes(null);
    setValor("");
    setMotivo("");
    setTentou(false);
  }

  function editar(c: Contribuicao) {
    setEditando(c.id);
    setEscopo(c.escopo);
    setMes(c.mes);
    setValor(c.valorSugerido == null ? "" : String(c.valorSugerido).replace(".", ","));
    setMotivo(c.motivo);
    setOk(null);
  }

  async function salvar(nova: Contribuicao[], msg: string) {
    setSalvando(true);
    setOk(null);
    const deu = await onSalvar(nova);
    setSalvando(false);
    if (deu) {
      limpar();
      setOk(msg);
    }
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (!valido || salvando) return;
    const c: Contribuicao = {
      id: editando ?? novoId(),
      escopo: escopo!,
      mes: escopo === "mes" ? mes : null,
      valorSugerido: numero,
      motivo: motivo.trim(),
      criadoEm: lista.find((x) => x.id === editando)?.criadoEm ?? new Date().toISOString(),
    };
    salvar(editando ? lista.map((x) => (x.id === editando ? c : x)) : [...lista, c], editando ? "Contribuição atualizada." : "Contribuição registrada.");
  }

  function remover(c: Contribuicao) {
    if (!window.confirm("Remover esta contribuição?")) return;
    salvar(lista.filter((x) => x.id !== c.id), "Contribuição removida.");
  }

  const caminho = [bloco.nome, tipo === "detalhe" ? grupo?.nome : null].filter(Boolean).join(" › ");

  return (
    <div className="orc-modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="orc-modal" role="dialog" aria-modal="true" aria-labelledby="orc-modal-titulo">
        <header className="orc-modal-head">
          <div>
            <p className="eyebrow">{caminho}</p>
            <h2 id="orc-modal-titulo">{tipo === "total-grupo" ? `Total – ${linha.nome}` : linha.nome}</h2>
          </div>
          <button type="button" className="orc-fechar" onClick={onFechar} aria-label="Fechar">×</button>
        </header>

        <div className="orc-modal-corpo">
          <ol className="orc-meses">
            {v27.map((x, i) => (
              <li key={i} className={escopo === "mes" && mes === i + 1 ? "ativo" : undefined}>
                <span>{MESES[i]}/{String(ANO_ORCAMENTO).slice(2)}</span>
                <b>{fmtCompleto(x, natureza)}</b>
              </li>
            ))}
            <li className={`orc-meses-anual${escopo === "global" ? " ativo" : ""}`}>
              <span>{ROTULO_ANUAL[natureza]} {ANO_ORCAMENTO}</span>
              <b>{fmtCompleto(valorAnual(v27, natureza), natureza)}</b>
            </li>
          </ol>

          {lista.length > 0 && (
            <section className="orc-lista">
              <h3>Suas contribuições nesta linha</h3>
              <ul>
                {lista.map((c) => (
                  <li key={c.id} className={editando === c.id ? "editando" : undefined}>
                    <div>
                      <span className="chip chip-ajustes">{rotuloEscopo(c)}</span>
                      {c.valorSugerido != null && <span className="orc-sugerido">Sugerido: {fmtCompleto(c.valorSugerido, natureza)}</span>}
                      <p>{c.motivo}</p>
                    </div>
                    <div className="orc-lista-acoes">
                      <button type="button" className="orc-link" onClick={() => editar(c)} disabled={salvando}>Editar</button>
                      <button type="button" className="orc-link orc-link-perigo" onClick={() => remover(c)} disabled={salvando}>Remover</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <form className="orc-form" onSubmit={enviar} noValidate>
            <h3>{editando ? "Editar contribuição" : lista.length ? "Nova contribuição" : "Recomendar alteração"}</h3>
            <fieldset className="campo">
              <span>A contribuição se refere a</span>
              <div className="orc-escopo">
                <label className={escopo === "mes" ? "ativo" : undefined}>
                  <input ref={primeiro} type="radio" name="escopo" checked={escopo === "mes"} onChange={() => setEscopo("mes")} />
                  Um mês específico
                </label>
                <label className={escopo === "global" ? "ativo" : undefined}>
                  <input type="radio" name="escopo" checked={escopo === "global"} onChange={() => setEscopo("global")} />
                  Valor global de {ANO_ORCAMENTO}
                </label>
              </div>
              {tentou && !escopo && <em>Escolha se é um mês ou o valor global.</em>}
            </fieldset>

            {escopo === "mes" && (
              <label className="campo">
                <span>Mês</span>
                <select value={mes ?? ""} onChange={(e) => setMes(e.target.value ? Number(e.target.value) : null)}>
                  <option value="" disabled>Selecione o mês</option>
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}/{ANO_ORCAMENTO}</option>
                  ))}
                </select>
                {tentou && !mes && <em>Selecione o mês.</em>}
              </label>
            )}

            {escopo && (
              <label className="campo">
                <span>Valor sugerido ({unidade}) <small className="opcional">opcional</small></span>
                <input
                  inputMode="decimal"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder={natureza === "taxa" ? "Ex.: 0,95" : "Ex.: 1.250.000,00"}
                />
                {atual != null && <small className="orc-atual">Valor orçado: {fmtCompleto(atual, natureza)}</small>}
                {!valorOk && <em>Use apenas números, por exemplo 1.250.000,00.</em>}
              </label>
            )}

            <label className="campo">
              <span>Motivo</span>
              <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={2000} rows={4}
                placeholder="Explique o que deve mudar e por quê." />
              {tentou && motivo.trim().length < 3 && <em>Explique o motivo da contribuição.</em>}
            </label>

            {ok && <div className="aviso aviso-ok" role="status">{ok}</div>}
            <div className="orc-form-acoes">
              {editando && <button type="button" className="btn btn-secundario" onClick={limpar}>Cancelar edição</button>}
              <button type="button" className="btn btn-secundario" onClick={onFechar}>Fechar</button>
              <button type="submit" className="btn btn-primario" disabled={salvando}>
                {salvando ? "Salvando…" : editando ? "Salvar alteração" : "Registrar contribuição"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
