import { useState } from "react";
import { Check, ReceiptText, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  billCharges,
  billStatus,
  daysInMonth,
  fmtBRL,
  fmtDate,
  markBillPaid,
  parseDecimal,
  parseISO,
  setCentral,
  toISO,
  toInputDecimal,
  TODAY,
  uid,
  useCentral,
  type Bill,
} from "@/lib/central-store";
import { ConfirmDialog, EmptyState, Fab, Field, FormSheet, ScreenHeader, Tag, ToggleRow, useSnackbar } from "@/components/proto/ui";

export function BillsScreen() {
  const { bills } = useCentral();
  const [editing, setEditing] = useState<Bill | "new" | null>(null);
  const snack = useSnackbar();

  const sorted = [...bills].sort((a, b) => {
    if (!a.openDue) return 1;
    if (!b.openDue) return -1;
    return a.openDue.localeCompare(b.openDue);
  });

  return (
    <div className="pb-32">
      <ScreenHeader title="Contas" subtitle="Lembretes de vencimento. Nada aqui faz pagamentos." />

      {sorted.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Nenhuma conta ainda" text="Toque em + para cadastrar a primeira." />
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {sorted.map((b) => (
            <BillRow
              key={b.id}
              bill={b}
              onOpen={() => setEditing(b)}
              onPaid={() => {
                const undo = markBillPaid(b.id);
                snack.show(`${b.name} marcada como paga`, undo);
              }}
            />
          ))}
        </ul>
      )}

      <Fab label="Nova conta" onClick={() => setEditing("new")} />
      {snack.node}
      {editing && <BillForm bill={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function BillRow({ bill, onOpen, onPaid }: { bill: Bill; onOpen: () => void; onPaid: () => void }) {
  const status = billStatus(bill);
  const charges = billCharges(bill);
  const late = status.kind === "late";

  return (
    <li className="flex items-start gap-3 px-5 py-4">
      <button
        type="button"
        onClick={onPaid}
        disabled={!bill.openDue}
        aria-label="Marcar como paga"
        title="Marcar como paga"
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-surface-strong text-transparent transition-colors hover:border-brand hover:text-muted-foreground disabled:opacity-40",
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </button>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{bill.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {status.tags.map((t) => (
              <Tag key={t.label} color={t.color}>
                {t.label}
              </Tag>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {bill.openDue ? `Vence em ${fmtDate(parseISO(bill.openDue))}` : `Todo dia ${bill.dueDay}`}
          </p>
          {late && charges.total != null && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Com multa {fmtBRL(charges.fine)} e juros {fmtBRL(charges.interest)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className={cn("text-[15px] font-bold", late && "text-destructive")}>
            {charges.total != null ? fmtBRL(charges.total) : "—"}
          </p>
          {late && bill.amount != null && (
            <p className="text-xs text-muted-foreground line-through">{fmtBRL(bill.amount)}</p>
          )}
        </div>
      </button>
    </li>
  );
}

function BillForm({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  const [name, setName] = useState(bill?.name ?? "");
  const [amount, setAmount] = useState(toInputDecimal(bill?.amount ?? null));
  const [day, setDay] = useState(bill ? String(bill.dueDay) : "");
  const [fine, setFine] = useState(bill ? toInputDecimal(bill.fine) : "2");
  const [interest, setInterest] = useState(bill ? toInputDecimal(bill.interest) : "1");
  const [recurring, setRecurring] = useState(bill?.recurring ?? true);
  const [notes, setNotes] = useState(bill?.notes ?? "");
  const [errors, setErrors] = useState<Partial<Record<"name" | "amount" | "day" | "fine" | "interest", string>>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const e: Partial<Record<"name" | "amount" | "day" | "fine" | "interest", string>> = {};
    if (!name.trim()) e.name = "Informe o nome da conta";
    const a = parseDecimal(amount);
    if (Number.isNaN(a)) e.amount = "Valor inválido. Exemplo: 99,90";
    const d = Number(day);
    if (!/^\d{1,2}$/.test(day) || d < 1 || d > 31) e.day = "Informe um dia de 1 a 31";
    const f = parseDecimal(fine || "0");
    const i = parseDecimal(interest || "0");
    if (Number.isNaN(f)) e.fine = "Percentual inválido. Exemplo: 2 ou 0,03";
    if (Number.isNaN(i)) e.interest = "Percentual inválido. Exemplo: 2 ou 0,03";
    setErrors(e);
    if (Object.keys(e).length) return;

    const y = TODAY.getFullYear();
    const m = TODAY.getMonth();
    let due = new Date(y, m, Math.min(d, daysInMonth(y, m + 1)));
    if (due < TODAY) due = new Date(y, m + 1, Math.min(d, daysInMonth(y, m + 2)));

    const data = {
      name: name.trim(),
      amount: a,
      dueDay: d,
      fine: f ?? 0,
      interest: i ?? 0,
      recurring,
      notes,
    };
    setCentral((s) => ({
      bills: bill
        ? s.bills.map((b) => (b.id === bill.id ? { ...b, ...data } : b))
        : [...s.bills, { id: uid("b"), ...data, openDue: toISO(due) }],
    }));
    onClose();
  };

  return (
    <FormSheet
      title={bill ? "Editar conta" : "Nova conta"}
      onClose={onClose}
      onSave={save}
    >
      <div className="space-y-5">
        <Field label="Nome" value={name} onChange={setName} placeholder="Ex.: Internet, Faculdade" error={errors.name} />
        <Field
          label="Valor"
          prefix="R$"
          inputMode="decimal"
          value={amount}
          onChange={setAmount}
          placeholder="0,00"
          helper="Deixe em branco se o valor muda todo mês"
          error={errors.amount}
        />
        <Field
          label="Dia do vencimento"
          inputMode="numeric"
          value={day}
          onChange={setDay}
          placeholder="1 a 31"
          helper="Em meses mais curtos, vence no último dia"
          error={errors.day}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Multa" suffix="%" inputMode="decimal" value={fine} onChange={setFine} error={errors.fine} />
          <Field label="Juros ao mês" suffix="%" inputMode="decimal" value={interest} onChange={setInterest} error={errors.interest} />
        </div>
        <ToggleRow
          label="Repete todo mês"
          helper="Ao marcar como paga, a fatura do mês seguinte é criada sozinha"
          checked={recurring}
          onChange={setRecurring}
        />
        <Field
          label="Observações"
          multiline
          value={notes}
          onChange={setNotes}
          placeholder="Ex.: número do contrato, quem usa…"
          helper="Nunca enviadas para nenhuma IA."
        />
        {bill && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-tag-red py-3.5 text-[15px] font-semibold text-tag-red-foreground"
          >
            <Trash2 className="size-4" />
            Excluir conta
          </button>
        )}
      </div>
      {confirmDelete && bill && (
        <ConfirmDialog
          title={`Excluir ${bill.name}?`}
          text="A fatura em aberto será apagada. As faturas já marcadas como pagas continuam no histórico."
          action="Excluir"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setCentral((s) => ({ bills: s.bills.filter((b) => b.id !== bill.id) }));
            onClose();
          }}
        />
      )}
    </FormSheet>
  );
}

