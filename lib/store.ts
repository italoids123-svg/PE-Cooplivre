import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CAMPOS_RESPOSTA, enviosDe, type Alteracao, type Participante, type Rascunho, type Resposta } from "./types";

// Armazenamento das respostas do evento.
//
// - Produção (Vercel): Redis via API REST da Upstash. A integração "Upstash for
//   Redis" do Marketplace da Vercel injeta KV_REST_API_URL/KV_REST_API_TOKEN;
//   UPSTASH_REDIS_REST_URL/TOKEN também são aceitos.
// - Local (`npm run dev` / `next start` fora da Vercel): arquivo .data/respostas.json.
// - Na Vercel sem Redis configurado: falha explícita. O disco da Vercel é efêmero
//   e gravar em arquivo lá perderia respostas sem aviso.

const HASH_PARTICIPANTES = "pe:participantes";
const HASH_RESPOSTAS = "pe:respostas";
const LISTA_HISTORICO = "pe:historico";
// participanteId|objetivoId -> Rascunho (edição em andamento, só para acompanhamento).
const HASH_RASCUNHOS = "pe:rascunhos";

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export class StoreNotConfiguredError extends Error {}
// Alteração recusada porque a pessoa já enviou a revisão final.
export class RevisaoEnviadaError extends Error {
  constructor() {
    super("Sua revisão já foi enviada e não pode mais ser alterada.");
  }
}
// Envio final recusado porque faltam objetivos sem avaliação.
export class RevisaoIncompletaError extends Error {
  constructor(public faltando: string[]) {
    super(`Faltam ${faltando.length} objetivo(s) sem avaliação. Conclua todos os pilares antes de enviar.`);
  }
}

export interface Snapshot {
  participantes: Participante[];
  respostas: Resposta[];
  historico: Alteracao[];
  rascunhos?: Record<string, Rascunho>;
}

interface Backend {
  // Devolve o participante como ficou gravado e as respostas (com criadoEm preservado).
  salvar(p: Participante, r: Resposta[]): Promise<{ participante: Participante; respostas: Resposta[] }>;
  participante(id: string): Promise<Participante | null>;
  respostasDe(participanteId: string): Promise<Resposta[]>;
  // Marca a revisão como enviada; exige avaliados todos os `obrigatorios`
  // (objetivos dos pilares sob responsabilidade da pessoa).
  enviar(id: string, obrigatorios: string[]): Promise<Participante>;
  // "Realizar ajustes": destrava uma revisão enviada para edição e reenvio.
  reabrir(id: string): Promise<Participante>;
  // Grava (dados) ou apaga (dados null) rascunhos de objetivos.
  sincronizarRascunhos(itens: { participanteId: string; objetivoId: string; pilar: string; dados: Rascunho["dados"] | null }[]): Promise<void>;
  apagarRascunhos(participanteId: string, objetivoIds: string[]): Promise<void>;
  rascunhos(): Promise<Rascunho[]>;
  tudo(): Promise<Snapshot>;
}

// Regras comuns aos dois backends.
function mesclarParticipante(atual: Participante | null, novo: Participante, comRespostas: boolean): Participante {
  // Atualizar nome/cargo continua permitido depois do envio; respostas não.
  if (atual?.enviadoEm && comRespostas) throw new RevisaoEnviadaError();
  // Campos de status vêm sempre do servidor, nunca do que o cliente mandou.
  const { enviadoEm, envios, reabertoEm, ...dados } = novo;
  void enviadoEm; void envios; void reabertoEm;
  return {
    ...dados,
    ...(atual?.enviadoEm && { enviadoEm: atual.enviadoEm }),
    ...(atual?.envios && { envios: atual.envios }),
    ...(atual?.reabertoEm && { reabertoEm: atual.reabertoEm }),
  };
}

function marcarEnviado(p: Participante): Participante {
  const agora = new Date().toISOString();
  return { ...p, enviadoEm: agora, envios: [...enviosDe(p), agora] };
}

