import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { TrailScreen } from "@/components/proto/TrailScreen";

export const Route = createFileRoute("/areas/trilha")({
  head: () => ({
    meta: [
      { title: "Trilha de Data Science — Murdock Assistent" },
      { name: "description", content: "26 tópicos de Data Science para marcar e estudar com o Jarvis." },
      { property: "og:title", content: "Trilha de Data Science — Murdock Assistent" },
      { property: "og:description", content: "26 tópicos de Data Science para marcar e estudar com o Jarvis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <TrailScreen />
    </PhoneShell>
  );
}
