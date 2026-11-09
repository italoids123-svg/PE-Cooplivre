// Rituais de acompanhamento do Plano Estratégico 2027–2030, transcritos do material
// "Rituais_Acompanhamento_PE_Cooplivre" (out/2026). Sem nomes de pessoas: líderes,
// suplentes e patrocinadores aparecem só pelo papel.

export const PAPEL_COMITE = [
  { titulo: "Metas olhadas todo mês", texto: "Planejado × realizado em cada pilar, não só no fechamento do ano." },
  { titulo: "Cada desvio sai com dono e prazo", texto: "Nada fica “em análise”. Quem resolve e até quando ficam registrados." },
  { titulo: "A Direx decide na hora certa", texto: "O problema chega pequeno, com proposta pronta, e não quando já virou resultado perdido." },
  { titulo: "O time sabe o que mudou e por quê", texto: "A decisão desce até a agência em até um mês, e o que o time vê sobe pelo mesmo caminho." },
];

export const PILAR_PAPEIS =
  "Cada pilar tem um executivo da Diretoria que patrocina, um líder que conduz e um suplente que assume quando o líder não pode. Líderes e suplentes vêm do Programa de Sucessão.";

export const ESTRUTURA = [
  { nome: "Conselho de Administração", texto: "aprova o plano e as metas · recebe o relato trimestral" },
  { nome: "Diretoria Executiva", texto: "decide · patrocina os pilares" },
  { nome: "Comitê Estratégico", freq: "trimestral", texto: "Direx, cinco líderes de pilar e GEs" },
  { nome: "Comitê Tático", freq: "mensal", texto: "um diretor rotativo, líderes de pilar e GEs" },
  { nome: "Desdobramento Estratégico", freq: "mensal", texto: "GEs, gerentes gerais e gerentes de área" },
  { nome: "Desdobramento Tático", freq: "quinzenal", texto: "gerente e time" },
];

export const SECRETARIA = {
  nome: "Secretaria da estratégia",
  texto: "Performance Corporativa e RH. Fecha o painel, registra decisões e prazos, publica a agenda.",
};

export interface Momento {
  numero: number;
  nome: string;
  freq: string;
  quando: string;
  quem: string[];
  paraQue: string;
  pauta: string[];
  sai: string[];
  importa: string;
}

export const MOMENTOS: Momento[] = [
  {
    numero: 1, nome: "Comitê Estratégico", freq: "Trimestral · 3 h",
    quando: "Abril, julho, outubro e janeiro, após o fechamento do trimestre. Presencial.",
    quem: ["Diretoria Executiva", "Cinco líderes de pilar", "Gerentes Executivos"],
    paraQue: "Revisar metas, ajustar rota e decidir o próximo trimestre.",
    pauta: [
      "Cada líder apresenta seu pilar: resultado do trimestre e o que pede decisão (10 min cada)",
      "Metas fora de rota: manter, ajustar ou pausar",
      "Iniciativas do próximo trimestre: o que entra, o que sai, com dono",
      "Decisões lidas e registradas",
    ],
    sai: ["Decisões do trimestre e relato de uma página ao Conselho."],
    importa: "É a única reunião em que a Direx olha o plano inteiro e decide se ele continua como está.",
  },
  {
    numero: 2, nome: "Comitê Tático", freq: "Mensal · 90 min",
    quando: "Terceira semana do mês, com o painel já fechado.",
    quem: ["Um diretor, em rodízio", "Líderes de pilar", "Gerentes Executivos", "Unidades fora da meta, no próprio item, por convite"],
    paraQue: "Tratar desvios (planejado × realizado) com dono, prazo e decisão.",
    pauta: [
      "Só o que está fora da meta entra na pauta: 15 min por pilar",
      "Para cada desvio: causa, ação, dono e prazo",
      "Unidade convidada apresenta o próprio plano e sai",
      "O que precisa da Direx vai com data para a resposta",
    ],
    sai: ["Lista de ações com dono e prazo, publicada no painel.", "Pedidos de decisão à Direx, respondidos até o próximo comitê."],
    importa: "É onde o desvio ganha dono. Sem este encontro, o problema só aparece no trimestre.",
  },
  {
    numero: 3, nome: "Desdobramento Estratégico", freq: "Mensal · 90 min",
    quando: "Semana seguinte ao Comitê Tático.",
    quem: ["Gerentes Executivos", "Gerentes gerais das agências", "Gerentes de área"],
    paraQue: "Traduzir as decisões em prioridades e planos da cooperativa.",
    pauta: [
      "O que foi decidido no comitê e por quê",
      "O que muda para cada agência e área neste mês",
      "Prioridades do mês, por unidade",
      "Dúvidas e propostas que sobem para o próximo comitê",
    ],
    sai: ["Plano do mês de cada agência e área, alinhado às decisões.", "Lista do que subiu para o comitê."],
    importa: "É a ponte entre a decisão e a execução. Sem ela, cada GE traduz o plano do seu jeito.",
  },
  {
    numero: 4, nome: "Desdobramento Tático", freq: "Quinzenal · 30 min",
    quando: "Dentro da rotina do time, na reunião já registrada no RIN.",
    quem: ["Gerente", "Time da agência ou da área"],
    paraQue: "Levar o plano ao time e trazer o que o time vê.",
    pauta: [
      "Principais destaques do mês",
      "Projeções das metas: onde chegamos no ritmo atual",
      "O que o time sugere para fechar a diferença",
    ],
    sai: ["Time sabe o que mudou e por quê.", "Sugestões registradas e levadas ao desdobramento estratégico."],
    importa: "É onde o plano deixa de ser da Direx e vira do time. Duas vezes por mês, trinta minutos.",
  },
];

