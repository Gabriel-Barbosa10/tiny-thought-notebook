import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { StudiesScreen } from "@/components/proto/StudiesScreen";

export const Route = createFileRoute("/areas/estudos")({
  head: () => ({
    meta: [
      { title: "Estudos — Murdock Assistent" },
      { name: "description", content: "Ideias, anotações e análises de dados, com a trilha de Data Science." },
      { property: "og:title", content: "Estudos — Murdock Assistent" },
      { property: "og:description", content: "Ideias, anotações e análises de dados, com a trilha de Data Science." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <StudiesScreen />
    </PhoneShell>
  );
}
