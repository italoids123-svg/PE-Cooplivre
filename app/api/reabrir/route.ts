import { respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { participanteId } from "@/lib/validate";

// "Realizar ajustes": destrava a revisão enviada. Ela precisa ser reenviada.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participanteId?: unknown } | null;
    return Response.json({ participante: await getStore().reabrir(participanteId(body?.participanteId)) });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível reabrir agora. Tente novamente.");
  }
}
