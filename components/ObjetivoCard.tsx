"use client";

import type { Objetivo, Pilar } from "@/lib/data";
import { AVALIACAO_LABEL, AVALIACOES, type RespostaRascunho } from "@/lib/types";

export const VAZIO: RespostaRascunho = { avaliacao: null, objetivo: "", indicador: "", meta: "", iniciativas: "", comentario: "" };

export type Mudar = <K extends keyof RespostaRascunho>(k: K, v: RespostaRascunho[K]) => void;

export const temTexto = (f: RespostaRascunho) =>
  !!(f.objetivo?.trim() || f.indicador.trim() || f.meta.trim() || f.iniciativas.trim() || f.comentario.trim());

// Mesma regra do servidor (lib/validate.ts): mensagem do que falta, ou null se ok.
// livre: quem acompanha todos os pilares ajusta sem obrigação de avaliar.
export function problemaDe(f: RespostaRascunho, livre = false): string | null {
  if (livre) return null;
  if (!f.avaliacao) return "Escolha sua avaliação para este objetivo.";
  if (f.avaliacao !== "concordo" && !temTexto(f)) return "Descreva o que você mudaria em pelo menos um campo.";
  return null;
}

function Campo({ label, value, onChange, placeholder, bloqueado, atual }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; bloqueado: boolean;
  // Texto atual do plano: oferece "Editar texto atual" para ajustar sem redigitar.
  atual?: string;
}) {
  const linhas = value.split("\n").length + Math.floor(value.length / 90);
  return (
    <label className="campo campo-texto">
      <span>
        {label}
        {atual && !value && !bloqueado && (
          <button type="button" className="campo-copiar" onClick={(e) => { e.preventDefault(); onChange(atual); }}>
            Editar texto atual
          </button>
        )}
      </span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(10, Math.max(2, linhas))} maxLength={2000} placeholder={placeholder} disabled={bloqueado} />
    </label>
  );
}

// Itens do plano um por linha, para editar a partir do texto atual.
const textoAtual = (itens: (string | null | undefined)[]) =>
  itens.map((t, i, a) => `${a.length > 1 ? `${i + 1}. ` : ""}${t ?? "Em definição"}`).join("\n");

function EmDefinicao() {
  return (
    <span className="em-definicao">
      <i>Em definição</i>
    </span>
  );
}

export function ObjetivoCard({ numero, objetivo, form, mudar, problema, bloqueado, acompanhamento, livre = false }: {
  numero: number;
  objetivo: Objetivo;
  form: RespostaRascunho;
  mudar: Mudar;
  problema: string | null;
  bloqueado: boolean;
  // Quadro com a revisão do responsável (só para quem tem acesso a todos os pilares).
  acompanhamento?: React.ReactNode;
  // Quem acompanha todos os pilares: campos de ajuste sempre abertos, avaliação opcional.
  livre?: boolean;
}) {
  const temPendencia = objetivo.kpis.some((k) => !k.indicador || !k.meta || k.emAnalise) || objetivo.iniciativas.length === 0;
  const pedeDetalhe = form.avaliacao === "ajustes" || form.avaliacao === "discordo";
  const ok = livre ? !!form.avaliacao || temTexto(form) : !problemaDe(form);

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

      {acompanhamento}

      <div className="rev">
        <p className="rev-titulo">Sua avaliação{livre && <small className="opcional"> (opcional)</small>}</p>
        <div className="seg-btns" role="radiogroup" aria-label="Sua avaliação">
          {AVALIACOES.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={form.avaliacao === a}
              disabled={bloqueado}
              className={`seg-btn seg-btn-${a}${form.avaliacao === a ? " ativo" : ""}`}
              // No modo livre, tocar de novo na avaliação marcada desmarca.
              onClick={() => mudar("avaliacao", livre && form.avaliacao === a ? null : a)}
            >
              {AVALIACAO_LABEL[a]}
            </button>
          ))}
        </div>

        {livre ? (
          <div className="rev-campos">
            <p className="rev-dica">Ajuste o que for necessário. Campos em branco mantêm o texto atual do plano.</p>
            <Campo label="Ajuste no objetivo" value={form.objetivo ?? ""} onChange={(v) => mudar("objetivo", v)} bloqueado={bloqueado} atual={objetivo.titulo} />
            <Campo label="Ajuste nos indicadores" value={form.indicador} onChange={(v) => mudar("indicador", v)} bloqueado={bloqueado} atual={textoAtual(objetivo.kpis.map((k) => k.indicador))} />
            <Campo label="Ajuste nas metas" value={form.meta} onChange={(v) => mudar("meta", v)} bloqueado={bloqueado} atual={textoAtual(objetivo.kpis.map((k) => k.meta))} />
            <Campo label="Ajuste nas iniciativas" value={form.iniciativas} onChange={(v) => mudar("iniciativas", v)} bloqueado={bloqueado} atual={textoAtual(objetivo.iniciativas)} />
            <Campo label="Comentário / decisão" value={form.comentario} onChange={(v) => mudar("comentario", v)} bloqueado={bloqueado} />
          </div>
        ) : form.avaliacao && (
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

export function SugestaoGeralCard({ pilar, form, mudar, bloqueado, acompanhamento }: {
  pilar: Pilar;
  form: RespostaRascunho;
  mudar: Mudar;
  bloqueado: boolean;
  acompanhamento?: React.ReactNode;
}) {
  return (
    <article className="obj obj-geral">
      <header className="obj-head">
        <span className="obj-num">+</span>
        <h2>Falta algo neste pilar? <small className="opcional">(opcional)</small></h2>
      </header>
      {acompanhamento}
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
