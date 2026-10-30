import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, FileText, Pin, PinOff, Route as RouteIcon, Search, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TODAY,
  TRAIL_TOTAL,
  fmtDate,
  pageKindColor,
  parseISO,
  setCentral,
  toISO,
  uid,
  useCentral,
  type PageKind,
  type StudyPage,
} from "@/lib/central-store";
import { Chip, ChipRow, ConfirmDialog, EmptyState, Fab, FormSheet, IconButton, ScreenHeader, Tag } from "@/components/proto/ui";

const KINDS: PageKind[] = ["Ideia", "Anotação", "Análise de dados"];
const FILTERS = ["Todos", ...KINDS] as const;

export function StudiesScreen() {
  const s = useCentral();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todos");
  const [editing, setEditing] = useState<StudyPage | "new" | null>(null);

  const done = s.trailDone.length;
  const pct = Math.round((done / TRAIL_TOTAL) * 100);

  const list = useMemo(
    () =>
      s.pages
        .filter((p) => filter === "Todos" || p.kind === filter)
        .filter((p) => !query || `${p.title} ${p.content}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.edited.localeCompare(a.edited)),
    [s.pages, filter, query],
  );

  return (
    <div className="pb-32">
      <ScreenHeader title="Estudos" back="/areas" />

      <div className="px-5 pt-2">
        <Link to="/areas/trilha" className="flex gap-3 rounded-2xl bg-tag-blue p-4 active:opacity-90">
          <RouteIcon className="mt-0.5 size-5 shrink-0 text-tag-blue-foreground" />
          <div className="flex-1">
            <p className="text-[15px] font-bold">Trilha de Data Science</p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs font-medium text-foreground">
              {done} de {TRAIL_TOTAL} tópicos · {pct}%
            </p>
          </div>
          <ChevronRight className="size-5 self-center text-tag-blue-foreground" />
        </Link>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-2 rounded-full bg-surface px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nas páginas"
          className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <ChipRow options={FILTERS} value={filter} onChange={setFilter} className="pt-3" />

      {list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={query ? "Nada encontrado" : "Nenhuma página ainda"}
          text="Toque em + para anotar uma ideia, um resumo de estudo ou uma análise de dados."
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setEditing(p)} className="flex w-full items-start gap-3 px-5 py-3.5 text-left active:bg-surface">
                <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    {p.pinned && <Pin className="size-3.5 shrink-0 fill-current text-muted-foreground" />}
                    <span className="truncate text-[15px] font-semibold">{p.title}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <Tag color={pageKindColor[p.kind]}>{p.kind}</Tag>
                    <span className="text-xs text-muted-foreground">editada em {fmtDate(parseISO(p.edited))}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Fab label="Nova página" onClick={() => setEditing("new")} />
      {editing && <PageEditor page={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

export function PageEditor({ page, onClose }: { page: StudyPage | null; onClose: () => void }) {
  const [title, setTitle] = useState(page?.title ?? "");
  const [kind, setKind] = useState<PageKind>(page?.kind ?? "Ideia");
  const [content, setContent] = useState(page?.content ?? "");
  const [pinned, setPinned] = useState(page?.pinned ?? false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    if (!title.trim()) return setError("Dê um título à página");
    const data = { title: title.trim(), kind, content, pinned, edited: toISO(TODAY) };
    setCentral((s) => ({
      pages: page ? s.pages.map((p) => (p.id === page.id ? { ...p, ...data } : p)) : [{ id: uid("p"), ...data }, ...s.pages],
    }));
    onClose();
  };

  return (
    <FormSheet
      title=""
      onClose={onClose}
      onSave={save}
      extraActions={
        <>
          <IconButton label={pinned ? "Desafixar" : "Fixar"} onClick={() => setPinned((v) => !v)}>
            {pinned ? <PinOff className="size-5" /> : <Pin className="size-5" />}
          </IconButton>
          {page && (
            <IconButton label="Excluir página" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-5" />
            </IconButton>
          )}
        </>
      }
    >
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError(null);
        }}
        placeholder="Sem título"
        className="-mt-4 w-full bg-transparent text-[28px] font-bold leading-tight tracking-tight outline-none placeholder:text-surface-strong"
      />
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
            {k}
          </Chip>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva livremente: ideias, resumos, consultas, resultados de análises."
        className={cn(
          "mt-5 min-h-[420px] w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground",
        )}
      />
      {confirmDelete && page && (
        <ConfirmDialog
          title={`Excluir "${page.title}"?`}
          text="A página será apagada deste iPhone. Isso não pode ser desfeito."
          action="Excluir"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setCentral((s) => ({ pages: s.pages.filter((p) => p.id !== page.id) }));
            onClose();
          }}
        />
      )}
    </FormSheet>
  );
}
