import { respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { validarParticipante } from "@/lib/validate";

// Identificação: se já existe revisão com o mesmo nome + localidade (em qualquer
// aparelho), devolve essa; senão registra uma nova com o id sugerido pelo cliente.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participante?: unknown } | null;
    return Response.json(await getStore().identificar(validarParticipante(body?.participante)));
  } catch (e) {
    return respostaDeErro(e, "Não foi possível entrar agora. Tente novamente.");
  }
}
