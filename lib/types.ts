export interface Participante {
  id: string;
  nome: string;
  cargo: string;
  localidade: string;
  atualizadoEm: string;
}

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
  participante: Omit<Participante, "atualizadoEm">;
  pilar: string;
  objetivoId: string;
  acao: "criou" | "alterou";
  antes: Pick<Resposta, CampoResposta> | null;
  depois: Pick<Resposta, CampoResposta>;
}

export type RespostaRascunho = Pick<Resposta, "avaliacao" | "indicador" | "meta" | "iniciativas" | "comentario">;
