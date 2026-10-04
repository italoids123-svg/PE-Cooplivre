import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Participante, Resposta } from "./types";

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

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export class StoreNotConfiguredError extends Error {}

export interface Snapshot {
  participantes: Participante[];
  respostas: Resposta[];
}

interface Backend {
  salvar(p: Participante, r: Resposta[]): Promise<void>;
  respostasDe(participanteId: string): Promise<Resposta[]>;
  tudo(): Promise<Snapshot>;
}

const chave = (r: Resposta) => `${r.participanteId}|${r.objetivoId}`;

async function redis<T>(cmd: string[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const body = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || body.error) throw new Error(`Redis ${cmd[0]}: ${body.error ?? res.status}`);
  return body.result as T;
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
    if (respostas.length === 0) return;
    const args = respostas.flatMap((r) => [chave(r), JSON.stringify(r)]);
    await redis(["HSET", HASH_RESPOSTAS, ...args]);
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
    const [p, r] = await Promise.all([
      redis<string[]>(["HGETALL", HASH_PARTICIPANTES]),
      redis<string[]>(["HGETALL", HASH_RESPOSTAS]),
    ]);
    return { participantes: hgetallParaLista(p), respostas: hgetallParaLista(r) };
  },
};

const ARQUIVO = path.join(process.cwd(), ".data", "respostas.json");
interface Arquivo {
  participantes: Record<string, Participante>;
  respostas: Record<string, Resposta>;
}
// Serializa gravações concorrentes no mesmo processo.
let fila: Promise<unknown> = Promise.resolve();

async function lerArquivo(): Promise<Arquivo> {
  try {
    return JSON.parse(await fs.readFile(ARQUIVO, "utf8")) as Arquivo;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { participantes: {}, respostas: {} };
    throw e;
  }
}

const arquivoBackend: Backend = {
  salvar(p, respostas) {
    const job = fila.then(async () => {
      const db = await lerArquivo();
      db.participantes[p.id] = p;
      for (const r of respostas) db.respostas[chave(r)] = r;
      await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
      const tmp = `${ARQUIVO}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(db, null, 2));
      await fs.rename(tmp, ARQUIVO);
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
    return { participantes: Object.values(db.participantes), respostas: Object.values(db.respostas) };
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