export const PAPEIS = [
  { papel: "Diretoria", verbo: "patrocina e decide", itens: ["Decide o que o comitê recomenda", "Responde pelo pilar no Conselho", "Sustenta o líder do pilar diante dos GEs e remove travas"] },
  { papel: "Líder do pilar", verbo: "conduz", itens: ["Prepara a página do pilar antes de cada comitê", "Apresenta o pilar no Estratégico e no Tático", "Cobra dono e prazo de cada desvio"] },
  { papel: "Gerente de agência ou área", verbo: "traduz", itens: ["Transforma prioridades em plano da unidade", "Conduz o desdobramento tático com o time", "Traz o que o time vê"] },
  { papel: "Secretaria", verbo: "sustenta", itens: ["Fecha o painel até o 5º dia útil", "Registra decisões, donos e prazos", "Publica a agenda e mede a presença"] },
];

// Quem faz o quê: linhas = papéis, colunas = os quatro momentos.
export const MATRIZ: { papel: string; celulas: string[] }[] = [
  { papel: "Diretoria", celulas: ["Decide", "Decide (um diretor, em rodízio)", "—", "—"] },
  { papel: "Líder do pilar", celulas: ["Apresenta o pilar", "Conduz o seu pilar", "Leva o pilar", "—"] },
  { papel: "GE", celulas: ["Participa", "Participa", "Conduz", "—"] },
  { papel: "Gerente de agência ou área", celulas: ["—", "Participa, se fora da meta", "Participa e leva o plano", "Conduz"] },
  { papel: "Time", celulas: ["—", "—", "—", "Participa"] },
  { papel: "Secretaria", celulas: ["Prepara e registra", "Prepara e registra", "Registra", "Recebe o registro (RIN)"] },
];

export const ACOMPANHAMENTO = {
  painel: ["Todos os indicadores do plano em um só lugar.", "Um indicador, uma fonte, um dono.", "Atualizado até o 5º dia útil de cada mês.", "Aberto para todos os líderes."],
  semaforo: [
    { cor: "verde", nome: "Verde", texto: "na meta do período" },
    { cor: "amarelo", nome: "Amarelo", texto: "abaixo da meta, com ação em curso" },
    { cor: "vermelho", nome: "Vermelho", texto: "abaixo da meta sem ação, ou sem medição" },
  ],
  pagina: [
    { titulo: "Semáforo", texto: "dos indicadores do pilar" },
    { titulo: "Desvios", texto: "no máximo três, com causa, ação, dono e prazo" },
    { titulo: "Decisões", texto: "pedidas à Direx, com data" },
    { titulo: "Destaque", texto: "do mês: o que avançou e quem fez" },
  ],
};

export const CALENDARIO: { mes: string; tipo: "E" | "T"; nota?: string }[] = [
  { mes: "Jan", tipo: "T", nota: "Primeiro Comitê Tático. Painel começa com o que já se mede." },
  { mes: "Fev", tipo: "T" },
  { mes: "Mar", tipo: "T" },
  { mes: "Abr", tipo: "E", nota: "Primeiro Comitê Estratégico: 1º trimestre e linhas de base. Relato ao Conselho." },
  { mes: "Mai", tipo: "T" },
  { mes: "Jun", tipo: "T", nota: "Painel completo." },
  { mes: "Jul", tipo: "E", nota: "2º trimestre. Relato ao Conselho." },
  { mes: "Ago", tipo: "T" },
  { mes: "Set", tipo: "T", nota: "Abre a revisão das metas 2028, junto com o orçamento." },
  { mes: "Out", tipo: "E", nota: "3º trimestre e metas 2028. Líderes de pilar do próximo mandato." },
  { mes: "Nov", tipo: "T", nota: "Conselho aprova as metas 2028. Devolutiva ao time no aniversário da Cooplivre." },
  { mes: "Dez", tipo: "T", nota: "Fechamento do ano. Passagem de bastão dos líderes de pilar." },
];
export const CALENDARIO_NOTA = "Janeiro de 2028: Comitê Estratégico de fechamento de 2027.";
