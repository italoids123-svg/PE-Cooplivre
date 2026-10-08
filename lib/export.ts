import "server-only";
import ExcelJS from "exceljs";
import { geralId, PILARES } from "./data";
import type { Snapshot } from "./store";
import { RESPONSAVEIS, responsavelPorId } from "./acesso";
import {
  AVALIACAO_LABEL, AVALIACOES, CAMPOS_RESPOSTA, enviosDe, STATUS_LABEL, statusRevisao,
  type Avaliacao, type CampoResposta,
} from "./types";

const FUSO = "America/Sao_Paulo";
const COR_CABECALHO = "FF003641";

const NOME_CAMPO: Record<CampoResposta, string> = {
  avaliacao: "Avaliação",
  indicador: "Sugestão p/ indicador",
  meta: "Sugestão p/ meta",
  iniciativas: "Sugestão p/ iniciativas",
  comentario: "Comentário",
};

interface InfoObjetivo {
  pilar: string;
  ordem: string;
  codigo: string;
  objetivo: string;
  responsavel: string;
  indicadores: string;
  metas: string;
  iniciativas: string;
}

function catalogo(): Record<string, InfoObjetivo> {
  const out: Record<string, InfoObjetivo> = {};
  PILARES.forEach((p, ip) => {
    p.objetivos.forEach((o, io) => {
      out[o.id] = {
        pilar: p.nome,
        ordem: `${ip + 1}.${io + 1}`,
        codigo: o.codigo,
        objetivo: o.titulo + (o.visivel ? "" : " (oculto no evento)"),
        responsavel: o.responsavel,
        indicadores: o.kpis.map((k) => k.indicador ?? "Em definição").join("\n"),
        metas: o.kpis.map((k) => (k.meta ? `${k.meta}${k.emAnalise ? " [em análise]" : ""}` : "Em definição")).join("\n"),
        iniciativas: o.iniciativas.join("\n") || "Em definição",
      };
    });
    out[geralId(p.slug)] = {
      pilar: p.nome,
      ordem: `${ip + 1}.+`,
      codigo: `${p.nome} (geral)`,
      objetivo: "Falta algo neste pilar?",
      responsavel: "",
      indicadores: "",
      metas: "",
      iniciativas: "",
    };
  });
  return out;
}

// Excel não tem fuso: grava a hora de Brasília "como se fosse UTC" para a célula
// mostrar o horário local do evento, não o do servidor.
function dataLocal(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return new Date(Date.UTC(+partes.year, +partes.month - 1, +partes.day, +partes.hour, +partes.minute, +partes.second));
}

const rotulo = (a: Avaliacao | null | undefined) => (a ? AVALIACAO_LABEL[a] : "");
const valorCampo = (c: CampoResposta, v: unknown) => (c === "avaliacao" ? rotulo(v as Avaliacao | null) : String(v ?? ""));

type Coluna = { header: string; key: string; width: number; data?: boolean; pct?: boolean };

function aba(wb: ExcelJS.Workbook, nome: string, colunas: Coluna[], linhas: Record<string, unknown>[]) {
  const ws = wb.addWorksheet(nome, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = colunas.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.addRows(linhas);
  const cab = ws.getRow(1);
  cab.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cab.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_CABECALHO } };
  cab.alignment = { vertical: "middle", wrapText: true };
  cab.height = 30;
  colunas.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    col.alignment = { vertical: "top", wrapText: true };
    if (c.data) col.numFmt = "dd/mm/yyyy hh:mm";
    if (c.pct) col.numFmt = "0%";
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: colunas.length } };
  return ws;
}

