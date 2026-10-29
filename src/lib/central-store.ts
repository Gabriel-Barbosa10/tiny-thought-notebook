import { useSyncExternalStore } from "react";

import type { TagColor } from "@/lib/proto-data";

/* ------------------------------------------------------------------ */
/* Datas e valores (pt-BR)                                             */
/* ------------------------------------------------------------------ */

/** O protótipo vive num dia fixo para os exemplos fazerem sentido. */
export const TODAY = new Date(2026, 9, 29); // quinta, 29/10/2026
export const UPDATED_AT = "08:00";

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");

export function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
/** a − b em dias inteiros. */
export function diffDays(a: Date, b: Date) {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ua - ub) / DAY_MS);
}
export function daysInMonth(year: number, month1: number) {
  return new Date(year, month1, 0).getDate();
}
export const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
export const fmtDayMonth = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

export const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function monthLabel(d: Date) {
  const m = MONTHS[d.getMonth()];
  return `${m[0].toUpperCase()}${m.slice(1)} de ${d.getFullYear()}`;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const fmtBRL = (n: number) => brl.format(n).replace(/\u00a0/g, " ");

/** "99,90" → 99.9 · "" → null · inválido → NaN */
export function parseDecimal(text: string): number | null {
  const t = text.trim().replace(/^R\$\s*/, "");
  if (!t) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d+)?$/.test(t)) return Number.NaN;
  return Number(t.replace(/\./g, "").replace(",", "."));
}
export const toInputDecimal = (n: number | null) => (n == null ? "" : String(n).replace(".", ","));

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/* Contas                                                              */
/* ------------------------------------------------------------------ */

export type Bill = {
  id: string;
  name: string;
  /** null = valor muda todo mês / ainda não informado */
  amount: number | null;
  dueDay: number;
  /** % de multa */
  fine: number;
  /** % de juros ao mês */
  interest: number;
  recurring: boolean;
  notes: string;
  /** vencimento da fatura em aberto (ISO) ou null = sem fatura em aberto */
  openDue: string | null;
};

export type HistoryEntry = {
  id: string;
  billId: string;
  name: string;
  paidAt: string;
  due: string;
  amount: number | null;
  charges: number;
};

export function billCharges(bill: Pick<Bill, "amount" | "fine" | "interest" | "openDue">, today = TODAY) {
  const daysLate = bill.openDue ? Math.max(0, diffDays(today, parseISO(bill.openDue))) : 0;
  if (bill.amount == null || daysLate === 0) {
    return { daysLate, fine: 0, interest: 0, perDay: 0, total: bill.amount };
  }
  const fine = round2((bill.amount * bill.fine) / 100);
  const perDayRaw = (bill.amount * bill.interest) / 100 / 30;
  const interest = round2(perDayRaw * daysLate);
  return { daysLate, fine, interest, perDay: round2(perDayRaw), total: round2(bill.amount + fine + interest) };
}

export type BillTag = { label: string; color: TagColor };
export type BillKind = "late" | "today" | "soon" | "pending" | "none";

export function billStatus(bill: Bill, today = TODAY): { kind: BillKind; days: number; tags: BillTag[] } {
  if (!bill.openDue) return { kind: "none", days: 0, tags: [{ label: "Sem fatura em aberto", color: "gray" }] };
  const days = diffDays(parseISO(bill.openDue), today);
  const tags: BillTag[] = [];
  let kind: BillKind;
  if (days < 0) {
    kind = "late";
    tags.push({ label: `Atrasada · ${-days} ${days === -1 ? "dia" : "dias"}`, color: "red" });
  } else if (days === 0) {
    kind = "today";
    tags.push({ label: "Vence hoje", color: "orange" });
  } else if (days <= 7) {
    kind = "soon";
    tags.push({ label: days === 1 ? "Amanhã" : `Em ${days} dias`, color: "blue" });
  } else {
    kind = "pending";
    tags.push({ label: "Pendente", color: "gray" });
  }
  if (bill.amount == null) tags.push({ label: "Valor a definir", color: "yellow" });
  return { kind, days, tags };
}

