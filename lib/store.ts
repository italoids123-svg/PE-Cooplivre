import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CAMPOS_RESPOSTA, type Alteracao, type Participante, type Resposta } from "./types";

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

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export class StoreNotConfiguredError extends Error {}

export interface Snapshot {
  participantes: Participante[];
  respostas: Resposta[];
  historico: Alteracao[];
}

interface Backend {
  // Devolve as respostas como ficaram gravadas (com criadoEm preservado).
  salvar(p: Participante, r: Resposta[]): Promise<Resposta[]>;
  respostasDe(participanteId: string): Promise<Resposta[]>;
  tudo(): Promise<Snapshot>;
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
const COM_RETENTATIVA = new Set(["HSET", "HMGET", "HSCAN", "HGETALL", "LRANGE", "RPUSH"]);

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
  async salvar(p, respostas) {
    await redis(["HSET", HASH_PARTICIPANTES, p.id, JSON.stringify(p)]);
    if (respostas.length === 0) return [];
    // Cada chave é de um único participante, então ler-e-gravar sem transação
    // não disputa com outras pessoas — só consigo mesmo em duas abas.
    const raw = await redis<(string | null)[]>(["HMGET", HASH_RESPOSTAS, ...respostas.map(chave)]);
    const { gravar, historico } = mesclar(p, raw.map((x) => (x ? (JSON.parse(x) as Resposta) : null)), respostas);
    if (historico.length === 0) return gravar;
    await redis(["HSET", HASH_RESPOSTAS, ...gravar.flatMap((r) => [chave(r), JSON.stringify(r)])]);
    await redis(["RPUSH", LISTA_HISTORICO, ...historico.map((h) => JSON.stringify(h))]);
    return gravar;
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
};

const ARQUIVO = path.join(process.cwd(), ".data", "respostas.json");
interface Arquivo {
  participantes: Record<string, Participante>;
  respostas: Record<string, Resposta>;
  historico: Alteracao[];
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

const arquivoBackend: Backend = {
  salvar(p, respostas) {
    const job = fila.then(async () => {
      const db = await lerArquivo();
      db.participantes[p.id] = p;
      const { gravar, historico } = mesclar(p, respostas.map((r) => db.respostas[chave(r)] ?? null), respostas);
      for (const r of gravar) db.respostas[chave(r)] = r;
      db.historico.push(...historico);
      await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
      const tmp = `${ARQUIVO}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(db, null, 2));
      await fs.rename(tmp, ARQUIVO);
      return gravar;
    });
    fila = job.catch(() => undefined);
    return job;
  },
  async respostasDe(participanteId) {
    const db = await lerArquivo();
    return Object.values(db.respostas).filter((r) => r.participanteId === participanteId);
  },
  async tudo() {
    const db = await lerArquivo();
    return { participantes: Object.values(db.participantes), respostas: Object.values(db.respostas), historico: db.historico };
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
