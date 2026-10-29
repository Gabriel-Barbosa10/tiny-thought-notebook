import { useState } from "react";
import { Lock, ScanFace, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { setCentral, wipeData, type LockVariant } from "@/lib/central-store";
import { MurdockAppIcon } from "@/components/proto/MurdockLogo";
import { ConfirmDialog } from "@/components/proto/ui";

const messages: Record<LockVariant, string> = {
  normal: "Seus dados estão protegidos.",
  failed: "Não foi possível confirmar sua identidade.",
  "no-passcode": "Ative o código e o Face ID do iPhone em Ajustes para usar o Murdock Assistent.",
  "lost-key":
    "Os dados salvos não podem ser abertos neste aparelho. Isso acontece quando o código do iPhone é removido.",
};

export function LockScreen({ variant }: { variant: LockVariant }) {
  const [scanning, setScanning] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const unlock = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setCentral({ locked: false, lockVariant: "normal" });
    }, 900);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-brand px-8 text-brand-foreground animate-in fade-in duration-200">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <MurdockAppIcon className="size-20 ring-1 ring-brand-raised" />
        <span className="mt-8 flex size-11 items-center justify-center rounded-full bg-brand-raised">
          <Lock className="size-5" />
        </span>
        <p className="mt-4 text-[24px] font-bold tracking-tight">Murdock Assistent</p>
        <p
          className={cn(
            "mt-2 max-w-[18rem] text-sm leading-relaxed",
            variant === "normal" ? "text-brand-muted" : "text-tag-red",
          )}
        >
          {messages[variant]}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pb-12">
        {scanning ? (
          <div className="flex h-[52px] items-center gap-2 text-sm font-semibold text-brand-muted">
            <ScanFace className="size-7 animate-pulse" />
            Olhe para o iPhone…
          </div>
        ) : (
          <button
            type="button"
            onClick={unlock}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-foreground py-4 text-[15px] font-bold text-brand active:opacity-90"
          >
            <ScanFace className="size-5" />
            Desbloquear
          </button>
        )}
        {variant === "lost-key" && !scanning && (
          <button
            type="button"
            onClick={() => setConfirmWipe(true)}
            className="py-2 text-sm font-semibold text-brand-muted underline-offset-4 hover:underline"
          >
            Apagar dados e recomeçar
          </button>
        )}
        <p className="text-[11px] text-brand-muted">Protótipo: o Face ID é simulado.</p>
      </div>

      {confirmWipe && (
        <div className="text-foreground">
          <ConfirmDialog
            title="Apagar todos os dados?"
            text="As contas e o histórico salvos serão apagados deste iPhone. Isso não pode ser desfeito."
            action="Apagar"
            danger
            onCancel={() => setConfirmWipe(false)}
            onConfirm={() => {
              setConfirmWipe(false);
              wipeData();
            }}
          />
        </div>
      )}
    </div>
  );
}

export function PrivacyCover({ kind }: { kind: "background" | "recording" }) {
  return (
    <button
      type="button"
      onClick={() => setCentral({ cover: null })}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-brand px-10 text-center text-brand-foreground"
    >
      <ShieldCheck className="size-14" strokeWidth={1.6} />
      <p className="mt-4 text-[22px] font-bold tracking-tight">Murdock Assistent</p>
      {kind === "recording" && (
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">Conteúdo oculto durante a gravação da tela.</p>
      )}
      <p className="absolute bottom-10 text-[11px] text-brand-muted">Protótipo: toque para voltar</p>
    </button>
  );
}
