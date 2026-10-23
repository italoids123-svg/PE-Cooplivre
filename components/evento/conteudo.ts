// Conteúdo da "Visão evento", a partir do material "Plano Estratégico — Ciclo 2027–2030"
// (Sicoob_Plano_Estrategico_2027-2030.pdf). Intenções e prioridades dos pilares foram
// reescritas a partir dos objetivos validados (out/2026). Nome, cor e objetivos de cada pilar vêm do
// mapa estratégico (lib/data.ts), pelo `slug`, para as duas visões ficarem iguais.
import { getPilar } from "@/lib/data";

export const COR = {
  escuro: "#0d3e46",
  teal: "#10b09d",
  verde: "#75c043",
  lima: "#bed62f",
  roxo: "#49479d",
  fundo: "#f6f8f4",
};

export type Icone =
  | "pessoas" | "processos" | "negocio" | "coracao" | "casa"
  | "banco" | "maleta" | "calendario" | "ciclo" | "painel" | "alvo" | "pessoa";

interface PilarMaterial {
  numero: string;
  slug: string;
  lema: string;
  // Intenção com o trecho em destaque entre [colchetes].
  intencao: string;
  // Prioridades do pilar: cada uma resume um objetivo do plano (id em lib/data.ts) e,
  // na tela, abre esse objetivo na lista abaixo.
  prioridades: { texto: string; objetivo: string }[];
  icone: Icone;
}

export interface PilarEvento extends PilarMaterial {
  nome: string;
  cor: string;
}

export const DIRECIONADOR =
  "Crescer de forma sustentável, colocando o cooperado no centro, fortalecendo pessoas, simplificando processos e gerando valor para a comunidade.";

const MATERIAL: PilarMaterial[] = [
  {
    numero: "01", slug: "pessoas-protagonistas", lema: "Gente que faz acontecer",
    intencao: "Desenvolver [pessoas protagonistas] que entregam resultado, com lideranças preparadas, reconhecimento justo e orgulho de pertencer.",
    prioridades: [
      { texto: "Líderes e times de alta performance", objetivo: "p1-1" },
      { texto: "Sucessão como alavanca de continuidade", objetivo: "p1-2" },
      { texto: "Reconhecimento por resultados e atitudes", objetivo: "p1-3" },
      { texto: "Cultura cooperativista de dentro pra fora", objetivo: "p1-4" },
      { texto: "Experiência com propósito e pertencimento", objetivo: "p1-5" },
    ],
    icone: "pessoas",
  },
  {
    numero: "02", slug: "processos-eficientes", lema: "Agilidade e simplicidade",
    intencao: "Tornar a operação [simples, digital e orientada por dados], com conhecimento preservado e melhoria contínua feita pelo time.",
    prioridades: [
      { texto: "Decisões com base em dados e rituais de gestão", objetivo: "e5-1" },
      { texto: "Gestão do conhecimento", objetivo: "e5-2" },
      { texto: "Simplificação e digitalização como diferencial", objetivo: "e5-3" },
      { texto: "Melhoria contínua com as ideias do time", objetivo: "e5-5" },
    ],
    icone: "processos",
  },
  {
    numero: "03", slug: "sustentabilidade-financeira", lema: "Solidez para crescer",
    intencao: "Crescer com [solidez]: capital social fortalecido, liquidez equilibrada no longo prazo e eficiência na gestão dos recursos.",
    prioridades: [
      { texto: "Fortalecimento do Capital Social", objetivo: "s3-1" },
      { texto: "Sustentabilidade no longo prazo", objetivo: "s3-2" },
      { texto: "Eficiência operacional", objetivo: "s3-4" },
    ],
    icone: "negocio",
  },
  {
    numero: "04", slug: "relacionamento-principalidade", lema: "Principalidade e confiança",
    intencao: "Ser a [primeira escolha financeira] do cooperado, com benefício econômico real e um atendimento que faz diferença no resultado.",
    prioridades: [
      { texto: "Geração de benefício econômico", objetivo: "r2-1" },
      { texto: "Atendimento como diferencial na geração de resultado", objetivo: "r2-1" },
      { texto: "Experiência que gera recomendação (NPS)", objetivo: "r2-1" },
    ],
    icone: "coracao",
  },
  {
    numero: "05", slug: "cooperativismo-comunidade", lema: "Desenvolvimento local",
    intencao: "Transformar resultado em [desenvolvimento local], com educação, parcerias, cooperados participativos e governança preparada para o futuro.",
    prioridades: [
      { texto: "Educação cooperativista e financeira com resultado na vida do cooperado", objetivo: "c4-1" },
      { texto: "Parcerias e presença ativa", objetivo: "c4-2" },
      { texto: "Cooperado integrado e participativo", objetivo: "c4-3" },
      { texto: "Colaboradores como agentes do cooperativismo", objetivo: "c4-4" },
      { texto: "Governança sucessória", objetivo: "c4-5" },
    ],
    icone: "casa",
  },
];

