import { createFileRoute } from "@tanstack/react-router";

import { PhoneShell } from "@/components/proto/PhoneShell";
import { BillsScreen } from "@/components/proto/BillsScreen";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas — Murdock Assistent" },
      {
        name: "description",
        content: "Contas com vencimento, multa e juros, para lembrar e anotar o que já foi pago.",
      },
      { property: "og:title", content: "Contas — Murdock Assistent" },
      {
        property: "og:description",
        content: "Contas com vencimento, multa e juros, para lembrar e anotar o que já foi pago.",
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
      <BillsScreen />
    </PhoneShell>
  );
}
