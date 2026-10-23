// Conteúdo da "Visão evento", transcrito do material "Plano Estratégico — Ciclo 2027–2030"
// (Sicoob_Plano_Estrategico_2027-2030.pdf). Nome, cor e objetivos de cada pilar vêm do
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
  prioridades: string[];
  indicadores: string[];
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
    intencao: "Construir uma cultura de [alta performance], desenvolvimento e responsabilidade compartilhada.",
    prioridades: ["Formação de líderes e sucessores", "Trilhas de desenvolvimento por função", "Reconhecimento por resultados e atitudes", "Cultura de feedback e protagonismo"],
    indicadores: ["eNPS / clima", "Retenção de talentos", "Horas de capacitação", "% sucessores preparados"],
    icone: "pessoas",
  },
  {
    numero: "02", slug: "processos-eficientes", lema: "Agilidade e simplicidade",
    intencao: "Tornar a operação mais [simples, digital e segura], orientada à experiência do cooperado.",
    prioridades: ["Mapear e redesenhar processos críticos", "Digitalizar jornadas", "Automatizar tarefas repetitivas", "Gestão por indicadores e SLAs"],
    indicadores: ["Tempo de atendimento", "Custo por operação", "% digitalização", "Retrabalho / erros"],
    icone: "processos",
  },
  {
    numero: "03", slug: "sustentabilidade-financeira", lema: "Solidez para crescer",
    intencao: "Garantir crescimento com [rentabilidade], qualidade da carteira, eficiência e gestão prudente de riscos.",
    prioridades: ["Crescimento equilibrado da carteira", "Fortalecer receitas recorrentes", "Controle de despesas e eficiência", "Gestão ativa de liquidez, capital e risco"],
    indicadores: ["ROE / resultado", "Inadimplência", "Eficiência operacional", "Capital / liquidez"],
    icone: "negocio",
  },
  {
    numero: "04", slug: "relacionamento-principalidade", lema: "Principalidade e confiança",
    intencao: "Ser a [principal instituição financeira] do cooperado, ampliando relacionamento, confiança e utilização de soluções.",
    prioridades: ["Conhecer melhor cada cooperado", "Estratégia de relacionamento por segmentos", "Oferta consultiva e completa", "Jornada pós-venda e fidelização"],
    indicadores: ["Principalidade", "Produtos por cooperado", "Ativação / recorrência", "NPS / satisfação"],
    icone: "coracao",
  },
  {
    numero: "05", slug: "cooperativismo-comunidade", lema: "Desenvolvimento local",
    intencao: "Transformar o resultado econômico em [desenvolvimento sustentável] para os cooperados e para a região.",
    prioridades: ["Educação financeira e cooperativista", "Projetos sociais e ambientais com impacto mensurável", "Participação ativa dos cooperados", "Parcerias com empresas, entidades e comunidade"],
    indicadores: ["Participação em ações", "Pessoas impactadas", "Projetos realizados", "Recursos / benefícios gerados"],
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
