import "server-only";
import ExcelJS from "exceljs";
import { aba, dataLocal } from "../export";
import { CATALOGO, POR_ID, TOTAL_LINHAS } from "./catalogo";
import type { SnapshotOrc } from "./store";
import { ANO_ORCAMENTO, de2027, MESES, rotuloEscopo, STATUS_LINHA_LABEL, valorAnual, type Natureza } from "./tipos";

const FMT_VALOR = "#,##0.00;-#,##0.00";
const FMT_TAXA = "0.0000";

function infoLinha(linhaId: string) {
  const it = POR_ID.get(linhaId);
  if (!it) return { ordem: 9999, bloco: "", grupo: "", linha: linhaId, natureza: "saldo" as Natureza, v: [] as (number | null)[] };
  return {
    ordem: it.ordem,
    bloco: it.bloco.nome,
    grupo: it.grupo?.nome ?? "",
    linha: it.tipo === "detalhe" ? it.linha.nome : it.tipo === "total-grupo" ? `Total – ${it.linha.nome}` : it.linha.nome,
    natureza: it.bloco.natureza,
    v: de2027(it.linha),
  };
}

export async function montarPlanilhaOrc(dados: SnapshotOrc): Promise<ArrayBuffer> {
  const pessoas = Object.fromEntries(dados.participantes.map((p) => [p.id, p]));
  const revisoes = [...dados.revisoes].sort(
    (a, b) => infoLinha(a.linhaId).ordem - infoLinha(b.linhaId).ordem || (pessoas[a.participanteId]?.nome ?? "").localeCompare(pessoas[b.participanteId]?.nome ?? "", "pt-BR"),
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "Orçamento Cooplivre";
  wb.created = new Date();

  // 1. Uma linha por contribuição, com o valor orçado ao lado do sugerido.
  const contrib = revisoes.flatMap((r) => {
    const i = infoLinha(r.linhaId);
    const p = pessoas[r.participanteId];
    return r.contribuicoes.map((c) => {
      const atual = c.escopo === "mes" && c.mes ? i.v[c.mes - 1] : valorAnual(i.v, i.natureza);
      return {
        bloco: i.bloco, grupo: i.grupo, linha: i.linha,
        visao: r.visao === "global" ? "Global" : `Agência`,
        nome: p?.nome, cargo: p?.cargo, agencia: p?.agencia,
        refere: rotuloEscopo(c),
        unidade: i.natureza === "taxa" ? "% a.m." : "R$",
        atual, sugerido: c.valorSugerido,
        diferenca: c.valorSugerido != null && atual != null ? c.valorSugerido - atual : null,
        motivo: c.motivo,
        criadoEm: dataLocal(c.criadoEm), atualizadoEm: dataLocal(r.atualizadoEm),
      };
    });
  });
  aba(wb, "Contribuições", [
    { header: "Bloco", key: "bloco", width: 22 },
    { header: "Grupo", key: "grupo", width: 26 },
    { header: "Linha", key: "linha", width: 34 },
    { header: "Visão", key: "visao", width: 9 },
    { header: "Nome", key: "nome", width: 26 },
    { header: "Cargo", key: "cargo", width: 22 },
    { header: "Cidade", key: "agencia", width: 16 },
    { header: "Refere-se a", key: "refere", width: 16 },
    { header: "Unidade", key: "unidade", width: 8 },
    { header: `Valor orçado ${ANO_ORCAMENTO}`, key: "atual", width: 18, fmt: FMT_VALOR },
    { header: "Valor sugerido", key: "sugerido", width: 18, fmt: FMT_VALOR },
    { header: "Diferença", key: "diferenca", width: 18, fmt: FMT_VALOR },
    { header: "Motivo", key: "motivo", width: 60 },
    { header: "Registrada em", key: "criadoEm", width: 17, data: true },
    { header: "Última alteração da linha", key: "atualizadoEm", width: 17, data: true },
  ], contrib);

  // 2. Status de cada linha revisada por cada pessoa (inclui "sem contribuição").
  aba(wb, "Revisão por linha", [
    { header: "Bloco", key: "bloco", width: 22 },
    { header: "Grupo", key: "grupo", width: 26 },
    { header: "Linha", key: "linha", width: 34 },
    { header: "Visão", key: "visao", width: 9 },
    { header: "Nome", key: "nome", width: 26 },
    { header: "Cidade", key: "agencia", width: 16 },
    { header: "Status", key: "status", width: 18 },
    { header: "Nº de contribuições", key: "n", width: 12 },
    { header: "Atualizado em", key: "em", width: 17, data: true },
  ], revisoes.map((r) => {
    const i = infoLinha(r.linhaId);
    const p = pessoas[r.participanteId];
    return {
      bloco: i.bloco, grupo: i.grupo, linha: i.linha, visao: r.visao === "global" ? "Global" : "Agência",
      nome: p?.nome, agencia: p?.agencia, status: STATUS_LINHA_LABEL[r.status], n: r.contribuicoes.length, em: dataLocal(r.atualizadoEm),
    };
  }));

  // 3. Participantes e andamento.
  aba(wb, "Participantes", [
    { header: "Nome", key: "nome", width: 30 },
    { header: "Cargo", key: "cargo", width: 26 },
    { header: "Cidade", key: "agencia", width: 18 },
    { header: "Linhas revisadas (global)", key: "revisadas", width: 14 },
    { header: "% revisado", key: "pct", width: 10, pct: true },
    { header: "Linhas com contribuição", key: "comContrib", width: 14 },
    { header: "Contribuições", key: "contribs", width: 12 },
    { header: "Primeiro acesso", key: "criadoEm", width: 17, data: true },
    { header: "Última atividade", key: "ultima", width: 17, data: true },
  ], [...dados.participantes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((p) => {
    const rs = dados.revisoes.filter((r) => r.participanteId === p.id && r.visao === "global");
    const ultima = rs.reduce((m, r) => (r.atualizadoEm > m ? r.atualizadoEm : m), p.atualizadoEm);
    return {
      nome: p.nome, cargo: p.cargo, agencia: p.agencia,
      revisadas: rs.length, pct: rs.length / TOTAL_LINHAS,
      comContrib: rs.filter((r) => r.status === "com-contribuicao").length,
      contribs: rs.reduce((n, r) => n + r.contribuicoes.length, 0),
      criadoEm: dataLocal(p.criadoEm), ultima: dataLocal(ultima),
    };
  }));

  // 4. Base orçada (referência para conferir as sugestões).
  aba(wb, `Orçamento ${ANO_ORCAMENTO}`, [
    { header: "Bloco", key: "bloco", width: 22 },
    { header: "Grupo", key: "grupo", width: 26 },
    { header: "Linha", key: "linha", width: 34 },
    ...MESES.map((m, i) => ({ header: `${m}/${String(ANO_ORCAMENTO).slice(2)}`, key: `m${i}`, width: 15, fmt: FMT_VALOR })),
  ], CATALOGO.map((it) => {
    const i = infoLinha(it.linha.id);
    return { bloco: i.bloco, grupo: i.grupo, linha: i.linha, ...Object.fromEntries(i.v.map((x, k) => [`m${k}`, x])) };
  })).eachRow((row, n) => {
    if (n === 1) return;
    const natureza = CATALOGO[n - 2]?.bloco.natureza;
    if (natureza === "taxa") for (let c = 4; c <= 15; c++) row.getCell(c).numFmt = FMT_TAXA;
    if (CATALOGO[n - 2]?.tipo !== "detalhe") row.font = { bold: true };
  });

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}
