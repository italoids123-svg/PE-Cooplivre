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
          { indicador: "Índice GPTW geral (favorabilidade)", meta: "75 (2026) → ≥80 em 2027 → ≥85 em 2029 → ≥88 em 2030" },
          { indicador: "% de colaboradores com PDI ativo e conversa 1:1 registrada no período (Feedz)", meta: "≥90% dos colaboradores com PDI ativo e ≥1 conversa 1:1 registrada por mês/trimestre, a partir de 2027" },
          { indicador: "% de vagas de liderança e de especialistas preenchidas por recrutamento interno", meta: "≥80% das vagas preenchidas internamente a partir de 2028 (linha de base 2026: medir)" },
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
          { indicador: "% de colaboradores que são cooperados ativos da Cooplivre, com produtos além da conta", meta: "(linha de base 2026: medir) → xx% até 2028", emAnalise: true },
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
          { indicador: "e-NPS", meta: "53 (2026) → ≥65 em 2027 → ≥72 em 2028 → ≥80 em 2030" },
          { indicador: "GPTW — item 'Tenho orgulho de contar a outras pessoas que trabalho aqui'", meta: "≥85 até 2028 (linha de base 2026: a confirmar no relatório GPTW)" },
          { indicador: "Turnover voluntário anual (monitoramento, sem meta de retenção forçada)", meta: "≤2% em 2027" },
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
          { indicador: "Índice de principalidade %", meta: "(linha de base 2026: medir) → +10 p.p. até 2030, com marcos anuais" },
          { indicador: "NPS do cooperado", meta: "≥68 em 2027 → ≥75 em 2030" },
          { indicador: "Benefício econômico entregue ao cooperado (taxas + sobras + juros ao capital), em R$/cooperado/ano vs. Mercado", meta: "(linha de base 2026: medir) → crescer acima da inflação a cada ano" },
        ],
        iniciativas: [
          "Modelo de atendimento consultivo por fase de vida (jovem, família, empreendedor, maturidade) praticado pelas lideranças comerciais no dia a dia",
          "Cadência de contato definida por faixa de relacionamento",
          "Ativação de cooperados não correntistas (30% do potencial não explorado até 2028 — meta operacional desta iniciativa)",
          "Comunicação anual do benefício econômico a cada cooperado",
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
        visivel: true,
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
        visivel: true,
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
        titulo: "Aumentar a capitalização do cooperado como proporção do crédito tomado",
        responsavel: "Amaya",
        kpis: [
          { indicador: "Capital social ÷ carteira de crédito (%)", meta: "(linha de base 2026: medir) → +X p.p. ao ano até 2030 — fechar o valor a partir do índice de Basileia-alvo e do crescimento de carteira previsto em S3.3", emAnalise: true },
          { indicador: "% de cooperados ativos com integralização mensal recorrente", meta: "(linha de base 2026: medir) → ≥60% até 2030" },
        ],
        iniciativas: [
          "Política de integralização proporcional ao crédito e aos produtos (regra pública e simples)",
          "Campanha permanente ligada à distribuição de sobras e juros ao capital ('seu capital trabalha para você')",
          "Mapeamento de perfil por faixa de relacionamento (R1–R7)",
        ],
        visivel: true,
      },
      {
        id: "s3-2",
        codigo: "S3.2",
        titulo: "Equilibrar os prazos entre captação e carteira de crédito, garantindo liquidez sem perder resultado",
        responsavel: "Amaya",
        kpis: [
          { indicador: "Descasamento de prazos: duration média da carteira de crédito ÷ duration média da captação", meta: "(linha de base 2026: medir) → reduzir o descasamento em 40% até 2030, com marcos anuais (≈10% ao ano)" },
          { indicador: "% da captação em instrumentos de prazo ≥ 12 meses", meta: "(linha de base 2026: medir) → definir mínimo após a medição", emAnalise: true },
        ],
        iniciativas: [
          "Política de ALM (gestão de ativos e passivos) com limites aprovados pelo Conselho",
          "Portfólio de captação de longo prazo com incentivo ao cooperado (taxa escalonada por prazo)",
          "Acompanhamento mensal no comitê de resultado",
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
        visivel: true,
      },
      {
        id: "s3-4",
        codigo: "S3.4",
        titulo: "Melhorar a eficiência operacional, com despesas crescendo abaixo das receitas",
        responsavel: "Amaya",
        kpis: [
          { indicador: "IEO — Índice de Eficiência Operacional (despesas administrativas ÷ receitas)", meta: "(linha de base 2026: medir) → reduzir o IEO em 10 p.p. até 2030, com marcos anuais" },
          { indicador: "Crescimento anual das despesas administrativas vs. crescimento das receitas (p.p.)", meta: "Despesas crescendo ao menos 3 p.p. abaixo das receitas a cada ano" },
        ],
        iniciativas: [
          "Guardiões e norteadores de resultado com painel mensal de custos por unidade",
          "Automação e simplificação de processos (E5.2 e E5.3) como fonte principal de eficiência",
          "Revisão de contratos e despesas recorrentes. Redução de quadro não é alavanca padrão deste objetivo",
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
        visivel: true,
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
        visivel: true,
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
          { indicador: "Nº de pessoas que concluem ações de educação cooperativista e financeira no ano (cooperados e não cooperados, separados)", meta: "(linha de base 2026: medir) → +20% ao ano até 2030" },
          { indicador: "% dos cooperados participantes com melhora de saúde financeira após 12 meses (ex.: redução de endividamento/atraso)", meta: "≥30% dos participantes com melhora mensurável até 2029" },
          { indicador: "% das sobras/FATES destinado a programas de educação e comunidade", meta: "% definido pela política de destinação das sobras (decisão do percentual pendente) · Selo ODS: marco de iniciativa", emAnalise: true },
        ],
        iniciativas: [
          "Programa estruturado de educação cooperativista (primeiro) e financeira, com trilhas por público (jovem, família, empreendedor, escola)",
          "Diagnóstico de saúde financeira antes/depois",
          "Certificação ODS como marco (1 projeto por ODS prioritário)",
          "Modelo de % das sobras por comunidade",
        ],
        visivel: true,
      },
      {
        id: "c4-2",
        codigo: "C4.2",
        titulo: "Fortalecer o relacionamento com as comunidades e instituições de cada praça",
        responsavel: "Rafael",
        kpis: [
          { indicador: "Nº de parcerias ativas com instituições prioritárias por agência (escolas, associações, sindicatos rurais, prefeituras)", meta: "≥3 parcerias ativas por agência até 2028" },
          { indicador: "Nº de novos cooperados originados em ações comunitárias no ano", meta: "(linha de base 2026: medir) → definir após 2027", emAnalise: true },
          { indicador: "Participações em eventos relevantes por agência (atividade)", meta: "≥2 por agência/ano (mantida)" },
        ],
        iniciativas: [
          "Mapear eventos relevantes",
          "Plano de relacionamento com instituições prioritárias",
          "Agenda comunitária anual por agência, com dono",
          "Registro de origem do cooperado (campo no cadastro) para medir o indicador 2",
        ],
        visivel: true,
      },
      {
        id: "c4-3",
        codigo: "C4.3",
        titulo: "Formar e integrar cooperados na cultura cooperativista (do onboarding à participação em assembleias)",
        responsavel: "Rafael",
        kpis: [
          { indicador: "% de novos cooperados que concluem a jornada de integração em até 90 dias", meta: "≥60% em 2027 → ≥80% em 2029" },
          { indicador: "% da base ativa com formação cooperativista concluída (acumulado)", meta: "10% (2027) · 15% (2028) · 20% (2029) · 25% (2030) — mantida" },
          { indicador: "% de participação de cooperados em assembleias", meta: "(linha de base 2026: medir) → +2 p.p. ao ano" },
        ],
        iniciativas: [
          "Onboarding cooperativista padronizado (absorve 'onboarding do cooperado' e 'padronização de abordagem' de P1.4)",
          "Programa de multiplicadores (cooperados e colaboradores)",
          "Incentivo à participação em assembleias e conselhos",
        ],
        visivel: true,
      },
      {
        id: "c4-4",
        codigo: "C4.4",
        titulo: "Mobilizar colaboradores como agentes do cooperativismo na comunidade (voluntariado)",
        responsavel: "Rafael",
        kpis: [
          { indicador: "% de colaboradores que participam, por opção, de ≥1 ação voluntária no ano", meta: "50% (2027) · 60% (2028) · 70% (2029) · 80% (2030) — mantida, condicionada à adesão voluntária (linha de base 2026: medir)" },
          { indicador: "Horas de voluntariado por colaborador participante", meta: "≥8 h/ano" },
          { indicador: "Satisfação dos voluntários com as ações (pesquisa simples pós-ação)", meta: "≥85% de satisfação", emAnalise: true },
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
          { indicador: "% de dirigentes (CA, Conselho Fiscal e Direx) com formação concluída conforme a Política de Formação de Dirigentes", meta: "100% até 2028 (política aprovada até jun/2027 — marco, não meta)" },
          { indicador: "Nº de candidatos elegíveis e preparados por cadeira do CA na próxima eleição", meta: "≥2 candidatos preparados por cadeira na próxima eleição" },
        ],
        iniciativas: [
          "Política de Formação de Dirigentes (escrita e aprovada em 2027)",
          "Programa de formação de novos dirigentes e capacitação contínua (CA, Fiscal e Direx)",
          "Integração com o plano de sucessão (P1.2) e com a governança de acompanhamento da estratégia",
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
          { indicador: "% das metas deste plano com indicador medido e publicado mensalmente (painel único)", meta: "100% até jun/2027 (hoje a maioria das linhas não tem linha de base)" },
          { indicador: "Aderência aos rituais de gestão: realizados ÷ planejados, por área", meta: "≥90% de aderência, com ritual mensal em 100% das áreas a partir de 2027" },
        ],
        iniciativas: [
          "Painel único da estratégia (um indicador = uma fonte = um dono)",
          "Levantamento das linhas de base 2026",
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
          { indicador: "Tempo de ciclo das jornadas críticas do cooperado (ex: abertura de conta, concessão de crédito, cartão), em dias", meta: "−25% até 2028 e −40% até 2030, sobre a linha de base 2026" },
          { indicador: "Esforço do cooperado: nº de interações/documentos para concluir a jornada", meta: "Jornadas prioritárias concluídas em 1 interação até 2029" },
          { indicador: "% de demandas internas resolvidas dentro do SLA", meta: "≥90% dentro do SLA a partir de 2027" },
        ],
        iniciativas: [
          "Programa de simplificação por jornada (mapear a jornada do cooperado - Realizar mapeamento com as áreas a respeito dos atendimentos prestados, assim como SLA se estabelecida, se não estabelecer em conjunto com área demandante para obtenção do mdc de SLA)",
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
        visivel: true,
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
