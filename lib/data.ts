// Conteúdo do Mapa Estratégico 2027–2030, transcrito da planilha
// "Cooplivre PE - Revisão" (aba Revisado: objetivos, indicadores, metas e iniciativas revisados).
//
// Regras de transcrição:
// - Indicadores e metas numerados ("1) … 2) …") viraram pares indicador→meta, pela ordem.
// - Iniciativas separadas por ";" ou por linha viraram itens de lista.
// - "[LB 2026: medir]" virou "(linha de base 2026: medir)" — linha de base = valor atual, a levantar.
// - `emAnalise`: meta ainda aberta (xx%, X p.p., "definir…", ou marcada em vermelho na planilha).
// - `novo`: linha nova proposta na revisão (verde na planilha).
// - Colunas Status, Observação, Tipo de ajuste e Elo com a ambição são notas internas da
//   revisão e NÃO são exibidas aos colaboradores. Notas internas que estavam dentro das
//   iniciativas/metas (ex.: "migram para C4.3") foram removidas.
// - `visivel: false` esconde do evento sem apagar o registro (linhas cinza da planilha:
//   excluídas/realocadas). O id nunca deve ser reaproveitado: respostas gravadas apontam para ele.
// - Out/2026: atualizado com a validação da diretoria (aba Contribuições da base exportada).
//   Objetivos excluídos nessa validação ficaram ocultos (visivel: false), com o motivo.

export interface Kpi {
  indicador: string | null;
  meta: string | null;
  // Meta ainda em aberto: a tela destaca e convida a sugerir.
  emAnalise?: boolean;
}

