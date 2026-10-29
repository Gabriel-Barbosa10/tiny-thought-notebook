import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { HomeScreen } from "@/components/proto/HomeScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Murdock Assistent" },
      { name: "description", content: "Protótipo mobile de um segundo cérebro pessoal: páginas, diário, hábitos e metas." },
      { property: "og:title", content: "Início — Murdock Assistent" },
      { property: "og:description", content: "Protótipo mobile de um segundo cérebro pessoal: páginas, diário, hábitos e metas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PhoneShell>
      <HomeScreen />
    </PhoneShell>
  );
}
