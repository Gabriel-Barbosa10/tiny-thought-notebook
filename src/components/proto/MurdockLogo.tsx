import { cn } from "@/lib/utils";

/** Marca "mdk" do Murdock Assistent, redesenhada em vetor a partir do logo original. */
export function MurdockMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 86 31" className={className} role="img" aria-label="Murdock Assistent">
      <path className={inverted ? "fill-brand-paper" : "fill-brand-ink"} d="M0.5 28V10.5Q0.5 6.5 4.5 6.5H32V27.5H26.5V12H20V27.5H15V12H6V28Z" />
      <path className={inverted ? "fill-brand-paper" : "fill-brand-ink"} d="M55 1.5H60.5V30H55Z" />
      <path
        className="fill-brand-slate"
        d="M17 4.5H53.5Q60.5 4.5 60.5 11.5V20.5Q60.5 28 53 28H46.5Q39 28 39 20.5V11H44.5V19.5Q44.5 22.5 47.5 22.5H52Q55 22.5 55 19.5V12.5Q55 10 52.5 10H17Z"
      />
      <path className={inverted ? "fill-brand-paper" : "fill-brand-ink"} d="M55 21H60.5V30H55Z" />
      <path className={inverted ? "fill-brand-paper" : "fill-brand-ink"} d="M62.5 13L76.5 0.5H85L69.5 15.5L86 29.5H77.5L62.5 18Z" />
    </svg>
  );
}

/** Ícone do app: a marca dentro do quadrado arredondado em degradê claro. */
export function MurdockAppIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex aspect-square items-center justify-center rounded-[28%] bg-gradient-to-b from-brand-tile-from to-brand-tile-to shadow-card",
        className,
      )}
    >
      <MurdockMark inverted className="w-[72%]" />
    </span>
  );
}
