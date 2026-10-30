import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { SettingsScreen } from "@/components/proto/SettingsScreen";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Murdock Assistent" },
      { name: "description", content: "Lembretes, temas de notícias, time, chaves e o Jarvis do Murdock Assistent." },
      { property: "og:title", content: "Configurações — Murdock Assistent" },
      { property: "og:description", content: "Lembretes, temas de notícias, time, chaves e o Jarvis do Murdock Assistent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <SettingsScreen />
    </PhoneShell>
  );
}
