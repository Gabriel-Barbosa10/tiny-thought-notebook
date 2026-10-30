import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { DatesScreen } from "@/components/proto/DatesScreen";

export const Route = createFileRoute("/areas/datas")({
  head: () => ({
    meta: [
      { title: "Datas especiais — Murdock Assistent" },
      { name: "description", content: "Aniversários e comemorações com aviso, em ordem da próxima data." },
      { property: "og:title", content: "Datas especiais — Murdock Assistent" },
      { property: "og:description", content: "Aniversários e comemorações com aviso, em ordem da próxima data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PhoneShell>
      <DatesScreen />
    </PhoneShell>
  );
}
