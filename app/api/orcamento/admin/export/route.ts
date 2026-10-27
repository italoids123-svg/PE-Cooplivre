import { checarAdmin } from "@/lib/admin-auth";
import { respostaDeErro } from "@/lib/api-erros";
import { montarPlanilhaOrc } from "@/lib/orcamento/export";
import { getStoreOrc } from "@/lib/orcamento/store";

// Base de contribuições em .xlsx. POST para a chave ir no header, nunca na URL.
export async function POST(request: Request) {
  const negado = checarAdmin(request);
  if (negado) return negado;
  try {
    const buf = await montarPlanilhaOrc(await getStoreOrc().tudo());
    const nome = `orcamento-2027-contribuicoes-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.xlsx`;
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nome}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return respostaDeErro(e, "Falha ao gerar a planilha");
  }
}
