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
  atualizadoEm: string;
}

export type RespostaRascunho = Pick<Resposta, "avaliacao" | "indicador" | "meta" | "iniciativas" | "comentario">;
