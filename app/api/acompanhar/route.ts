import type { NextRequest } from "next/server";
import { responsaveisAcompanhados, veTodos } from "@/lib/acesso";
import { AcessoNegadoError, respostaDeErro } from "@/lib/api-erros";
import { geralId, objetivosVisiveis, PILARES } from "@/lib/data";
import { getStore } from "@/lib/store";
import { CAMPOS_RESPOSTA, statusRevisao, type Acompanhamento, type ObjetivoAcompanhado, type RespostaRascunho, type ResponsavelAcompanhado } from "@/lib/types";
import { participanteId } from "@/lib/validate";

const campos = (x: RespostaRascunho): RespostaRascunho =>
  Object.fromEntries(CAMPOS_RESPOSTA.map((c) => [c, x[c]])) as unknown as RespostaRascunho;
const iguais = (a: RespostaRascunho, b: RespostaRascunho) => CAMPOS_RESPOSTA.every((c) => a[c] === b[c]);

// Evolução das revisões dos responsáveis de cada pilar. Só para quem tem acesso a
// todos os pilares (lib/acesso.ts). ?pilar=slug restringe a um pilar.
export async function GET(request: NextRequest) {
  try {
    const pid = participanteId(request.nextUrl.searchParams.get("pid"));
    if (!veTodos(pid)) throw new AcessoNegadoError("Acompanhamento disponível só para quem tem acesso a todos os pilares.");
    const filtro = request.nextUrl.searchParams.get("pilar");
    const store = getStore();
    const [{ participantes, respostas }, rascunhos] = await Promise.all([store.tudo(), store.rascunhos()]);
    const pessoas = Object.fromEntries(participantes.map((p) => [p.id, p]));
    const salvas = new Map(respostas.map((r) => [`${r.participanteId}|${r.objetivoId}`, r]));
    const editando = new Map(rascunhos.map((r) => [`${r.participanteId}|${r.objetivoId}`, r]));

    const pilares = PILARES.filter((p) => !filtro || p.slug === filtro).map((pilar) => {
      const ids = [...objetivosVisiveis(pilar).map((o) => o.id), geralId(pilar.slug)];
      const responsaveis = responsaveisAcompanhados(pilar.slug).map((resp): ResponsavelAcompanhado => {
        const pe = pessoas[resp.id];
        const objetivos: Record<string, ObjetivoAcompanhado> = {};
        let ultima: string | null = null;
        for (const oid of ids) {
          const s = salvas.get(`${resp.id}|${oid}`);
          const r = editando.get(`${resp.id}|${oid}`);
          const item: ObjetivoAcompanhado = {};
          if (s) item.salvo = { ...campos(s), atualizadoEm: s.atualizadoEm };
          if (r && !(s && iguais(r.dados, s)) && !pe?.enviadoEm) item.emEdicao = { ...campos(r.dados), atualizadoEm: r.atualizadoEm };
          for (const t of [s?.atualizadoEm, r?.atualizadoEm]) if (t && (!ultima || t > ultima)) ultima = t;
          if (item.salvo || item.emEdicao) objetivos[oid] = item;
        }
        const obrig = objetivosVisiveis(pilar).map((o) => o.id);
        return {
          id: resp.id,
          nome: resp.nome,
          acessou: !!pe,
          status: pe ? statusRevisao(pe) : null,
          salvos: obrig.filter((o) => objetivos[o]?.salvo?.avaliacao).length,
          total: obrig.length,
          emEdicao: Object.values(objetivos).filter((o) => o.emEdicao).length,
          ultimaAtividade: ultima,
          objetivos,
        };
      });
      return { slug: pilar.slug, responsaveis };
    });
    const corpo: Acompanhamento = { geradoEm: new Date().toISOString(), pilares };
    return Response.json(corpo, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return respostaDeErro(e, "Falha ao carregar o acompanhamento");
  }
}
