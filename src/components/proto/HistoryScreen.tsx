import { useMemo, useState } from "react";
import {
  FileSpreadsheet,
  FolderDown,
  History,
  Mail,
  MoreVertical,
  Share,
  Undo2,
} from "lucide-react";

import {
  MONTHS,
  fmtBRL,
  fmtDate,
  monthLabel,
  parseISO,
  unmarkPaid,
  useCentral,
  type HistoryEntry,
} from "@/lib/central-store";
import {
  ChipRow,
  ConfirmDialog,
  EmptyState,
  IconButton,
  ScreenHeader,
  Tag,
} from "@/components/proto/ui";

export function HistoryScreen() {
  const { history } = useCentral();
  const [filter, setFilter] = useState("Todas");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [unmark, setUnmark] = useState<HistoryEntry | null>(null);
  const [exportStep, setExportStep] = useState<null | "confirm" | "share">(null);

  const names = useMemo(
    () => ["Todas", ...Array.from(new Set(history.map((h) => h.name)))],
    [history],
  );
  const groups = useMemo(() => {
    const list = [...history]
      .filter((h) => filter === "Todas" || h.name === filter)
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
    const map = new Map<string, HistoryEntry[]>();
    for (const h of list) {
      const k = h.paidAt.slice(0, 7);
      map.set(k, [...(map.get(k) ?? []), h]);
    }
    return [...map.entries()];
  }, [history, filter]);

  return (
    <div className="pb-10" onClick={() => menuFor && setMenuFor(null)}>
      <ScreenHeader
        title="Histórico"
        actions={
          history.length > 0 && (
            <button
              type="button"
              onClick={() => setExportStep("confirm")}
              className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-sm font-semibold active:bg-surface-strong"
            >
              <Share className="size-4" />
              Exportar CSV
            </button>
          )
        }
      />

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nada no histórico ainda"
          text="As contas marcadas como pagas aparecem aqui."
        />
      ) : (
        <>
          <ChipRow options={names} value={filter} onChange={setFilter} className="pb-2 pt-2" />
          {groups.map(([month, entries]) => (
            <section key={month} className="pt-5">
              <div className="flex items-baseline justify-between px-5 pb-1">
                <h2 className="text-[17px] font-bold">{monthLabel(parseISO(`${month}-01`))}</h2>
                <span className="text-sm font-bold">
                  {fmtBRL(entries.reduce((s, h) => s + (h.amount ?? 0), 0))}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {entries.map((h) => {
                  const late = h.paidAt > h.due;
                  return (
                    <li key={h.id} className="relative flex items-start gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold">{h.name}</p>
                        <Tag color={late ? "orange" : "green"} className="mt-1">
                          {late ? "Paga com atraso" : "Paga em dia"}
                        </Tag>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          em {fmtDate(parseISO(h.paidAt))} · venc. {fmtDate(parseISO(h.due))}
                        </p>
                        {h.charges > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Inclui {fmtBRL(h.charges)} de multa e juros
                          </p>
                        )}
                      </div>
                      <p className="pt-0.5 text-[15px] font-bold">
                        {h.amount != null ? fmtBRL(h.amount) : "Sem valor"}
                      </p>
                      <IconButton
                        label="Mais opções"
                        className="-mr-2 size-8 text-muted-foreground"
                        onClick={() => setMenuFor(menuFor === h.id ? null : h.id)}
                      >
                        <MoreVertical className="size-4" />
                      </IconButton>
                      {menuFor === h.id && (
                        <div className="absolute right-5 top-12 z-20 rounded-2xl bg-background p-1 shadow-phone animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuFor(null);
                              setUnmark(h);
                            }}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface"
                          >
                            <Undo2 className="size-4" />
                            Desmarcar como paga
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}

      {unmark && (
        <ConfirmDialog
          title={`Desmarcar ${unmark.name}?`}
          text={`A fatura de ${MONTHS[parseISO(unmark.due).getMonth()]} de ${parseISO(unmark.due).getFullYear()} volta para "em aberto" e sai do histórico.`}
          action="Desmarcar"
          onCancel={() => setUnmark(null)}
          onConfirm={() => {
            unmarkPaid(unmark.id);
            setUnmark(null);
          }}
        />
      )}
      {exportStep === "confirm" && (
        <ConfirmDialog
          title="Exportar histórico?"
          text="O arquivo CSV sai sem criptografia: quem tiver o arquivo consegue ler nomes de contas, datas e valores. Guarde-o num lugar seguro."
          action="Exportar"
          onCancel={() => setExportStep(null)}
          onConfirm={() => setExportStep("share")}
        />
      )}
      {exportStep === "share" && <ShareSheet onClose={() => setExportStep(null)} />}
    </div>
  );
}

/** Imitação da folha de compartilhamento do iPhone. */
function ShareSheet({ onClose }: { onClose: () => void }) {
  const options = [
    { label: "Salvar em Arquivos", icon: FolderDown },
    { label: "Mail", icon: Mail },
    { label: "Numbers", icon: FileSpreadsheet },
  ];
  return (
    <div
      className="absolute inset-0 z-[45] flex flex-col justify-end bg-overlay animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl bg-background px-5 pb-8 pt-3 shadow-sheet animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-surface-strong" />
        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-tag-green">
            <FileSpreadsheet className="size-5 text-tag-green-foreground" />
          </span>
          <div>
            <p className="text-[15px] font-bold">historico-contas.csv</p>
            <p className="text-xs text-muted-foreground">Planilha CSV · sem criptografia</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={onClose}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-surface">
                <o.icon className="size-6" />
              </span>
              <span className="text-xs font-semibold">{o.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-surface py-3.5 text-[15px] font-semibold"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
