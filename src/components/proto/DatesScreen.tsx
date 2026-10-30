import { useState } from "react";
import { Bell, BellOff, Cake, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  countdownLabel,
  fmtDayMonth,
  nextOccurrence,
  setCentral,
  turnsYears,
  uid,
  useCentral,
  validateDateParts,
  type DateKind,
  type SpecialDate,
} from "@/lib/central-store";
import { ConfirmDialog, EmptyState, Fab, Field, FormSheet, IconButton, ScreenHeader, ToggleRow } from "@/components/proto/ui";
import { ChipGroup } from "@/components/proto/LeisureScreen";

const KINDS: DateKind[] = ["Aniversário", "Comemoração", "Outro"];

export function DatesScreen() {
  const { dates } = useCentral();
  const [editing, setEditing] = useState<SpecialDate | "new" | null>(null);
  const list = dates.map((d) => ({ d, ...nextOccurrence(d) })).sort((a, b) => a.days - b.days);

  return (
    <div className="pb-32">
      <ScreenHeader title="Datas especiais" back="/areas" />
      {list.length === 0 ? (
        <EmptyState
          icon={Cake}
          title="Nenhuma data ainda"
          text="Toque em + para guardar um aniversário ou uma comemoração e ser avisado."
        />
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {list.map(({ d, days, date }) => {
            const years = turnsYears(d);
            const soon = days <= 1;
            return (
              <li key={d.id}>
                <button type="button" onClick={() => setEditing(d)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left active:bg-surface">
                  <span
                    className={cn(
                      "flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl text-center leading-none",
                      days === 0 ? "bg-tag-green" : soon ? "bg-tag-blue" : "bg-surface",
                    )}
                  >
                    <span className="text-[15px] font-bold">{String(date.getDate()).padStart(2, "0")}</span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[15px] font-bold">{d.name}</span>
                      <span className={cn("shrink-0 text-xs font-semibold", soon ? "text-foreground" : "text-muted-foreground")}>
                        {countdownLabel(days)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {fmtDayMonth(date)} · {d.kind}
                      {years ? ` · faz ${years} anos` : ""}
                    </span>
                  </span>
                  <span title={d.notify ? "Com aviso" : "Sem aviso"} aria-label={d.notify ? "Com aviso" : "Sem aviso"}>
                    {d.notify ? <Bell className="size-4 text-foreground" /> : <BellOff className="size-4 text-muted-foreground" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Fab label="Nova data" onClick={() => setEditing("new")} />
      {editing && <DateForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function DateForm({ item, onClose }: { item: SpecialDate | null; onClose: () => void }) {
  const [name, setName] = useState(item?.name ?? "");
  const [day, setDay] = useState(item ? String(item.day) : "");
  const [month, setMonth] = useState(item ? String(item.month) : "");
  const [year, setYear] = useState(item?.year ? String(item.year) : "");
  const [kind, setKind] = useState<DateKind>(item?.kind ?? "Aniversário");
  const [notify, setNotify] = useState(item?.notify ?? true);
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [errors, setErrors] = useState<{ name?: string; day?: string; month?: string; year?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const e = { ...validateDateParts(day, month, year), ...(name.trim() ? {} : { name: "Informe um nome" }) };
    setErrors(e);
    if (Object.keys(e).length) return;
    const data = { name: name.trim(), day: Number(day), month: Number(month), year: year ? Number(year) : null, kind, notify, notes };
    setCentral((s) => ({
      dates: item ? s.dates.map((d) => (d.id === item.id ? { ...d, ...data } : d)) : [...s.dates, { id: uid("d"), ...data }],
    }));
    onClose();
  };

  return (
    <FormSheet
      title={item ? "Editar data" : "Nova data"}
      onClose={onClose}
      onSave={save}
      extraActions={
        item && (
          <IconButton label="Excluir data" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-5" />
          </IconButton>
        )
      }
    >
      <div className="space-y-5">
        <Field label="Nome" value={name} onChange={setName} placeholder="Ex.: Aniversário da Ana, Casamento" error={errors.name} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Dia" inputMode="numeric" value={day} onChange={setDay} placeholder="20" error={errors.day} />
          <Field label="Mês" inputMode="numeric" value={month} onChange={setMonth} placeholder="11" error={errors.month} />
          <Field label="Ano" inputMode="numeric" value={year} onChange={setYear} placeholder="1996" error={errors.year} />
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">O ano é opcional e serve para contar os anos.</p>
        <ChipGroup label="Tipo" options={KINDS} value={kind} onChange={setKind} />
        <ToggleRow
          label="Avisar"
          helper="Lembrete no dia anterior e no dia, sem o nome na tela bloqueada"
          checked={notify}
          onChange={setNotify}
        />
        <Field label="Observações" multiline value={notes} onChange={setNotes} placeholder="Ideias de presente, lugar, lembrar de ligar..." />
      </div>
      {confirmDelete && item && (
        <ConfirmDialog
          title={`Excluir ${item.name}?`}
          text="A data e os avisos dela serão apagados."
          action="Excluir"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setCentral((s) => ({ dates: s.dates.filter((d) => d.id !== item.id) }));
            onClose();
          }}
        />
      )}
    </FormSheet>
  );
}
