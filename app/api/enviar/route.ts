import { pilaresDe, veTodos } from "@/lib/acesso";
import { AcessoNegadoError, respostaDeErro } from "@/lib/api-erros";
import { objetivosObrigatorios } from "@/lib/data";
import { getStore } from "@/lib/store";
import { participanteId } from "@/lib/validate";

// Envio final: confere no servidor que todos os objetivos dos pilares da pessoa
// foram avaliados e trava a revisão. Quem acompanha todos os pilares faz ajustes
// livres (avaliação opcional), então envia sem objetivos obrigatórios.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participanteId?: unknown } | null;
    const id = participanteId(body?.participanteId);
    const pilares = pilaresDe(id);
    if (!pilares.length) throw new AcessoNegadoError("Seu acesso não foi reconhecido.");
    const participante = await getStore().enviar(id, veTodos(id) ? [] : objetivosObrigatorios(pilares));
    return Response.json({ participante });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível enviar agora. Tente novamente.");
  }
}