/** Próximo vencimento depois de `fromISO`, no dia escolhido (meses curtos: último dia). */
export function nextDue(fromISO: string, dueDay: number) {
  const from = parseISO(fromISO);
  const y = from.getMonth() === 11 ? from.getFullYear() + 1 : from.getFullYear();
  const m = (from.getMonth() + 1) % 12;
  return toISO(new Date(y, m, Math.min(dueDay, daysInMonth(y, m + 1))));
}

/* ------------------------------------------------------------------ */
/* Briefing do Jarvis                                                  */
/* ------------------------------------------------------------------ */

export type CardTone = "alert" | "attention" | "info" | "positive";
export type BriefingCard = { id: string; tone: CardTone; title: string; text: string };

export function buildBriefing(bills: Bill[], today = TODAY): BriefingCard[] {
  const open = bills
    .filter((b) => b.openDue)
    .map((b) => ({ b, s: billStatus(b, today), c: billCharges(b, today) }))
    .sort((x, y) => x.b.openDue!.localeCompare(y.b.openDue!));

  const cards: BriefingCard[] = [];
  for (const { b, s, c } of open) {
    if (s.kind !== "late") continue;
    cards.push({
      id: `late-${b.id}`,
      tone: "alert",
      title: `${b.name} atrasada há ${c.daysLate} ${c.daysLate === 1 ? "dia" : "dias"}`,
      text:
        c.total != null
          ? `Valor atualizado hoje: ${fmtBRL(c.total)} (multa ${fmtBRL(c.fine)} e juros ${fmtBRL(c.interest)}). Cada dia a mais soma ${fmtBRL(c.perDay)}.`
          : "O valor ainda não foi informado.",
    });
  }
  for (const { b, s } of open) {
    if (s.kind !== "today") continue;
    cards.push({
      id: `today-${b.id}`,
      tone: "attention",
      title: `${b.name} vence hoje`,
      text: b.amount != null ? `${fmtBRL(b.amount)} até o fim do dia.` : "O valor ainda não foi informado.",
    });
  }
  for (const { b, s } of open) {
    if (s.kind !== "soon") continue;
    const when = s.days === 1 ? "amanhã" : `em ${s.days} dias`;
    cards.push({
      id: `soon-${b.id}`,
      tone: b.amount == null ? "attention" : "info",
      title: `${b.name} vence ${when}`,
      text:
        b.amount != null
          ? `${fmtBRL(b.amount)} em ${fmtDate(parseISO(b.openDue!))}.`
          : `Vence em ${fmtDate(parseISO(b.openDue!))}. O valor ainda não foi informado.`,
    });
  }
  if (!open.some((o) => o.s.kind === "late")) {
    const next = open[0];
    cards.push({
      id: "positive",
      tone: "positive",
      title: "Nenhuma conta atrasada",
      text: next ? `Próximo vencimento: ${next.b.name} em ${fmtDate(parseISO(next.b.openDue!))}.` : "Nenhuma fatura em aberto.",
    });
  }
  return cards.slice(0, 6);
}

export function monthSummary(bills: Bill[], history: HistoryEntry[], today = TODAY) {
  const ym = toISO(today).slice(0, 7);
  const paid = history.filter((h) => h.paidAt.startsWith(ym)).reduce((s, h) => s + (h.amount ?? 0), 0);
  let pending = 0;
  let late = 0;
  let missing = 0;
  for (const b of bills) {
    if (!b.openDue) continue;
    if (b.amount == null) {
      missing++;
      continue;
    }
    const s = billStatus(b, today);
    if (s.kind === "late") late += billCharges(b, today).total ?? 0;
    else pending += b.amount;
  }
  return { total: round2(paid + pending + late), paid: round2(paid), pending: round2(pending), late: round2(late), missing };
}

/* ------------------------------------------------------------------ */
/* Datas especiais                                                     */
/* ------------------------------------------------------------------ */

export type DateKind = "Aniversário" | "Comemoração" | "Outro";
export type SpecialDate = {
  id: string;
  name: string;
  day: number;
  month: number;
  year: number | null;
  kind: DateKind;
  notify: boolean;
  notes: string;
};

