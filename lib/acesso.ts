import { PILARES } from "./data";
import { normalizar } from "./normalizar";

// Quem pode acessar o app e quais pilares cada pessoa revisa.
// Para mudar o acesso, edite só esta lista. O id é fixo por pessoa: as respostas
// ficam gravadas nele, então não mude o id de quem já respondeu.

const TODOS = PILARES.map((p) => p.slug);

export interface Responsavel {
  id: string;
  nome: string;
  pilares: string[];
  // Se definido, SÓ estes sobrenomes dão acesso (os demais do nome não contam).
  // Usado quando duas pessoas dividem primeiro nome e sobrenome.
  sobrenomesChave?: string[];
}

export const RESPONSAVEIS: Responsavel[] = [
  { id: "silvanira-squiapatti-da-silva-lanconi", nome: "Silvanira Squiapatti da Silva Lanconi", pilares: ["pessoas-protagonistas", "cooperativismo-comunidade"] },
  { id: "nelson-alves-quagliato", nome: "Nelson Alves Quagliato", pilares: ["relacionamento-principalidade"] },
  // Os dois Rafaeis dividem "Oliveira": cada um só entra com o sobrenome que o distingue.
  { id: "rafael-cavallante-de-oliveira", nome: "Rafael Cavallante de Oliveira", pilares: ["relacionamento-principalidade"], sobrenomesChave: ["Cavallante"] },
  { id: "cleber-eduardo-vitorino", nome: "Cleber Eduardo Vitorino", pilares: ["processos-eficientes"] },
  { id: "amaya-fernanda-dal-coleto-de-albuquerque", nome: "Amaya Fernanda Dal Coleto de Albuquerque", pilares: ["sustentabilidade-financeira"] },
  { id: "joao-angelo-de-moraes", nome: "João Angelo de Moraes", pilares: TODOS },
  { id: "domingos-savio-oriente-franciulli", nome: "Domingos Savio Oriente Franciulli", pilares: TODOS },
  { id: "rafael-kerche-de-oliveira", nome: "Rafael Kerche de Oliveira", pilares: TODOS, sobrenomesChave: ["Kerche"] },
  { id: "italo-leal-dos-santos", nome: "Italo Leal dos Santos", pilares: TODOS },
  { id: "patricia-antunes", nome: "Patricia Antunes", pilares: TODOS },
];

const PARTICULAS = new Set(["de", "da", "do", "das", "dos", "e"]);
const tokens = (nome: string) => normalizar(nome).split(" ").filter((t) => t && !PARTICULAS.has(t));

export type Reconhecimento =
  | { ok: true; pessoa: Responsavel }
  | { ok: false; motivo: "incompleto" | "nao-encontrado" | "ambiguo"; mensagem: string };

// Regra: primeiro nome igual + pelo menos um sobrenome igual (ignora maiúsculas,
// acentos e "de/da/dos"). Para quem tem `sobrenomesChave`, só esses sobrenomes
// contam. Se mais de uma pessoa bater, vence quem tiver mais sobrenomes
// coincidentes; empate = pede outro sobrenome em vez de adivinhar.
export function reconhecer(nomeDigitado: string): Reconhecimento {
  const t = tokens(nomeDigitado);
  if (t.length < 2) {
    return { ok: false, motivo: "incompleto", mensagem: "Informe seu nome e pelo menos um sobrenome." };
  }
  const [primeiro, ...sobrenomes] = t;
  const candidatos = RESPONSAVEIS.map((pessoa) => {
    const [p0, ...resto] = tokens(pessoa.nome);
    const validos = pessoa.sobrenomesChave ? pessoa.sobrenomesChave.flatMap(tokens) : resto;
    const pontos = p0 === primeiro ? sobrenomes.filter((s) => validos.includes(s)).length : 0;
    return { pessoa, pontos };
  }).filter((c) => c.pontos > 0);

  if (candidatos.length === 0) {
    // Primeiro nome de quem exige sobrenome-chave: pede outro sobrenome.
    const chaves = RESPONSAVEIS.filter((p) => p.sobrenomesChave && tokens(p.nome)[0] === primeiro).flatMap((p) => p.sobrenomesChave!);
    // Mensagem genérica de propósito: não revela quais sobrenomes dão acesso.
    if (chaves.length) return { ok: false, motivo: "incompleto", mensagem: "Inserir outro sobrenome." };
    return {
      ok: false,
      motivo: "nao-encontrado",
      mensagem: "Não encontramos seu nome na lista de responsáveis pela revisão. Confira a grafia do nome e de um sobrenome.",
    };
  }
  const max = Math.max(...candidatos.map((c) => c.pontos));
  const melhores = candidatos.filter((c) => c.pontos === max);
  if (melhores.length > 1) {
    return {
      ok: false,
      motivo: "ambiguo",
      mensagem: `Há mais de uma pessoa com esse nome (${melhores.map((c) => c.pessoa.nome).join(" / ")}). Inclua outro sobrenome.`,
    };
  }
  return { ok: true, pessoa: melhores[0].pessoa };
}

export function responsavelPorId(id: string): Responsavel | undefined {
  return RESPONSAVEIS.find((r) => r.id === id);
}

// Pilares que a pessoa revisa (vazio para quem não está na lista).
export function pilaresDe(id: string): string[] {
  return responsavelPorId(id)?.pilares ?? [];
}

// Quem tem acesso a todos os pilares acompanha a evolução dos demais responsáveis.
export function veTodos(id: string): boolean {
  return pilaresDe(id).length === TODOS.length;
}

// Responsáveis acompanhados num pilar: quem revisa o pilar sem ter acesso a todos.
export function responsaveisAcompanhados(slug: string): Responsavel[] {
  return RESPONSAVEIS.filter((r) => r.pilares.includes(slug) && r.pilares.length < TODOS.length);
}
