import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { HomeScreen } from "@/components/proto/HomeScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Murdock Assistent" },
      {
        name: "description",
        content: "Briefing do dia do Jarvis: contas, datas especiais, resumo do mês e notícias.",
      },
      { property: "og:title", content: "Início — Murdock Assistent" },
      {
        property: "og:description",
        content: "Briefing do dia do Jarvis: contas, datas especiais, resumo do mês e notícias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PhoneShell statusTone="brand">
      <HomeScreen />
    </PhoneShell>
  );
}
