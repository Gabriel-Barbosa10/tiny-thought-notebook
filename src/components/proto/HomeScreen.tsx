import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Cake,
  CalendarHeart,
  ExternalLink,
  Eye,
  EyeOff,
  Gamepad2,
  ListChecks,
  ReceiptText,
  RotateCw,
  Settings,
  Sparkles,
  Route as RouteIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MurdockAppIcon } from "@/components/proto/MurdockLogo";
import {
  TODAY,
  UPDATED_AT,
  WEEKDAYS,
  buildBriefing,
  claudeActive,
  fmtBRL,
  fmtDate,
  fmtDayMonth,
  iphoneAi,
  monthSummary,
  newsFor,
  nextOccurrence,
  setCentral,
  turnsYears,
  useCentral,
  validateClaudeKey,
} from "@/lib/central-store";
import {
  Callout,
  Loading,
  PillButton,
  SecureField,
  SectionTitle,
  SourceLine,
  Tag,
  useFakeLoading,
} from "@/components/proto/ui";

const shortcuts = [
  { label: "Contas", icon: ReceiptText, to: "/contas" as const },
  { label: "Estudos", icon: BookOpen, to: "/areas/estudos" as const },
  { label: "Trilha", icon: RouteIcon, to: "/areas/trilha" as const },
  { label: "Lazer", icon: Gamepad2, to: "/areas/lazer" as const },
  { label: "Datas", icon: CalendarHeart, to: "/areas/datas" as const },
  { label: "Tarefas", icon: ListChecks, to: "/tarefas" as const },
];

