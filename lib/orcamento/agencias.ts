// Agências (PAs) da Cooplivre, conforme a "Seção Atual" da base de funcionários
// (Funcionários Base 09.2026): "SICOOB COOPLIVRE - <cidade>".
export const AGENCIAS = [
  "Agência Digital",
  "Boituva",
  "Cabreúva",
  "Canacap",
  "Capivari",
  "Cerquilho",
  "Cesário Lange",
  "Elias Fausto",
  "Indaiatuba",
  "Itupeva",
  "Jumirim",
  "Louveira",
  "Mombuca",
  "Monte Mor",
  "Pereiras",
  "Porangaba",
  "Porto Feliz",
  "Rafard",
  "Salto",
  "Tietê",
  "Valinhos",
  "Vinhedo",
] as const;

// Quem trabalha nas áreas centrais não tem agência; vê só a visão global.
export const SEDE = "Sede (áreas centrais)";

export const LOCAIS: readonly string[] = [...AGENCIAS, SEDE];

export const ehAgencia = (local: string) => local !== SEDE;
