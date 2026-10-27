// Revisão do Planejamento Orçamentário 2027 (rota /orcamento).

// saldo: posição no fim do mês (balanço). fluxo: resultado do mês (DRE). taxa: % a.m.
export type Natureza = "saldo" | "fluxo" | "taxa";

export interface Linha {
  id: string;
  nome: string;
  // jan/2026 … dez/2027. null = célula vazia na planilha.
  v: (number | null)[];
}

export interface Grupo {
  id: string;
  codigo: string | null;
  // null: bloco sem agrupamento (as linhas aparecem direto).
  nome: string | null;
  // null: grupo sem linha de total (blocos de taxas).
  total: Linha | null;
  linhas: Linha[];
}

export interface Bloco {
  id: string;
  nome: string;
  natureza: Natureza;
  total: Linha | null;
  grupos: Grupo[];
}

export const ANO_ORCAMENTO = 2027;
export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
// Na planilha, 2026 é realizado até agosto; de setembro em diante é projeção.
export const ULTIMO_MES_REALIZADO_2026 = 8;

export type Visao = "global" | "agencia";
export type Escopo = "mes" | "global";

export interface Contribuicao {
  id: string;
  escopo: Escopo;
  // 1–12 quando escopo = "mes".
  mes: number | null;
  // Em R$ (ou % a.m. para taxas). Opcional: a pessoa pode só explicar o motivo.
  valorSugerido: number | null;
  motivo: string;
  criadoEm: string;
}

export type StatusLinha = "sem-contribuicao" | "com-contribuicao";

export interface RevisaoLinha {
  participanteId: string;
  visao: Visao;
  linhaId: string;
  status: StatusLinha;
  contribuicoes: Contribuicao[];
  atualizadoEm: string;
}

export interface ParticipanteOrc {
  id: string;
  nome: string;
  cargo: string;
  agencia: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AlteracaoOrc {
  em: string;
  participante: { id: string; nome: string; cargo: string; agencia: string };
  visao: Visao;
  linhaId: string;
  antes: RevisaoLinha | null;
  depois: RevisaoLinha | null;
}

export const STATUS_LINHA_LABEL: Record<StatusLinha, string> = {
  "sem-contribuicao": "Sem contribuição",
  "com-contribuicao": "Com contribuição",
};

export const chaveRevisao = (pid: string, visao: Visao, linhaId: string) => `${pid}|${visao}|${linhaId}`;

// Valores do ano do orçamento (2027) e do ano de referência (2026).
export const de2026 = (l: Linha) => l.v.slice(0, 12);
export const de2027 = (l: Linha) => l.v.slice(12, 24);

// Valor que resume o ano: saldo de dezembro, soma do resultado ou média da taxa.
export function valorAnual(vs: (number | null)[], natureza: Natureza): number | null {
  const nums = vs.filter((x): x is number => x != null);
  if (!nums.length) return null;
  if (natureza === "saldo") return vs[11] ?? null;
  const soma = nums.reduce((a, b) => a + b, 0);
  return natureza === "fluxo" ? soma : soma / nums.length;
}

export const ROTULO_ANUAL: Record<Natureza, string> = {
  saldo: "Saldo dez",
  fluxo: "Total ano",
  taxa: "Média a.m.",
};

export function rotuloEscopo(c: Pick<Contribuicao, "escopo" | "mes">): string {
  return c.escopo === "mes" && c.mes ? `${MESES[c.mes - 1]}/${ANO_ORCAMENTO}` : `Valor global ${ANO_ORCAMENTO}`;
}
