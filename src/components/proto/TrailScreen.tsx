import { useState } from "react";
import { Check, FileText, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TODAY,
  TRAIL,
  claudeActive,
  iphoneAi,
  setCentral,
  toISO,
  topicPageContent,
  uid,
  useCentral,
  type StudyPage,
} from "@/lib/central-store";
import { ScreenHeader, useSnackbar } from "@/components/proto/ui";
import { PageEditor } from "@/components/proto/StudiesScreen";

export function TrailScreen() {
  const s = useCentral();
  const [generating, setGenerating] = useState<string | null>(null);
  const [open, setOpen] = useState<StudyPage | null>(null);
  const snack = useSnackbar();
  const canWrite = iphoneAi(s) || claudeActive(s);

  const toggle = (id: string) =>
    setCentral((st) => ({
      trailDone: st.trailDone.includes(id)
        ? st.trailDone.filter((x) => x !== id)
        : [...st.trailDone, id],
    }));

  const study = (id: string, title: string) => {
    if (!canWrite) {
      snack.show(
        "Este aparelho não tem Apple Intelligence. Sem ela, o Jarvis só escreve a página com o Claude conectado.",
      );
      return;
    }
    setGenerating(id);
    setTimeout(() => {
      const page: StudyPage = {
        id: uid("p"),
        title,
        kind: "Anotação",
        content: topicPageContent(title),
        pinned: false,
        edited: toISO(TODAY),
        topicId: id,
      };
      setCentral((st) => ({ pages: [page, ...st.pages] }));
      setGenerating(null);
      setOpen(page);
    }, 1800);
  };

  return (
    <div className="pb-24">
      <ScreenHeader title="Data Science" back="/areas/estudos" />
      <p className="px-5 text-sm leading-relaxed text-muted-foreground">
        Marque o que já estudou. Em cada tópico, o Jarvis escreve uma página com explicação, exemplo
        de código e exercício, que fica salva em Estudos. Só o nome do tópico é enviado.
      </p>

      {TRAIL.map((m, mi) => {
        const doneCount = m.topics.filter((t) => s.trailDone.includes(t.id)).length;
        return (
          <section key={m.id} className="pt-6">
            <div className="flex items-baseline justify-between px-5 pb-1">
              <h2 className="text-[17px] font-bold">
                {mi + 1}. {m.title}
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">
                {doneCount}/{m.topics.length}
              </span>
            </div>
            <ul>
              {m.topics.map((t) => {
                const done = s.trailDone.includes(t.id);
                const page = s.pages.find((p) => p.topicId === t.id);
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={`Concluído: ${t.title}`}
                      onClick={() => toggle(t.id)}
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                        done
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-surface-strong",
                      )}
                    >
                      {done && <Check className="size-3.5" strokeWidth={3} />}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-[15px]",
                        done && "text-muted-foreground line-through decoration-1",
                      )}
                    >
                      {t.title}
                    </span>
                    {generating === t.id ? (
                      <span className="flex size-9 items-center justify-center">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      </span>
                    ) : page ? (
                      <button
                        type="button"
                        aria-label="Abrir página"
                        title="Abrir página"
                        onClick={() => setOpen(page)}
                        className="flex size-9 items-center justify-center rounded-full bg-surface"
                      >
                        <FileText className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Estudar com o Jarvis"
                        title="Estudar com o Jarvis"
                        disabled={!!generating}
                        onClick={() => study(t.id, t.title)}
                        className="flex size-9 items-center justify-center rounded-full bg-tag-blue text-tag-blue-foreground disabled:opacity-50"
                      >
                        <Sparkles className="size-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {snack.node}
      {open && (
        <PageEditor
          page={s.pages.find((p) => p.id === open.id) ?? open}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
