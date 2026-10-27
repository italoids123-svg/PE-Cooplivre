import { normalizar } from "../normalizar";
import { ValidationError } from "../validate";
import { LOCAIS } from "./agencias";
import { POR_ID } from "./catalogo";
import type { Contribuicao, Escopo, RevisaoLinha, Visao } from "./tipos";

const MAX_MOTIVO = 2000;
const MAX_CONTRIBUICOES = 30;
const ID_RE = /^[a-z0-9-]{3,120}$/;

function texto(v: unknown, campo: string, max: number): string {
  if (v == null) return "";
  if (typeof v !== "string") throw new ValidationError(`Campo inválido: ${campo}`);
  const t = v.trim();
  if (t.length > max) throw new ValidationError(`Campo muito longo: ${campo}`);
  return t;
}

// Sem lista de acesso nesta etapa: a pessoa é reconhecida pelo nome digitado.
// "José da Silva" e "jose  da silva" caem no mesmo id.
export function idPorNome(nome: string): string {
  return normalizar(nome).replace(/ /g, "-");
}

export function participanteId(v: unknown): string {
  if (typeof v !== "string" || !ID_RE.test(v)) throw new ValidationError("Identificação inválida");
  return v;
}

export function validarIdentificacao(v: unknown) {
  const o = (v ?? {}) as Record<string, unknown>;
  const nome = texto(o.nome, "nome", 120).replace(/\s+/g, " ");
  const cargo = texto(o.cargo, "cargo", 120);
  const agencia = texto(o.agencia, "agencia", 120);
  if (normalizar(nome).split(" ").filter(Boolean).length < 2) throw new ValidationError("Informe seu nome e pelo menos um sobrenome.");
  if (cargo.length < 2) throw new ValidationError("Informe seu cargo.");
  if (!LOCAIS.includes(agencia)) throw new ValidationError("Selecione sua cidade.");
  return { id: participanteId(idPorNome(nome)), nome, cargo, agencia };
}

export function visao(v: unknown): Visao {
  if (v !== "global" && v !== "agencia") throw new ValidationError("Visão inválida");
  return v;
}

function contribuicao(v: unknown): Contribuicao {
  const o = (v ?? {}) as Record<string, unknown>;
  const escopo = o.escopo as Escopo;
  if (escopo !== "mes" && escopo !== "global") throw new ValidationError("Indique se a contribuição é de um mês ou do valor global.");
  const mes = escopo === "mes" ? Number(o.mes) : null;
  if (mes !== null && !(Number.isInteger(mes) && mes >= 1 && mes <= 12)) throw new ValidationError("Selecione o mês.");
  let valorSugerido: number | null = null;
  if (o.valorSugerido != null && o.valorSugerido !== "") {
    valorSugerido = Number(o.valorSugerido);
    if (!Number.isFinite(valorSugerido) || Math.abs(valorSugerido) > 1e13) throw new ValidationError("Valor sugerido inválido.");
  }
  const motivo = texto(o.motivo, "motivo", MAX_MOTIVO);
  if (motivo.length < 3) throw new ValidationError("Explique o motivo da contribuição.");
  const id = texto(o.id, "id", 40);
  const criadoEm = texto(o.criadoEm, "criadoEm", 40);
  return {
    id: /^[a-zA-Z0-9-]{4,40}$/.test(id) ? id : crypto.randomUUID(),
    escopo,
    mes,
    valorSugerido,
    motivo,
    criadoEm: Number.isNaN(Date.parse(criadoEm)) ? new Date().toISOString() : criadoEm,
  };
}

// null = a linha volta a ficar pendente (apaga a revisão).
export function validarRevisao(v: unknown, pid: string): { visao: Visao; linhaId: string; revisao: RevisaoLinha | null } {
  const o = (v ?? {}) as Record<string, unknown>;
  const vis = visao(o.visao);
  const linhaId = texto(o.linhaId, "linhaId", 200);
  if (!POR_ID.has(linhaId)) throw new ValidationError(`Linha desconhecida: ${linhaId}`);
  if (o.status == null) return { visao: vis, linhaId, revisao: null };
  if (o.status !== "sem-contribuicao" && o.status !== "com-contribuicao") throw new ValidationError("Status inválido");
  const lista = Array.isArray(o.contribuicoes) ? o.contribuicoes : [];
  if (lista.length > MAX_CONTRIBUICOES) throw new ValidationError("Contribuições demais nesta linha.");
  const contribuicoes = o.status === "com-contribuicao" ? lista.map(contribuicao) : [];
  if (o.status === "com-contribuicao" && !contribuicoes.length) throw new ValidationError("Inclua ao menos uma contribuição.");
  return {
    visao: vis,
    linhaId,
    revisao: { participanteId: pid, visao: vis, linhaId, status: o.status, contribuicoes, atualizadoEm: new Date().toISOString() },
  };
}
