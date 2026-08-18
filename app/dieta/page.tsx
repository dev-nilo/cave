"use client";

import { PageHeader, Panel, stagger } from "@/components/ui";
import { PILLARS } from "@/lib/score";
import { MEAL_DAYS, PROFILE, SUBSTITUTIONS, dayTotal, nutritionTargets } from "@/lib/meals";

const pillar = PILLARS.find((p) => p.key === "alimentacao")!;

export default function DietaPage() {
  const t = nutritionTargets();

  return (
    <div className="space-y-3">
      <PageHeader eyebrow="Plano de 7 dias" title="Dieta" />

      <section className="panel-dark rise p-5" style={stagger(1)}>
        <span className="eyebrow eyebrow-dark mb-2">Meta calculada</span>
        <p className="t-small mb-1" style={{ color: "var(--dark-ink)" }}>
          {PROFILE.alturaCm}cm · {PROFILE.pesoKg}kg · {PROFILE.idade} anos · {PROFILE.bfPercent}% BF
        </p>
        <p className="t-micro" style={{ color: "var(--dark-ink-2)" }}>
          TMB {t.bmr} kcal · manutenção ~{t.tdee} kcal (treino de força 4x/semana) · déficit leve de 300 kcal para
          emagrecer mantendo massa magra
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { label: "kcal", value: t.kcal },
            { label: "proteína", value: `${t.protein}g` },
            { label: "carbo", value: `${t.carbs}g` },
            { label: "gordura", value: `${t.fat}g` },
          ].map((x) => (
            <div key={x.label}>
              <p className="t-panel tabular-nums" style={{ color: "var(--dark-ink)" }}>
                {x.value}
              </p>
              <p className="t-micro" style={{ color: "var(--dark-ink-2)" }}>
                {x.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {MEAL_DAYS.map((day, i) => {
        const total = dayTotal(day);
        return (
          <Panel
            key={day.label}
            index={2 + i}
            eyebrow={day.label}
            title={`~${total.kcal} kcal`}
            color={pillar.color}
            right={`${total.protein}p · ${total.carbs}c · ${total.fat}g`}
          >
            <ul>
              {day.meals.map((m) => (
                <li key={m.time} className="row py-4 first:pt-0">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="eyebrow">{m.time}</span>
                    <span className="t-micro tabular-nums" style={{ color: "var(--body-3)" }}>
                      {m.kcal} kcal · {m.protein}p {m.carbs}c {m.fat}g
                    </span>
                  </div>
                  <p className="t-small mb-1.5" style={{ color: "var(--title)", fontWeight: 600 }}>
                    {m.name}
                  </p>
                  <p className="t-micro mb-1.5" style={{ color: "var(--body-2)" }}>
                    {m.portions.join(" · ")}
                  </p>
                  <p className="t-small" style={{ color: "var(--body-2)" }}>
                    {m.recipe}
                  </p>
                </li>
              ))}
            </ul>
            <p className="t-micro mt-2" style={{ color: "var(--body-3)" }}>
              {day.topUp}
            </p>
          </Panel>
        );
      })}

      <Panel index={2 + MEAL_DAYS.length} eyebrow="Flexibilidade" title="Substituições">
        <p className="t-small mb-4" style={{ color: "var(--body-2)" }}>
          Troque qualquer item por outro do mesmo grupo — as porções foram ajustadas para entregar
          aproximadamente o mesmo macro.
        </p>
        <ul className="space-y-4">
          {SUBSTITUTIONS.map((g) => (
            <li key={g.titulo}>
              <p className="eyebrow mb-1.5">{g.titulo}</p>
              <p className="t-small" style={{ color: "var(--body-2)" }}>
                {g.itens.join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
