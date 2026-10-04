// Conteúdo do Mapa Estratégico 2027–2030, extraído da planilha
// "Consolidado" (pós-workshop 19/08).
//
// Regras de transcrição:
// - Indicadores e metas numerados ("1) … 2) …") viraram pares indicador→meta.
// - Iniciativas separadas por ";" viraram itens de lista.
// - Células "PENDENTE …" viraram `meta: null` / `iniciativas: []` — a tela mostra
//   "Em definição" e convida o colaborador a sugerir, em vez de expor a nota
//   interna do workshop. Quando a célula trazia um rascunho, ele vai em `rascunho`.
// - As colunas Status e Observação da planilha são notas internas da revisão e
//   NÃO são exibidas aos colaboradores.
// - `visivel: false` esconde o objetivo do evento sem apagar o registro (usado nos
//   objetivos marcados "EXCLUIR" na planilha). O id nunca deve ser reaproveitado:
//   respostas já gravadas apontam para ele.

export interface Kpi {
  indicador: string | null;
  meta: string | null;
  rascunho?: string;
}

export interface Objetivo {
  id: string;
  titulo: string;
  responsavel: string;
  kpis: Kpi[];
  iniciativas: string[];
  visivel: boolean;
}

export interface Pilar {
  slug: string;
  nome: string;
  // Duas linhas para caber dentro do segmento do mapa.
  rotulo: [string, string];
  cor: string;
  temas: string[];
  objetivos: Objetivo[];
}

export const AMBICAO = "Ser a primeira escolha financeira do cooperado, em cada fase da vida dele.";

