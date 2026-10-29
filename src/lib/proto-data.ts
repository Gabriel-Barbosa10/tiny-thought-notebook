export type TagColor = "gray" | "orange" | "yellow" | "green" | "blue" | "pink" | "red";

export const tagClasses: Record<TagColor, string> = {
  gray: "bg-tag-gray text-tag-gray-foreground",
  orange: "bg-tag-orange text-tag-orange-foreground",
  yellow: "bg-tag-yellow text-tag-yellow-foreground",
  green: "bg-tag-green text-tag-green-foreground",
  blue: "bg-tag-blue text-tag-blue-foreground",
  pink: "bg-tag-pink text-tag-pink-foreground",
  red: "bg-tag-red text-tag-red-foreground",
};

export const dotClasses: Record<TagColor, string> = {
  gray: "bg-tag-gray-foreground",
  orange: "bg-tag-orange-foreground",
  yellow: "bg-tag-yellow-foreground",
  green: "bg-tag-green-foreground",
  blue: "bg-tag-blue-foreground",
  pink: "bg-tag-pink-foreground",
  red: "bg-tag-red-foreground",
};

export type PageNode = {
  id: string;
  icon: string;
  title: string;
  to?: "/tarefas";
  children?: PageNode[];
};

export const favorites: PageNode[] = [
  { id: "fav-diario", icon: "📓", title: "Diário — 29 out" },
  { id: "fav-tarefas", icon: "✅", title: "Tarefas", to: "/tarefas" },
  { id: "fav-metas", icon: "🎯", title: "Metas 2026" },
];

export const privatePages: PageNode[] = [
  {
    id: "diario",
    icon: "📓",
    title: "Diário",
    children: [
      {
        id: "out",
        icon: "🗓️",
        title: "Outubro 2026",
        children: [
          { id: "d29", icon: "📝", title: "29 out — quinta" },
          { id: "d28", icon: "📝", title: "28 out — quarta" },
          { id: "d27", icon: "📝", title: "27 out — terça" },
        ],
      },
      { id: "set", icon: "🗓️", title: "Setembro 2026" },
    ],
  },
  {
    id: "projetos",
    icon: "🚀",
    title: "Projetos",
    children: [
      { id: "app", icon: "📱", title: "App segundo cérebro" },
      { id: "proj-tarefas", icon: "✅", title: "Tarefas", to: "/tarefas" },
    ],
  },
  { id: "habitos", icon: "🌱", title: "Hábitos" },
  {
    id: "notas",
    icon: "💡",
    title: "Notas & ideias",
    children: [
      { id: "livros", icon: "📚", title: "Livros lidos" },
      { id: "ideias", icon: "✨", title: "Ideias soltas" },
      { id: "citacoes", icon: "💬", title: "Citações" },
    ],
  },
  { id: "metas", icon: "🎯", title: "Metas 2026" },
  { id: "financas", icon: "💰", title: "Finanças pessoais" },
];

export const quickAccess: { id: string; icon: string; title: string; edited: string; color: TagColor; to?: "/tarefas" }[] = [
  { id: "q1", icon: "📓", title: "Diário de hoje", edited: "Agora há pouco", color: "yellow" },
  { id: "q2", icon: "✅", title: "Tarefas", edited: "Há 12 min", color: "blue", to: "/tarefas" },
  { id: "q3", icon: "🌱", title: "Hábitos", edited: "Ontem", color: "green" },
  { id: "q4", icon: "📚", title: "Livros lidos", edited: "Há 3 dias", color: "orange" },
];

export const initialHabits = [
  { id: "agua", icon: "💧", label: "Água", done: true },
  { id: "leitura", icon: "📖", label: "Ler 20 min", done: true },
  { id: "treino", icon: "🏃", label: "Treino", done: false },
  { id: "meditar", icon: "🧘", label: "Meditar", done: false },
];

export type Status = "todo" | "doing" | "done";

export const statuses: { id: Status; label: string; color: TagColor }[] = [
  { id: "todo", label: "A fazer", color: "gray" },
  { id: "doing", label: "Fazendo", color: "blue" },
  { id: "done", label: "Feito", color: "green" },
];

export const areas: { id: string; label: string; color: TagColor }[] = [
  { id: "pessoal", label: "Pessoal", color: "pink" },
  { id: "trabalho", label: "Trabalho", color: "blue" },
  { id: "saude", label: "Saúde", color: "green" },
  { id: "estudos", label: "Estudos", color: "orange" },
];

export type Priority = "Alta" | "Média" | "Baixa";

export const priorityColor: Record<Priority, TagColor> = {
  Alta: "red",
  Média: "yellow",
  Baixa: "gray",
};

export type Task = {
  id: string;
  title: string;
  status: Status;
  area: string;
  due?: string;
  priority: Priority;
};

export const initialTasks: Task[] = [
  { id: "t1", title: "Esboçar telas do app", status: "doing", area: "trabalho", due: "Hoje", priority: "Alta" },
  { id: "t2", title: "Revisar metas do trimestre", status: "todo", area: "pessoal", due: "Amanhã", priority: "Média" },
  { id: "t3", title: "Marcar consulta no dentista", status: "todo", area: "saude", due: "2 nov", priority: "Baixa" },
  { id: "t4", title: "Terminar capítulo 4 de “Hábitos Atômicos”", status: "doing", area: "estudos", due: "Sexta", priority: "Média" },
  { id: "t5", title: "Organizar notas da semana", status: "todo", area: "pessoal", priority: "Baixa" },
  { id: "t6", title: "Pagar fatura do cartão", status: "done", area: "pessoal", due: "Ontem", priority: "Alta" },
  { id: "t7", title: "Treino de pernas", status: "done", area: "saude", due: "Ontem", priority: "Média" },
  { id: "t8", title: "Pesquisar referências de design", status: "todo", area: "trabalho", due: "30 out", priority: "Média" },
];

export function flattenPages(nodes: PageNode[]): PageNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenPages(n.children) : [])]);
}