export interface Objetivo {
  id: string;
  // Código do objetivo na planilha (ex.: "P1.1"), exibido no card.
  codigo: string;
  titulo: string;
  responsavel: string;
  // Linha nova proposta na revisão.
  novo?: boolean;
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
  // O que o pilar mede/garante — exibido logo abaixo do nome na página do pilar.
  intuito: string;
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
    intuito: "Medir se as pessoas efetivamente atuam com protagonismo, entregam resultado e demonstram os comportamentos esperados.",
    temas: [
      "Desenvolvimento de times e lideranças",
      "Sucessão de lideranças e cooperados",
      "Meritocracia por resultado",
      "Experiência do colaborador",
    ],
    objetivos: [
      {
        id: "p1-1",
        codigo: "P1.1",
        titulo: "Desenvolver líderes e times de alta performance",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "Índice GPTW geral (favorabilidade)", meta: "75 (2026) → ≥85 em 2027 → ≥88 em 2029 → ≥91 em 2030" },
          { indicador: "% de colaboradores com PDI executado", meta: "≥50% dos colaboradores com PDI executado em 2027" },
          { indicador: "Conversas 1:1 registradas no período (Feedz)", meta: "≥1 conversa 1:1 registrada por trimestre, a partir de 2027" },
          { indicador: "% de vagas de liderança e de especialistas preenchidas por recrutamento interno", meta: "30% (2026) → ≥50% em 2027 → ≥70% das vagas preenchidas internamente a partir de 2028" },
          { indicador: "Reuniões de alinhamento dos times registradas no relatório RIN", meta: "No mínimo 2 reuniões mensais" },
        ],
        iniciativas: [
          "Academia de Líderes Cooplivre (trilha por nível, começando pelos líderes de primeiro nível)",
          "Rituais de liderança formalizados (1:1 mensal, feedback contínuo, revisão de PDI no Feedz)",
          "Recrutamento interno prioritário com critérios públicos",
          "Tutoria entre áreas",
        ],
        visivel: true,
      },
      {
        id: "p1-2",
        codigo: "P1.2",
        titulo: "Preparar futuras lideranças para cargos estratégicos",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "% de posições estratégicas com status 'Saudável' no mapa de sucessão (critério v3: ≥1 sucessor pronto + ≥1 em formação de curto prazo)", meta: "≥50% em 2027 → ≥75% em 2028 → 100% em 2030" },
          { indicador: "Nº de posições estratégicas em status 'Crítico'", meta: "Zero posições 'Críticas' até dez/2027 (jul/2026: Financeira, CRO e Riscos em 'Crítico')" },
        ],
        iniciativas: [
          "Plano de sucessão com governança: mapa de posições estratégicas atualizado semestralmente",
          "PDI individual para cada sucessor (modelo já aplicado: comportamentos observáveis + ciclos 30/60/90 com o gestor)",
          "Calibração do comitê (gestor × avaliadores) antes de usar prontidão como critério",
          "Publicação dos critérios de elegibilidade antes de qualquer anúncio",
        ],
        visivel: true,
      },
      {
        id: "p1-3",
        codigo: "P1.3",
        titulo: "Reconhecer e promover pessoas com base em desempenho e protagonismo, com critérios públicos",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "GPTW — itens 'promoções são dadas a quem merece' e 'ausência de favoritismo' (favorabilidade)", meta: "48 e 49 (2026) → ≥65 em 2027 → ≥75 em 2028 → ≥80 em 2030" },
          { indicador: "% de promoções e movimentações realizadas por processo com critérios públicos", meta: "100% a partir de 2027" },
        ],
        iniciativas: [
          "Publicar estrutura de cargos, requisitos e critérios de promoção (intranet, acesso de todos)",
          "Revisar regras da PLR/RV com participação dos times",
          "Comitê de movimentação com registro de decisão ('se sim, quando; se não, por que não')",
          "Reconhecimento não monetário, público e frequente",
        ],
        visivel: true,
      },
      {
        id: "p1-4",
        codigo: "P1.4",
        titulo: "Fortalecer a cultura cooperativista entre os colaboradores (colaborador como potencializador do cooperativismo)",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "% de colaboradores com formação em cooperativismo concluída (trilha básica + atualização bienal)", meta: "100% dos colaboradores até 2027; novos admitidos em até 90 dias" },
          { indicador: "% de colaboradores com IAP acima de 8 produtos", meta: "55,05% (2026, colaboradores com 9 ou mais produtos) → 70% em 2027 → 80% em 2028, mantido até 2030 (avaliar linha de base)" },
        ],
        iniciativas: [
          "Trilha de cooperativismo para colaboradores (onboarding + atualização)",
          "‘Colaborador como primeiro cooperado’ (condições para o quadro usar os produtos da cooperativa)",
        ],
        visivel: true,
      },
      {
        id: "p1-5",
        codigo: "P1.5",
        titulo: "Promover uma experiência do colaborador com propósito e pertencimento",
        responsavel: "Silvanira",
        kpis: [
          { indicador: "e-NPS", meta: "53 (2026) → ≥75 em 2027 → ≥80 em 2028 → ≥85 em 2030" },
          { indicador: "GPTW — item 'Tenho orgulho de contar a outras pessoas que trabalho aqui'", meta: "≥85 até 2028 (linha de base 2026: resultado do GPTW 2026)" },
          { indicador: "Turnover voluntário anual (monitoramento, sem meta de retenção forçada)", meta: "≤4% em 2027" },
        ],
        iniciativas: [
          "Guardiões da Cultura",
          "Avança Cooplivre com devolutiva formal das contribuições ('o que abrimos, devolvemos')",
          "Calendário de comunicação da estratégia",
          "Conversas de capacidade líder-time",
          "Reconhecimento público",
        ],
        visivel: true,
      },
    ],
  },
  {
    slug: "relacionamento-principalidade",
    nome: "Relacionamento & Principalidade",
    rotulo: ["Relacionamento", "& Principalidade"],
    cor: "#00707e",
    intuito: "Medir se o cooperado, além de declarar satisfação, escolhe a cooperativa para concentrar seus negócios e ampliar o relacionamento.",
    temas: [
      "Principalidade como norte comercial",
      "Share of wallet como 1ª alavanca",
      "Retenção como processo contínuo",
      "Cuidado ativo do cooperado",
      "Rentabilidade por cooperado",
    ],
    objetivos: [
      {
        id: "r2-1",
        codigo: "R2.1",
        titulo: "Ampliar a principalidade por geração de valor no diferencial socioeconômico",
        responsavel: "Nelson/Rafael",
        kpis: [
          { indicador: "NPS do cooperado", meta: "≥68 em 2027 → ≥75 em 2030 (valores a confirmar)", emAnalise: true },
          { indicador: "Benefício econômico entregue ao cooperado (taxas + sobras + juros ao capital), em R$/cooperado/ano vs. Mercado", meta: "(linha de base 2026: medir) → crescer acima da inflação a cada ano" },
          { indicador: "% da base elegível no Q2", meta: "≥22% em 2027 → ≥25% em 2028 → ≥27% em 2029 → 30% até 2030" },
          { indicador: "IAP do cooperado (referência: IAP ≥6)", meta: "≥4 em 2027 → ≥5 em 2028 → ≥6 em 2029 → ≥6 em 2030" },
          { indicador: "Quantidade de visitas ao cooperado", meta: "≥2 visitas diárias" },
          { indicador: "% de visitas ao cooperado com geração de resultado", meta: "≥50% de conversão em negócios" },
        ],
        iniciativas: [
          "Realização de visitas",
          "Comunicação anual do benefício econômico a cada cooperado",
          "Mapear perfil do cooperado, avaliar nível de risco (CRL) e fomentar consultoria financeira para migração",
        ],
        visivel: true,
      },
      {
        id: "r2-2",
        codigo: "R2.2",
        titulo: "(Excluído como objetivo) Taxas diferenciadas com retorno financeiro ao cooperado → absorvido em R2.1",
        responsavel: "Nelson/Rafael",
        kpis: [
          { indicador: "— (ver R2.1, indicador 3: benefício econômico ao cooperado)", meta: "—" },
        ],
        iniciativas: [
          "Política de precificação com diferencial explícito vs. mercado por produto, comunicada ao cooperado (passa a ser iniciativa de R2.1)",
        ],
        // Oculto: excluído — absorvido em R2.1.
        visivel: false,
      },
      {
        id: "r2-3",
        codigo: "R2.3",
        titulo: "(Excluído como objetivo) Atendimento consultivo presencial pelas lideranças comerciais → iniciativa de R2.1",
        responsavel: "Nelson/Rafael",
        kpis: [
          { indicador: "— (ver R2.1); indicador operacional sugerido: % de cooperados R4+ com visita/consultoria registrada no semestre", meta: "—" },
        ],
        iniciativas: [
          "Treinamentos engajadores para a consultoria financeira ser praticada no dia a dia (passa a ser iniciativa de R2.1)",
        ],
        // Oculto: excluído — absorvido em R2.1.
        visivel: false,
      },
      {
        id: "r2-4",
        codigo: "R2.4",
        titulo: "Aumentar a quantidade de cooperados ativos no quadrante Q2 (maior crédito e mais produtos), com risco controlado",
        responsavel: "Nelson/Rafael",
        kpis: [
          { indicador: "% da base elegível no Q2", meta: "(linha de base 2026: registrar o % atual em Q2) → 26% até 2030, com marcos anuais (ex.: +2 p.p./ano)" },
          { indicador: "% dos cooperados migrados de Q1/Q3 para Q2 no ano que permanecem em Q2 após 12 meses", meta: "≥80% de permanência" },
          { indicador: "Inadimplência da carteira migrada vs. carteira total", meta: "Inadimplência da carteira migrada ≤ média da carteira" },
        ],
        iniciativas: [
          "Mapear perfil do cooperado, avaliar nível de risco (CRL) e fomentar consultoria financeira para migração",
          "Integrar com o mapa de potencial por praça (S3.5)",
          "Registrar a definição formal dos quadrantes Q1–Q4 e do CRL no glossário do plano",
        ],
        // Oculto: excluído na validação da diretoria (out/2026). % da base no Q2 e mapeamento de perfil/risco absorvidos em R2.1.
        visivel: false,
      },
      {
        id: "r2-5",
        codigo: "R2.5",
        titulo: "Converter base de inativos em ativos (critério de elegibilidade: IAP mínimo 2)",
        responsavel: "Nelson/Rafael",
        kpis: [
          { indicador: "% de cooperados inativos elegíveis (IAP ≥2) convertidos em ativos no ano", meta: "20% ao ano sobre a base elegível de janeiro (2027–2030)" },
          { indicador: "% dos convertidos que permanecem ativos após 12 meses", meta: "≥70% de permanência" },
        ],
        iniciativas: [
          "Consultoria financeira por perfil de risco",
          "Pacote de descontos/taxas para reativação",
          "Régua de reativação por fase de vida (motivo da inatividade)",
          "Encerramento assistido para quem não tem aderência (limpa a base e melhora o indicador de principalidade)",
        ],
        // Oculto: excluído na validação da diretoria (out/2026).
        visivel: false,
      },
    ],
  },
  {
    slug: "sustentabilidade-financeira",
    nome: "Sustentabilidade Financeira",
    rotulo: ["Sustentabilidade", "Financeira"],
    cor: "#0fa999",
    intuito: "Garantir eficiência, rentabilidade, geração de sobras, qualidade do crescimento e gestão de riscos.",
    temas: [
      "Mix PJ / PF / Agro equilibrado",
      "Crescimento orgânico e intencional",
      "Gestão de riscos por todos",
      "Eficiência (IEO) e sobras",
    ],
    objetivos: [
      {
        id: "s3-1",
        codigo: "S3.1",
        titulo: "Fomentar a integralização de capital social",
        responsavel: "Amaya",
        kpis: [
          { indicador: "% de cooperados ativos com integralização recorrente", meta: "≥10% em 2027 → ≥15% até 2028 → ≥25% até 2029 → ≥30% até 2030" },
        ],
        iniciativas: [
          "Manual de integralização de capital",
          "Uma campanha anual voltada à conscientização do cooperado",
          "Criação da Store Cooplivre em cada PA para incentivo ao aporte no capital social",
        ],
        visivel: true,
      },
      {
        id: "s3-2",
        codigo: "S3.2",
        titulo: "Equilibrar os prazos entre captação e carteira de crédito, garantindo liquidez sem perder resultado",
        responsavel: "Amaya",
        kpis: [
          { indicador: "% da captação em instrumentos de prazo ≥ 6 meses", meta: "≥20% em 2027 → ≥25% em 2028 → ≥30% em 2029 → ≥30% em 2030" },
        ],
        iniciativas: [
          "Política de ALM (gestão de ativos e passivos) com limites aprovados pelo Conselho",
          "Portfólio de captação de longo prazo com incentivo ao cooperado (taxa escalonada por prazo)",
        ],
        visivel: true,
      },
      {
        id: "s3-3",
        codigo: "S3.3",
        titulo: "Crescer de forma sustentável, com orçamento construído com as unidades, balizado pelo IEO e pela realidade regional, potencializando as sobras",
        responsavel: "Amaya",
        kpis: [
          { indicador: "Realizado ÷ orçado (carteira de crédito, captação e resultado), por unidade", meta: "≥100% do orçado em cada linha, por unidade, a partir de 2027" },
          { indicador: "Sobras ÷ patrimônio líquido (%)", meta: "X p.p. ao ano (fomentar a integralização das sobras)", emAnalise: true },
          { indicador: "Sobras distribuídas por cooperado ativo (R$)", meta: "(linha de base 2026: medir) → crescimento real (acima da inflação) a cada ano até 2030" },
        ],
        iniciativas: [
          "Orçamento 2027–2030 construído de baixo para cima (metas por agência propostas pelas equipes e consolidadas pela Direx)",
          "Revisão trimestral com plano de ação para desvios >5%",
          "Política de destinação das sobras comunicada ao cooperado",
        ],
        // Oculto: excluído na validação da diretoria (out/2026).
        visivel: false,
      },
      {
        id: "s3-4",
        codigo: "S3.4",
        titulo: "Garantir a eficiência operacional (IEO)",
        responsavel: "Amaya",
        kpis: [
          { indicador: "IEO — Índice de Eficiência Operacional (despesas administrativas ÷ receitas)", meta: "55% em 2027 → 50% em 2028 → 45% em 2029 → 40% em 2030" },
          { indicador: "Índice de cobertura administrativa", meta: "65% em 2027 → 75% em 2028 → 85% em 2029 → 100% em 2030" },
        ],
        iniciativas: [
          "Controle de despesas por centro de custo",
          "Revisão de contratos e despesas recorrentes",
          "Ajuste trimestral do precificador de taxas",
        ],
        visivel: true,
      },
      {
        id: "s3-5",
        codigo: "S3.5",
        titulo: "Definir metas por unidade proporcionais ao potencial e à complexidade de cada praça",
        responsavel: "Amaya",
        kpis: [
          { indicador: "% de unidades com meta calibrada por potencial de praça (mapa potencial × complexidade)", meta: "100% das unidades até jun/2027 (antes do orçamento 2028)" },
          { indicador: "Produtos por cooperado ativo (cross-sell), por unidade", meta: "(linha de base 2026: medir) → definir meta escalonada até 2030", emAnalise: true },
        ],
        iniciativas: [
          "Mapa de potencial por praça (base Sicoob + dados regionais)",
          "Escalonamento de metas e de reconhecimento por complexidade da unidade",
          "Integração com o modelo de quadrantes (R2.4)",
        ],
        // Oculto: excluído na validação da diretoria (out/2026).
        visivel: false,
      },
      {
        id: "s3-6",
        codigo: "S3.6",
        titulo: "(Ritual, não objetivo) Comitê mensal de resultado e correção de rota da gestão financeira",
        responsavel: "Amaya",
        kpis: [
          { indicador: "% de desvios relevantes (>5% do orçado) com plano de ação aprovado em até 30 dias", meta: "100% a partir de 2027; comitê realizado 12×/ano" },
        ],
        iniciativas: [
          "Incorporar ao calendário de rituais de gestão (E5.1) e à governança de acompanhamento da estratégia que o Conselho aprova em outubro",
        ],
        // Oculto: ritual, não objetivo (proposta: retirar do mapa).
        visivel: false,
      },
      {
        id: "s3-7",
        codigo: "S3.7",
        titulo: "Fortalecer a gestão de riscos como responsabilidade de todos",
        responsavel: "Amaya (sugestão: com Riscos/Compliance)",
        novo: true,
        kpis: [
          { indicador: "Nº de eventos/riscos registrados espontaneamente pelas áreas (registro de risco operacional)", meta: "(linha de base 2026: medir) → crescimento no primeiro ano (sinal de cultura de registro), depois estabilização" },
          { indicador: "% de apontamentos de auditoria, compliance e supervisão sanados no prazo", meta: "100% no prazo a partir de 2027" },
        ],
        iniciativas: [
          "Radar de Riscos (consolidado da Semana de Riscos, set/2026) devolvido às áreas com retorno formal",
          "Formação básica em riscos para 100% do quadro",
          "Revisão de alçadas e da porta de entrada de demandas (reduz risco operacional e demanda criada)",
        ],
        // Oculto: excluído na validação da diretoria (out/2026).
        visivel: false,
      },
    ],
  },
  {
    slug: "cooperativismo-comunidade",
    nome: "Cooperativismo & Comunidade",
    rotulo: ["Cooperativismo", "& Comunidade"],
    cor: "#008a52",
    intuito: "Medir alcance, educação, impacto e geração de valor social, sem reduzir as iniciativas a uma mera obrigação de meta.",
    temas: [
      "Escolhas que privilegiam a comunidade",
      "Parcerias com resultado socioeconômico",
      "Valor cooperativista comunicado",
      "Educação cooperativista e financeira",
      "Colaborador potencializador do cooperativismo",
    ],
    objetivos: [
      {
        id: "c4-1",
        codigo: "C4.1",
        titulo: "Promover educação cooperativista e financeira que gere resultado socioeconômico nas comunidades",
        responsavel: "Rafael",
        kpis: [
          { indicador: "Nº de pessoas que concluem ações de educação financeira no ano", meta: "Aumento de pessoas impactadas na comunidade: +20% ao ano" },
          { indicador: "% dos cooperados participantes com melhora de saúde financeira após 12 meses (ex.: redução de endividamento/atraso)", meta: "≥30% dos participantes com melhora mensurável até 2029" },
        ],
        iniciativas: [
          "Programa estruturado de educação cooperativista (primeiro) e financeira, com trilhas por público (jovem, família, empreendedor, escola)",
          "Diagnóstico de saúde financeira antes/depois",
          "Certificação ODS — selo ouro",
        ],
        visivel: true,
      },
      {
        id: "c4-2",
        codigo: "C4.2",
        titulo: "Fortalecer o relacionamento com as comunidades e instituições de cada praça",
        responsavel: "Rafael",
        kpis: [
          { indicador: "Participações em eventos relevantes por agência (atividade)", meta: "≥2 por agência/ano" },
        ],
        iniciativas: [
          "Mapear eventos relevantes",
          "Plano de relacionamento com instituições prioritárias",
          "Agenda comunitária anual por agência",
        ],
        visivel: true,
      },
      {
        id: "c4-3",
        codigo: "C4.3",
        titulo: "Formar e integrar cooperados na cultura cooperativista",
        responsavel: "Rafael",
        kpis: [
          { indicador: "% de novos cooperados que concluem a jornada de integração em até 90 dias", meta: "≥60% em 2027 → ≥80% em 2029" },
          { indicador: "% da base ativa com formação cooperativista concluída (acumulado)", meta: "10% (2027) · 15% (2028) · 20% (2029) · 25% (2030)" },
          { indicador: "% de participação de cooperados em assembleias", meta: "28% (2026) → 35% (2027) · 40% (2028) · 45% (2029) · 50% (2030)" },
        ],
        iniciativas: [
          "Onboarding cooperativista padronizado",
          "Programa de multiplicadores (cooperados e colaboradores)",
          "Incentivo à participação em assembleias e conselhos",
        ],
        visivel: true,
      },
      {
        id: "c4-4",
        codigo: "C4.4",
        titulo: "Mobilizar colaboradores como agentes do cooperativismo na comunidade",
        responsavel: "Rafael",
        kpis: [
          { indicador: "% de colaboradores que participam, por opção, de ≥1 ação voluntária no ano", meta: "50% (2027) · 60% (2028) · 70% (2029) · 80% (2030)" },
          { indicador: "Horas de voluntariado por colaborador participante", meta: "≥8 h/ano" },
          { indicador: "Satisfação dos voluntários com as ações (pesquisa simples pós-ação)", meta: "≥85% de satisfação" },
        ],
        iniciativas: [
          "Política de voluntariado",
          "Revisitar o programa de formação do voluntário transformador",
          "Reconhecimento público dos voluntários",
        ],
        visivel: true,
      },
      {
        id: "c4-5",
        codigo: "C4.5",
        titulo: "Fortalecer a governança cooperativista",
        responsavel: "Rafael",
        kpis: [
          { indicador: "% de dirigentes (CA e Direx) com formação concluída conforme a Política de Formação de Dirigentes", meta: "100% até 2028 (política aprovada até jun/2027)" },
          { indicador: "Nº de candidatos elegíveis e preparados por cadeira do CA na próxima eleição", meta: "≥3 candidatos preparados por cadeira na próxima eleição" },
        ],
        iniciativas: [
          "Política de Formação de Dirigentes (escrita e aprovada em 2027)",
          "Programa de formação de novos dirigentes e capacitação contínua (CA e Direx)",
          "Integração com o plano de sucessão (P1.2) e com a governança de acompanhamento da estratégia",
          "Implementar sucessão no CA",
        ],
        visivel: true,
      },
    ],
  },
  {
    slug: "processos-eficientes",
    nome: "Processos Eficientes",
    rotulo: ["Processos", "Eficientes"],
    cor: "#767c7d",
    intuito: "Medir qualidade, agilidade, melhoria contínua e experiência interna e externa.",
    temas: [
      "Decisões por dados e fatos",
      "Melhoria contínua dos processos-chave",
      "Inovação que simplifica",
      "Digital como alavanca",
      "Gestão do conhecimento crítico",
    ],
    objetivos: [
      {
        id: "e5-1",
        codigo: "E5.1",
        titulo: "Decidir com base em dados: indicadores e rituais de gestão em todas as áreas",
        responsavel: "Cleber",
        kpis: [
          { indicador: "% das metas deste plano com indicador medido e publicado mensalmente (painel único)", meta: "100% até set–dez/2027 (mapeamentos até mar/2027, construções até jun/2027, entregáveis até set–dez/2027)" },
          { indicador: "Aderência aos rituais de gestão: realizados ÷ planejados, por área", meta: "≥90% de aderência, com ritual mensal em 100% das áreas a partir de 2027" },
        ],
        iniciativas: [
          "Painel único da estratégia (um indicador = uma fonte = um dono)",
          "Levantamento das linhas de base 2026",
          "Cronograma em três etapas: todos os mapeamentos até mar/2027, construções até jun/2027 e entregáveis até set–dez/2027",
          "Planos trimestrais de acompanhamento da implantação",
          "Rituais em cascata (Direx mensal → GE quinzenal → líder-time mensal) com registro de decisões",
          "Capacitação de líderes em leitura de indicadores",
        ],
        visivel: true,
      },
      {
        id: "e5-2",
        codigo: "E5.2",
        titulo: "Assegurar gestão do conhecimento dos processos críticos",
        responsavel: "Cleber",
        kpis: [
          { indicador: "% de processos críticos mapeados, padronizados e com dono", meta: "100% até 2027 (lista de processos críticos aprovada até mar/2027)" },
          { indicador: "% de processos críticos com ≥2 pessoas habilitadas (sem dependência de pessoa única)", meta: "≥50% em 2027 → 100% em 2028" },
        ],
        iniciativas: [
          "Realizar mapeamento com as áreas de processos críticos",
          "Inventário e priorização dos processos críticos (risco × volume × impacto no cooperado)",
          "Padronização com documentação viva - manual que demonstre funcionamento passo a passo do processo e backup humano",
          "Rodízio e treinamento cruzado para eliminar pessoa única",
          "Dimensionamento de capacidade por processo (dado de entrada para o NR-1 e para S3.4)",
          "Possível automação de processos de maior volume",
        ],
        visivel: true,
      },
      {
        id: "e5-3",
        codigo: "E5.3",
        titulo: "Simplificar os processos e a jornada do cooperado",
        responsavel: "Cleber",
        kpis: [
          { indicador: "Tempo de ciclo das jornadas críticas do cooperado (ex: abertura de conta, concessão de crédito, cartão), em dias", meta: "−25% até 2028 e −40% até 2030, sobre a linha de base 2026, separando a parcela que depende da Cooperativa da parcela sistêmica (CCS/Central)" },
          { indicador: "% de demandas internas resolvidas dentro do SLA", meta: "≥30% dentro do SLA em 2027 → ≥30% em 2028 → ≥90% a partir de 2029 (calibrar com o volume levantado no mapeamento)" },
          { indicador: "Esforço do cooperado: nº de interações/documentos para concluir a jornada", meta: "Jornadas prioritárias concluídas em 1 interação até 2029" },
          { indicador: "% de jornadas prioritárias (contratações de contas, crédito e produtos) iniciadas ou concluídas em canal digital", meta: "≥40% até 2030" },
        ],
        iniciativas: [
          "Programa de simplificação por jornada (mapear a jornada do cooperado - Realizar mapeamento com as áreas a respeito dos atendimentos prestados, assim como SLA se estabelecida, se não estabelecer em conjunto com área demandante para obtenção do mdc de SLA)",
          "Leitura do fluxo de cada jornada (flow process), indicando quanto cada etapa contribui para a simplificação e o que depende da Cooperativa ou do sistema (CCS/Central)",
          "Mapeamento conjunto Comercial (agência) + Back Office (UAD), com cronograma ajustado à disponibilidade das áreas",
          "Digitalização das jornadas prioritárias do cooperado: identificar etapas que podem ser iniciadas ou concluídas digitalmente e acompanhar a adoção dos canais digitais",
          "Revisão de alçadas e eliminação de possíveis aprovações redundantes",
          "Avaliar ferramental ou metodologia atual que permita mensurar e montar mapa de calor para avaliar, mitigar, treinar, melhorar, mensurar e iniciar o ciclo continuamente (mensal)",
          "Consolidação de sistemas",
        ],
        visivel: true,
      },
      {
        id: "e5-4",
        codigo: "E5.4",
        titulo: "Digitalizar as jornadas do cooperado, mantendo a proximidade como diferencial",
        responsavel: "Cleber",
        kpis: [
          { indicador: "% de cooperados ativos que usam app/internet banking mensalmente", meta: "(linha de base 2026: medir) → ≥80% até 2030, com marcos anuais" },
          { indicador: "% de contratações (contas, crédito, produtos) iniciadas ou concluídas em canal digital", meta: "(linha de base 2026: medir) → ≥40% até 2030, com marcos anuais" },
          { indicador: "ROI das campanhas digitais (complementar)", meta: "≥20% ao ano (valor do grupo mantido até haver base)" },
        ],
        iniciativas: [
          "Jornadas digitais prioritárias (abertura de conta, crédito pré-aprovado, investimentos)",
          "Campanhas segmentadas por fase de vida do cooperado",
          "Calendário anual de ações de fomento",
        ],
        // Oculto: excluído na validação da diretoria (out/2026). Digitalização das jornadas absorvida em E5.3.
        visivel: false,
      },
      {
        id: "e5-5",
        codigo: "E5.5",
        titulo: "Fomentar a cultura de melhoria contínua de processos e a criatividade",
        responsavel: "Cleber",
        kpis: [
          { indicador: "Nº de melhorias implementadas a partir de ideias de colaboradores, por 100 colaboradores/ano", meta: "≥10 por 100 colaboradores em 2027 → ≥20 em 2030 (linha de base 2026: medir)" },
          { indicador: "% de ideias com resposta em até 30 dias ('se sim, quando; se não, por que não')", meta: "100% a partir de 2027" },
          { indicador: "Satisfação do cliente interno (SIC) - complementar", meta: "SIC ≥9 (critério do grupo mantido; registrar a definição de SIC no glossário)" },
        ],
        iniciativas: [
          "Canal único de ideias com fluxo de resposta e reconhecimento público das implementadas",
          "Canal de manifestações do cliente interno via Lecom, com campos obrigatórios: PA/UAD e reclamante, área envolvida, abrangência (pontual ou várias unidades) e descrição objetiva; prazo de retorno conforme a complexidade",
          "Programa de Gestão de Demanda (priorização e capacidade)",
          "Ciclos curtos de melhoria por área com participação do time",
        ],
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

// Objetivos que precisam de avaliação para a revisão poder ser enviada:
// os dos pilares sob responsabilidade da pessoa (lib/acesso.ts).
export function objetivosObrigatorios(pilares: string[]): string[] {
  return PILARES.filter((p) => pilares.includes(p.slug)).flatMap((p) => objetivosVisiveis(p).map((o) => o.id));
}