// Ordem = ordem dos segmentos no mapa, em sentido horário a partir do topo.
export const PILARES: Pilar[] = [
  {
    slug: "pessoas-protagonistas",
    nome: "Pessoas Protagonistas",
    rotulo: ["Pessoas", "Protagonistas"],
    cor: "#003641",
    temas: [
      "Desenvolvimento de times e lideranças",
      "Sucessão de lideranças e cooperados",
      "Meritocracia por resultado",
      "Experiência do colaborador",
    ],
    objetivos: [
      {
        id: "pp-1",
        titulo: "Desenvolver times e líderes de alta performance",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "Nº médio de feedbacks/1:1/PDI por colaborador", meta: "≥3 por semestre; avaliação de desempenho com nota ≥4" },
          { indicador: "% de exportação de talentos para outras áreas", meta: "3% UAD e 5% Agências" },
        ],
        iniciativas: ["Academia de líderes e workshops internos", "Catálogo de rituais formalizados", "Cultura de feedback"],
        visivel: true,
      },
      {
        id: "pp-2",
        titulo: "Preparar futuras lideranças para cargos estratégicos",
        responsavel: "Silvanira",
        kpis: [{ indicador: "Nº de colaboradores inscritos/indicados no plano de sucessão", meta: "Mínimo de 1 candidato por área/agência" }],
        iniciativas: ["Plano de sucessão: mapeamento de posições críticas, matriz de sucessores, cronograma de desenvolvimento"],
        visivel: true,
      },
      {
        id: "pp-3",
        titulo: "Reconhecer e promover pessoas com base em desempenho e protagonismo",
        responsavel: "Silvanira",
        kpis: [{ indicador: "% de promoções realizadas por meritocracia", meta: "≥90%" }],
        iniciativas: ["Plano de Gestão de Carreira e Remuneração Variável (RV)"],
        visivel: true,
      },
      {
        id: "pp-4",
        titulo: "Fortalecer a cultura cooperativista",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "NPS", meta: "≥68" },
          { indicador: "Q2 (quadrante)", meta: "26%" },
        ],
        iniciativas: ["Treinamento em Cooperativismo", "Padronização de abordagem", "Onboarding do cooperado"],
        visivel: true,
      },
      {
        id: "pp-5",
        titulo: "Engajar colaborador com propósito",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "% de colaboradores que declaram sentir orgulho em trabalhar na Cooplivre", meta: "≥80 (e-NPS)" },
          { indicador: "% Turnover", meta: "≤2%" },
        ],
        iniciativas: ["Guardião da Cultura", "Comunicação contínua da estratégia (Calendário)", "Avança Cooplivre"],
        visivel: true,
      },
    ],
  },
  {
    slug: "relacionamento-principalidade",
    nome: "Relacionamento & Principalidade",
    rotulo: ["Relacionamento", "& Principalidade"],
    cor: "#00707e",
    temas: [
      "Principalidade como norte comercial",
      "Share of wallet como 1ª alavanca",
      "Retenção como processo contínuo",
      "Cuidado ativo do cooperado",
      "Rentabilidade por cooperado",
    ],
    objetivos: [
      {
        id: "rp-1",
        titulo: "Ampliar a principalidade por geração de valor no diferencial socioeconômico",
        responsavel: "Nelson/Rafael",
        kpis: [{ indicador: "Índice de consistência periódica no contato com o cooperado", meta: "Ativar 30% do potencial não explorado (cooperado não correntista)" }],
        iniciativas: ["Avaliar base com potencial não explorado e nortear resultados para atingir a meta estipulada"],
        visivel: true,
      },
      {
        id: "rp-2",
        titulo: "Praticar taxas diferenciadas que proporcionem retorno financeiro ao cooperado",
        responsavel: "Nelson/Rafael",
        kpis: [{ indicador: "Pesquisa de satisfação dos cooperados sobre consistência da estratégia", meta: null }],
        iniciativas: ["Relacionar clientela para conquista de novos cooperados alinhados à meta estipulada"],
        // Planilha: "Compementar/Revisar (EXCLUIR)" + conflito de indicadores.
        visivel: false,
      },
      {
        id: "rp-3",
        titulo: "Fomentar o atendimento físico proporcionado pelas lideranças comerciais",
        responsavel: "Nelson/Rafael",
        kpis: [{ indicador: "Indicador de crescimento em principalidade (produtos e serviços)", meta: null }],
        iniciativas: ["Formatar treinamentos engajadores para consultoria ser praticada no dia a dia"],
        // Planilha: "Pendente de decisão (EXCLUIR)" + conflito de indicadores.
        visivel: false,
      },
      {
        id: "rp-4",
        titulo: "Aumentar quantidade de cooperados ativos (R1–R7) no quadrante Q2 (maior crédito e maior produto)",
        responsavel: "Nelson/Rafael",
        kpis: [{ indicador: "% de migração dos quadrantes Q1 (10%) e Q3 (16%) para Q2", meta: "26% da base elegível no Q2" }],
        iniciativas: ["Mapear perfil do cooperado", "Avaliar nível de risco (CRL)", "Fomentar consultoria financeira para migração"],
        visivel: true,
      },
      {
        id: "rp-5",
        titulo: "Converter base de inativos em ativos (critério de elegibilidade: IAP mínimo 2)",
        responsavel: "Nelson/Rafael",
        kpis: [{ indicador: "% de conversões no período", meta: "20% de conversão em ativos" }],
        iniciativas: ["Consultoria financeira por perfil de risco", "Pacote de descontos/taxas para reativação"],
        visivel: true,
      },
    ],
  },
  {
    slug: "sustentabilidade-financeira",
    nome: "Sustentabilidade Financeira",
    rotulo: ["Sustentabilidade", "Financeira"],
    cor: "#0fa999",
    temas: [
      "Mix PJ / PF / Agro equilibrado",
      "Crescimento orgânico e intencional",
      "Gestão de riscos por todos",
      "Eficiência (IEO) e sobras",
    ],
    objetivos: [
      {
        id: "sf-1",
        titulo: "Aumentar a capitalização do cooperado como proporção do crédito tomado",
        responsavel: "Amaya",
        kpis: [{ indicador: "Capital Social / Carteira de Crédito, %", meta: null }],
        iniciativas: ["Mapeamento de perfil e criação de estratégia de atração do cooperado para capitalização"],
        visivel: true,
      },
      {
        id: "sf-2",
        titulo: "Gerir e acompanhar o duration da carteira de crédito em relação à captação",
        responsavel: "Amaya",
        kpis: [
          {
            indicador: "% de carteira no tempo em relação à captação",
            meta: null,
            rascunho:
              "Estabelecer que a mortalidade da captação de recursos no futuro seja 40% menor em relação às operações de crédito, dando estabilidade sem perder oportunidade de resultado.",
          },
        ],
        iniciativas: [],
        visivel: true,
      },
      {
        id: "sf-3",
        titulo: "Estabelecer fóruns de discussão para correções de rota na gestão financeira",
        responsavel: "Amaya",
        kpis: [{ indicador: "Nº de fóruns realizados no período", meta: "1 vez ao mês" }],
        iniciativas: [],
        visivel: true,
      },
      {
        id: "sf-4",
        titulo: "Orçar com crescimento sustentável, alinhado à realidade macroeconômica regional e balizado pelo IEO",
        responsavel: "Amaya",
        kpis: [{ indicador: "Orçado x realizado, segmentado por estrutura comercial", meta: "Atingir 100% do orçamento (Estrutura Comercial)" }],
        iniciativas: [
          "Mapeamento de cooperados não ativos",
          "Visitas guiadas e tempestivas ao público PF",
          "Manutenção da cadência de produtos e serviços",
        ],
        visivel: true,
      },
      {
        id: "sf-5",
        titulo: "Reduzir custos e melhorar a eficiência da estrutura operacional",
        responsavel: "Amaya",
        kpis: [{ indicador: "Resultados preditivos trimestrais/sazonais de custos e gastos", meta: "Reduzir custos em 10% (Estrutura operacional e de gastos)" }],
        iniciativas: ["Atuação dos guardiões e norteadores de resultado sobre custos"],
        visivel: true,
      },
      {
        id: "sf-6",
        titulo: "Canalizar a estratégia de mix de produtos para o potencial de cada praça, com foco em proatividade e conhecimento do cooperado",
        responsavel: "Amaya",
        kpis: [{ indicador: null, meta: null }],
        iniciativas: [
          "Mapear a complexidade das unidades para definir indicadores e metas",
          "Criar escalonamento (promoção)",
        ],
        visivel: true,
      },
    ],
  },
  {
    slug: "cooperativismo-comunidade",
    nome: "Cooperativismo & Comunidade",
    rotulo: ["Cooperativismo", "& Comunidade"],
    cor: "#008a52",
    temas: [
      "Escolhas que privilegiam a comunidade",
      "Parcerias com resultado socioeconômico",
      "Valor cooperativista comunicado",
      "Educação cooperativista e financeira",
      "Colaborador potencializador do cooperativismo",
    ],
    objetivos: [
      {
        id: "cc-1",
        titulo: "Promover a consciência financeira e cooperativista para comunidades",
        responsavel: "Rafael",
        kpis: [
          { indicador: "% de pessoas impactadas por ações de educação financeira e cooperativista", meta: null },
          { indicador: "Nível de endividamento dos cooperados impactados por educação financeira", meta: null },
          { indicador: "Nº de projetos por ODS", meta: "Selo ouro ODS (1 por ODS)" },
        ],
        iniciativas: [
          "Medição de saúde financeira para não cooperados",
          "Palestras, cursos e workshops",
          "Programa de educação financeira",
          "Participação na certificação Instituto ODS",
        ],
        visivel: true,
      },
      {
        id: "cc-2",
        titulo: "Fortalecer o relacionamento com a comunidade",
        responsavel: "Rafael",
        kpis: [{ indicador: "Nº de participações em feiras e eventos relevantes", meta: "2 participações por agência ao ano" }],
        iniciativas: ["Mapear eventos relevantes", "Plano de relacionamento com instituições prioritárias"],
        visivel: true,
      },
      {
        id: "cc-3",
        titulo: "Estruturar programa de formação e integração de novos cooperados",
        responsavel: "Rafael",
        kpis: [{ indicador: "% de cooperados formados", meta: "10% em 2027 · 15% em 2028 · 20% em 2029 · 25% em 2030" }],
        iniciativas: ["Criação do programa de multiplicador", "Mecanismo de incentivo", "Grau de engajamento dos multiplicadores"],
        visivel: true,
      },
      {
        id: "cc-4",
        titulo: "Institucionalizar ações internas para ampliar o cooperativismo por meio dos colaboradores",
        responsavel: "Rafael",
        kpis: [{ indicador: "% de colaboradores engajados em ações voluntárias", meta: "50% em 2027 · 60% em 2028 · 70% em 2029 · 80% em 2030" }],
        iniciativas: ["Estabelecer política de voluntariado", "Revisitar o programa de formação de voluntário transformador"],
        visivel: true,
      },
      {
        id: "cc-5",
        titulo: "Fortalecer a governança cooperativista",
        responsavel: "Rafael",
        kpis: [
          {
            indicador: "% de dirigentes aderentes à política",
            meta: "2027: escrever a Política de Formação de Dirigentes Cooplivre · 100% dos dirigentes aderentes à política",
          },
        ],
        iniciativas: ["Criar programa de formação de novos dirigentes e capacitação contínua dos dirigentes (CA e DIREX)"],
        visivel: true,
      },
    ],
  },
  {
    slug: "processos-eficientes",
    nome: "Processos Eficientes",
    rotulo: ["Processos", "Eficientes"],
    cor: "#767c7d",
    temas: [
      "Decisões por dados e fatos",
      "Melhoria contínua dos processos-chave",
      "Inovação que simplifica",
      "Digital como alavanca",
      "Gestão do conhecimento crítico",
    ],
    objetivos: [
      {
        id: "pe-1",
        titulo: "Fomentar a gestão de dados para tomada de decisão",
        responsavel: "Cleber",
        kpis: [
          { indicador: "% de áreas estratégicas com KPIs definidos", meta: "100%" },
          { indicador: "Nº de rituais de gestão", meta: "Mínimo 1 ritual mensal por área" },
        ],
        iniciativas: ["Implementar gestão por indicadores", "Implementar rituais de gestão (líderes com times)"],
        visivel: true,
      },
      {
        id: "pe-2",
        titulo: "Assegurar gestão do conhecimento dos processos críticos",
        responsavel: "Cleber",
        kpis: [
          { indicador: "% de processos críticos mapeados", meta: "100% dos processos críticos" },
          { indicador: "Qtde. de backups para processos críticos", meta: "Mínimo 1 backup por processo crítico" },
        ],
        iniciativas: [
          "Treinamento, mapeamento e padronização de processos críticos",
          "Automação",
          "Gestão à vista",
          "Dimensionamento de HC",
        ],
        visivel: true,
      },
      {
        id: "pe-3",
        titulo: "Reduzir a complexidade dos processos e do relacionamento com o cooperado",
        responsavel: "Cleber",
        kpis: [{ indicador: "SLA de atendimento", meta: "Redução ≥25% considerando flow process" }],
        iniciativas: ["Programa de redução de complexidade (workshops)", "Concentrar processos em um único sistema"],
        visivel: true,
      },
      {
        id: "pe-4",
        titulo: "Fomentar aquisição de negócios via canais digitais",
        responsavel: "Cleber",
        kpis: [{ indicador: "ROI de campanhas de aquisição digital, %", meta: "20% de fomento" }],
        iniciativas: [
          "Construção de calendário de ações para fomento da Cooplivre",
          "Campanhas direcionadas à necessidade do cooperado",
        ],
        visivel: true,
      },
      {
        id: "pe-5",
        titulo: "Fomentar a cultura de melhoria contínua de processos e criatividade",
        responsavel: "Cleber",
        kpis: [{ indicador: "% de processos com melhoria implementada no período", meta: "40% (SIC com nota ≥9 como indicador complementar de satisfação)" }],
        iniciativas: ["Programa de Gestão de Demanda", "Otimização e padronização de processos"],
        visivel: true,
      },
    ],
  },
];

// Pseudo-objetivo de cada pilar para "falta algo neste pilar?".
export const GERAL_SUFIXO = "geral";
export const geralId = (slug: string) => `${slug}:${GERAL_SUFIXO}`;

export function getPilar(slug: string): Pilar | undefined {
  return PILARES.find((p) => p.slug === slug);
}

export function objetivosVisiveis(p: Pilar): Objetivo[] {
  return p.objetivos.filter((o) => o.visivel);
}

// Ids aceitos pela API (objetivos visíveis + o campo geral de cada pilar).
export function idsValidos(): Map<string, Pilar> {
  const m = new Map<string, Pilar>();
  for (const p of PILARES) {
    for (const o of objetivosVisiveis(p)) m.set(o.id, p);
    m.set(geralId(p.slug), p);
  }
  return m;
}

export const LOCALIDADES = [
  "Boituva",
  "Cabreúva",
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
];
