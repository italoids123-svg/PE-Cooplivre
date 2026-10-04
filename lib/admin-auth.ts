import "server-only";
import { timingSafeEqual } from "node:crypto";

// null = autorizado; senão, a Response de erro a devolver.
export function checarAdmin(request: Request): Response | null {
  const esperado = process.env.ADMIN_KEY;
  if (!esperado) {
    return Response.json({ error: "Defina a variável de ambiente ADMIN_KEY para liberar o painel." }, { status: 503 });
  }
  const recebido = request.headers.get("x-admin-key") ?? "";
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Chave inválida" }, { status: 401 });
  }
  return null;
}
