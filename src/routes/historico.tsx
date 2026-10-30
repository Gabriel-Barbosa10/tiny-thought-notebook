import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { HistoryScreen } from "@/components/proto/HistoryScreen";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Murdock Assistent" },
      { name: "description", content: "Contas marcadas como pagas, agrupadas por mês, com exportação em CSV." },
      { property: "og:title", content: "Histórico — Murdock Assistent" },
      { property: "og:description", content: "Contas marcadas como pagas, agrupadas por mês, com exportação em CSV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <HistoryScreen />
    </PhoneShell>
  );
}
