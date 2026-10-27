import { respostaDeErro } from "@/lib/api-erros";
import { getStoreOrc } from "@/lib/orcamento/store";
import { participanteId, validarRevisao, visao } from "@/lib/orcamento/validar";
import { ValidationError } from "@/lib/validate";

// Revisões da pessoa numa visão (global / agência).
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pid = participanteId(url.searchParams.get("pid"));
    const revisoes = await getStoreOrc().revisoesDe(pid, visao(url.searchParams.get("visao")));
    return Response.json({ revisoes }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível carregar suas contribuições.");
  }
}

// Grava o estado de linhas: sem contribuição, com contribuições, ou pendente (status null).
// Aceita uma linha ({ linhaId, ... }) ou várias ({ itens: [...] }, ex.: marcar o bloco inteiro).
export async function PUT(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const pid = participanteId(body?.participanteId);
    const brutos = Array.isArray(body?.itens) ? (body.itens as unknown[]) : [body];
    if (brutos.length > 200) throw new ValidationError("Linhas demais de uma vez.");
    const itens = brutos.map((x) => validarRevisao(x, pid));
    const store = getStoreOrc();
    const p = await store.participante(pid);
    if (!p) throw new ValidationError("Identifique-se novamente para continuar.");
    // Chaves distintas (uma por linha): gravar em paralelo não disputa.
    await Promise.all(itens.map(({ visao: vis, linhaId, revisao }) => store.gravar(p, vis, linhaId, revisao)));
    return Response.json({ ok: true, revisoes: itens.map((x) => x.revisao) });
  } catch (e) {
    return respostaDeErro(e);
  }
}
