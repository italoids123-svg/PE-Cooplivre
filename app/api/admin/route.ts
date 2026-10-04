import { checarAdmin } from "@/lib/admin-auth";
import { getStore, StoreNotConfiguredError } from "@/lib/store";

// Todas as respostas, participantes e histórico. Protegido por ADMIN_KEY (header x-admin-key).
export async function GET(request: Request) {
  const negado = checarAdmin(request);
  if (negado) return negado;
  try {
    return Response.json(await getStore().tudo());
  } catch (e) {
    if (e instanceof StoreNotConfiguredError) return Response.json({ error: e.message }, { status: 503 });
    console.error(e);
    return Response.json({ error: "Falha ao ler as respostas" }, { status: 500 });
  }
}
