import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Loader2,
  Plus,
  RotateCw,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { tagClasses, type TagColor } from "@/lib/proto-data";
import type { CardTone } from "@/lib/central-store";

/* Cabeçalho das telas brancas: voltar + ações, título grande em negrito */
export function ScreenHeader({
  title,
  back,
  actions,
  subtitle,
}: {
  title: string;
  back?: "/" | "/areas" | "/areas/estudos" | "/contas" | undefined;
  actions?: ReactNode | undefined;
  subtitle?: ReactNode | undefined;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-background/95 px-3 backdrop-blur">
        {back ? (
          <Link
            to={back}
            aria-label="Voltar"
            className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-surface"
          >
            <ChevronLeft className="size-6" />
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">{actions}</div>
      </div>
      <div className="px-5 pb-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
      </div>
    </>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: (() => void) | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-foreground hover:bg-surface active:bg-surface-strong",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PillButton({
  children,
  onClick,
  variant = "brand",
  className,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: (() => void) | undefined;
  variant?: "brand" | "surface" | "danger" | "light" | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  type?: "button" | "submit" | undefined;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition-opacity active:opacity-85 disabled:opacity-50",
        variant === "brand" && "bg-brand text-brand-foreground",
        variant === "surface" && "bg-surface text-foreground active:bg-surface-strong",
        variant === "danger" && "bg-tag-red text-tag-red-foreground",
        variant === "light" && "bg-brand-foreground text-brand",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Tag({ color, children, className }: { color: TagColor; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold", tagClasses[color], className)}>
      {children}
    </span>
  );
}

const toneMap: Record<CardTone, { bg: string; fg: string; icon: LucideIcon }> = {
  alert: { bg: "bg-tag-red", fg: "text-tag-red-foreground", icon: AlertCircle },
  attention: { bg: "bg-tag-yellow", fg: "text-tag-yellow-foreground", icon: Clock },
  info: { bg: "bg-tag-blue", fg: "text-tag-blue-foreground", icon: CalendarDays },
  positive: { bg: "bg-tag-green", fg: "text-tag-green-foreground", icon: CheckCircle2 },
};

export function Callout({
  tone,
  title,
  children,
  icon,
  className,
}: {
  tone: CardTone;
  title?: ReactNode | undefined;
  children?: ReactNode | undefined;
  icon?: LucideIcon | undefined;
  className?: string | undefined;
}) {
  const t = toneMap[tone];
  const Icon = icon ?? t.icon;
  return (
    <div className={cn("flex gap-3 rounded-2xl p-4", t.bg, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", t.fg)} strokeWidth={2.2} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-[15px] font-bold leading-snug text-foreground">{title}</p>}
        {children && <div className="mt-0.5 text-sm leading-relaxed text-foreground">{children}</div>}
      </div>
    </div>
  );
}

export function ChipRow<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string | undefined;
}) {
  return (
    <div className={cn("no-scrollbar flex gap-2 overflow-x-auto px-5", className)}>
      {options.map((o) => (
        <Chip key={o} active={o === value} onClick={() => onChange(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        active ? "bg-brand text-brand-foreground" : "bg-surface text-foreground active:bg-surface-strong",
      )}
    >
      {children}
    </button>
  );
}

export function SourceLine({
  text,
  loading,
  loadingText,
  onRefresh,
  refreshLabel = "Atualizar",
  className,
}: {
  text: ReactNode;
  loading?: boolean | undefined;
  loadingText?: string | undefined;
  onRefresh?: (() => void) | undefined;
  refreshLabel?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {loading ? (
        <Loading text={loadingText ?? "Carregando…"} />
      ) : (
        <p className="text-xs font-medium text-muted-foreground">{text}</p>
      )}
      {onRefresh && (
        <IconButton label={refreshLabel} onClick={onRefresh} className="size-8 text-muted-foreground">
          <RotateCw className={cn("size-4", loading && "animate-spin")} />
        </IconButton>
      )}
    </div>
  );
}

export function Loading({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" />
      {text}
    </p>
  );
}

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center px-10 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface">
        <Icon className="size-7 text-muted-foreground" />
      </span>
      <p className="mt-4 text-[17px] font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

/** Botão flutuante +, preso à moldura do celular, acima da barra inferior. */
export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="absolute bottom-24 right-5 z-20 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-phone active:scale-95"
    >
      <Plus className="size-6" strokeWidth={2.4} />
    </button>
  );
}

/** Aviso no rodapé. Some em 5 s e deixa espaço para o botão +. */
export function useSnackbar() {
  const [snack, setSnack] = useState<{ id: number; text: string; undo?: (() => void) | undefined } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, undo?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setSnack({ id: Date.now(), text, undo });
    timer.current = setTimeout(() => setSnack(null), 5000);
  }, []);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const node = snack ? (
    <div
      key={snack.id}
      role="status"
      className="absolute bottom-24 left-4 right-24 z-30 flex items-center gap-3 rounded-2xl bg-brand px-4 py-3 text-sm text-brand-foreground shadow-phone animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <span className="flex-1 leading-snug">{snack.text}</span>
      {snack.undo && (
        <button
          type="button"
          onClick={() => {
            snack.undo?.();
            setSnack(null);
          }}
          className="shrink-0 font-bold text-brand-muted"
        >
          Desfazer
        </button>
      )}
    </div>
  ) : null;

  return { show, node };
}

export function ConfirmDialog({
  title,
  text,
  action,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  action: string;
  danger?: boolean | undefined;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[45] flex items-center justify-center bg-overlay p-7 animate-in fade-in duration-150">
      <div role="alertdialog" aria-label={title} className="w-full rounded-3xl bg-background p-6 shadow-phone animate-in zoom-in-95 duration-150">
        <p className="text-[19px] font-bold leading-snug">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
        <div className="mt-6 flex gap-2">
          <PillButton variant="surface" className="flex-1" onClick={onCancel}>
            Cancelar
          </PillButton>
          <PillButton variant={danger ? "danger" : "brand"} className="flex-1" onClick={onConfirm}>
            {action}
          </PillButton>
        </div>
      </div>
    </div>
  );
}

/** Tela de formulário por cima do conteúdo (some se o app bloquear). */
export function FormSheet({
  title,
  onClose,
  onSave,
  extraActions,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  extraActions?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 top-0 z-30 flex flex-col bg-background animate-in fade-in slide-in-from-bottom-4 duration-200 sm:top-11">
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <IconButton label="Cancelar" onClick={onClose}>
          <X className="size-5" />
        </IconButton>
        <div className="flex items-center gap-1">
          {extraActions}
          <button
            type="button"
            onClick={onSave}
            className="ml-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground active:opacity-85"
          >
            Salvar
          </button>
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
        {title && <h1 className="pb-4 text-[28px] font-bold leading-tight tracking-tight">{title}</h1>}
        {children}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl bg-surface px-4 py-3.5 text-[15px] outline-none ring-ring placeholder:text-muted-foreground focus:ring-2";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error,
  prefix,
  suffix,
  inputMode,
  multiline,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string | undefined;
  helper?: string | undefined;
  error?: string | null | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  inputMode?: "text" | "decimal" | "numeric" | undefined;
  multiline?: boolean | undefined;
  rows?: number | undefined;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted-foreground">
            {prefix}
          </span>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn(inputCls, "resize-none leading-relaxed", error && "ring-2 ring-destructive")}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            className={cn(inputCls, prefix && "pl-11", suffix && "pr-10", error && "ring-2 ring-destructive")}
          />
        )}
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-destructive">{error}</span>
      ) : (
        helper && <span className="mt-1.5 block text-xs text-muted-foreground">{helper}</span>
      )}
    </label>
  );
}

