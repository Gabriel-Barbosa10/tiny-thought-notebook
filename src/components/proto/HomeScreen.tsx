import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Lightbulb,
  ListChecks,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Settings,
  Sprout,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MurdockAppIcon } from "@/components/proto/MurdockLogo";
import { favorites, initialHabits, initialTasks, privatePages, quickAccess, type PageNode } from "@/lib/proto-data";

const actions = [
  { id: "nota", label: "Nova nota", icon: NotebookPen },
  { id: "diario", label: "Diário", icon: BookOpen },
  { id: "tarefa", label: "Tarefas", icon: ListChecks, to: "/tarefas" as const },
  { id: "habito", label: "Hábito", icon: Sprout },
  { id: "meta", label: "Metas", icon: Target },
  { id: "ideia", label: "Ideia", icon: Lightbulb },
];

export function HomeScreen() {
  const [habits, setHabits] = useState(initialHabits);
  const [hidden, setHidden] = useState(false);
  const doneCount = habits.filter((h) => h.done).length;
  const pending = initialTasks.filter((t) => t.status !== "done").length;
  const today = initialTasks.filter((t) => t.due === "Hoje" && t.status !== "done").length;

  return (
    <div className="pb-8">
      {/* Topo grafite, no estilo do Nubank */}
      <header className="bg-brand px-5 pb-6 pt-3 text-brand-foreground">
        <div className="flex items-center justify-between">
          <MurdockAppIcon className="size-12 ring-1 ring-brand-raised" />
          <div className="flex items-center gap-1">
            <HeaderIcon label={hidden ? "Mostrar números" : "Esconder números"} onClick={() => setHidden((h) => !h)}>
              {hidden ? <EyeOff className="size-[22px]" /> : <Eye className="size-[22px]" />}
            </HeaderIcon>
            <HeaderIcon label="Ajuda">
              <CircleHelp className="size-[22px]" />
            </HeaderIcon>
            <HeaderIcon label="Configurações">
              <Settings className="size-[22px]" />
            </HeaderIcon>
          </div>
        </div>
        <h1 className="mt-6 text-[22px] font-bold tracking-tight">Olá, Gabriel</h1>
        <p className="mt-0.5 text-sm text-brand-muted">Quinta, 29 de outubro</p>
      </header>

      {/* Resumo do dia */}
      <Link to="/tarefas" className="flex items-center justify-between px-5 pb-1 pt-6">
        <div>
          <p className="text-[17px] font-bold">Tarefas</p>
          <p className="mt-2 text-[26px] font-bold tracking-tight">
            {hidden ? "••••" : `${pending} pendentes`}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {hidden ? "•• para hoje" : `${today} para hoje`}
          </p>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" />
      </Link>

      {/* Atalhos em círculo */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-2 pt-6">
        {actions.map((a) => {
          const inner = (
            <>
              <span className="flex size-[68px] items-center justify-center rounded-full bg-surface text-foreground transition-colors group-active:bg-surface-strong">
                <a.icon className="size-6" strokeWidth={1.9} />
              </span>
              <span className="text-[13px] font-semibold">{a.label}</span>
            </>
          );
          const cls = "group flex w-[68px] shrink-0 flex-col items-center gap-2 text-center";
          return a.to ? (
            <Link key={a.id} to={a.to} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={a.id} type="button" className={cls}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Pílula estilo "Meus cartões" */}
      <div className="px-5 pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-4 text-left text-[15px] font-semibold active:bg-surface-strong"
        >
          <NotebookPen className="size-5" />
          Escrever no diário de hoje
        </button>
      </div>

      {/* Cartões de acesso rápido */}
      <div className="no-scrollbar flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-6 pt-3">
        {quickAccess.map((q) => {
          const card = (
            <>
              <span className="text-xl leading-none">{q.icon}</span>
              <p className="mt-3 text-[14px] font-semibold leading-snug">{q.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{q.edited}</p>
            </>
          );
          const cls =
            "block w-[150px] shrink-0 snap-start rounded-2xl bg-surface p-4 text-left transition-transform active:scale-[0.98]";
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

      <Divider />

      {/* Hábitos */}
      <section className="px-5 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Hábitos de hoje</h2>
          <span className="text-sm font-semibold text-muted-foreground">
            {doneCount} de {habits.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${(doneCount / habits.length) * 100}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {habits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() =>
                setHabits((prev) => prev.map((x) => (x.id === h.id ? { ...x, done: !x.done } : x)))
              }
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition-colors",
                h.done ? "bg-brand text-brand-foreground" : "bg-surface text-foreground active:bg-surface-strong",
              )}
            >
              <span className="text-base leading-none">{h.icon}</span>
              <span className={cn("flex-1 truncate", h.done && "line-through decoration-1 opacity-80")}>{h.label}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* Páginas */}
      <section className="pt-6">
        <h2 className="px-5 text-[17px] font-bold">Favoritos</h2>
        <div className="px-2 pb-4 pt-2">
          {favorites.map((p) => (
            <TreeRow key={p.id} node={p} depth={0} />
          ))}
        </div>
      </section>

      <Divider />

      <section className="pt-6">
        <div className="flex items-center justify-between pr-4">
          <h2 className="px-5 text-[17px] font-bold">Minhas páginas</h2>
          <button
            type="button"
            aria-label="Adicionar página"
            className="flex size-8 items-center justify-center rounded-full bg-surface text-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="px-2 pt-2">
          {privatePages.map((p) => (
            <TreeRow key={p.id} node={p} depth={0} defaultOpen={p.id === "diario"} />
          ))}
        </div>
        <div className="px-5 pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[15px] font-semibold text-brand-foreground active:opacity-90"
          >
            <Plus className="size-4" />
            Nova página
          </button>
        </div>
      </section>
    </div>
  );
}

function HeaderIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full text-brand-foreground hover:bg-brand-raised"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
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
  const labelCls = "flex min-w-0 flex-1 items-center gap-3 py-2.5 text-left";

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-xl pr-2 text-[15px] font-medium hover:bg-surface active:bg-surface"
        style={{ paddingLeft: `${depth * 18 + 4}px` }}
      >
        <button
          type="button"
          aria-label={open ? "Recolher" : "Expandir"}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-strong",
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
