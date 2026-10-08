import { idsValidos } from "./data";
import { AVALIACOES, type Avaliacao, type Participante, type Resposta, type RespostaRascunho } from "./types";

const MAX_TEXTO = 2000;
const MAX_CAMPO_ID = 120;
const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;
const IDS = idsValidos();

export class ValidationError extends Error {}

function texto(v: unknown, campo: string, max = MAX_TEXTO): string {
  if (v == null) return "";
  if (typeof v !== "string") throw new ValidationError(`Campo inválido: ${campo}`);
  const t = v.trim();
  if (t.length > max) throw new ValidationError(`Campo muito longo: ${campo}`);
  return t;
}

export function participanteId(v: unknown): string {
  if (typeof v !== "string" || !ID_RE.test(v)) throw new ValidationError("Identificação inválida");
  return v;
}

export function validarParticipante(v: unknown): Participante {
  const o = (v ?? {}) as Record<string, unknown>;
  const p: Participante = {
    id: participanteId(o.id),
    nome: texto(o.nome, "nome", MAX_CAMPO_ID),
    cargo: texto(o.cargo, "cargo", MAX_CAMPO_ID),
    atualizadoEm: new Date().toISOString(),
  };
  if (!p.nome || !p.cargo) throw new ValidationError("Preencha nome e cargo");
  return p;
}

export function validarResposta(v: unknown, pid: string): Resposta {
  const o = (v ?? {}) as Record<string, unknown>;
  const objetivoId = texto(o.objetivoId, "objetivoId", MAX_CAMPO_ID);
  const pilar = IDS.get(objetivoId);
  if (!pilar) throw new ValidationError(`Objetivo desconhecido: ${objetivoId}`);
  const geral = objetivoId.endsWith(":geral");
  const avaliacao = o.avaliacao == null ? null : (o.avaliacao as Avaliacao);
  if (geral ? avaliacao !== null : !AVALIACOES.includes(avaliacao as Avaliacao)) {
    throw new ValidationError("Selecione uma avaliação");
  }
  const r: Resposta = {
    participanteId: pid,
    pilar: pilar.slug,
    objetivoId,
    avaliacao,
    indicador: texto(o.indicador, "indicador"),
    meta: texto(o.meta, "meta"),
    iniciativas: texto(o.iniciativas, "iniciativas"),
    comentario: texto(o.comentario, "comentario"),
    // criadoEm é corrigido pelo store quando já existe resposta anterior.
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  // "Discordo" ou "com ajustes" sem dizer o quê não é acionável. O campo geral
  // ("falta algo?") é opcional e pode ser enviado vazio para apagar o que havia.
  const temTexto = !!(r.indicador || r.meta || r.iniciativas || r.comentario);
  if (!geral && avaliacao !== "concordo" && !temTexto) {
    throw new ValidationError("Descreva sua sugestão em pelo menos um dos campos");
  }
  return r;
}

// Rascunho em andamento: só limites de tamanho e formato, sem exigir completude.
// Devolve o pilar do objetivo para o controle de acesso.
export function validarRascunho(v: unknown): { objetivoId: string; pilar: string; dados: RespostaRascunho | null } {
  const o = (v ?? {}) as Record<string, unknown>;
  const objetivoId = texto(o.objetivoId, "objetivoId", MAX_CAMPO_ID);
  const pilar = IDS.get(objetivoId);
  if (!pilar) throw new ValidationError(`Objetivo desconhecido: ${objetivoId}`);
  if (o.dados == null) return { objetivoId, pilar: pilar.slug, dados: null };
  const d = o.dados as Record<string, unknown>;
  const avaliacao = d.avaliacao == null ? null : (d.avaliacao as Avaliacao);
  if (avaliacao !== null && !AVALIACOES.includes(avaliacao)) throw new ValidationError("Avaliação inválida");
  return {
    objetivoId,
    pilar: pilar.slug,
    dados: {
      avaliacao,
      indicador: texto(d.indicador, "indicador"),
      meta: texto(d.meta, "meta"),
      iniciativas: texto(d.iniciativas, "iniciativas"),
      comentario: texto(d.comentario, "comentario"),
    },
  };
}
