import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { TaskBoardScreen } from "@/components/proto/TaskBoardScreen";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Segundo Cérebro" },
      { name: "description", content: "Quadro de tarefas estilo Notion para organizar o que precisa sair da cabeça." },
      { property: "og:title", content: "Tarefas — Segundo Cérebro" },
      { property: "og:description", content: "Quadro de tarefas estilo Notion para organizar o que precisa sair da cabeça." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TarefasPage,
});

function TarefasPage() {
  return (
    <PhoneShell>
      <TaskBoardScreen />
    </PhoneShell>
  );
}