/** Campo de chave: oculto como senha, sem sugestões, com "Colar" que limpa a área de transferência. */
export function SecureField({
  label,
  value,
  onChange,
  helper,
  error,
  placeholder = "Cole a chave aqui",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string | undefined;
  error?: string | null | undefined;
  placeholder?: string | undefined;
}) {
  const [pasteNote, setPasteNote] = useState<string | null>(null);
  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.trim());
      await navigator.clipboard.writeText("");
      setPasteNote("Colada. A área de transferência foi limpa.");
    } catch {
      setPasteNote("Não foi possível ler a área de transferência neste navegador.");
    }
  };
  return (
    <div>
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1.5 flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-1p-ignore
          className={cn(inputCls, "flex-1 font-mono text-sm", error && "ring-2 ring-destructive")}
        />
        <button
          type="button"
          onClick={paste}
          className="shrink-0 rounded-2xl bg-surface px-4 text-sm font-semibold active:bg-surface-strong"
        >
          Colar
        </button>
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-destructive">{error}</span>
      ) : (
        (pasteNote || helper) && <span className="mt-1.5 block text-xs text-muted-foreground">{pasteNote ?? helper}</span>
      )}
    </div>
  );
}

export function ToggleRow({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string;
  helper?: string | undefined;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-4 rounded-2xl bg-surface px-4 py-3.5 text-left"
    >
      <span className="flex-1">
        <span className="block text-[15px] font-semibold">{label}</span>
        {helper && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{helper}</span>}
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-surface-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-background shadow-card transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

export function Stars({ value, onChange, size = "sm" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = (
          <Star
            className={cn(
              size === "lg" ? "size-8" : "size-3.5",
              n <= value ? "fill-tag-yellow-foreground text-tag-yellow-foreground" : "text-surface-strong",
            )}
            strokeWidth={size === "lg" ? 1.6 : 2}
          />
        );
        return onChange ? (
          <button key={n} type="button" aria-label={`${n} estrela${n > 1 ? "s" : ""}`} onClick={() => onChange(n === value ? 0 : n)} className="p-0.5">
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </span>
  );
}

export function SectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between px-5", className)}>
      <h2 className="text-[17px] font-bold">{children}</h2>
      {right}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-2 bg-surface", className)} />;
}

/** Simula uma espera curta (busca, geração da IA). */
export function useFakeLoading(ms = 1200) {
  const [loading, setLoading] = useState(false);
  const run = useCallback(
    (after?: () => void) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        after?.();
      }, ms);
    },
    [ms],
  );
  return [loading, run] as const;
}
