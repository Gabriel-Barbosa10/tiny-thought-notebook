import { useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BatteryFull, History, Home, LayoutGrid, ReceiptText, Signal, Wifi, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { setCentral, useCentral } from "@/lib/central-store";
import { LockScreen, PrivacyCover } from "@/components/proto/SecurityScreens";

export function PhoneShell({
  children,
  statusTone = "default",
}: {
  children: ReactNode;
  /** "brand" pinta a barra de status de grafite, para telas com topo escuro. */
  statusTone?: "default" | "brand";
}) {
  const s = useCentral();

  // Ao sair do app (trocar de aba/app), bloqueia na hora e mostra a capa de privacidade.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setCentral({ locked: true, lockVariant: "normal", cover: "background" });
      else setCentral((st) => (st.cover === "background" ? { cover: null } : {}));
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const hideContent = s.locked || s.cover !== null;

  return (
    <div className="phone-stage">
      <div className="phone-frame">
        <StatusBar tone={statusTone} />
        {/* Nada do conteúdo (nem janelas por cima) existe enquanto está bloqueado. */}
        {!hideContent && (
          <>
            {/* Scroll area is intentionally not positioned so sheets anchor to the frame */}
            <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
            <BottomNav />
          </>
        )}
        {s.locked && <LockScreen variant={s.lockVariant} />}
        {s.cover && <PrivacyCover kind={s.cover} />}
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

const tabs: { to: "/" | "/contas" | "/areas" | "/historico"; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/contas", label: "Contas", icon: ReceiptText },
  { to: "/areas", label: "Áreas", icon: LayoutGrid },
  { to: "/historico", label: "Histórico", icon: History },
];

function BottomNav() {
  return (
    <nav className="flex shrink-0 border-t border-border bg-background px-2 pb-5 pt-1.5 sm:pb-6">
      {tabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          activeOptions={{ exact: !!t.exact }}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold text-muted-foreground transition-colors"
          activeProps={{ className: "text-brand" }}
        >
          {({ isActive }) => (
            <>
              <t.icon
                className={cn("size-[22px]", isActive && "fill-surface-strong")}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              {t.label}
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
