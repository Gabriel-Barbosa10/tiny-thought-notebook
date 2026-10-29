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
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-3 py-2.5 backdrop-blur">
        <Link to="/" className="flex items-center gap-1 rounded-md px-1 py-1 text-sm text-muted-foreground hover:bg-accent">
          <ChevronLeft className="size-5" />
          <span>Projetos</span>
          <span className="px-0.5">/</span>
          <span className="text-foreground">Tarefas</span>
        </Link>
        <button type="button" aria-label="Mais opções" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
          <MoreHorizontal className="size-5" />
        </button>
      </header>

      {/* Título da página */}
      <section className="px-5 pt-3">
        <span className="text-[44px] leading-none">✅</span>
        <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight">Tarefas</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Tudo que precisa sair da cabeça.</p>
      </section>

      {/* Visualizações */}
      <div className="mt-5 flex items-center gap-1 border-b border-border px-4">
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
              "-mb-px flex items-center gap-1.5 border-b-2 px-2 py-2 text-sm font-medium transition-colors",
              view === v.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <v.icon className="size-4" />
            {v.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
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
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {statuses.map((s) => {
            const col = visible.filter((t) => t.status === s.id);
            return (
              <div key={s.id} className="w-[78%] shrink-0 snap-start rounded-xl bg-muted/70 p-2">
                <div className="flex items-center justify-between px-1.5 py-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status={s.id} />
                    <span className="text-sm text-muted-foreground">{col.length}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Nova tarefa em ${s.label}`}
                    onClick={() => setAddingTo(s.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
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
                      className="rounded-lg bg-card px-3 py-2.5 text-sm shadow-card outline-none ring-2 ring-ring/40"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingTo(s.id)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-accent"
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
            <div key={t.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-accent">
              <button
                type="button"
                aria-label={t.status === "done" ? "Desmarcar" : "Concluir"}
                onClick={() => updateTask(t.id, { status: t.status === "done" ? "todo" : "done" })}
                className={cn(
                  "flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
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
                <p className={cn("truncate text-[15px]", t.status === "done" && "text-muted-foreground line-through")}>
                  {t.title}
                </p>
              </button>
              {t.due && <span className="shrink-0 text-xs text-muted-foreground">{t.due}</span>}
            </div>
          ))}
        </div>
      )}

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
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: Status }) {
  const s = statuses.find((x) => x.id === status)!;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[13px] font-medium", tagClasses[s.color])}>
      <span className={cn("size-1.5 rounded-full", dotClasses[s.color])} />
      {s.label}
    </span>
  );
}

function TagBadge({ label, color }: { label: string; color: keyof typeof tagClasses }) {
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", tagClasses[color])}>
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
      className="w-full rounded-lg bg-card p-3 text-left shadow-card transition-transform active:scale-[0.98]"
    >
      <p className={cn("text-sm font-medium leading-snug", task.status === "done" && "text-muted-foreground")}>
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
      <div className="relative rounded-t-3xl bg-card px-5 pb-8 pt-3 shadow-sheet animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto h-1 w-10 rounded-full bg-border" />
        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-snug tracking-tight">{task.title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-md p-1 text-muted-foreground hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>

        <dl className="mt-4 space-y-1 text-sm">
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

        <p className="mt-5 text-xs font-semibold text-muted-foreground">Mover para</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {statuses.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onMove(s.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors",
                task.status === s.id
                  ? cn("border-transparent", tagClasses[s.color])
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <span className={cn("size-1.5 rounded-full", dotClasses[s.color])} />
              {s.label}
            </button>
          ))}
        </div>
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
      <dt className="flex w-32 items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
