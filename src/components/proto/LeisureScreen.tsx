import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Clapperboard, Gamepad2, ListPlus, Play, Trash2, Trophy, Tv } from "lucide-react";

import {
  KNOWN_TEAMS,
  SUGGESTIONS,
  UPDATED_AT,
  WEEKDAYS_SHORT,
  fmtDayMonth,
  setCentral,
  uid,
  upcomingGames,
  useCentral,
  type LeisureCategory,
  type LeisureItem,
  type LeisureStatus,
} from "@/lib/central-store";
import {
  Chip,
  ChipRow,
  ConfirmDialog,
  EmptyState,
  Fab,
  Field,
  FormSheet,
  IconButton,
  Loading,
  ScreenHeader,
  SectionTitle,
  SourceLine,
  Stars,
  Tag,
  useFakeLoading,
  useSnackbar,
} from "@/components/proto/ui";

const CATEGORIES: LeisureCategory[] = ["Games", "Filmes", "Séries", "Futebol", "Outro"];
const FILTERS = ["Todos", ...CATEGORIES] as const;
const STATUSES: LeisureStatus[] = ["Quero ver", "Em andamento", "Concluído"];

export function LeisureScreen() {
  const s = useCentral();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todos");
  const [editing, setEditing] = useState<LeisureItem | "new" | null>(null);
  const snack = useSnackbar();

  const showGames = filter === "Todos" || filter === "Futebol";
  const showMovies = filter === "Todos" || filter === "Filmes" || filter === "Séries";
  const items = s.leisure.filter((l) => filter === "Todos" || l.category === filter);

  const setStatus = (id: string, status: LeisureStatus) =>
    setCentral((st) => ({ leisure: st.leisure.map((l) => (l.id === id ? { ...l, status } : l)) }));

  return (
    <div className="pb-32">
      <ScreenHeader title="Lazer" back="/areas" />
      <ChipRow options={FILTERS} value={filter} onChange={setFilter} className="pt-1" />

      {showGames && <GamesSection />}
      {showMovies && (
        <MoviesSection
          filter={filter === "Filmes" || filter === "Séries" ? filter : null}
          onAdded={(title) => snack.show(`${title} adicionado a 'Quero ver'`)}
        />
      )}

      <section className="pt-7">
        <SectionTitle>Minha lista</SectionTitle>
        {items.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="Nada por aqui ainda"
            text="Toque em + para anotar um game, filme, série ou jogo que quer acompanhar."
          />
        ) : (
          STATUSES.map((st) => {
            const group = items.filter((i) => i.status === st);
            if (!group.length) return null;
            return (
              <div key={st} className="pt-4">
                <p className="flex items-center justify-between px-5 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {st}
                  <span>{group.length}</span>
                </p>
                <ul className="divide-y divide-border">
                  {group.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 px-5 py-3">
                      <button type="button" onClick={() => setEditing(i)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-[15px] font-semibold">{i.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          {i.category}
                          {i.rating > 0 && <Stars value={i.rating} />}
                        </p>
                      </button>
                      {st === "Quero ver" && (
                        <IconButton label="Começar" onClick={() => setStatus(i.id, "Em andamento")} className="bg-surface">
                          <Play className="size-4 fill-current" />
                        </IconButton>
                      )}
                      {st === "Em andamento" && (
                        <IconButton label="Marcar como concluído" onClick={() => setStatus(i.id, "Concluído")} className="bg-surface">
                          <Check className="size-4" strokeWidth={2.6} />
                        </IconButton>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>

      <Fab label="Novo item" onClick={() => setEditing("new")} />
      {snack.node}
      {editing && <ItemForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function GamesSection() {
  const { settings } = useCentral();
  const [loading, refetch] = useFakeLoading(1000);
  const team = settings.team.trim();
  const known = KNOWN_TEAMS.find((t) => t.toLowerCase() === team.toLowerCase());
  const games = known ? upcomingGames(known) : [];

  return (
    <section className="pt-6">
      <SectionTitle>Próximos jogos{known ? ` · ${known}` : ""}</SectionTitle>
      <SourceLine
        className="px-5"
        text={`TheSportsDB · às ${UPDATED_AT}`}
        onRefresh={team ? () => refetch() : undefined}
        refreshLabel="Buscar jogos de novo"
      />
      <div className="px-5">
        {!team ? (
          <Link to="/configuracoes" className="block rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
            Informe seu time em Configurações → Lazer.
          </Link>
        ) : loading ? (
          <Loading text="Buscando os jogos…" className="py-3" />
        ) : !known ? (
          <p className="rounded-2xl bg-tag-red p-4 text-sm font-medium text-tag-red-foreground">
            Não encontrei o time "{team}". Confira o nome em Configurações.
          </p>
        ) : games.length === 0 ? (
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted-foreground">Nenhum jogo marcado por enquanto.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {games.map((g) => (
              <li key={g.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 text-lg leading-none">⚽</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">
                    {g.home} x {g.away}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Tag color="green">{g.league}</Tag>
                    <span className="text-xs text-muted-foreground">
                      {WEEKDAYS_SHORT[g.when.getDay()]}, {fmtDayMonth(g.when)} · {g.time}
                      {g.tv ? ` · ${g.tv}` : ""}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {known && !loading && <p className="mt-2 text-[11px] text-muted-foreground">Horários de Brasília.</p>}
      </div>
    </section>
  );
}

function MoviesSection({ filter, onAdded }: { filter: "Filmes" | "Séries" | null; onAdded: (t: string) => void }) {
  const s = useCentral();
  const [loading, refetch] = useFakeLoading(1000);
  const hasKey = !!s.settings.tmdbKey.trim();
  const list = SUGGESTIONS.filter((x) => !filter || x.type === filter);
  const inList = (title: string) => s.leisure.some((l) => l.title === title);

  const add = (title: string, type: "Filmes" | "Séries") => {
    setCentral((st) => ({
      leisure: [...st.leisure, { id: uid("l"), title, category: type, status: "Quero ver", rating: 0, notes: "" }],
    }));
    onAdded(title);
  };

  return (
    <section className="pt-7">
      <SectionTitle>Filmes e séries</SectionTitle>
      <SourceLine
        className="px-5"
        text={`TMDB · às ${UPDATED_AT}`}
        onRefresh={hasKey ? () => refetch() : undefined}
        refreshLabel="Buscar sugestões de novo"
      />
      <div className="px-5">
        {!hasKey ? (
          <Link to="/configuracoes" className="block rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
            Para ver estreias e sugestões, crie uma chave grátis no TMDB e cole em Configurações → Lazer.
          </Link>
        ) : loading ? (
          <Loading text="Buscando filmes e séries…" className="py-3" />
        ) : (
          <ul className="space-y-2.5">
            {list.map((m) => {
              const added = inList(m.title);
              const Icon = m.type === "Filmes" ? Clapperboard : Tv;
              return (
                <li key={m.id} className="flex items-start gap-3 rounded-2xl border border-border p-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-bold">{m.title}</p>
                      <Tag color={m.badge === "Estreia" ? "orange" : "blue"}>{m.badge}</Tag>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">{m.meta}</p>
                    <p className="mt-1 text-sm">{m.blurb}</p>
                  </div>
                  <IconButton
                    label={added ? "Já está em 'Quero ver'" : "Adicionar a 'Quero ver'"}
                    onClick={() => !added && add(m.title, m.type)}
                    className={added ? "bg-brand text-brand-foreground hover:bg-brand" : "bg-surface"}
                  >
                    {added ? <Check className="size-4" strokeWidth={2.6} /> : <ListPlus className="size-4" />}
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Trophy className="mt-0.5 size-3 shrink-0 opacity-0" aria-hidden />
          Dados de filmes e séries do TMDB. Este app usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
        </p>
      </div>
    </section>
  );
}

function ItemForm({ item, onClose }: { item: LeisureItem | null; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState<LeisureCategory>(item?.category ?? "Filmes");
  const [status, setStatus] = useState<LeisureStatus>(item?.status ?? "Quero ver");
  const [rating, setRating] = useState(item?.rating ?? 0);
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    if (!title.trim()) return setError("Dê um título ao item");
    const data = { title: title.trim(), category, status, rating, notes };
    setCentral((s) => ({
      leisure: item ? s.leisure.map((l) => (l.id === item.id ? { ...l, ...data } : l)) : [...s.leisure, { id: uid("l"), ...data }],
    }));
    onClose();
  };

  return (
    <FormSheet
      title={item ? "Editar item" : "Novo item"}
      onClose={onClose}
      onSave={save}
      extraActions={
        item && (
          <IconButton label="Excluir item" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-5" />
          </IconButton>
        )
      }
    >
      <div className="space-y-5">
        <Field label="Título" value={title} onChange={(v) => { setTitle(v); setError(null); }} placeholder="Ex.: Ruptura, Zelda, Fla x Flu" error={error} />
        <ChipGroup label="Categoria" options={CATEGORIES} value={category} onChange={setCategory} />
        <ChipGroup label="Andamento" options={STATUSES} value={status} onChange={setStatus} />
        <div>
          <span className="text-sm font-semibold">Nota</span>
          <div className="mt-1">
            <Stars value={rating} onChange={setRating} size="lg" />
          </div>
        </div>
        <Field label="Observações" multiline value={notes} onChange={setNotes} placeholder="Onde assistir, plataforma, temporada, com quem..." />
      </div>
      {confirmDelete && item && (
        <ConfirmDialog
          title={`Excluir ${item.title}?`}
          text="O item sai da sua lista de lazer."
          action="Excluir"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setCentral((s) => ({ leisure: s.leisure.filter((l) => l.id !== item.id) }));
            onClose();
          }}
        />
      )}
    </FormSheet>
  );
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={value === o} onClick={() => onChange(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export const _unused = useMemo;
