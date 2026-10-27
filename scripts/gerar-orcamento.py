"""Gera lib/orcamento/dados.ts a partir da planilha de planejamento orçamentário.

Uso: python3 scripts/gerar-orcamento.py "<Planejamento Orçamentário 3191 - em valores.xlsx>"

Lê a aba "Planejamento Orçamentário 3191": coluna A = bloco, B = grupo ("01 - ..."),
C = linha ("Total" marca o total do grupo), D..AA = jan/2026..dez/2027.
Os ids são derivados dos nomes: renomear uma linha na planilha muda o id e
desvincula as contribuições já gravadas nela.
"""
import json
import re
import sys
import unicodedata

import openpyxl

ABA = "Planejamento Orçamentário 3191"
MESES = 24  # D..AA
NATUREZA = {
    "Origem de Recurso": "saldo",
    "Taxas de Captações": "taxa",
    "Aplicação de Recurso": "saldo",
    "Taxas de Aplicação": "taxa",
    "DRE - Demonstração de Resultado Gerencial": "fluxo",
}
TITULO = {"DRE - Demonstração de Resultado Gerencial": "DRE – Demonstração de Resultado Gerencial"}


def slug(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def valores(ws, r, natureza):
    casas = 4 if natureza == "taxa" else 2
    out = []
    for c in range(4, 4 + MESES):
        v = ws.cell(r, c).value
        out.append(round(float(v), casas) if isinstance(v, (int, float)) else None)
    return out


def main(arquivo):
    ws = openpyxl.load_workbook(arquivo, data_only=True)[ABA]
    blocos = []
    bloco = grupo = None
    for r in range(5, ws.max_row + 1):
        a, b, c = (ws.cell(r, i).value for i in (1, 2, 3))
        a, b, c = (str(x).strip() if x is not None else None for x in (a, b, c))
        if a:
            if a not in NATUREZA:
                raise SystemExit(f"Bloco desconhecido na linha {r}: {a}")
            bloco = {"id": slug(a), "nome": TITULO.get(a, a), "natureza": NATUREZA[a], "grupos": [], "total": None}
            blocos.append(bloco)
            grupo = None
        if bloco is None:
            continue
        nat = bloco["natureza"]
        if b == "Total" and not c:
            bloco["total"] = {"id": f"{bloco['id']}/total", "nome": f"Total – {bloco['nome']}", "v": valores(ws, r, nat)}
            continue
        if b:
            m = re.match(r"^(\d+)\s*-\s*(.+)$", b)
            codigo = m.group(1) if m else None
            gid = f"{bloco['id']}/{codigo or slug(b)}"
            grupo = {"id": gid, "codigo": codigo, "nome": b if not m else f"{codigo} - {m.group(2).strip()}", "total": None, "linhas": []}
            bloco["grupos"].append(grupo)
            if c == "Total":
                grupo["total"] = {"id": f"{gid}/total", "nome": grupo["nome"], "v": valores(ws, r, nat)}
            continue
        if not c or c == "DESCRIÇÃO":
            continue
        if grupo is None:  # bloco sem grupos (Taxas de Captações)
            grupo = {"id": f"{bloco['id']}/linhas", "codigo": None, "nome": None, "total": None, "linhas": []}
            bloco["grupos"].append(grupo)
        grupo["linhas"].append({"id": f"{grupo['id']}/{slug(c)}", "nome": c, "v": valores(ws, r, nat)})

    ids = [l["id"] for bl in blocos for g in bl["grupos"] for l in ([g["total"]] if g["total"] else []) + g["linhas"]]
    ids += [bl["total"]["id"] for bl in blocos if bl["total"]]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        raise SystemExit(f"Ids duplicados: {dup}")

    # Uma linha da planilha por linha do arquivo: diffs legíveis ao regenerar.
    def linha(l, ind):
        return " " * ind + json.dumps(l, ensure_ascii=False, separators=(", ", ": "))

    partes = []
    for bl in blocos:
        gs = []
        for g in bl["grupos"]:
            itens = ",\n".join(linha(l, 8) for l in g["linhas"])
            cab = {k: g[k] for k in ("id", "codigo", "nome")}
            total = json.dumps(g["total"], ensure_ascii=False, separators=(", ", ": "))
            gs.append(
                f"    {{{json.dumps(cab, ensure_ascii=False, separators=(', ', ': '))[1:-1]},\n"
                f"      \"total\": {total},\n      \"linhas\": [\n{itens}\n      ]}}"
            )
        cab = {k: bl[k] for k in ("id", "nome", "natureza")}
        total = json.dumps(bl["total"], ensure_ascii=False, separators=(", ", ": "))
        partes.append(
            f"  {{{json.dumps(cab, ensure_ascii=False, separators=(', ', ': '))[1:-1]},\n"
            f"   \"total\": {total},\n   \"grupos\": [\n" + ",\n".join(gs) + "\n   ]}"
        )
    corpo = "[\n" + ",\n".join(partes) + "\n]"
    print(
        "// Gerado por scripts/gerar-orcamento.py a partir da aba \"Planejamento Orçamentário 3191\".\n"
        "// Não edite à mão: rode o script de novo com a planilha atualizada.\n"
        'import type { Bloco } from "./tipos";\n\n'
        "// v: jan/2026 … dez/2027 (24 posições). 2026 = realizado até ago + projeção; 2027 = orçamento.\n"
        f"export const BLOCOS: Bloco[] = {corpo};\n"
    )
    print(f"{len(blocos)} blocos, {len(ids)} linhas", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1])
