import type { Natureza } from "./tipos";

const MIL = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const REAIS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const TAXA = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero" });
const PP = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });

// Tabela: valores em R$ mil; taxas em % a.m.
export function fmtTabela(v: number | null, natureza: Natureza): string {
  if (v == null) return "–";
  if (natureza === "taxa") return `${TAXA.format(v)}%`;
  const mil = Math.round(v / 1000);
  return mil === 0 && v !== 0 ? (v < 0 ? "-0" : "0") : MIL.format(mil);
}

// Valor completo (dicas, formulário, painel).
export function fmtCompleto(v: number | null, natureza: Natureza): string {
  if (v == null) return "sem valor";
  return natureza === "taxa" ? `${TAXA.format(v)}% a.m.` : REAIS.format(v);
}

// Variação do ano do orçamento sobre o ano anterior: % para valores, p.p. para taxas.
export function fmtVariacao(atual: number | null, anterior: number | null, natureza: Natureza): string {
  if (atual == null || anterior == null) return "–";
  if (natureza === "taxa") return `${PP.format(atual - anterior)} p.p.`;
  if (anterior === 0) return "–";
  return PCT.format((atual - anterior) / Math.abs(anterior));
}

// "1.234.567,89" / "1234567.89" / "-12,5" → número. null se vazio; NaN se inválido.
export function lerNumero(s: string): number | null {
  const t = s.trim().replace(/\s|R\$|%/g, "");
  if (!t) return null;
  const normal = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : /^-?\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, "") : t;
  return /^-?\d+(\.\d+)?$/.test(normal) ? Number(normal) : NaN;
}
