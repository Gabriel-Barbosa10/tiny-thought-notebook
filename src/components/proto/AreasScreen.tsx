import { Link } from "@tanstack/react-router";
import { BookOpen, Cake, ChevronRight, Gamepad2, ListChecks, type LucideIcon } from "lucide-react";

import { nextOccurrence, useCentral } from "@/lib/central-store";
import { ScreenHeader } from "@/components/proto/ui";

export function AreasScreen() {
  const s = useCentral();
  const doing = s.leisure.filter((l) => l.status === "Em andamento").length;
  const next = [...s.dates].map((d) => ({ d, ...nextOccurrence(d) })).sort((a, b) => a.days - b.days)[0];
  const nextLabel = next ? (next.days === 0 ? "hoje" : next.days === 1 ? "amanhã" : `em ${next.days} dias`) : "";

  const rows: { to: "/areas/estudos" | "/areas/lazer" | "/areas/datas"; icon: LucideIcon; title: string; subtitle: string }[] = [
    {
      to: "/areas/estudos",
      icon: BookOpen,
      title: "Estudos",
      subtitle: s.pages.length ? `${s.pages.length} ${s.pages.length === 1 ? "página" : "páginas"}` : "Ideias, anotações e análises de dados",
    },
    {
      to: "/areas/lazer",
      icon: Gamepad2,
      title: "Lazer",
      subtitle: s.leisure.length
        ? `${s.leisure.length} ${s.leisure.length === 1 ? "item" : "itens"} · ${doing} em andamento`
        : "Games, filmes, séries e futebol",
    },
    {
      to: "/areas/datas",
      icon: Cake,
      title: "Datas especiais",
      subtitle: next ? `Próxima: ${next.d.name} ${nextLabel}` : "Aniversários e comemorações, com aviso",
    },
  ];

  return (
    <div className="pb-10">
      <ScreenHeader title="Áreas" />
      <ul className="mt-2 space-y-2.5 px-5">
        {rows.map((r) => (
          <li key={r.to}>
            <Row to={r.to} icon={r.icon} title={r.title} subtitle={r.subtitle} />
          </li>
        ))}
      </ul>

      <p className="px-5 pb-2 pt-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Também no app</p>
      <div className="px-5">
        <Row to="/tarefas" icon={ListChecks} title="Tarefas" subtitle="Quadro de tarefas pessoais" />
      </div>
    </div>
  );
}

function Row({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: "/areas/estudos" | "/areas/lazer" | "/areas/datas" | "/tarefas";
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-2xl bg-surface p-4 transition-colors active:bg-surface-strong">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background">
        <Icon className="size-[22px]" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold">{title}</span>
        <span className="block truncate text-sm text-muted-foreground">{subtitle}</span>
      </span>
      <ChevronRight className="size-5 text-muted-foreground" />
    </Link>
  );
}
