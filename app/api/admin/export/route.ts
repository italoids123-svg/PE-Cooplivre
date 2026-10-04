import { checarAdmin } from "@/lib/admin-auth";
import { montarPlanilha } from "@/lib/export";
import { getStore, StoreNotConfiguredError } from "@/lib/store";

// Base completa em .xlsx. POST (e não GET) para a chave ir no header, nunca na URL.
export async function POST(request: Request) {
  const negado = checarAdmin(request);
  if (negado) return negado;
  try {
    const buf = await montarPlanilha(await getStore().tudo());
    const nome = `mapa-estrategico-contribuicoes-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.xlsx`;
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nome}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof StoreNotConfiguredError) return Response.json({ error: e.message }, { status: 503 });
    console.error(e);
    return Response.json({ error: "Falha ao gerar a planilha" }, { status: 500 });
  }
}