function marcarReaberto(p: Participante): Participante {
  const { enviadoEm, ...resto } = p;
  return { ...resto, envios: enviosDe(p), ...(enviadoEm && { reabertoEm: new Date().toISOString() }) };
}

function conferirCompleta(respostas: Resposta[], obrigatorios: string[]) {
  const avaliados = new Set(respostas.filter((r) => r.avaliacao).map((r) => r.objetivoId));
  const faltando = obrigatorios.filter((id) => !avaliados.has(id));
  if (faltando.length) throw new RevisaoIncompletaError(faltando);
}

const chave = (r: Resposta) => `${r.participanteId}|${r.objetivoId}`;

const campos = (r: Resposta) =>
  Object.fromEntries(CAMPOS_RESPOSTA.map((c) => [c, r[c]])) as Alteracao["depois"];

// Junta o envio com o que já estava gravado: preserva criadoEm, descarta envios
// idênticos e gera uma linha de histórico por envio que mudou algo.
function mesclar(p: Participante, anteriores: (Resposta | null)[], novas: Resposta[]) {
  const gravar: Resposta[] = [];
  const historico: Alteracao[] = [];
  const quem = { id: p.id, nome: p.nome, cargo: p.cargo, localidade: p.localidade };
  novas.forEach((r, i) => {
    const prev = anteriores[i];
    if (prev && CAMPOS_RESPOSTA.every((c) => prev[c] === r[c])) {
      gravar.push(prev);
      return;
    }
    const final = { ...r, criadoEm: prev?.criadoEm ?? prev?.atualizadoEm ?? r.criadoEm };
    gravar.push(final);
    historico.push({
      em: final.atualizadoEm,
      participante: quem,
      pilar: final.pilar,
      objetivoId: final.objetivoId,
      acao: prev ? "alterou" : "criou",
      antes: prev ? campos(prev) : null,
      depois: campos(final),
    });
  });
  return { gravar, historico };
}

// Comandos repetidos em falha de rede. HSET/leituras são idempotentes; RPUSH pode
// duplicar uma linha de histórico se a 1ª tentativa chegou a gravar — a leitura
// (tudo) descarta duplicatas, então repetir é seguro e evita perder histórico.
const COM_RETENTATIVA = new Set(["HSET", "HDEL", "HGET", "HMGET", "HSCAN", "HGETALL", "LRANGE", "RPUSH"]);

async function redis<T>(cmd: string[]): Promise<T> {
  const tentativas = COM_RETENTATIVA.has(cmd[0]) ? 3 : 1;
  let res: Response | undefined;
  for (let i = 1; ; i++) {
    try {
      res = await fetch(REDIS_URL!, {
        method: "POST",
        headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(cmd),
        cache: "no-store",
      });
      if (res.status < 500 || i >= tentativas) break;
    } catch (e) {
      // Falha de rede passageira (ECONNRESET, timeout): tenta de novo com espera crescente.
      if (i >= tentativas) throw e;
    }
    await new Promise((r) => setTimeout(r, 150 * i));
  }
  if (!res) throw new Error(`Redis ${cmd[0]}: sem resposta`);
  const body = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || body.error) throw new Error(`Redis ${cmd[0]}: ${body.error ?? res.status}`);
  return body.result as T;
}

