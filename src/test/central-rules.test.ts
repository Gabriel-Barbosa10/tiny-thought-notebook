import { describe, expect, it } from "vitest";

import {
  billCharges,
  billStatus,
  buildBriefing,
  countdownLabel,
  nextDue,
  validateClaudeKey,
  validateDateParts,
  validateTmdbKey,
  type Bill,
} from "@/lib/central-store";

const today = new Date(2026, 9, 29);
const bill = (p: Partial<Bill>): Bill => ({
  id: "x", name: "Internet 1", amount: 99, dueDay: 19, fine: 2, interest: 1,
  recurring: true, notes: "", openDue: "2026-10-19", ...p,
});

describe("Contas", () => {
  it("atrasada 10 dias soma multa de 2% e juros de 1% ao mês por dia", () => {
    const c = billCharges(bill({}), today);
    expect(c.daysLate).toBe(10);
    expect(c.fine).toBe(1.98);
    expect(c.interest).toBe(0.33);
    expect(c.total).toBe(101.31);
  });

  it("etiquetas: atrasada, vence hoje, amanhã, em N dias, pendente, sem fatura e valor a definir", () => {
    expect(billStatus(bill({}), today).tags[0].label).toBe("Atrasada · 10 dias");
    expect(billStatus(bill({ openDue: "2026-10-29" }), today).tags[0].label).toBe("Vence hoje");
    expect(billStatus(bill({ openDue: "2026-10-30" }), today).tags[0].label).toBe("Amanhã");
    expect(billStatus(bill({ openDue: "2026-11-03" }), today).tags[0].label).toBe("Em 5 dias");
    expect(billStatus(bill({ openDue: "2026-11-15" }), today).tags[0].label).toBe("Pendente");
    expect(billStatus(bill({ openDue: null }), today).tags[0].label).toBe("Sem fatura em aberto");
    expect(billStatus(bill({ amount: null }), today).tags.map((t) => t.label)).toContain("Valor a definir");
  });

  it("em meses curtos, o vencimento cai no último dia", () => {
    expect(nextDue("2026-01-31", 31)).toBe("2026-02-28");
  });
});

describe("Briefing", () => {
  it("ordena atrasadas, vence hoje e próximos 7 dias; sem atrasadas mostra o card positivo", () => {
    const cards = buildBriefing(
      [bill({ id: "a" }), bill({ id: "b", name: "Faculdade", openDue: "2026-10-29", amount: null }), bill({ id: "c", name: "Internet 2", openDue: "2026-11-01" })],
      today,
    );
    expect(cards.map((c) => c.tone)).toEqual(["alert", "attention", "info"]);
    const ok = buildBriefing([bill({ openDue: "2026-11-08" })], today);
    expect(ok[0].title).toBe("Nenhuma conta atrasada");
  });
});

describe("Validações", () => {
  it("chave do Claude começa com sk-ant-", () => {
    expect(validateClaudeKey("")).toBe("Cole a chave da API");
    expect(validateClaudeKey("abc")).toBe("Chave inválida. Ela começa com sk-ant-");
    expect(validateClaudeKey("sk-ant-123")).toBeNull();
  });
  it("chave do TMDB tem 32 letras e números", () => {
    expect(validateTmdbKey("a".repeat(32))).toBeNull();
    expect(validateTmdbKey("eyJhbGciOi.token")).not.toBeNull();
  });
  it("datas: dia do mês, mês de 1 a 12 e ano entre 1900 e o ano atual", () => {
    expect(validateDateParts("31", "11", "", today).day).toBe("Esse mês tem até 30 dias");
    expect(validateDateParts("10", "13", "", today).month).toBe("De 1 a 12");
    expect(validateDateParts("10", "10", "1899", today).year).toBe("Ano entre 1900 e 2026");
    expect(countdownLabel(0)).toBe("Hoje");
    expect(countdownLabel(12)).toBe("Em 12 dias");
    expect(countdownLabel(90)).toBe("Em 3 meses");
  });
});
