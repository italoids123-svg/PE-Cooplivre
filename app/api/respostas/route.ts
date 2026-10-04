import type { NextRequest } from "next/server";
import { getStore, StoreNotConfiguredError } from "@/lib/store";
import { participanteId, validarParticipante, validarResposta, ValidationError } from "@/lib/validate";

function erro(e: unknown) {
  if (e instanceof ValidationError) return Response.json({ error: e.message }, { status: 400 });
  if (e instanceof StoreNotConfiguredError) return Response.json({ error: e.message }, { status: 503 });
  console.error(e);
  return Response.json({ error: "Não foi possível salvar agora. Tente novamente." }, { status: 500 });
}

// Respostas já gravadas do próprio participante (para reabrir o formulário preenchido).
export async function GET(request: NextRequest) {
  try {
    const pid = participanteId(request.nextUrl.searchParams.get("pid"));
    return Response.json({ respostas: await getStore().respostasDe(pid) });
  } catch (e) {
    return erro(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participante?: unknown; respostas?: unknown } | null;
    const participante = validarParticipante(body?.participante);
    const lista = Array.isArray(body?.respostas) ? body.respostas : [];
    if (lista.length > 50) throw new ValidationError("Respostas demais em um envio");
    const respostas = lista.map((r) => validarResposta(r, participante.id));
    const gravadas = await getStore().salvar(participante, respostas);
    return Response.json({ ok: true, respostas: gravadas });
  } catch (e) {
    return erro(e);
  }
}
