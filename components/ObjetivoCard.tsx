"use client";

import type { Objetivo, Pilar } from "@/lib/data";
import { AVALIACAO_LABEL, AVALIACOES, type RespostaRascunho } from "@/lib/types";

export const VAZIO: RespostaRascunho = { avaliacao: null, indicador: "", meta: "", iniciativas: "", comentario: "" };

export type Mudar = <K extends keyof RespostaRascunho>(k: K, v: RespostaRascunho[K]) => void;

const temTexto = (f: RespostaRascunho) => !!(f.indicador.trim() || f.meta.trim() || f.iniciativas.trim() || f.comentario.trim());

// Mesma regra do servidor (lib/validate.ts): mensagem do que falta, ou null se ok.
export function problemaDe(f: RespostaRascunho): string | null {
  if (!f.avaliacao) return "Escolha sua avaliação para este objetivo.";
  if (f.avaliacao !== "concordo" && !temTexto(f)) return "Descreva o que você mudaria em pelo menos um campo.";
  return null;
}

function Campo({ label, value, onChange, placeholder, bloqueado }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; bloqueado: boolean;
}) {
  return (
    <label className="campo campo-texto">
      <span>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} maxLength={2000} placeholder={placeholder} disabled={bloqueado} />
    </label>
  );
}

function EmDefinicao() {
  return (
    <span className="em-definicao">
      <i>Em definição</i>
    </span>
  );
}

export function ObjetivoCard({ numero, objetivo, form, mudar, problema, bloqueado }: {
  numero: number;
  objetivo: Objetivo;
  form: RespostaRascunho;
  mudar: Mudar;
  problema: string | null;
  bloqueado: boolean;
}) {
  const temPendencia = objetivo.kpis.some((k) => !k.indicador || !k.meta || k.emAnalise) || objetivo.iniciativas.length === 0;
  const pedeDetalhe = form.avaliacao === "ajustes" || form.avaliacao === "discordo";
  const ok = !problemaDe(form);

  return (
    <article className={`obj${ok ? " obj-feito" : ""}${problema ? " obj-problema" : ""}`} id={objetivo.id}>
      <header className="obj-head">
        <span className="obj-num">{ok ? "✓" : numero}</span>
        <div className="obj-tit">
          <span className="obj-codigo">
            {objetivo.codigo}
            {objetivo.novo && <i className="obj-novo">Novo objetivo proposto</i>}
          </span>
          <h2>{objetivo.titulo}</h2>
        </div>
      </header>

      <div className="obj-corpo">
        <table className="kpis">
          <thead>
            <tr><th>Indicador</th><th>Meta</th></tr>
          </thead>
          <tbody>
            {objetivo.kpis.map((k, i) => (
              <tr key={i}>
                <td data-label="Indicador">{k.indicador ?? <EmDefinicao />}</td>
                <td data-label="Meta">
                  {k.meta ?? <EmDefinicao />}
                  {k.meta && k.emAnalise && <span className="em-definicao em-analise"><i>Meta em análise</i></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="inic">
          <h3>Iniciativas</h3>
          {objetivo.iniciativas.length ? (
            <ul>{objetivo.iniciativas.map((t) => <li key={t}>{t}</li>)}</ul>
          ) : (
            <EmDefinicao />
          )}
        </div>
        {temPendencia && (
          <p className="obj-convite">Este objetivo ainda tem itens em definição — sua sugestão é especialmente bem-vinda aqui.</p>
        )}
      </div>

      <div className="rev">
        <p className="rev-titulo">Sua avaliação</p>
        <div className="seg-btns" role="radiogroup" aria-label="Sua avaliação">
          {AVALIACOES.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={form.avaliacao === a}
              disabled={bloqueado}
              className={`seg-btn seg-btn-${a}${form.avaliacao === a ? " ativo" : ""}`}
              onClick={() => mudar("avaliacao", a)}
            >
              {AVALIACAO_LABEL[a]}
            </button>
          ))}
        </div>

        {form.avaliacao && (
          <div className="rev-campos">
            {pedeDetalhe ? (
              <>
                <p className="rev-dica">O que você mudaria? Preencha ao menos um campo.</p>
                <Campo label="Sugestão para o indicador" value={form.indicador} onChange={(v) => mudar("indicador", v)} bloqueado={bloqueado} />
                <Campo label="Sugestão para a meta" value={form.meta} onChange={(v) => mudar("meta", v)} bloqueado={bloqueado} />
                <Campo label="Sugestão para as iniciativas" value={form.iniciativas} onChange={(v) => mudar("iniciativas", v)} bloqueado={bloqueado} />
                <Campo label="Comentário geral" value={form.comentario} onChange={(v) => mudar("comentario", v)} bloqueado={bloqueado} />
              </>
            ) : (
              <Campo label="Comentário (opcional)" value={form.comentario} onChange={(v) => mudar("comentario", v)} bloqueado={bloqueado} />
            )}
          </div>
        )}
        {problema && <p className="obj-erro" role="alert">{problema}</p>}
      </div>
    </article>
  );
}

export function SugestaoGeralCard({ pilar, form, mudar, bloqueado }: {
  pilar: Pilar;
  form: RespostaRascunho;
  mudar: Mudar;
  bloqueado: boolean;
}) {
  return (
    <article className="obj obj-geral">
      <header className="obj-head">
        <span className="obj-num">+</span>
        <h2>Falta algo neste pilar? <small className="opcional">(opcional)</small></h2>
      </header>
      <div className="rev">
        <Campo
          label={`Objetivo, indicador ou iniciativa que você incluiria em “${pilar.nome}”`}
          value={form.comentario}
          onChange={(v) => mudar("comentario", v)}
          placeholder="Descreva o que está faltando e por que é importante."
          bloqueado={bloqueado}
        />
      </div>
    </article>
  );
}
