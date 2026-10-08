import type { NextRequest } from "next/server";
import { pilaresDe, responsavelPorId } from "@/lib/acesso";
import { AcessoNegadoError, respostaDeErro } from "@/lib/api-erros";
import { getStore } from "@/lib/store";
import { participanteId, validarParticipante, validarResposta, ValidationError } from "@/lib/validate";

// Estado salvo do próprio participante: respostas, envio e pilares que ele revisa.
export async function GET(request: NextRequest) {
  try {
    const pid = participanteId(request.nextUrl.searchParams.get("pid"));
    const store = getStore();
    const [participante, respostas] = await Promise.all([store.participante(pid), store.respostasDe(pid)]);
    return Response.json({ participante, respostas, pilares: pilaresDe(pid) });
  } catch (e) {
    return respostaDeErro(e, "Falha ao carregar suas respostas");
  }
}

// Salva um pilar. Só aceita pilares sob responsabilidade da pessoa.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { participante?: unknown; respostas?: unknown } | null;
    const enviado = validarParticipante(body?.participante);
    const pessoa = responsavelPorId(enviado.id);
    if (!pessoa) throw new AcessoNegadoError("Seu acesso não foi reconhecido. Saia e entre novamente com seu nome.");
    // Nome sempre o da lista: o cliente não consegue gravar com outro nome.
    const participante = { ...enviado, nome: pessoa.nome };
    const lista = Array.isArray(body?.respostas) ? body.respostas : [];
    if (lista.length > 50) throw new ValidationError("Respostas demais em um envio");
    const respostas = lista.map((r) => validarResposta(r, participante.id));
    const fora = respostas.find((r) => !pessoa.pilares.includes(r.pilar));
    if (fora) throw new AcessoNegadoError("Você não tem acesso a este pilar.");
    const store = getStore();
    const resultado = await store.salvar(participante, respostas);
    // Pilar salvo: o que estava "em edição" virou resposta. Falha aqui não desfaz o salvamento.
    await store.apagarRascunhos(participante.id, respostas.map((r) => r.objetivoId)).catch((e) => console.error(e));
    return Response.json(resultado);
  } catch (e) {
    return respostaDeErro(e);
  }
}
