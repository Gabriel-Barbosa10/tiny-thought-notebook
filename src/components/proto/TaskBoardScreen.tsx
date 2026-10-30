import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  ChevronLeft,
  CircleDot,
  Flag,
  Kanban,
  List,
  MoreHorizontal,
  Plus,
  Tag,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  areas,
  dotClasses,
  initialTasks,
  priorityColor,
  statuses,
  tagClasses,
  type Status,
  type Task,
} from "@/lib/proto-data";

type View = "board" | "list";

export function TaskBoardScreen() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<View>("board");
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<Status | null>(null);
  const [draft, setDraft] = useState("");

  const visible = useMemo(
    () => tasks.filter((t) => filter === "all" || t.area === filter),
    [tasks, filter],
  );
  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const commitDraft = (status: Status) => {
    const title = draft.trim();
    if (title) {
      setTasks((prev) => [
        ...prev,
        {
          id: `t${Date.now()}`,
          title,
          status,
          area: filter === "all" ? "pessoal" : filter,
          priority: "Média",
        },
      ]);
    }
    setDraft("");
    setAddingTo(null);
  };

  return (
    <div className="pb-6">
      {/* Topo */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-3 py-2 backdrop-blur">
        <Link
          to="/areas"
          aria-label="Voltar para Áreas"
          className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-surface"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <button
          type="button"
          aria-label="Mais opções"
          className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-surface"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </header>

      {/* Título da página */}
      <section className="px-5 pt-3">
        <p className="text-sm font-semibold text-muted-foreground">Projetos</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">Tarefas</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {tasks.filter((t) => t.status !== "done").length} pendentes · tudo que precisa sair da cabeça.
        </p>
      </section>

      {/* Visualizações */}
      <div className="mx-5 mt-5 flex items-center gap-1 rounded-full bg-surface p-1">
        {(
          [
            { id: "board", label: "Quadro", icon: Kanban },
            { id: "list", label: "Lista", icon: List },
          ] as const
        ).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors",
              view === v.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <v.icon className="size-4" />
            {v.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Todas
        </FilterChip>
        {areas.map((a) => (
          <FilterChip key={a.id} active={filter === a.id} onClick={() => setFilter(a.id)}>
            <span className={cn("size-1.5 rounded-full", dotClasses[a.color])} />
            {a.label}
          </FilterChip>
        ))}
      </div>

      {view === "board" ? (
        <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
          {statuses.map((s) => {
            const col = visible.filter((t) => t.status === s.id);
            return (
              <div key={s.id} className="w-[80%] shrink-0 snap-start rounded-3xl bg-surface p-2.5">
                <div className="flex items-center justify-between px-1.5 py-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status={s.id} />
                    <span className="text-sm text-muted-foreground">{col.length}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Nova tarefa em ${s.label}`}
                    onClick={() => setAddingTo(s.id)}
                    className="flex size-8 items-center justify-center rounded-full bg-card text-foreground shadow-card"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <div className="mt-1 flex flex-col gap-2">
                  {col.map((t) => (
                    <TaskCard key={t.id} task={t} onOpen={() => setSelectedId(t.id)} />
                  ))}
                  {addingTo === s.id ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitDraft(s.id);
                        if (e.key === "Escape") {
                          setDraft("");
                          setAddingTo(null);
                        }
                      }}
                      onBlur={() => commitDraft(s.id)}
                      placeholder="Digite um nome…"
                      className="rounded-2xl bg-card px-4 py-3 text-sm shadow-card outline-none ring-2 ring-ring/50"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingTo(s.id)}
                      className="flex items-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-surface-strong"
                    >
                      <Plus className="size-4" />
                      Nova
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-3">
          {visible.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 hover:bg-surface">
              <button
                type="button"
                aria-label={t.status === "done" ? "Desmarcar" : "Concluir"}
                onClick={() => updateTask(t.id, { status: t.status === "done" ? "todo" : "done" })}
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  t.status === "done"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50",
                )}
              >
                {t.status === "done" && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 6.5l2.2 2.2L9.5 3.8" />
                  </svg>
                )}
              </button>
              <button type="button" onClick={() => setSelectedId(t.id)} className="min-w-0 flex-1 text-left">
                <p className={cn("truncate text-[15px] font-medium", t.status === "done" && "text-muted-foreground line-through")}>
                  {t.title}
                </p>
              </button>
              {t.due && <span className="shrink-0 text-xs text-muted-foreground">{t.due}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="px-5 pt-5">
        <button
          type="button"
          onClick={() => {
            setView("board");
            setAddingTo("todo");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[15px] font-semibold text-brand-foreground active:opacity-90"
        >
          <Plus className="size-4" />
          Nova tarefa
        </button>
      </div>

      {selected && (
        <TaskSheet
          task={selected}
          onClose={() => setSelectedId(null)}
          onMove={(status) => updateTask(selected.id, { status })}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
        active ? "bg-brand text-brand-foreground" : "bg-surface text-foreground hover:bg-surface-strong",
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: Status }) {
  const s = statuses.find((x) => x.id === status)!;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold", tagClasses[s.color])}>
      <span className={cn("size-1.5 rounded-full", dotClasses[s.color])} />
      {s.label}
    </span>
  );
}

function TagBadge({ label, color }: { label: string; color: keyof typeof tagClasses }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", tagClasses[color])}>
      {label}
    </span>
  );
}

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const area = areas.find((a) => a.id === task.area)!;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl bg-card p-4 text-left shadow-card transition-transform active:scale-[0.98]"
    >
      <p className={cn("text-[15px] font-semibold leading-snug", task.status === "done" && "text-muted-foreground")}>
        {task.title}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <TagBadge label={area.label} color={area.color} />
        <TagBadge label={task.priority} color={priorityColor[task.priority]} />
      </div>
      {task.due && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          {task.due}
        </p>
      )}
    </button>
  );
}

function TaskSheet({
  task,
  onClose,
  onMove,
}: {
  task: Task;
  onClose: () => void;
  onMove: (s: Status) => void;
}) {
  const area = areas.find((a) => a.id === task.area)!;
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-overlay animate-in fade-in duration-200"
      />
      <div className="relative rounded-t-[2rem] bg-card px-5 pb-8 pt-3 shadow-sheet animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto h-1 w-10 rounded-full bg-border" />
        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="text-[22px] font-bold leading-snug tracking-tight">{task.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <dl className="mt-4 space-y-1 rounded-2xl bg-surface px-4 py-2 text-sm">
          <PropRow icon={CircleDot} label="Status">
            <StatusPill status={task.status} />
          </PropRow>
          <PropRow icon={Tag} label="Área">
            <TagBadge label={area.label} color={area.color} />
          </PropRow>
          <PropRow icon={Calendar} label="Data">
            <span>{task.due ?? <span className="text-muted-foreground">Vazio</span>}</span>
          </PropRow>
          <PropRow icon={Flag} label="Prioridade">
            <TagBadge label={task.priority} color={priorityColor[task.priority]} />
          </PropRow>
        </dl>

        <p className="mt-5 text-sm font-bold">Mover para</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {statuses.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onMove(s.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold transition-colors",
                task.status === s.id ? "bg-brand text-brand-foreground" : "bg-surface text-foreground hover:bg-surface-strong",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onMove(task.status === "done" ? "todo" : "done");
            onClose();
          }}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-[15px] font-semibold text-brand-foreground active:opacity-90"
        >
          {task.status === "done" ? "Reabrir tarefa" : "Concluir tarefa"}
        </button>
      </div>
    </div>
  );
}

function PropRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center py-1.5">
      <dt className="flex w-32 items-center gap-2 font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
