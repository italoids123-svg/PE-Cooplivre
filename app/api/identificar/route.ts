import { reconhecer } from "@/lib/acesso";
import { AcessoNegadoError, respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { ValidationError } from "@/lib/validate";

// Identificação por nome: só entra quem está na lista de responsáveis (lib/acesso.ts).
// O id da revisão é o da pessoa na lista, então qualquer grafia aceita — em qualquer
// aparelho — cai sempre na mesma revisão.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { nome?: unknown; cargo?: unknown } | null;
    const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
    const cargo = typeof body?.cargo === "string" ? body.cargo.trim().slice(0, 120) : "";
    if (!cargo) throw new ValidationError("Informe seu cargo.");
    const r = reconhecer(nome);
    if (!r.ok) {
      if (r.motivo === "nao-encontrado") throw new AcessoNegadoError(r.mensagem);
      throw new ValidationError(r.mensagem);
    }
    const store = getStore();
    const existente = await store.participante(r.pessoa.id);
    const { participante } = await store.salvar(
      { id: r.pessoa.id, nome: r.pessoa.nome, cargo, atualizadoEm: new Date().toISOString() },
      [],
    );
    return Response.json({ participante, pilares: r.pessoa.pilares, retomou: !!existente });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível entrar agora. Tente novamente.");
  }
}
