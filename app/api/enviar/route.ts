import { respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { participanteId } from "@/lib/validate";

// Envio final: confere no servidor que todos os objetivos foram avaliados e trava a revisão.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participanteId?: unknown } | null;
    const participante = await getStore().enviar(participanteId(body?.participanteId));
    return Response.json({ participante });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível enviar agora. Tente novamente.");
  }
}
