"use client";

import { WHEEL_AREAS, type WheelArea } from "@/lib/types";

type Series = {
  label: string;
  scores: Record<WheelArea, number>;
  color: string;
  dashed?: boolean;
};

// A caixa é mais larga que alta: os rótulos laterais ("Desenvolvimento",
// "Relacionamentos") precisam de espaço fora do polígono.
const W = 360;
const H = 272;
const CX = W / 2;
const CY = H / 2;
const R = 88;

function point(i: number, value: number) {
  const angle = (Math.PI * 2 * i) / WHEEL_AREAS.length - Math.PI / 2;
  const r = (Math.max(0, Math.min(10, value)) / 10) * R;
  return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r] as const;
}

function path(scores: Record<WheelArea, number>) {
  return (
    WHEEL_AREAS.map((a, i) => {
      const [x, y] = point(i, scores[a] ?? 0);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

/** Roda da vida: um eixo por área, 0 no centro e 10 na borda. */
export default function Radar({ series }: { series: Series[] }) {
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full"
        role="img"
        aria-label={`Roda da vida, notas de 0 a 10 em ${WHEEL_AREAS.length} áreas`}
      >
        {[2, 4, 6, 8, 10].map((v) => (
          <polygon
            key={v}
            points={WHEEL_AREAS.map((_, i) => point(i, v).join(",")).join(" ")}
            fill="none"
            stroke="var(--line-2)"
            strokeWidth={1}
          />
        ))}
        {WHEEL_AREAS.map((a, i) => {
          const [x, y] = point(i, 10);
          const [lx, ly] = point(i, 11.9);
          return (
            <g key={a}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke="var(--line-2)" strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                fontSize={10}
                textAnchor={lx > CX + 2 ? "start" : lx < CX - 2 ? "end" : "middle"}
                dominantBaseline="middle"
                fill="var(--body-2)"
              >
                {a}
              </text>
            </g>
          );
        })}

        {series.map((s) => (
          <g key={s.label}>
            <path
              d={path(s.scores)}
              fill={s.dashed ? "none" : s.color}
              fillOpacity={s.dashed ? 0 : 0.16}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              strokeLinejoin="round"
            />
            {!s.dashed &&
              WHEEL_AREAS.map((a, i) => {
                const [x, y] = point(i, s.scores[a] ?? 0);
                return (
                  <circle
                    key={a}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={s.color}
                    stroke="var(--panel)"
                    strokeWidth={2}
                  >
                    <title>{`${a}: ${s.scores[a] ?? 0}/10`}</title>
                  </circle>
                );
              })}
          </g>
        ))}
      </svg>

      {series.length > 1 && (
        <figcaption className="t-micro mt-3 flex justify-center gap-5" style={{ color: "var(--body-2)" }}>
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <svg width={16} height={8} aria-hidden>
                <line
                  x1={0}
                  y1={4}
                  x2={16}
                  y2={4}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? "4 3" : undefined}
                />
              </svg>
              {s.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
