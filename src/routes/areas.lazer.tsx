import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { LeisureScreen } from "@/components/proto/LeisureScreen";

export const Route = createFileRoute("/areas/lazer")({
  head: () => ({
    meta: [
      { title: "Lazer — Murdock Assistent" },
      {
        name: "description",
        content: "Próximos jogos do seu time, estreias de filmes e séries e sua lista.",
      },
      { property: "og:title", content: "Lazer — Murdock Assistent" },
      {
        property: "og:description",
        content: "Próximos jogos do seu time, estreias de filmes e séries e sua lista.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <LeisureScreen />
    </PhoneShell>
  );
}
