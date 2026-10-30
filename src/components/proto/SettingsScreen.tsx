import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCircle2, Info, Lock, MonitorPlay, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AI_UNAVAILABLE_REASON,
  MAX_TOPICS,
  PRESET_TOPICS,
  lockApp,
  setCentral,
  useCentral,
  validateClaudeKey,
  validateTmdbKey,
  type AiMode,
  type LockVariant,
  type NewsMode,
} from "@/lib/central-store";
import { Chip, Field, ScreenHeader, SecureField, ToggleRow } from "@/components/proto/ui";

export function SettingsScreen() {
  const s = useCentral();
  const navigate = useNavigate();
  const [hour, setHour] = useState(String(s.settings.reminderHour));
  const [days, setDays] = useState(String(s.settings.reminderDays));
  const [topics, setTopics] = useState<string[]>(s.settings.topics);
  const [custom, setCustom] = useState<string[]>(s.settings.customTopics);
  const [otherTopic, setOtherTopic] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [team, setTeam] = useState(s.settings.team);
  const [tmdb, setTmdb] = useState(s.settings.tmdbKey);
  const [jarvisName, setJarvisName] = useState(s.settings.jarvisName);
  const [claudeOn, setClaudeOn] = useState(s.settings.claudeOn);
  const [claudeKey, setClaudeKey] = useState(s.settings.claudeKey);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const toggleTopic = (t: string) => {
    setTopicError(null);
    if (topics.includes(t)) return setTopics(topics.filter((x) => x !== t));
    if (topics.length >= MAX_TOPICS) return setTopicError("Escolha no máximo 8 temas.");
    setTopics([...topics, t]);
  };
  const addTopic = () => {
    const t = otherTopic.trim();
    if (!t) return;
    if (topics.length >= MAX_TOPICS) return setTopicError("Escolha no máximo 8 temas.");
    if (!PRESET_TOPICS.includes(t) && !custom.includes(t)) setCustom([...custom, t]);
    if (!topics.includes(t)) setTopics([...topics, t]);
    setOtherTopic("");
  };

  const save = () => {
    const h = Number(hour);
    const d = Number(days);
    const e: Record<string, string | null> = {
      hour: !/^\d{1,2}$/.test(hour) || h > 23 ? "Informe uma hora de 0 a 23" : null,
      days: !/^\d$/.test(days) || d > 7 ? "Informe de 0 a 7 dias" : null,
      tmdb: validateTmdbKey(tmdb),
      claude: claudeOn || claudeKey ? (claudeKey ? validateClaudeKey(claudeKey) : claudeOn ? "Cole a chave da API" : null) : null,
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    setCentral({
      settings: {
        reminderHour: h,
        reminderDays: d,
        topics,
        customTopics: custom,
        team: team.trim(),
        tmdbKey: tmdb.trim(),
        jarvisName: jarvisName.trim(),
        claudeOn,
        claudeKey: claudeKey.trim(),
      },
    });
    navigate({ to: "/" });
  };

  const aiOk = s.ai === "active" || s.ai === "failed";

  return (
    <div className="pb-12">
      <ScreenHeader
        title="Configurações"
        back="/"
        actions={
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground active:opacity-85"
          >
            Salvar
          </button>
        }
      />

      <Section title="Lembretes">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora do aviso" inputMode="numeric" value={hour} onChange={setHour} suffix="h" error={errors.hour} />
          <Field label="Dias de antecedência" inputMode="numeric" value={days} onChange={setDays} error={errors.days} />
        </div>
        <p className="text-xs text-muted-foreground">Prévia do aviso na tela bloqueada (sem nome nem valor):</p>
        <div className="flex items-start gap-3 rounded-2xl bg-surface p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Bell className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>MURDOCK ASSISTENT</span>
              <span>{String(Number(hour) || 0).padStart(2, "0")}:00</span>
            </p>
            <p className="mt-0.5 text-sm font-semibold">1 conta vence amanhã</p>
            <p className="text-sm font-semibold">1 data especial hoje</p>
          </div>
        </div>
      </Section>

      <Section title="Notícias">
        <p className="text-sm text-muted-foreground">
          Temas das notícias do Início, do Google Notícias (ou do Claude, se conectado). Só os temas são enviados.
        </p>
        <div className="flex flex-wrap gap-2">
          {[...PRESET_TOPICS, ...custom].map((t) => (
            <Chip key={t} active={topics.includes(t)} onClick={() => toggleTopic(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Outro tema" value={otherTopic} onChange={setOtherTopic} placeholder="Ex.: Fórmula 1, Apple, energia solar" />
          </div>
          <button
            type="button"
            onClick={addTopic}
            className="rounded-2xl bg-brand px-4 py-3.5 text-sm font-semibold text-brand-foreground active:opacity-85"
          >
            Adicionar
          </button>
        </div>
        <p className={cn("text-xs", topicError ? "font-medium text-destructive" : "text-muted-foreground")}>
          {topicError ?? `${topics.length} de ${MAX_TOPICS} temas escolhidos.`}
        </p>
      </Section>

      <Section title="Lazer">
        <Field
          label="Meu time"
          value={team}
          onChange={setTeam}
          placeholder="Ex.: Flamengo"
          helper="Os jogos vêm do TheSportsDB; só o nome do time é enviado."
        />
        <SecureField
          label="Chave do TMDB (grátis)"
          value={tmdb}
          onChange={setTmdb}
          error={errors.tmdb}
          helper="Para estreias e sugestões de filmes e séries. Crie em themoviedb.org → Configurações → API. Só os títulos favoritos são enviados."
        />
      </Section>

      <Section title="Jarvis">
        <Field label="Como o Jarvis deve te chamar" value={jarvisName} onChange={setJarvisName} placeholder="Ex.: Gabriel" helper="Opcional." />
        <div className="flex items-start gap-3 rounded-2xl bg-surface p-4">
          {aiOk ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-tag-green-foreground" />
          ) : (
            <Info className="mt-0.5 size-5 shrink-0 text-tag-blue-foreground" />
          )}
          <div>
            <p className="text-[15px] font-semibold">IA do iPhone</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {aiOk
                ? "Ativa e gratuita. Escreve o briefing e as páginas de estudo sem nada sair do aparelho."
                : AI_UNAVAILABLE_REASON[s.ai as Exclude<AiMode, "active" | "failed">]}
            </p>
          </div>
        </div>
        <ToggleRow
          label="Briefing com o Claude"
          helper="Opcional e pago. Desligado, o Jarvis usa a IA do iPhone ou o resumo do aparelho."
          checked={claudeOn}
          onChange={setClaudeOn}
        />
        <SecureField
          label="Chave da API da Anthropic"
          value={claudeKey}
          onChange={setClaudeKey}
          error={errors.claude}
          placeholder="sk-ant-…"
          helper="Crie em console.anthropic.com. Fica guardada no banco criptografado, liberado pelo Face ID."
        />
        <div className="rounded-2xl bg-surface p-4 text-sm leading-relaxed">
          <p className="font-bold">O que é enviado ao Claude</p>
          <p className="mt-2 font-semibold">Sai do aparelho:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
            <li>Nome das contas, valores e vencimentos, para escrever o briefing.</li>
            <li>Seus temas de notícias.</li>
            <li>O nome do tópico da trilha, ao gerar uma página.</li>
          </ul>
          <p className="mt-3 font-semibold">Nunca sai:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
            <li>Observações das contas e das datas.</li>
            <li>Nomes de pessoas das datas especiais.</li>
            <li>O conteúdo das suas páginas de estudo.</li>
          </ul>
        </div>
      </Section>

      <DemoSection />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-8 border-surface px-5 py-6 first-of-type:border-t-0">
      <h2 className="text-[17px] font-bold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Controles só do protótipo, para ver cada estado das telas. */
function DemoSection() {
  const s = useCentral();
  const aiModes: { id: AiMode; label: string }[] = [
    { id: "active", label: "Ativa" },
    { id: "failed", label: "Falhou" },
    { id: "no-device", label: "Sem Apple Intelligence" },
    { id: "off", label: "Desligada" },
    { id: "downloading", label: "Baixando modelo" },
  ];
  const newsModes: { id: NewsMode; label: string }[] = [
    { id: "ok", label: "Normal" },
    { id: "loading", label: "Carregando" },
    { id: "empty", label: "Vazio" },
    { id: "offline", label: "Sem internet" },
    { id: "down", label: "Fora do ar" },
  ];
  const locks: { id: LockVariant; label: string }[] = [
    { id: "normal", label: "Bloquear agora" },
    { id: "failed", label: "Face ID falhou" },
    { id: "no-passcode", label: "Sem código no iPhone" },
    { id: "lost-key", label: "Chave perdida" },
  ];
  return (
    <section className="mx-5 mt-2 rounded-3xl border-2 border-dashed border-border p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Só no protótipo</p>
      <h2 className="mt-1 text-[17px] font-bold">Ver outros estados</h2>

      <p className="mt-4 text-sm font-semibold">IA do iPhone</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {aiModes.map((m) => (
          <Chip key={m.id} active={s.ai === m.id} onClick={() => setCentral({ ai: m.id, claudeCardDismissed: false })}>
            {m.label}
          </Chip>
        ))}
      </div>

      <p className="mt-5 text-sm font-semibold">Notícias</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {newsModes.map((m) => (
          <Chip key={m.id} active={s.news === m.id} onClick={() => setCentral({ news: m.id })}>
            {m.label}
          </Chip>
        ))}
      </div>

      <p className="mt-5 text-sm font-semibold">Segurança</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {locks.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => lockApp(l.id)}
            className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold active:bg-surface-strong"
          >
            <Lock className="size-4 shrink-0" />
            {l.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCentral({ cover: "background", locked: true })}
          className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold active:bg-surface-strong"
        >
          <ShieldCheck className="size-4 shrink-0" />
          Sair do app
        </button>
        <button
          type="button"
          onClick={() => setCentral({ cover: "recording" })}
          className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-3 text-left text-sm font-semibold active:bg-surface-strong"
        >
          <MonitorPlay className="size-4 shrink-0" />
          Gravando a tela
        </button>
      </div>
    </section>
  );
}
