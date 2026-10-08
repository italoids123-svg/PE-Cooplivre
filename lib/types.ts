export interface Participante {
  id: string;
  nome: string;
  cargo: string;
  // Não é mais pedida na identificação; mantida opcional por compatibilidade.
  localidade?: string;
  atualizadoEm: string;
  // Campos controlados só pelo servidor (o cliente não consegue defini-los):
  // enviadoEm: revisão enviada e travada; vazio = em edição (nunca enviada ou reaberta).
  enviadoEm?: string;
  // Todos os envios, em ordem. Mais de um = a pessoa reabriu e reenviou.
  envios?: string[];
  // Última vez que a pessoa clicou em "Realizar ajustes" depois de enviar.
  reabertoEm?: string;
}

export type StatusRevisao = "em-andamento" | "enviada" | "reenviada" | "reaberta";

export function enviosDe(p: Participante): string[] {
  // Registros anteriores ao campo `envios` só têm enviadoEm.
  return p.envios?.length ? p.envios : p.enviadoEm ? [p.enviadoEm] : [];
}

export function statusRevisao(p: Participante): StatusRevisao {
  const n = enviosDe(p).length;
  if (p.enviadoEm) return n > 1 ? "reenviada" : "enviada";
  return n > 0 ? "reaberta" : "em-andamento";
}

export const STATUS_LABEL: Record<StatusRevisao, string> = {
  "em-andamento": "Em andamento",
  enviada: "Enviada",
  reenviada: "Reenviada",
  reaberta: "Reaberta (ajustes não reenviados)",
};

export const AVALIACOES = ["concordo", "ajustes", "discordo"] as const;
export type Avaliacao = (typeof AVALIACOES)[number];

export const AVALIACAO_LABEL: Record<Avaliacao, string> = {
  concordo: "Concordo",
  ajustes: "Concordo com ajustes",
  discordo: "Discordo",
};

export interface Resposta {
  participanteId: string;
  pilar: string;
  objetivoId: string;
  // null no campo "falta algo neste pilar?", que não tem avaliação.
  avaliacao: Avaliacao | null;
  indicador: string;
  meta: string;
  iniciativas: string;
  comentario: string;
  // criadoEm: primeira vez que o objetivo foi respondido; atualizadoEm: última edição.
  criadoEm: string;
  atualizadoEm: string;
}

export const CAMPOS_RESPOSTA = ["avaliacao", "indicador", "meta", "iniciativas", "comentario"] as const;
export type CampoResposta = (typeof CAMPOS_RESPOSTA)[number];

// Uma linha por envio que mudou algo. Guarda o participante como estava no
// momento (nome/cargo/localidade podem ser editados depois) e os valores de
// antes e depois, para auditar quem alterou o quê.
export interface Alteracao {
  em: string;
  participante: Pick<Participante, "id" | "nome" | "cargo" | "localidade">;
  pilar: string;
  objetivoId: string;
  acao: "criou" | "alterou";
  antes: Pick<Resposta, CampoResposta> | null;
  depois: Pick<Resposta, CampoResposta>;
}

export type RespostaRascunho = Pick<Resposta, "avaliacao" | "indicador" | "meta" | "iniciativas" | "comentario">;

// Rascunho de um objetivo enquanto o responsável preenche (antes de "Salvar pilar").
// Sincronizado em segundo plano só para acompanhamento: não é resposta, não entra
// no Excel e é apagado quando o pilar é salvo.
export interface Rascunho {
  participanteId: string;
  objetivoId: string;
  pilar: string;
  dados: RespostaRascunho;
  atualizadoEm: string;
}

// Acompanhamento (GET /api/acompanhar): evolução das revisões dos responsáveis.
export interface ObjetivoAcompanhado {
  salvo?: RespostaRascunho & { atualizadoEm: string };
  // Só quando difere do salvo: o responsável está mexendo neste objetivo agora.
  emEdicao?: RespostaRascunho & { atualizadoEm: string };
}

export interface ResponsavelAcompanhado {
  id: string;
  nome: string;
  acessou: boolean;
  status: StatusRevisao | null;
  salvos: number;
  total: number;
  emEdicao: number;
  ultimaAtividade: string | null;
  objetivos: Record<string, ObjetivoAcompanhado>;
}

export interface Acompanhamento {
  geradoEm: string;
  pilares: { slug: string; responsaveis: ResponsavelAcompanhado[] }[];
}
