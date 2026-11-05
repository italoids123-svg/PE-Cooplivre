import { timingSafeEqual } from "node:crypto";
import { CONSELHO } from "@/lib/acesso";
import { AcessoNegadoError, respostaDeErro } from "@/lib/api-erros";
import type { Participante } from "@/lib/types";

// Entrada do Conselho pelo link /conselho?chave=…: confere a chave (variável de ambiente
// CONSELHO_KEY) e devolve a identidade de visualização. Trocar a variável invalida o link.
export async function POST(request: Request) {
  try {
    const esperado = process.env.CONSELHO_KEY;
    if (!esperado) return Response.json({ error: "Acesso do Conselho não configurado." }, { status: 503 });
    const body = (await request.json().catch(() => null)) as { chave?: unknown } | null;
    const a = Buffer.from(esperado);
    const b = Buffer.from(typeof body?.chave === "string" ? body.chave : "");
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new AcessoNegadoError("Link de acesso inválido ou expirado.");
    const participante: Participante = {
      id: CONSELHO.id,
      nome: CONSELHO.nome,
      cargo: "Visualização",
      atualizadoEm: new Date().toISOString(),
    };
    return Response.json({ participante });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível abrir o acesso agora. Tente novamente.");
  }
}