export const PILARES_EVENTO: PilarEvento[] = MATERIAL.map((m) => {
  const p = getPilar(m.slug)!;
  return { ...m, nome: p.nome, cor: p.cor };
});

export const AGENDA = [
  { ano: "2027", fase: "Fundamentar", texto: "Cultura, diagnóstico, indicadores, processos críticos e prioridades.", cor: COR.lima, tinta: COR.escuro },
  { ano: "2028", fase: "Acelerar", texto: "Digitalização, produtividade, desenvolvimento de pessoas e relacionamento.", cor: COR.teal, tinta: "#ffffff" },
  { ano: "2029", fase: "Escalar", texto: "Expansão das melhores práticas, principalidade e novos negócios.", cor: COR.verde, tinta: "#ffffff" },
  { ano: "2030", fase: "Consolidar", texto: "Resultados sustentáveis, sucessão, impacto comunitário e próximo ciclo.", cor: COR.roxo, tinta: "#ffffff" },
];

export const PAINEL_2030: { titulo: string; texto: string; cor: string; tinta: string; icone: Icone }[] = [
  { titulo: "Cooperado", texto: "Mais relacionamento, confiança e principalidade.", cor: getPilar("relacionamento-principalidade")!.cor, tinta: "#ffffff", icone: "pessoa" },
  { titulo: "Pessoas", texto: "Mais protagonismo, liderança e capacidade.", cor: getPilar("pessoas-protagonistas")!.cor, tinta: "#ffffff", icone: "pessoas" },
  { titulo: "Negócio", texto: "Mais eficiência, resultado e solidez.", cor: getPilar("sustentabilidade-financeira")!.cor, tinta: "#ffffff", icone: "negocio" },
  { titulo: "Comunidade", texto: "Mais impacto e desenvolvimento regional.", cor: getPilar("cooperativismo-comunidade")!.cor, tinta: "#ffffff", icone: "casa" },
  // Não consta no material do Conselho: incluído para cobrir o pilar Processos Eficientes.
  { titulo: "Processos", texto: "Mais agilidade e digitalização.", cor: getPilar("processos-eficientes")!.cor, tinta: "#ffffff", icone: "processos" },
];

export const GOVERNANCA: { titulo: string; cor: string; tinta: string; icone: Icone }[] = [
  { titulo: "Conselho de Administração", cor: COR.escuro, tinta: COR.lima, icone: "banco" },
  { titulo: "Diretoria Executiva", cor: COR.roxo, tinta: "#ffffff", icone: "maleta" },
  { titulo: "Comitês e gestores", cor: COR.teal, tinta: "#ffffff", icone: "pessoas" },
  { titulo: "Acompanhamento trimestral", cor: COR.verde, tinta: "#ffffff", icone: "calendario" },
  { titulo: "Revisão anual das metas", cor: COR.lima, tinta: COR.escuro, icone: "ciclo" },
  { titulo: "Painel único de indicadores", cor: COR.escuro, tinta: "#ffffff", icone: "painel" },
];

export const PRINCIPIO =
  "Estratégia só gera valor quando se transforma em [prioridades claras], [metas mensuráveis], [responsáveis definidos] e [acompanhamento contínuo].";
