import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronsUpDown, MoreHorizontal, Plus, SquarePen } from "lucide-react";

import { cn } from "@/lib/utils";
import { MurdockAppIcon } from "@/components/proto/MurdockLogo";
import {
  favorites,
  initialHabits,
  privatePages,
  quickAccess,
  tagClasses,
  type PageNode,
} from "@/lib/proto-data";

export function HomeScreen() {
  const [habits, setHabits] = useState(initialHabits);
  const doneCount = habits.filter((h) => h.done).length;

  return (
    <div className="pb-8">
      {/* Topo */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-2.5 backdrop-blur">
        <button type="button" className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent">
          <MurdockAppIcon className="size-8" />
          <span className="text-[15px] font-semibold">Murdock Assistent</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button type="button" aria-label="Mais opções" className="rounded-md p-1.5 hover:bg-accent">
            <MoreHorizontal className="size-5" />
          </button>
          <button type="button" aria-label="Nova página" className="rounded-md p-1.5 hover:bg-accent">
            <SquarePen className="size-5" />
          </button>
        </div>
      </header>

      {/* Saudação */}
      <section className="px-5 pb-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Quinta, 29 de outubro
        </p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Boa tarde, Gabriel</h1>
      </section>

      {/* Acesso rápido */}
      <SectionLabel>Acesso rápido</SectionLabel>
      <div className="no-scrollbar flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-6 pt-2">
        {quickAccess.map((q) => {
          const card = (
            <>
              <div className={cn("h-11 w-full", tagClasses[q.color])} />
              <div className="px-3 pb-3">
                <span className="-mt-4 block text-2xl leading-none">{q.icon}</span>
                <p className="mt-2 truncate text-sm font-semibold">{q.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{q.edited}</p>
              </div>
            </>
          );
          const cls =
            "block w-36 shrink-0 snap-start overflow-hidden rounded-xl bg-card text-left shadow-card transition-transform active:scale-[0.98]";
          return q.to ? (
            <Link key={q.id} to={q.to} className={cls}>
              {card}
            </Link>
          ) : (
            <button key={q.id} type="button" className={cls}>
              {card}
            </button>
          );
        })}
      </div>

      {/* Hábitos */}
      <div className="flex items-center justify-between pr-5">
        <SectionLabel>Hábitos de hoje</SectionLabel>
        <span className="text-xs font-medium text-muted-foreground">
          {doneCount}/{habits.length}
        </span>
      </div>
      <div className="mx-5 mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-tag-green-foreground transition-all duration-500"
          style={{ width: `${(doneCount / habits.length) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 px-5 pb-6 pt-3">
        {habits.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() =>
              setHabits((prev) => prev.map((x) => (x.id === h.id ? { ...x, done: !x.done } : x)))
            }
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              h.done
                ? "border-transparent bg-tag-green text-tag-green-foreground"
                : "border-border bg-card text-foreground hover:bg-accent",
            )}
          >
            <span className="text-base leading-none">{h.icon}</span>
            <span className={cn("flex-1 truncate font-medium", h.done && "line-through decoration-1")}>
              {h.label}
            </span>
          </button>
        ))}
      </div>

      {/* Árvore de páginas */}
      <SectionLabel>Favoritos</SectionLabel>
      <div className="px-2 pb-5 pt-1">
        {favorites.map((p) => (
          <TreeRow key={p.id} node={p} depth={0} />
        ))}
      </div>

      <div className="flex items-center justify-between pr-4">
        <SectionLabel>Privado</SectionLabel>
        <button type="button" aria-label="Adicionar página" className="rounded p-1 text-muted-foreground hover:bg-accent">
          <Plus className="size-4" />
        </button>
      </div>
      <div className="px-2 pt-1">
        {privatePages.map((p) => (
          <TreeRow key={p.id} node={p} depth={0} defaultOpen={p.id === "diario"} />
        ))}
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[15px] text-muted-foreground hover:bg-accent"
        >
          <Plus className="size-4" />
          Nova página
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="px-5 text-xs font-semibold text-muted-foreground">{children}</h2>;
}

function TreeRow({ node, depth, defaultOpen = false }: { node: PageNode; depth: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!node.children?.length;

  const label = (
    <>
      <span className="text-[17px] leading-none">{node.icon}</span>
      <span className="truncate">{node.title}</span>
    </>
  );
  const labelCls = "flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left";

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-md pr-2 text-[15px] hover:bg-accent active:bg-accent"
        style={{ paddingLeft: `${depth * 18 + 4}px` }}
      >
        <button
          type="button"
          aria-label={open ? "Recolher" : "Expandir"}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-secondary",
            !hasChildren && "invisible",
          )}
        >
          <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
        </button>
        {node.to ? (
          <Link to={node.to} className={labelCls}>
            {label}
          </Link>
        ) : (
          <button type="button" onClick={() => hasChildren && setOpen((o) => !o)} className={labelCls}>
            {label}
          </button>
        )}
        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      </div>
      {open && hasChildren && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
          {node.children!.map((c) => (
            <TreeRow key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
