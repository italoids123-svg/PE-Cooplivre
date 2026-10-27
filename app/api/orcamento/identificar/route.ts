import { respostaDeErro } from "@/lib/api-erros";
import { getStoreOrc } from "@/lib/orcamento/store";
import { validarIdentificacao } from "@/lib/orcamento/validar";

// Identificação por nome + cargo + cidade, sem lista de acesso nesta etapa.
// O id vem do nome normalizado: a mesma pessoa, em qualquer aparelho, retoma a revisão.
export async function POST(request: Request) {
  try {
    const dados = validarIdentificacao(await request.json().catch(() => null));
    const { participante, retomou } = await getStoreOrc().identificar(dados);
    return Response.json({ participante, retomou });
  } catch (e) {
    return respostaDeErro(e, "Não foi possível entrar agora. Tente novamente.");
  }
}
