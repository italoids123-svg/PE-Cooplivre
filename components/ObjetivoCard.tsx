"use client";

import { useState } from "react";
import { geralId, type Objetivo, type Pilar } from "@/lib/data";
import { enviarResposta, gravarRascunho, lerRascunho } from "@/lib/respostas-client";
import { AVALIACAO_LABEL, AVALIACOES, type Participante, type Resposta, type RespostaRascunho } from "@/lib/types";

const VAZIO: RespostaRascunho = { avaliacao: null, indicador: "", meta: "", iniciativas: "", comentario: "" };

function deResposta(r: Resposta | undefined): RespostaRascunho {
  if (!r) return VAZIO;
  return { avaliacao: r.avaliacao, indicador: r.indicador, meta: r.meta, iniciativas: r.iniciativas, comentario: r.comentario };
}

const igual = (a: RespostaRascunho, b: RespostaRascunho) =>
  a.avaliacao === b.avaliacao && a.indicador === b.indicador && a.meta === b.meta &&
  a.iniciativas === b.iniciativas && a.comentario === b.comentario;

const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Estado de edição compartilhado pelos dois tipos de card: rascunho local,
// comparação com o que está salvo no servidor e envio.
function useEdicao(participante: Participante, objetivoId: string, salva: Resposta | undefined, onSalvo: (r: Resposta) => void) {
  const base = deResposta(salva);
  const [form, setForm] = useState<RespostaRascunho>(() => lerRascunho(participante.id, objetivoId) ?? base);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const sujo = !igual(form, base);

  function set<K extends keyof RespostaRascunho>(k: K, v: RespostaRascunho[K]) {
    setForm((f) => {
      const novo = { ...f, [k]: v };
      gravarRascunho(participante.id, objetivoId, igual(novo, base) ? null : novo);
      return novo;
    });
    setErro(null);
  }

  async function salvar() {
    setEnviando(true);
    setErro(null);
    try {
      const r = await enviarResposta(participante, objetivoId, form);
      gravarRascunho(participante.id, objetivoId, null);
      setForm(deResposta(r));
      onSalvo(r);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return { form, set, salvar, enviando, erro, sujo };
}

function Status({ salva, sujo, erro }: { salva?: Resposta; sujo: boolean; erro: string | null }) {
  if (erro) return <span className="status status-erro" role="alert">{erro}</span>;
  if (sujo) return <span className="status status-pendente">Alterações não enviadas</span>;
  if (salva) return <span className="status status-ok">✓ Enviado às {hora(salva.atualizadoEm)}</span>;
  return null;
}

function Campo({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="campo campo-texto">
      <span>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} maxLength={2000} placeholder={placeholder} />
    </label>
  );
}

function EmDefinicao({ rascunho }: { rascunho?: string }) {
  return (
    <span className="em-definicao">
      <i>Em definição</i>
      {rascunho && <span className="rascunho">Proposta em discussão: {rascunho}</span>}
    </span>
  );
}

export function ObjetivoCard({
  numero,
  objetivo,
  participante,
  salva,
  onSalvo,
}: {
  numero: number;
  objetivo: Objetivo;
  participante: Participante;
  salva?: Resposta;
  onSalvo: (r: Resposta) => void;
}) {
  const { form, set, salvar, enviando, erro, sujo } = useEdicao(participante, objetivo.id, salva, onSalvo);
  const temPendencia = objetivo.kpis.some((k) => !k.indicador || !k.meta) || objetivo.iniciativas.length === 0;
  const pedeDetalhe = form.avaliacao === "ajustes" || form.avaliacao === "discordo";
  const temTexto = !!(form.indicador || form.meta || form.iniciativas || form.comentario);
  const podeEnviar = !!form.avaliacao && (!pedeDetalhe || temTexto) && (sujo || !salva) && !enviando;

  return (
    <article className={`obj${salva && !sujo ? " obj-feito" : ""}`} id={objetivo.id}>
      <header className="obj-head">
        <span className="obj-num">{numero}</span>
        <h2>{objetivo.titulo}</h2>
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
                <td data-label="Meta">{k.meta ?? <EmDefinicao rascunho={k.rascunho} />}</td>
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
              className={`seg-btn seg-btn-${a}${form.avaliacao === a ? " ativo" : ""}`}
              onClick={() => set("avaliacao", a)}
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
                <Campo label="Sugestão para o indicador" value={form.indicador} onChange={(v) => set("indicador", v)} />
                <Campo label="Sugestão para a meta" value={form.meta} onChange={(v) => set("meta", v)} />
                <Campo label="Sugestão para as iniciativas" value={form.iniciativas} onChange={(v) => set("iniciativas", v)} />
                <Campo label="Comentário geral" value={form.comentario} onChange={(v) => set("comentario", v)} />
              </>
            ) : (
              <Campo label="Comentário (opcional)" value={form.comentario} onChange={(v) => set("comentario", v)} />
            )}
          </div>
        )}

        <div className="rev-acoes">
          <Status salva={salva} sujo={sujo} erro={erro} />
          <button type="button" className="btn btn-primario" disabled={!podeEnviar} onClick={salvar}>
            {enviando ? "Enviando…" : salva ? "Atualizar" : "Enviar"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function SugestaoGeralCard({
  pilar,
  participante,
  salva,
  onSalvo,
}: {
  pilar: Pilar;
  participante: Participante;
  salva?: Resposta;
  onSalvo: (r: Resposta) => void;
}) {
  const { form, set, salvar, enviando, erro, sujo } = useEdicao(participante, geralId(pilar.slug), salva, onSalvo);
  const podeEnviar = !!form.comentario.trim() && sujo && !enviando;
  return (
    <article className={`obj obj-geral${salva && !sujo ? " obj-feito" : ""}`}>
      <header className="obj-head">
        <span className="obj-num">+</span>
        <h2>Falta algo neste pilar?</h2>
      </header>
      <div className="rev">
        <Campo
          label={`Objetivo, indicador ou iniciativa que você incluiria em “${pilar.nome}”`}
          value={form.comentario}
          onChange={(v) => set("comentario", v)}
          placeholder="Descreva o que está faltando e por que é importante."
        />
        <div className="rev-acoes">
          <Status salva={salva} sujo={sujo} erro={erro} />
          <button type="button" className="btn btn-primario" disabled={!podeEnviar} onClick={salvar}>
            {enviando ? "Enviando…" : salva ? "Atualizar" : "Enviar"}
          </button>
        </div>
      </div>
    </article>
  );
}
