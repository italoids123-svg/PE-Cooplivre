import { timingSafeEqual } from "node:crypto";
import { getStore, StoreNotConfiguredError } from "@/lib/store";

function autorizado(request: Request): boolean {
  const esperado = process.env.ADMIN_KEY;
  const recebido = request.headers.get("x-admin-key");
  if (!esperado || !recebido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Todas as respostas + participantes. Protegido por ADMIN_KEY (header x-admin-key).
export async function GET(request: Request) {
  if (!process.env.ADMIN_KEY) {
    return Response.json({ error: "Defina a variável de ambiente ADMIN_KEY para liberar o painel." }, { status: 503 });
  }
  if (!autorizado(request)) return Response.json({ error: "Chave inválida" }, { status: 401 });
  try {
    return Response.json(await getStore().tudo());
  } catch (e) {
    if (e instanceof StoreNotConfiguredError) return Response.json({ error: e.message }, { status: 503 });
    console.error(e);
    return Response.json({ error: "Falha ao ler as respostas" }, { status: 500 });
  }
}
