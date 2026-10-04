import type { NextRequest } from "next/server";
import { respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { participanteId, validarParticipante, validarResposta, ValidationError } from "@/lib/validate";

// Estado salvo do próprio participante: respostas e se a revisão já foi enviada.
export async function GET(request: NextRequest) {
  try {
    const pid = participanteId(request.nextUrl.searchParams.get("pid"));
    const store = getStore();
    const [participante, respostas] = await Promise.all([store.participante(pid), store.respostasDe(pid)]);
    return Response.json({ participante, respostas });
  } catch (e) {
    return respostaDeErro(e, "Falha ao carregar suas respostas");
  }
}

// Salva um pilar (ou só a identificação, com respostas vazias).
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participante?: unknown; respostas?: unknown } | null;
    const participante = validarParticipante(body?.participante);
    const lista = Array.isArray(body?.respostas) ? body.respostas : [];
    if (lista.length > 50) throw new ValidationError("Respostas demais em um envio");
    const respostas = lista.map((r) => validarResposta(r, participante.id));
    return Response.json(await getStore().salvar(participante, respostas));
  } catch (e) {
    return respostaDeErro(e);
  }
}