function semDuplicatas(hs: Alteracao[]): Alteracao[] {
  const vistos = new Set<string>();
  return hs.filter((h) => {
    const k = `${h.em}|${h.participante.id}|${h.objetivoId}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

function hgetallParaLista<T>(flat: string[] | null): T[] {
  const out: T[] = [];
  if (!flat) return out;
  for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]) as T);
  return out;
}

const redisBackend: Backend = {
  async participante(id) {
    const raw = await redis<string | null>(["HGET", HASH_PARTICIPANTES, id]);
    return raw ? (JSON.parse(raw) as Participante) : null;
  },
  async salvar(novo, respostas) {
    const p = mesclarParticipante(await this.participante(novo.id), novo, respostas.length > 0);
    await redis(["HSET", HASH_PARTICIPANTES, p.id, JSON.stringify(p)]);
    if (respostas.length === 0) return { participante: p, respostas: [] };
    // Cada chave é de um único participante, então ler-e-gravar sem transação
    // não disputa com outras pessoas — só consigo mesmo em duas abas.
    const raw = await redis<(string | null)[]>(["HMGET", HASH_RESPOSTAS, ...respostas.map(chave)]);
    const { gravar, historico } = mesclar(p, raw.map((x) => (x ? (JSON.parse(x) as Resposta) : null)), respostas);
    if (historico.length) {
      await redis(["HSET", HASH_RESPOSTAS, ...gravar.flatMap((r) => [chave(r), JSON.stringify(r)])]);
      await redis(["RPUSH", LISTA_HISTORICO, ...historico.map((h) => JSON.stringify(h))]);
    }
    return { participante: p, respostas: gravar };
  },
  async enviar(id, obrigatorios) {
    const atual = await this.participante(id);
    if (!atual) throw new RevisaoIncompletaError(obrigatorios);
    if (atual.enviadoEm) return atual;
    conferirCompleta(await this.respostasDe(id), obrigatorios);
    const p = marcarEnviado(atual);
    await redis(["HSET", HASH_PARTICIPANTES, id, JSON.stringify(p)]);
    return p;
  },
  async reabrir(id) {
    const atual = await this.participante(id);
    if (!atual) throw new RevisaoIncompletaError([]);
    if (!atual.enviadoEm) return atual;
    const p = marcarReaberto(atual);
    await redis(["HSET", HASH_PARTICIPANTES, id, JSON.stringify(p)]);
    return p;
  },
  async respostasDe(participanteId) {
    // HSCAN com MATCH evita trazer as respostas de todo mundo.
    const out: Resposta[] = [];
    let cursor = "0";
    do {
      const [next, flat] = await redis<[string, string[]]>([
        "HSCAN", HASH_RESPOSTAS, cursor, "MATCH", `${participanteId}|*`, "COUNT", "500",
      ]);
      out.push(...hgetallParaLista<Resposta>(flat));
      cursor = next;
    } while (cursor !== "0");
    return out;
  },
  async tudo() {
    const [p, r, h] = await Promise.all([
      redis<string[]>(["HGETALL", HASH_PARTICIPANTES]),
      redis<string[]>(["HGETALL", HASH_RESPOSTAS]),
      redis<string[]>(["LRANGE", LISTA_HISTORICO, "0", "-1"]),
    ]);
    return {
      participantes: hgetallParaLista(p),
      respostas: hgetallParaLista(r),
      historico: semDuplicatas(h.map((x) => JSON.parse(x) as Alteracao)),
    };
  },
  async sincronizarRascunhos(itens) {
    const agora = new Date().toISOString();
    const gravar = itens.filter((x) => x.dados);
    const apagar = itens.filter((x) => !x.dados);
    if (gravar.length) {
      await redis(["HSET", HASH_RASCUNHOS, ...gravar.flatMap((x) => [
        `${x.participanteId}|${x.objetivoId}`,
        JSON.stringify({ participanteId: x.participanteId, objetivoId: x.objetivoId, pilar: x.pilar, dados: x.dados, atualizadoEm: agora }),
      ])]);
    }
    if (apagar.length) await redis(["HDEL", HASH_RASCUNHOS, ...apagar.map((x) => `${x.participanteId}|${x.objetivoId}`)]);
  },
  async apagarRascunhos(participanteId, objetivoIds) {
    if (objetivoIds.length) await redis(["HDEL", HASH_RASCUNHOS, ...objetivoIds.map((o) => `${participanteId}|${o}`)]);
  },
  async rascunhos() {
    return hgetallParaLista<Rascunho>(await redis<string[]>(["HGETALL", HASH_RASCUNHOS]));
  },
};

const ARQUIVO = path.join(process.cwd(), ".data", "respostas.json");
interface Arquivo {
  participantes: Record<string, Participante>;
  respostas: Record<string, Resposta>;
  historico: Alteracao[];
  rascunhos?: Record<string, Rascunho>;
}
// Serializa gravações concorrentes no mesmo processo.
let fila: Promise<unknown> = Promise.resolve();

async function lerArquivo(): Promise<Arquivo> {
  try {
    const db = JSON.parse(await fs.readFile(ARQUIVO, "utf8")) as Arquivo;
    db.historico ??= [];
    return db;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { participantes: {}, respostas: {}, historico: [] };
    throw e;
  }
}

async function gravarArquivo(db: Arquivo) {
  await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
  const tmp = `${ARQUIVO}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, ARQUIVO);
}

function naFila<T>(fn: () => Promise<T>): Promise<T> {
  const job = fila.then(fn);
  fila = job.catch(() => undefined);
  return job;
}

// Só chamar de dentro de naFila.
async function salvarNoArquivo(novo: Participante, respostas: Resposta[]) {
  const db = await lerArquivo();
  const p = mesclarParticipante(db.participantes[novo.id] ?? null, novo, respostas.length > 0);
  db.participantes[p.id] = p;
  const { gravar, historico } = mesclar(p, respostas.map((r) => db.respostas[chave(r)] ?? null), respostas);
  for (const r of gravar) db.respostas[chave(r)] = r;
  db.historico.push(...historico);
  await gravarArquivo(db);
  return { participante: p, respostas: gravar };
}

const arquivoBackend: Backend = {
  salvar(novo, respostas) {
    return naFila(() => salvarNoArquivo(novo, respostas));
  },
  reabrir(id) {
    return naFila(async () => {
      const db = await lerArquivo();
      const atual = db.participantes[id];
      if (!atual) throw new RevisaoIncompletaError([]);
      if (!atual.enviadoEm) return atual;
      db.participantes[id] = marcarReaberto(atual);
      await gravarArquivo(db);
      return db.participantes[id];
    });
  },
  async participante(id) {
    return (await lerArquivo()).participantes[id] ?? null;
  },
  enviar(id, obrigatorios) {
    return naFila(async () => {
      const db = await lerArquivo();
      const atual = db.participantes[id];
      if (!atual) throw new RevisaoIncompletaError(obrigatorios);
      if (atual.enviadoEm) return atual;
      conferirCompleta(Object.values(db.respostas).filter((r) => r.participanteId === id), obrigatorios);
      const p = marcarEnviado(atual);
      db.participantes[id] = p;
      await gravarArquivo(db);
      return p;
    });
  },
  async respostasDe(participanteId) {
    const db = await lerArquivo();
    return Object.values(db.respostas).filter((r) => r.participanteId === participanteId);
  },
  async tudo() {
    const db = await lerArquivo();
    return { participantes: Object.values(db.participantes), respostas: Object.values(db.respostas), historico: db.historico };
  },
  sincronizarRascunhos(itens) {
    return naFila(async () => {
      const db = await lerArquivo();
      const agora = new Date().toISOString();
      db.rascunhos ??= {};
      for (const x of itens) {
        const k = `${x.participanteId}|${x.objetivoId}`;
        if (x.dados) db.rascunhos[k] = { participanteId: x.participanteId, objetivoId: x.objetivoId, pilar: x.pilar, dados: x.dados, atualizadoEm: agora };
        else delete db.rascunhos[k];
      }
      await gravarArquivo(db);
    });
  },
  apagarRascunhos(participanteId, objetivoIds) {
    return naFila(async () => {
      const db = await lerArquivo();
      for (const o of objetivoIds) delete db.rascunhos?.[`${participanteId}|${o}`];
      await gravarArquivo(db);
    });
  },
  async rascunhos() {
    return Object.values((await lerArquivo()).rascunhos ?? {});
  },
};

export function getStore(): Backend {
  if (REDIS_URL && REDIS_TOKEN) return redisBackend;
  if (process.env.VERCEL) {
    throw new StoreNotConfiguredError(
      "Armazenamento não configurado: conecte o Upstash Redis ao projeto na Vercel (KV_REST_API_URL / KV_REST_API_TOKEN).",
    );
  }
  return arquivoBackend;
}