export async function montarPlanilha(dados: Snapshot): Promise<ArrayBuffer> {
  const info = catalogo();
  const pessoas = Object.fromEntries(dados.participantes.map((p) => [p.id, p]));
  const edicoes: Record<string, number> = {};
  for (const h of dados.historico) {
    const k = `${h.participante.id}|${h.objetivoId}`;
    edicoes[k] = (edicoes[k] ?? 0) + 1;
  }
  const ordem = (oid: string) => info[oid]?.ordem ?? "9";
  const porOrdem = <T,>(xs: T[], oid: (x: T) => string, extra: (x: T) => string) =>
    [...xs].sort((a, b) => ordem(oid(a)).localeCompare(ordem(oid(b)), "pt-BR", { numeric: true }) || extra(a).localeCompare(extra(b), "pt-BR"));

  const wb = new ExcelJS.Workbook();
  wb.creator = "Mapa Estratégico Cooplivre";
  wb.created = new Date();

  const status = (pid: string) => (pessoas[pid] ? STATUS_LABEL[statusRevisao(pessoas[pid])] : "");
  // Cada responsável tem id fixo (lib/acesso.ts), então não há duplicatas a tratar.
  // Entra no resumo quem está na lista e enviou ao menos uma vez.
  const noResumo = new Set(dados.participantes.filter((p) => responsavelPorId(p.id) && enviosDe(p).length).map((p) => p.id));
  const nomePilar = (slug: string) => PILARES.find((p) => p.slug === slug)?.nome ?? slug;

  // 1. Resumo por objetivo — revisões enviadas, uma por pessoa.
  const finais = dados.respostas.filter((r) => noResumo.has(r.participanteId));
  const resumo = PILARES.flatMap((p) =>
    [...p.objetivos.filter((o) => o.visivel).map((o) => o.id), geralId(p.slug)].map((oid) => {
      const rs = finais.filter((r) => r.objetivoId === oid);
      const cont = Object.fromEntries(AVALIACOES.map((a) => [a, rs.filter((r) => r.avaliacao === a).length])) as Record<Avaliacao, number>;
      const avaliadas = cont.concordo + cont.ajustes + cont.discordo;
      return {
        codigo: info[oid].codigo, pilar: info[oid].pilar, objetivo: info[oid].objetivo, responsavel: info[oid].responsavel,
        respostas: rs.length, concordo: cont.concordo, ajustes: cont.ajustes, discordo: cont.discordo,
        pctConcordo: avaliadas ? cont.concordo / avaliadas : null,
        sugestoes: rs.filter((r) => r.indicador || r.meta || r.iniciativas || r.comentario).length,
      };
    }),
  );
  aba(wb, "Resumo (enviadas)", [
    { header: "Código", key: "codigo", width: 9 },
    { header: "Pilar", key: "pilar", width: 24 },
    { header: "Objetivo", key: "objetivo", width: 55 },
    { header: "Responsável", key: "responsavel", width: 14 },
    { header: "Respostas", key: "respostas", width: 11 },
    { header: "Concordo", key: "concordo", width: 11 },
    { header: "Com ajustes", key: "ajustes", width: 11 },
    { header: "Discordo", key: "discordo", width: 11 },
    { header: "% Concordo", key: "pctConcordo", width: 12, pct: true },
    { header: "Sugestões escritas", key: "sugestoes", width: 12 },
  ], resumo);

  // 2. Contribuições (versão final de cada pessoa em cada objetivo)
  const contrib = porOrdem(dados.respostas, (r) => r.objetivoId, (r) => pessoas[r.participanteId]?.nome ?? "").map((r) => {
    const i = info[r.objetivoId];
    const p = pessoas[r.participanteId];
    return {
      codigo: i?.codigo ?? r.objetivoId, pilar: i?.pilar ?? r.pilar, objetivo: i?.objetivo ?? r.objetivoId,
      indicadorAtual: i?.indicadores, metaAtual: i?.metas, iniciativasAtuais: i?.iniciativas,
      nome: p?.nome, cargo: p?.cargo, status: status(r.participanteId),
      noResumo: noResumo.has(r.participanteId) ? "Sim" : "Não",
      avaliacao: rotulo(r.avaliacao), indicador: r.indicador, meta: r.meta, iniciativas: r.iniciativas, comentario: r.comentario,
      edicoes: edicoes[`${r.participanteId}|${r.objetivoId}`] ?? 1,
      criadoEm: dataLocal(r.criadoEm ?? r.atualizadoEm), atualizadoEm: dataLocal(r.atualizadoEm),
    };
  });
  aba(wb, "Contribuições", [
    { header: "Código", key: "codigo", width: 9 },
    { header: "Pilar", key: "pilar", width: 22 },
    { header: "Objetivo", key: "objetivo", width: 40 },
    { header: "Indicador proposto", key: "indicadorAtual", width: 32 },
    { header: "Meta proposta", key: "metaAtual", width: 28 },
    { header: "Iniciativas propostas", key: "iniciativasAtuais", width: 36 },
    { header: "Nome", key: "nome", width: 24 },
    { header: "Cargo", key: "cargo", width: 22 },
    { header: "Status da revisão", key: "status", width: 16 },
    { header: "Entra no resumo", key: "noResumo", width: 10 },
    { header: "Avaliação", key: "avaliacao", width: 16 },
    { header: "Sugestão p/ indicador", key: "indicador", width: 34 },
    { header: "Sugestão p/ meta", key: "meta", width: 34 },
    { header: "Sugestão p/ iniciativas", key: "iniciativas", width: 34 },
    { header: "Comentário", key: "comentario", width: 34 },
    { header: "Nº de edições", key: "edicoes", width: 10 },
    { header: "Primeiro envio", key: "criadoEm", width: 17, data: true },
    { header: "Última alteração", key: "atualizadoEm", width: 17, data: true },
  ], contrib);

  // 3. Histórico: uma linha por campo alterado em cada envio
  const hist = [...dados.historico]
    .sort((a, b) => a.em.localeCompare(b.em))
    .flatMap((h) =>
      CAMPOS_RESPOSTA.filter((c) => (h.antes?.[c] ?? (c === "avaliacao" ? null : "")) !== h.depois[c]).map((c) => ({
        em: dataLocal(h.em),
        nome: h.participante.nome, cargo: h.participante.cargo,
        pilar: info[h.objetivoId]?.pilar ?? h.pilar, objetivo: info[h.objetivoId]?.objetivo ?? h.objetivoId,
        acao: h.acao === "criou" ? "Primeiro envio" : "Alteração",
        campo: NOME_CAMPO[c],
        antes: h.antes ? valorCampo(c, h.antes[c]) : "",
        depois: valorCampo(c, h.depois[c]),
      })),
    );
  aba(wb, "Histórico de alterações", [
    { header: "Data/hora", key: "em", width: 17, data: true },
    { header: "Nome", key: "nome", width: 24 },
    { header: "Cargo", key: "cargo", width: 22 },
    { header: "Pilar", key: "pilar", width: 22 },
    { header: "Objetivo", key: "objetivo", width: 40 },
    { header: "Ação", key: "acao", width: 14 },
    { header: "Campo", key: "campo", width: 20 },
    { header: "Antes", key: "antes", width: 40 },
    { header: "Depois", key: "depois", width: 40 },
  ], hist);

  // 4. Participantes: todos os responsáveis da lista, inclusive quem ainda não entrou.
  const ultimaAtividade = (pid: string, base: string) =>
    dados.respostas.filter((r) => r.participanteId === pid).reduce((m, r) => (r.atualizadoEm > m ? r.atualizadoEm : m), base);
  const pilaresSalvos = (pid: string, pilares: string[]) =>
    PILARES.filter((pl) => pilares.includes(pl.slug)).filter((pl) =>
      pl.objetivos.filter((o) => o.visivel).every((o) => dados.respostas.some((r) => r.participanteId === pid && r.objetivoId === o.id && r.avaliacao)),
    ).length;
  const part = RESPONSAVEIS.map((resp) => {
    const p = pessoas[resp.id];
    return {
      nome: resp.nome, cargo: p?.cargo ?? "",
      pilaresResp: resp.pilares.length === PILARES.length ? "Todos" : resp.pilares.map(nomePilar).join("; "),
      status: p ? status(p.id) : "Não acessou",
      pilares: `${p ? pilaresSalvos(p.id, resp.pilares) : 0}/${resp.pilares.length}`,
      envios: p ? enviosDe(p).length : 0,
      primeiroEnvio: dataLocal(p && enviosDe(p)[0]), ultimoEnvio: dataLocal(p && enviosDe(p).at(-1)),
      reabertoEm: dataLocal(p?.reabertoEm), ultima: dataLocal(p && ultimaAtividade(p.id, p.atualizadoEm)),
    };
  });
  aba(wb, "Participantes", [
    { header: "Nome", key: "nome", width: 34 },
    { header: "Cargo", key: "cargo", width: 26 },
    { header: "Pilares sob responsabilidade", key: "pilaresResp", width: 40 },
    { header: "Status da revisão", key: "status", width: 16 },
    { header: "Pilares salvos", key: "pilares", width: 10 },
    { header: "Nº de envios", key: "envios", width: 9 },
    { header: "Primeiro envio", key: "primeiroEnvio", width: 17, data: true },
    { header: "Último envio", key: "ultimoEnvio", width: 17, data: true },
    { header: "Reaberta em", key: "reabertoEm", width: 17, data: true },
    { header: "Última atividade", key: "ultima", width: 17, data: true },
  ], part);

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}
