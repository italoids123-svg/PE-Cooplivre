import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { REDIS_CONFIGURADO, redis, StoreNotConfiguredError } from "../store";
import { chaveRevisao, type AlteracaoOrc, type ParticipanteOrc, type RevisaoLinha, type Visao } from "./tipos";

// Contribuições da revisão do orçamento. Mesmo Redis do mapa estratégico, com
// prefixo próprio (orc:*); localmente, .data/orcamento.json.

const HASH_PARTICIPANTES = "orc:participantes";
// participanteId|visao|linhaId -> RevisaoLinha
const HASH_REVISOES = "orc:revisoes";
const LISTA_HISTORICO = "orc:historico";

export interface SnapshotOrc {
  participantes: ParticipanteOrc[];
  revisoes: RevisaoLinha[];
  historico: AlteracaoOrc[];
}

interface Backend {
  identificar(p: Omit<ParticipanteOrc, "criadoEm" | "atualizadoEm">): Promise<{ participante: ParticipanteOrc; retomou: boolean }>;
  participante(id: string): Promise<ParticipanteOrc | null>;
  revisoesDe(pid: string, visao: Visao): Promise<RevisaoLinha[]>;
  // revisao null = linha volta a ficar pendente.
  gravar(p: ParticipanteOrc, visao: Visao, linhaId: string, revisao: RevisaoLinha | null): Promise<void>;
  tudo(): Promise<SnapshotOrc>;
}

function mesclarParticipante(atual: ParticipanteOrc | null, novo: Omit<ParticipanteOrc, "criadoEm" | "atualizadoEm">): ParticipanteOrc {
  const agora = new Date().toISOString();
  return { ...novo, criadoEm: atual?.criadoEm ?? agora, atualizadoEm: agora };
}

// Preserva a data de criação de cada contribuição já gravada.
function preservarDatas(antes: RevisaoLinha | null, depois: RevisaoLinha | null): RevisaoLinha | null {
  if (!depois || !antes) return depois;
  const criados = new Map(antes.contribuicoes.map((c) => [c.id, c.criadoEm]));
  return { ...depois, contribuicoes: depois.contribuicoes.map((c) => ({ ...c, criadoEm: criados.get(c.id) ?? c.criadoEm })) };
}

const quem = (p: ParticipanteOrc) => ({ id: p.id, nome: p.nome, cargo: p.cargo, agencia: p.agencia });

function lista<T>(flat: string[] | null): T[] {
  const out: T[] = [];
  if (!flat) return out;
  for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]) as T);
  return out;
}

const redisBackend: Backend = {
  async participante(id) {
    const raw = await redis<string | null>(["HGET", HASH_PARTICIPANTES, id]);
    return raw ? (JSON.parse(raw) as ParticipanteOrc) : null;
  },
  async identificar(novo) {
    const atual = await this.participante(novo.id);
    const p = mesclarParticipante(atual, novo);
    await redis(["HSET", HASH_PARTICIPANTES, p.id, JSON.stringify(p)]);
    return { participante: p, retomou: !!atual };
  },
  async revisoesDe(pid, visao) {
    const out: RevisaoLinha[] = [];
    let cursor = "0";
    do {
      const [next, flat] = await redis<[string, string[]]>(["HSCAN", HASH_REVISOES, cursor, "MATCH", `${pid}|${visao}|*`, "COUNT", "500"]);
      out.push(...lista<RevisaoLinha>(flat));
      cursor = next;
    } while (cursor !== "0");
    return out;
  },
  async gravar(p, visao, linhaId, revisao) {
    const k = chaveRevisao(p.id, visao, linhaId);
    const raw = await redis<string | null>(["HGET", HASH_REVISOES, k]);
    const antes = raw ? (JSON.parse(raw) as RevisaoLinha) : null;
    const depois = preservarDatas(antes, revisao);
    if (depois) await redis(["HSET", HASH_REVISOES, k, JSON.stringify(depois)]);
    else if (antes) await redis(["HDEL", HASH_REVISOES, k]);
    else return;
    const h: AlteracaoOrc = { em: new Date().toISOString(), participante: quem(p), visao, linhaId, antes, depois };
    await redis(["RPUSH", LISTA_HISTORICO, JSON.stringify(h)]);
  },
  async tudo() {
    const [p, r, h] = await Promise.all([
      redis<string[]>(["HGETALL", HASH_PARTICIPANTES]),
      redis<string[]>(["HGETALL", HASH_REVISOES]),
      redis<string[]>(["LRANGE", LISTA_HISTORICO, "0", "-1"]),
    ]);
    return { participantes: lista(p), revisoes: lista(r), historico: h.map((x) => JSON.parse(x) as AlteracaoOrc) };
  },
};

const ARQUIVO = path.join(process.cwd(), ".data", "orcamento.json");
interface Arquivo {
  participantes: Record<string, ParticipanteOrc>;
  revisoes: Record<string, RevisaoLinha>;
  historico: AlteracaoOrc[];
}
let fila: Promise<unknown> = Promise.resolve();

async function ler(): Promise<Arquivo> {
  try {
    return JSON.parse(await fs.readFile(ARQUIVO, "utf8")) as Arquivo;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { participantes: {}, revisoes: {}, historico: [] };
    throw e;
  }
}

async function escrever(db: Arquivo) {
  await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
  await fs.writeFile(`${ARQUIVO}.tmp`, JSON.stringify(db, null, 2));
  await fs.rename(`${ARQUIVO}.tmp`, ARQUIVO);
}

function naFila<T>(fn: () => Promise<T>): Promise<T> {
  const job = fila.then(fn);
  fila = job.catch(() => undefined);
  return job;
}

const arquivoBackend: Backend = {
  async participante(id) {
    return (await ler()).participantes[id] ?? null;
  },
  identificar(novo) {
    return naFila(async () => {
      const db = await ler();
      const atual = db.participantes[novo.id] ?? null;
      const p = mesclarParticipante(atual, novo);
      db.participantes[p.id] = p;
      await escrever(db);
      return { participante: p, retomou: !!atual };
    });
  },
  async revisoesDe(pid, visao) {
    return Object.values((await ler()).revisoes).filter((r) => r.participanteId === pid && r.visao === visao);
  },
  gravar(p, visao, linhaId, revisao) {
    return naFila(async () => {
      const db = await ler();
      const k = chaveRevisao(p.id, visao, linhaId);
      const antes = db.revisoes[k] ?? null;
      const depois = preservarDatas(antes, revisao);
      if (depois) db.revisoes[k] = depois;
      else if (antes) delete db.revisoes[k];
      else return;
      db.historico.push({ em: new Date().toISOString(), participante: quem(p), visao, linhaId, antes, depois });
      await escrever(db);
    });
  },
  async tudo() {
    const db = await ler();
    return { participantes: Object.values(db.participantes), revisoes: Object.values(db.revisoes), historico: db.historico };
  },
};

export function getStoreOrc(): Backend {
  if (REDIS_CONFIGURADO) return redisBackend;
  if (process.env.VERCEL) {
    throw new StoreNotConfiguredError(
      "Armazenamento não configurado: conecte o Upstash Redis ao projeto na Vercel (KV_REST_API_URL / KV_REST_API_TOKEN).",
    );
  }
  return arquivoBackend;
}
