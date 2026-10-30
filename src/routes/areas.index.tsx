import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { AreasScreen } from "@/components/proto/AreasScreen";

export const Route = createFileRoute("/areas/")({
  head: () => ({
    meta: [
      { title: "Áreas — Murdock Assistent" },
      { name: "description", content: "Estudos, lazer e datas especiais organizados em um só lugar." },
      { property: "og:title", content: "Áreas — Murdock Assistent" },
      { property: "og:description", content: "Estudos, lazer e datas especiais organizados em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <AreasScreen />
    </PhoneShell>
  );
}