export function nextOccurrence(sd: Pick<SpecialDate, "day" | "month">, today = TODAY) {
  let y = today.getFullYear();
  let d = new Date(y, sd.month - 1, Math.min(sd.day, daysInMonth(y, sd.month)));
  if (diffDays(d, today) < 0) {
    y += 1;
    d = new Date(y, sd.month - 1, Math.min(sd.day, daysInMonth(y, sd.month)));
  }
  return { date: d, days: diffDays(d, today) };
}

export function countdownLabel(days: number) {
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  if (days < 45) return `Em ${days} dias`;
  const months = Math.round(days / 30);
  return months <= 1 ? "Em 1 mês" : `Em ${months} meses`;
}

export function turnsYears(sd: Pick<SpecialDate, "day" | "month" | "year">, today = TODAY) {
  if (!sd.year) return null;
  return nextOccurrence(sd, today).date.getFullYear() - sd.year;
}

/** Erro do formulário de data, ou null. */
export function validateDateParts(dayText: string, monthText: string, yearText: string, today = TODAY) {
  const errors: { day?: string; month?: string; year?: string } = {};
  const day = Number(dayText);
  const month = Number(monthText);
  if (!/^\d{1,2}$/.test(monthText) || month < 1 || month > 12) errors.month = "De 1 a 12";
  if (!/^\d{1,2}$/.test(dayText) || day < 1 || day > 31) errors.day = "De 1 a 31";
  else if (!errors.month && day > daysInMonth(2024, month)) errors.day = `Esse mês tem até ${daysInMonth(2024, month)} dias`;
  if (yearText.trim()) {
    const y = Number(yearText);
    if (!/^\d{4}$/.test(yearText) || y < 1900 || y > today.getFullYear()) errors.year = `Ano entre 1900 e ${today.getFullYear()}`;
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Estudos e trilha                                                    */
/* ------------------------------------------------------------------ */

export type PageKind = "Ideia" | "Anotação" | "Análise de dados";
export const pageKindColor: Record<PageKind, TagColor> = {
  Ideia: "yellow",
  Anotação: "gray",
  "Análise de dados": "blue",
};
export type StudyPage = {
  id: string;
  title: string;
  kind: PageKind;
  content: string;
  pinned: boolean;
  edited: string;
  topicId?: string;
};

export const TRAIL: { id: string; title: string; topics: { id: string; title: string }[] }[] = [
  { id: "m1", title: "Fundamentos", topics: ["Python básico", "Listas, dicionários e funções", "Jupyter Notebook e Git"] },
  { id: "m2", title: "Dados com Python", topics: ["NumPy", "pandas: DataFrames", "Limpeza e preparação de dados", "Visualização com Matplotlib e Seaborn"] },
  { id: "m3", title: "SQL", topics: ["SELECT, WHERE e ORDER BY", "JOINs", "GROUP BY e agregações", "Funções de janela", "CTEs e subconsultas"] },
  { id: "m4", title: "Estatística", topics: ["Estatística descritiva", "Probabilidade", "Distribuições", "Testes de hipótese", "Intervalo de confiança", "Regressão linear"] },
  { id: "m5", title: "Machine Learning", topics: ["Pré-processamento e features", "Regressão e classificação", "Validação cruzada e métricas", "Árvores e ensembles", "Clustering"] },
  { id: "m6", title: "Prática", topics: ["Análise exploratória (EDA)", "Storytelling com dados", "Projeto de portfólio"] },
].map((m) => ({ ...m, topics: m.topics.map((t, i) => ({ id: `${m.id}-${i + 1}`, title: t })) }));

export const TRAIL_TOTAL = TRAIL.reduce((s, m) => s + m.topics.length, 0);
export const AI_FOOTER = "Escrito pela IA do iPhone. Confira os detalhes na documentação oficial.";

export function topicPageContent(title: string) {
  return `## O que é\n${title} é um dos passos da trilha de Data Science. Aqui vai uma explicação curta, em linguagem simples, do conceito e de quando usar.\n\n## Exemplo de código\n\`\`\`python\nimport pandas as pd\ndf = pd.read_csv("vendas.csv")\ndf.head()\n\`\`\`\n\n## Exercício\nUse um conjunto de dados público e aplique ${title.toLowerCase()} em 3 perguntas diferentes.\n\n${AI_FOOTER}`;
}

/* ------------------------------------------------------------------ */
/* Lazer                                                               */
/* ------------------------------------------------------------------ */

export type LeisureCategory = "Games" | "Filmes" | "Séries" | "Futebol" | "Outro";
export type LeisureStatus = "Quero ver" | "Em andamento" | "Concluído";
export type LeisureItem = {
  id: string;
  title: string;
  category: LeisureCategory;
  status: LeisureStatus;
  rating: number;
  notes: string;
};

export const KNOWN_TEAMS = [
  "Flamengo", "Palmeiras", "Corinthians", "São Paulo", "Santos", "Vasco", "Fluminense", "Botafogo",
  "Grêmio", "Internacional", "Atlético-MG", "Cruzeiro", "Bahia", "Fortaleza", "Athletico-PR", "Vitória",
];

export function upcomingGames(team: string) {
  const rivals = ["Palmeiras", "Bahia", "Racing", "Fluminense", "Corinthians"].filter((r) => r !== team);
  return [
    { id: "g1", home: team, away: rivals[0], league: "Brasileirão", when: new Date(2026, 10, 1), time: "16:00", tv: "Globo e Premiere" },
    { id: "g2", home: rivals[1], away: team, league: "Brasileirão", when: new Date(2026, 10, 4), time: "21:30", tv: "Premiere" },
    { id: "g3", home: team, away: rivals[2], league: "Libertadores", when: new Date(2026, 10, 11), time: "21:00", tv: "Paramount+" },
    { id: "g4", home: rivals[3], away: team, league: "Brasileirão", when: new Date(2026, 10, 15), time: "18:30", tv: null },
  ];
}

export const SUGGESTIONS: {
  id: string;
  title: string;
  type: "Filmes" | "Séries";
  badge: "Estreia" | "Para você";
  meta: string;
  blurb: string;
}[] = [
  { id: "s1", title: "O Último Farol", type: "Filmes", badge: "Estreia", meta: "Cinema · Estreia em 26/11", blurb: "Uma faroleira isolada descobre sinais vindos do fundo do mar." },
  { id: "s2", title: "Cidade Submersa", type: "Séries", badge: "Estreia", meta: "Série no ar · Episódios novos", blurb: "Investigação em uma metrópole que afunda alguns centímetros por ano." },
  { id: "s3", title: "Dark", type: "Séries", badge: "Para você", meta: "Série · De 2017", blurb: "Parecido com Ruptura." },
  { id: "s4", title: "A Chegada", type: "Filmes", badge: "Para você", meta: "Filme · De 2016", blurb: "Parecido com Interestelar." },
];

/* ------------------------------------------------------------------ */
/* Notícias                                                            */
/* ------------------------------------------------------------------ */

export const PRESET_TOPICS = [
  "Tecnologia", "Inteligência artificial", "Ciência", "Games",
  "Futebol", "Filmes e séries", "Economia", "Startups",
];
export const MAX_TOPICS = 8;

const NEWS: Record<string, string[]> = {
  Tecnologia: [
    "Fabricantes anunciam baterias que carregam em 10 minutos",
    "Brasil passa de 60% de cobertura 5G nas capitais",
    "Nova geração de chips promete notebooks mais frios",
  ],
  "Inteligência artificial": [
    "Modelos de IA no próprio celular ganham espaço em 2026",
    "Universidades lançam guia para uso de IA em trabalhos",
    "Empresas brasileiras testam assistentes para atendimento",
  ],
  Ciência: ["Telescópio registra a galáxia mais distante já vista", "Pesquisa brasileira avança em vacina contra dengue"],
  Games: ["Lançamentos de novembro: confira a lista", "Torneio nacional de e-sports bate recorde de público"],
  Futebol: ["Rodada decisiva mexe na briga pelo título", "Seleção divulga convocados para amistosos"],
  "Filmes e séries": ["Festival do Rio divulga os vencedores", "Séries mais vistas da semana no streaming"],
  Economia: ["Inflação de outubro fica abaixo do esperado", "Dólar fecha a semana em queda"],
  Startups: ["Startups de saúde lideram investimentos no trimestre", "Programa público abre vagas para aceleração"],
};

export function newsFor(topic: string) {
  const heads = NEWS[topic] ?? [`${topic}: o que mudou nesta semana`, `Especialistas comentam as novidades sobre ${topic}`];
  return heads.slice(0, 3).map((h, i) => ({
    id: `${topic}-${i}`,
    topic,
    headline: h,
    published: `Publicada em ${pad(28 - i)}/10 às ${pad(9 + i * 3)}:30`,
    summary: `Resumo do Jarvis: ${h.toLowerCase()}. Em duas frases, o essencial para você ler depois.`,
    source: ["Jornal Exemplo", "Folha Exemplo", "Portal Exemplo"][i % 3],
    url: `https://news.google.com/search?q=${encodeURIComponent(topic)}&hl=pt-BR`,
  }));
}

/* ------------------------------------------------------------------ */
/* Validações das chaves                                               */
/* ------------------------------------------------------------------ */

export function validateClaudeKey(key: string) {
  const k = key.trim();
  if (!k) return "Cole a chave da API";
  if (!k.startsWith("sk-ant-")) return "Chave inválida. Ela começa com sk-ant-";
  return null;
}
export function validateTmdbKey(key: string) {
  const k = key.trim();
  if (!k) return null;
  return /^[a-zA-Z0-9]{32}$/.test(k) ? null : "Use a 'Chave da API' (32 letras e números), não o token";
}

/* ------------------------------------------------------------------ */
/* Estado do protótipo                                                 */
/* ------------------------------------------------------------------ */

export type AiMode = "active" | "failed" | "no-device" | "off" | "downloading";
export type NewsMode = "ok" | "loading" | "empty" | "offline" | "down";
export type LockVariant = "normal" | "failed" | "no-passcode" | "lost-key";

export const AI_UNAVAILABLE_REASON: Record<Exclude<AiMode, "active" | "failed">, string> = {
  "no-device": "Este aparelho não tem Apple Intelligence.",
  off: "Ligue o Apple Intelligence em Ajustes para usar a IA do iPhone.",
  downloading: "O iPhone ainda está baixando o modelo do Apple Intelligence.",
};

export type Settings = {
  reminderHour: number;
  reminderDays: number;
  topics: string[];
  customTopics: string[];
  team: string;
  tmdbKey: string;
  jarvisName: string;
  claudeOn: boolean;
  claudeKey: string;
};

export type CentralState = {
  bills: Bill[];
  history: HistoryEntry[];
  dates: SpecialDate[];
  pages: StudyPage[];
  trailDone: string[];
  leisure: LeisureItem[];
  settings: Settings;
  ai: AiMode;
  news: NewsMode;
  claudeCardDismissed: boolean;
  locked: boolean;
  lockVariant: LockVariant;
  cover: null | "background" | "recording";
};

function createInitialState(): CentralState {
  return {
    bills: [
      { id: "b1", name: "Internet 1", amount: 99, dueDay: 19, fine: 2, interest: 1, recurring: true, notes: "", openDue: "2026-10-19" },
      { id: "b2", name: "Faculdade", amount: null, dueDay: 29, fine: 2, interest: 1, recurring: true, notes: "Valor muda com as matérias do semestre.", openDue: "2026-10-29" },
      { id: "b3", name: "Internet 2", amount: 99, dueDay: 1, fine: 2, interest: 1, recurring: true, notes: "", openDue: "2026-11-01" },
      { id: "b4", name: "Academia", amount: 120, dueDay: 15, fine: 0, interest: 0, recurring: true, notes: "", openDue: "2026-11-15" },
      { id: "b5", name: "IPVA 2026", amount: 412.3, dueDay: 20, fine: 0.33, interest: 1, recurring: false, notes: "Última parcela.", openDue: null },
    ],
    history: [
      { id: "h1", billId: "b5", name: "IPVA 2026", paidAt: "2026-10-20", due: "2026-10-20", amount: 412.3, charges: 0 },
      { id: "h2", billId: "b4", name: "Academia", paidAt: "2026-10-14", due: "2026-10-15", amount: 120, charges: 0 },
      { id: "h3", billId: "b3", name: "Internet 2", paidAt: "2026-10-01", due: "2026-10-01", amount: 99, charges: 0 },
      { id: "h4", billId: "b2", name: "Faculdade", paidAt: "2026-09-28", due: "2026-09-29", amount: 1250, charges: 0 },
      { id: "h5", billId: "b1", name: "Internet 1", paidAt: "2026-09-18", due: "2026-09-19", amount: 99, charges: 0 },
      { id: "h6", billId: "b4", name: "Academia", paidAt: "2026-09-15", due: "2026-09-15", amount: 120, charges: 0 },
      { id: "h7", billId: "b3", name: "Internet 2", paidAt: "2026-08-31", due: "2026-09-01", amount: 99, charges: 0 },
      { id: "h8", billId: "b2", name: "Faculdade", paidAt: "2026-08-29", due: "2026-08-29", amount: 1250, charges: 0 },
      { id: "h9", billId: "b1", name: "Internet 1", paidAt: "2026-08-22", due: "2026-08-19", amount: 101.08, charges: 2.08 },
    ],
    dates: [
      { id: "d1", name: "Ana", day: 30, month: 10, year: 1996, kind: "Aniversário", notify: true, notes: "Gosta de livros de fantasia." },
      { id: "d2", name: "Namoro com a Júlia", day: 29, month: 10, year: 2021, kind: "Comemoração", notify: true, notes: "Reservar o restaurante." },
      { id: "d3", name: "Pedro", day: 10, month: 11, year: 1999, kind: "Aniversário", notify: true, notes: "" },
      { id: "d4", name: "Vó Maria", day: 15, month: 1, year: 1948, kind: "Aniversário", notify: false, notes: "Lembrar de ligar cedo." },
      { id: "d5", name: "Formatura", day: 12, month: 12, year: null, kind: "Outro", notify: true, notes: "" },
    ],
    pages: [
      { id: "p1", title: "Perguntas para o projeto de vendas", kind: "Análise de dados", content: "1. Quais produtos vendem mais por região?\n2. Existe sazonalidade?\n3. Ticket médio por canal.", pinned: true, edited: "2026-10-28" },
      { id: "p2", title: "Ideia: painel de hábitos com pandas", kind: "Ideia", content: "Juntar os dados do diário e fazer um gráfico semanal.", pinned: true, edited: "2026-10-27" },
      { id: "p3", title: "Python básico", kind: "Anotação", content: topicPageContent("Python básico"), pinned: false, edited: "2026-10-26", topicId: "m1-1" },
      { id: "p4", title: "Listas, dicionários e funções", kind: "Anotação", content: topicPageContent("Listas, dicionários e funções"), pinned: false, edited: "2026-10-25", topicId: "m1-2" },
      { id: "p5", title: "NumPy", kind: "Anotação", content: topicPageContent("NumPy"), pinned: false, edited: "2026-10-24", topicId: "m2-1" },
      { id: "p6", title: "Resumo: média, mediana e moda", kind: "Anotação", content: "Mediana é melhor quando há valores muito fora da curva.", pinned: false, edited: "2026-10-22" },
      { id: "p7", title: "Análise: gastos do mês com contas", kind: "Análise de dados", content: "Agosto teve R$ 2,08 de encargos por atraso.", pinned: false, edited: "2026-10-20" },
      { id: "p8", title: "Ideia: prever atraso de contas", kind: "Ideia", content: "Classificação simples com histórico de pagamentos.", pinned: false, edited: "2026-10-18" },
      { id: "p9", title: "Consultas SQL úteis", kind: "Anotação", content: "SELECT categoria, SUM(valor) FROM gastos GROUP BY categoria;", pinned: false, edited: "2026-10-15" },
      { id: "p10", title: "Dataset do IBGE para praticar", kind: "Anotação", content: "Baixar a PNAD contínua e testar limpeza.", pinned: false, edited: "2026-10-12" },
      { id: "p11", title: "Análise: horas de estudo x notas", kind: "Análise de dados", content: "Correlação de 0,62 nas últimas 8 semanas.", pinned: false, edited: "2026-10-09" },
      { id: "p12", title: "Ideia: bot que resume artigos", kind: "Ideia", content: "Usar a IA do iPhone para resumir PDFs salvos.", pinned: false, edited: "2026-10-05" },
    ],
    trailDone: ["m1-1", "m1-2", "m1-3", "m2-1", "m2-2"],
    leisure: [
      { id: "l1", title: "The Last of Us Part II", category: "Games", status: "Em andamento", rating: 4, notes: "PS5, capítulo Seattle dia 2." },
      { id: "l2", title: "The Bear", category: "Séries", status: "Em andamento", rating: 4, notes: "Temporada 3, com a Júlia." },
      { id: "l3", title: "Duna: Parte Dois", category: "Filmes", status: "Quero ver", rating: 0, notes: "Max" },
      { id: "l4", title: "Hollow Knight: Silksong", category: "Games", status: "Quero ver", rating: 0, notes: "" },
      { id: "l5", title: "Final da Libertadores", category: "Futebol", status: "Quero ver", rating: 0, notes: "Juntar a galera." },
      { id: "l6", title: "Ruptura", category: "Séries", status: "Concluído", rating: 5, notes: "Apple TV+" },
      { id: "l7", title: "Interestelar", category: "Filmes", status: "Concluído", rating: 5, notes: "" },
      { id: "l8", title: "Trilha da Pedra Bonita", category: "Outro", status: "Concluído", rating: 4, notes: "Ir cedo." },
    ],
    settings: {
      reminderHour: 9,
      reminderDays: 1,
      topics: ["Tecnologia", "Inteligência artificial"],
      customTopics: [],
      team: "Flamengo",
      tmdbKey: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      jarvisName: "Gabriel",
      claudeOn: false,
      claudeKey: "",
    },
    ai: "active",
    news: "ok",
    claudeCardDismissed: false,
    locked: true,
    lockVariant: "normal",
    cover: null,
  };
}

let state: CentralState = createInitialState();
const serverSnapshot = state;
const listeners = new Set<() => void>();

export function getCentral() {
  return state;
}
export function setCentral(update: Partial<CentralState> | ((s: CentralState) => Partial<CentralState>)) {
  const patch = typeof update === "function" ? update(state) : update;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useCentral() {
  return useSyncExternalStore(subscribe, () => state, () => serverSnapshot);
}

export const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const claudeActive = (s: CentralState) => s.settings.claudeOn && !validateClaudeKey(s.settings.claudeKey);
export const iphoneAi = (s: CentralState) => s.ai === "active" || s.ai === "failed";

/* ------------------------------------------------------------------ */
/* Ações                                                               */
/* ------------------------------------------------------------------ */

/** Marca como paga e devolve a função de desfazer. */
export function markBillPaid(id: string) {
  const prev = { bills: state.bills, history: state.history };
  const bill = state.bills.find((b) => b.id === id);
  if (!bill?.openDue) return () => {};
  const c = billCharges(bill);
  const entry: HistoryEntry = {
    id: uid("h"),
    billId: bill.id,
    name: bill.name,
    paidAt: toISO(TODAY),
    due: bill.openDue,
    amount: c.total,
    charges: Math.round((c.fine + c.interest) * 100) / 100,
  };
  setCentral((s) => ({
    history: [entry, ...s.history],
    bills: s.bills.map((b) => (b.id === id ? { ...b, openDue: b.recurring ? nextDue(b.openDue!, b.dueDay) : null } : b)),
  }));
  return () => setCentral(prev);
}

export function unmarkPaid(entryId: string) {
  const entry = state.history.find((h) => h.id === entryId);
  if (!entry) return;
  setCentral((s) => ({
    history: s.history.filter((h) => h.id !== entryId),
    bills: s.bills.map((b) => (b.id === entry.billId ? { ...b, openDue: entry.due } : b)),
  }));
}

export function lockApp(variant: LockVariant = "normal") {
  setCentral({ locked: true, lockVariant: variant, cover: null });
}

export function wipeData() {
  setCentral({ bills: [], history: [], locked: false, lockVariant: "normal" });
}