export function HomeScreen() {
  const s = useCentral();
  const [hidden, setHidden] = useState(false);
  const [briefingLoading, regenerate] = useFakeLoading(1600);

  const hasClaude = claudeActive(s);
  const hasAi = iphoneAi(s) || hasClaude;
  const cards = useMemo(() => buildBriefing(s.bills), [s.bills]);
  const summary = useMemo(() => monthSummary(s.bills, s.history), [s.bills, s.history]);
  const soonDates = useMemo(
    () =>
      s.dates
        .map((d) => ({ d, ...nextOccurrence(d) }))
        .filter((x) => x.days <= 7)
        .sort((a, b) => a.days - b.days),
    [s.dates],
  );

  const name = s.settings.jarvisName.trim();
  const greeting = `Boa tarde${name ? `, ${name}` : ""}.`;
  const origin = hasClaude
    ? `Jarvis · Claude às ${UPDATED_AT}`
    : iphoneAi(s)
      ? `Jarvis · IA do iPhone às ${UPDATED_AT}`
      : "Resumo feito no aparelho";

  const money = (n: number) => (hidden ? "R$ ••••" : fmtBRL(n));
  const blur = (t: string) => (hidden ? t.replace(/R\$\s?[\d.,]+/g, "R$ ••••") : t);

  return (
    <div className="pb-8">
      {/* Topo grafite, no estilo do Nubank */}
      <header className="bg-brand px-5 pb-6 pt-3 text-brand-foreground">
        <div className="flex items-center justify-between">
          <MurdockAppIcon className="size-12 ring-1 ring-brand-raised" />
          <div className="flex items-center gap-1">
            <HeaderIcon
              label={hidden ? "Mostrar valores" : "Esconder valores"}
              onClick={() => setHidden((h) => !h)}
            >
              {hidden ? <EyeOff className="size-[22px]" /> : <Eye className="size-[22px]" />}
            </HeaderIcon>
            <Link
              to="/configuracoes"
              aria-label="Configurações"
              title="Configurações"
              className="flex size-10 items-center justify-center rounded-full text-brand-foreground hover:bg-brand-raised"
            >
              <Settings className="size-[22px]" />
            </Link>
          </div>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Início
        </p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">{greeting}</h1>
        <p className="mt-0.5 text-sm text-brand-muted">
          {WEEKDAYS[TODAY.getDay()]}, {fmtDate(TODAY)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          {briefingLoading ? (
            <p className="flex items-center gap-2 text-xs font-medium text-brand-muted">
              <RotateCw className="size-3.5 animate-spin" />
              Jarvis está analisando suas contas…
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">
              <Sparkles className="size-3.5" />
              {origin}
            </p>
          )}
          {hasAi && (
            <button
              type="button"
              onClick={() => regenerate()}
              aria-label="Pedir novo briefing"
              title="Pedir novo briefing"
              className="flex size-8 items-center justify-center rounded-full bg-brand-raised"
            >
              <RotateCw className={cn("size-4", briefingLoading && "animate-spin")} />
            </button>
          )}
        </div>
        {s.ai === "failed" && !hasClaude && !briefingLoading && (
          <p className="mt-3 rounded-xl bg-tag-red px-3 py-2 text-xs font-medium text-tag-red-foreground">
            A IA do iPhone trocou algum valor. Mostrando o resumo do aparelho.
          </p>
        )}
      </header>

      {/* Atalhos em círculo */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pt-6">
        {shortcuts.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="group flex w-[64px] shrink-0 flex-col items-center gap-2 text-center"
          >
            <span className="flex size-[64px] items-center justify-center rounded-full bg-surface text-foreground transition-colors group-active:bg-surface-strong">
              <a.icon className="size-6" strokeWidth={1.9} />
            </span>
            <span className="text-[12px] font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      {!iphoneAi(s) && !hasClaude && !s.claudeCardDismissed && <ConnectClaudeCard />}

      {/* Briefing do dia */}
      <section className="pt-7">
        <SectionTitle>Briefing do dia</SectionTitle>
        <div
          className={cn(
            "mt-3 space-y-2.5 px-5 transition-opacity",
            briefingLoading && "opacity-40",
          )}
        >
          {cards.map((c) => (
            <Callout key={c.id} tone={c.tone} title={c.title}>
              {blur(c.text)}
            </Callout>
          ))}
          {soonDates.map(({ d, days, date }) => {
            const years = turnsYears(d);
            const isBirthday = d.kind === "Aniversário";
            const title = `${isBirthday ? `Aniversário de ${d.name}` : d.name} ${days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`}`;
            return (
              <Link key={d.id} to="/areas/datas" className="block">
                <Callout tone={days === 0 ? "positive" : "info"} icon={Cake} title={title}>
                  {d.kind} em {fmtDayMonth(date)}
                  {years ? ` · faz ${years} anos` : ""}.
                </Callout>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Resumo do mês */}
      <section className="pt-8">
        <SectionTitle
          right={
            <Link to="/contas" className="text-sm font-semibold text-muted-foreground">
              Ver contas
            </Link>
          }
        >
          Resumo do mês
        </SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-2.5 px-5">
          <SummaryBox label="Total" value={money(summary.total)} />
          <SummaryBox label="Pago" value={money(summary.paid)} />
          <SummaryBox label="Pendente" value={money(summary.pending)} />
          <SummaryBox label="Atrasado" value={money(summary.late)} danger={summary.late > 0} />
        </div>
        {summary.missing > 0 && (
          <p className="mt-2.5 px-5 text-xs text-muted-foreground">
            {summary.missing === 1
              ? "1 fatura sem valor informado não entra no total."
              : `${summary.missing} faturas sem valor informado não entram no total.`}
          </p>
        )}
      </section>

      <NewsSection />
    </div>
  );
}

function SummaryBox({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-3.5">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-[18px] font-bold tracking-tight", danger && "text-destructive")}>
        {value}
      </p>
    </div>
  );
}

function ConnectClaudeCard() {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const connect = () => {
    const err = validateClaudeKey(key);
    setError(err);
    if (!err)
      setCentral((st) => ({ settings: { ...st.settings, claudeKey: key.trim(), claudeOn: true } }));
  };
  return (
    <div className="px-5 pt-6">
      <Callout tone="info" icon={Sparkles} title="Conectar o Jarvis ao Claude">
        <p>
          Cole sua chave da API da Anthropic uma vez e o Claude passa a escrever seu briefing do
          dia. Ela fica só neste iPhone, no banco criptografado.
        </p>
        <div className="mt-3">
          <SecureField
            label="Chave da API"
            value={key}
            onChange={setKey}
            error={error}
            placeholder="sk-ant-…"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <PillButton onClick={connect} className="py-2.5">
            Conectar
          </PillButton>
          <PillButton
            variant="surface"
            className="bg-background py-2.5"
            onClick={() => setCentral({ claudeCardDismissed: true })}
          >
            Agora não
          </PillButton>
        </div>
      </Callout>
    </div>
  );
}

function NewsSection() {
  const s = useCentral();
  const [loading, refetch] = useFakeLoading(1200);
  const hasClaude = claudeActive(s);
  const topics = s.settings.topics;
  const mode = loading ? "loading" : s.news;

  return (
    <section className="pt-8">
      <SectionTitle>Notícias</SectionTitle>
      <SourceLine
        className="px-5 pt-1"
        text={
          hasClaude
            ? `Jarvis · busca na web · às ${UPDATED_AT}`
            : `Google Notícias · às ${UPDATED_AT}`
        }
        loading={mode === "loading"}
        loadingText="Buscando as notícias…"
        onRefresh={() => refetch()}
        refreshLabel="Buscar notícias de novo"
      />
      <div className="mt-2 space-y-2.5 px-5">
        {topics.length === 0 ? (
          <Link
            to="/configuracoes"
            className="block rounded-2xl bg-surface p-4 text-sm text-muted-foreground"
          >
            Escolha os temas que quer acompanhar em Configurações.
          </Link>
        ) : mode === "loading" ? (
          [0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface" />)
        ) : mode === "empty" ? (
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
            Nenhuma notícia encontrada hoje para os seus temas.
          </p>
        ) : mode === "offline" || mode === "down" ? (
          <p className="rounded-2xl bg-tag-red p-4 text-sm font-medium text-tag-red-foreground">
            {mode === "offline"
              ? "Sem conexão com a internet."
              : "O Google Notícias está fora do ar agora."}
          </p>
        ) : (
          topics.flatMap(newsFor).map((n) => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-border p-4 transition-colors active:bg-surface"
            >
              <Tag color="blue">{n.topic}</Tag>
              <p className="mt-2 text-[15px] font-bold leading-snug">{n.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasClaude ? n.summary : n.published}
              </p>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ExternalLink className="size-3.5" />
                {n.source} · news.google.com
              </p>
            </a>
          ))
        )}
      </div>
    </section>
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
      title={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full text-brand-foreground hover:bg-brand-raised"
    >
      {children}
    </button>
  );
}
