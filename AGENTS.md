<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Prototype screens live in `src/components/proto/` and are wrapped by `PhoneShell` per route; sheets/overlays use `absolute` positioning anchored to the phone frame (the scroll area stays unpositioned) so they stay inside the device mockup on desktop.
- Mock data for the prototype lives in `src/lib/proto-data.ts` (tasks) and `src/lib/central-store.ts` (contas, histórico, datas, estudos, lazer, settings, lock state); no backend. `central-store` is an in-memory store shared across screens via `useSyncExternalStore` so actions (e.g. marking a bill paid) show on every tab; it resets on reload.
- Business rules (bill charges/status, briefing order, key/date validation) live as pure functions in `central-store.ts` and are covered by `src/test/central-rules.test.ts`.
- The lock screen and privacy cover render inside `PhoneShell`; while locked, screen content and its overlays are not mounted at all.
