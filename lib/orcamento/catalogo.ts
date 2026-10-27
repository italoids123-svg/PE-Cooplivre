import { BLOCOS } from "./dados";
import type { Bloco, Grupo, Linha } from "./tipos";

export interface ItemCatalogo {
  linha: Linha;
  bloco: Bloco;
  grupo: Grupo | null;
  // "total-bloco" | "total-grupo" | "detalhe"
  tipo: "total-bloco" | "total-grupo" | "detalhe";
  ordem: number;
}

// Todas as linhas revisáveis, na ordem da planilha.
export function linhasDoBloco(b: Bloco): Omit<ItemCatalogo, "ordem">[] {
  const out: Omit<ItemCatalogo, "ordem">[] = [];
  for (const g of b.grupos) {
    if (g.total) out.push({ linha: g.total, bloco: b, grupo: g, tipo: "total-grupo" });
    for (const l of g.linhas) out.push({ linha: l, bloco: b, grupo: g, tipo: "detalhe" });
  }
  if (b.total) out.push({ linha: b.total, bloco: b, grupo: null, tipo: "total-bloco" });
  return out;
}

export const CATALOGO: ItemCatalogo[] = BLOCOS.flatMap(linhasDoBloco).map((x, ordem) => ({ ...x, ordem }));
export const POR_ID = new Map(CATALOGO.map((x) => [x.linha.id, x]));
export const TOTAL_LINHAS = CATALOGO.length;
