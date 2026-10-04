"use client";

import { useRouter } from "next/navigation";
import { AMBICAO, PILARES, type Pilar } from "@/lib/data";

const CX = 700;
const CY = 520;
const R_IN = 152;
const R_OUT = 335;
const R_TEMA = 362;
const SEG = 360 / PILARES.length;

function ponto(r: number, graus: number): [number, number] {
  const rad = (graus * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
}

function setor(a0: number, a1: number): string {
  const [x0, y0] = ponto(R_OUT, a0);
  const [x1, y1] = ponto(R_OUT, a1);
  const [x2, y2] = ponto(R_IN, a1);
  const [x3, y3] = ponto(R_IN, a0);
  const grande = a1 - a0 > 180 ? 1 : 0;
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 ${grande} 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 ${grande} 0 ${x3} ${y3}Z`;
}

function quebrar(texto: string, max = 28): string[] {
  const linhas: string[] = [];
  let atual = "";
  for (const p of texto.split(" ")) {
    if (atual && (atual + " " + p).length > max) {
      linhas.push(atual);
      atual = p;
    } else atual = atual ? `${atual} ${p}` : p;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export interface Progresso {
  salvo: boolean;
  // Há alterações digitadas e não salvas neste pilar.
  pendente: boolean;
}

export function rotuloProgresso(p: Progresso): string {
  if (p.pendente) return "alterações não salvas";
  return p.salvo ? "✓ salvo" : "a revisar";
}

function Temas({ pilar, a0 }: { pilar: Pilar; a0: number }) {
  const passo = SEG / pilar.temas.length;
  return (
    <g className="map-temas" aria-hidden="true">
      {pilar.temas.map((tema, i) => {
        const ang = a0 + passo * (i + 0.5);
        const [x, y] = ponto(R_TEMA, ang);
        const [dx, dy] = ponto(R_OUT + 12, ang);
        const s = Math.sin((ang * Math.PI) / 180);
        const c = Math.cos((ang * Math.PI) / 180);
        const anchor = s > 0.05 ? "start" : s < -0.05 ? "end" : "middle";
        // Na base do mapa os temas ficam lado a lado: uma linha só evita sobreposição.
        const linhas = c < -0.85 ? [tema] : quebrar(tema);
        const lh = 21;
        // Topo: o bloco termina no ponto; base: começa nele; laterais: centralizado.
        const y0 = c > 0.6 ? y - (linhas.length - 1) * lh : c < -0.6 ? y + lh * 0.7 : y - ((linhas.length - 1) * lh) / 2 + 6;
        return (
          <g key={tema}>
            <circle cx={dx} cy={dy} r={4} fill={pilar.cor} />
            <text x={x} y={y0} textAnchor={anchor} className="map-tema">
              {linhas.map((l, k) => (
                <tspan key={k} x={x} dy={k === 0 ? 0 : lh}>{l}</tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function MapaEstrategico({
  comTemas,
  progresso,
}: {
  comTemas: boolean;
  progresso: Record<string, Progresso> | null;
}) {
  const router = useRouter();
  const viewBox = comTemas ? "0 90 1400 870" : `${CX - R_OUT - 8} ${CY - R_OUT - 8} ${2 * R_OUT + 16} ${2 * R_OUT + 16}`;
  return (
    <svg viewBox={viewBox} className={`mapa-svg${comTemas ? " mapa-desktop" : " mapa-mobile"}`} role="group" aria-label="Mapa Estratégico Cooplivre">
      {PILARES.map((p, i) => {
        const a0 = i * SEG;
        const a1 = a0 + SEG;
        const [lx, ly] = ponto((R_IN + R_OUT) / 2, a0 + SEG / 2);
        const prog = progresso?.[p.slug];
        const abrir = () => router.push(`/pilar/${p.slug}`);
        return (
          <g key={p.slug}>
            <g
              className="seg"
              role="link"
              tabIndex={0}
              aria-label={`${p.nome}${prog ? ` — ${rotuloProgresso(prog)}` : ""}`}
              onClick={abrir}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  abrir();
                }
              }}
            >
              <path d={setor(a0, a1)} fill={p.cor} />
              <text x={lx} y={ly - 16} textAnchor="middle" className="seg-rotulo">
                <tspan x={lx}>{p.rotulo[0]}</tspan>
                <tspan x={lx} dy={27}>{p.rotulo[1]}</tspan>
              </text>
              {prog && (
                <text x={lx} y={ly + 46} textAnchor="middle" className="seg-prog">
                  {rotuloProgresso(prog)}
                </text>
              )}
            </g>
            {comTemas && <Temas pilar={p} a0={a0} />}
          </g>
        );
      })}
      <circle cx={CX} cy={CY} r={R_IN - 6} className="map-centro" />
      <text x={CX} y={CY - 62} textAnchor="middle" className="map-ambicao-rot">AMBIÇÃO</text>
      <text x={CX} y={CY - 22} textAnchor="middle" className="map-ambicao">
        {quebrar(`“${AMBICAO}”`, 26).map((l, k) => (
          <tspan key={k} x={CX} dy={k === 0 ? 0 : 28}>{l}</tspan>
        ))}
      </text>
      <text x={CX} y={CY + 92} textAnchor="middle" className="map-marca">
        <tspan className="map-marca-a">SICOOB</tspan> <tspan className="map-marca-b">COOPLIVRE</tspan>
      </text>
    </svg>
  );
}
