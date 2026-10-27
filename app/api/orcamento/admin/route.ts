import { checarAdmin } from "@/lib/admin-auth";
import { respostaDeErro } from "@/lib/api-erros";
import { getStoreOrc } from "@/lib/orcamento/store";

// Participantes e contribuições do orçamento. Protegido por ADMIN_KEY (header x-admin-key).
export async function GET(request: Request) {
  const negado = checarAdmin(request);
  if (negado) return negado;
  try {
    const { participantes, revisoes } = await getStoreOrc().tudo();
    return Response.json({ participantes, revisoes }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return respostaDeErro(e, "Falha ao ler as contribuições");
  }
}
