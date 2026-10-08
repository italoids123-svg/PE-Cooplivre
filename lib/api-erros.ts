import "server-only";
import { RevisaoEnviadaError, RevisaoIncompletaError, StoreNotConfiguredError } from "./store";
import { ValidationError } from "./validate";

// Pessoa fora da lista de responsáveis, ou tentando gravar em pilar que não é dela.
export class AcessoNegadoError extends Error {}

export function respostaDeErro(e: unknown, padrao = "Não foi possível salvar agora. Tente novamente."): Response {
  if (e instanceof ValidationError) return Response.json({ error: e.message }, { status: 400 });
  if (e instanceof AcessoNegadoError) return Response.json({ error: e.message }, { status: 403 });
  if (e instanceof RevisaoEnviadaError) return Response.json({ error: e.message, enviada: true }, { status: 409 });
  if (e instanceof RevisaoIncompletaError) return Response.json({ error: e.message, faltando: e.faltando }, { status: 422 });
  if (e instanceof StoreNotConfiguredError) return Response.json({ error: e.message }, { status: 503 });
  console.error(e);
  return Response.json({ error: padrao }, { status: 500 });
}
