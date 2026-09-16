"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Diário" },
  { href: "/treino", label: "Treino" },
  { href: "/dieta", label: "Dieta" },
  { href: "/semana", label: "Semana" },
  { href: "/financeiro", label: "Finanças" },
  { href: "/roda", label: "Roda" },
  { href: "/perfil", label: "Perfil" },
];

/** Pílula flutuante — o site trata tudo que é acionável como pílula. */
export default function Nav() {
  const path = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 px-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <ul
        className="mx-auto flex max-w-md gap-1 rounded-full border p-1.5 backdrop-blur"
        style={{
          borderColor: "var(--line-2)",
          background: "color-mix(in srgb, var(--panel) 92%, transparent)",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.1)",
        }}
      >
        {ITEMS.map((it) => {
          const active = path === it.href;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 items-center justify-center rounded-full px-0.5 text-[11px] font-semibold"
                style={{
                  letterSpacing: "-0.24px",
                  color: active ? "var(--action-ink)" : "var(--body-2)",
                  background: active ? "var(--action)" : "transparent",
                  transition: "background-color 150ms ease, color 150ms ease",
                }}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
