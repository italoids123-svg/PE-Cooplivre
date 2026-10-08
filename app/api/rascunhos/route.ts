import { responsavelPorId } from "@/lib/acesso";
import { AcessoNegadoError, respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { participanteId, validarRascunho, ValidationError } from "@/lib/validate";

// Sincronização em segundo plano do que o responsável está preenchendo, para quem
// tem acesso a todos os pilares acompanhar. Não é resposta: não entra no Excel.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participanteId?: unknown; itens?: unknown } | null;
    const pid = participanteId(body?.participanteId);
    const pessoa = responsavelPorId(pid);
    if (!pessoa) throw new AcessoNegadoError("Seu acesso não foi reconhecido.");
    const lista = Array.isArray(body?.itens) ? body.itens : [];
    if (lista.length > 10) throw new ValidationError("Itens demais em uma sincronização");
    const itens = lista.map(validarRascunho);
    if (itens.some((x) => !pessoa.pilares.includes(x.pilar))) throw new AcessoNegadoError("Você não tem acesso a este pilar.");
    const store = getStore();
    // Revisão já enviada não está "em edição": ignora sem erro (o cliente não precisa saber).
    if ((await store.participante(pid))?.enviadoEm) return Response.json({ ok: true, ignorado: true });
    await store.sincronizarRascunhos(itens.map((x) => ({ participanteId: pid, ...x })));
    return Response.json({ ok: true });
  } catch (e) {
    return respostaDeErro(e, "Falha ao sincronizar");
  }
}
