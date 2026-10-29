import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BatteryFull, CheckSquare, Home, Search, Signal, Wifi, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { favorites, flattenPages, privatePages } from "@/lib/proto-data";

export function PhoneShell({
  children,
  statusTone = "default",
}: {
  children: ReactNode;
  /** "brand" pinta a barra de status de grafite, para telas com topo escuro. */
  statusTone?: "default" | "brand";
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="phone-stage">
      <div className="phone-frame">
        <StatusBar tone={statusTone} />
        {/* Scroll area is intentionally not positioned so sheets anchor to the frame */}
        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
        <BottomNav onSearch={() => setSearchOpen(true)} />
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </div>
    </div>
  );
}

function StatusBar({ tone }: { tone: "default" | "brand" }) {
  return (
    <div
      className={cn(
        "hidden h-11 shrink-0 items-center justify-between px-7 text-sm font-semibold sm:flex",
        tone === "brand" ? "bg-brand text-brand-foreground" : "bg-background text-foreground",
      )}
    >
      <span>13:13</span>
      <div className="flex items-center gap-1.5">
        <Signal className="size-4" />
        <Wifi className="size-4" />
        <BatteryFull className="size-5" />
      </div>
    </div>
  );
}

const navItem =
  "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold text-muted-foreground transition-colors";

function BottomNav({ onSearch }: { onSearch: () => void }) {
  return (
    <nav className="flex shrink-0 border-t border-border bg-background px-4 pb-5 pt-1.5 sm:pb-6">
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className={navItem}
        activeProps={{ className: "text-brand" }}
      >
        <Home className="size-[22px]" strokeWidth={1.8} />
        Início
      </Link>
      <button type="button" onClick={onSearch} className={navItem}>
        <Search className="size-[22px]" strokeWidth={1.8} />
        Buscar
      </button>
      <Link to="/tarefas" className={navItem} activeProps={{ className: "text-brand" }}>
        <CheckSquare className="size-[22px]" strokeWidth={1.8} />
        Tarefas
      </Link>
    </nav>
  );
}

const allPages = (() => {
  const seen = new Set<string>();
  return flattenPages([...favorites, ...privatePages]).filter((p) => {
    if (seen.has(p.title)) return false;
    seen.add(p.title);
    return true;
  });
})();

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = allPages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-background animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="hidden h-11 shrink-0 sm:block" />
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-full bg-surface px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no seu segundo cérebro…"
          className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar busca"
          className="rounded-full p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-2 py-3">
        <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
          {query ? `${results.length} resultado(s)` : "Páginas recentes"}
        </p>
        {results.map((p) => {
          const content = (
            <>
              <span className="text-lg leading-none">{p.icon}</span>
              <span className="truncate">{p.title}</span>
            </>
          );
          const cls = cn(
            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-medium hover:bg-surface active:bg-surface",
          );
          return p.to ? (
            <Link key={p.id} to={p.to} onClick={onClose} className={cls}>
              {content}
            </Link>
          ) : (
            <button key={p.id} type="button" onClick={onClose} className={cls}>
              {content}
            </button>
          );
        })}
        {results.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nada encontrado.</p>
        )}
      </div>
    </div>
  );
}
