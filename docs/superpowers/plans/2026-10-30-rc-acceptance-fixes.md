# RC 1.5.0 acceptance fixes

The maintainer authorized implementation, parallel execution and new builds after
the observation-only pass. Baseline: `9e5059fdf8831920eaf7e0e44fc60cb4f966ed5f`.
The eight original findings remain in
`docs/history/2026-10-30-supervised-candidate-findings.md`; never replace failed
observations with source-test success.

## Parallel ownership

1. Theme presentation and repeated navigation: the theme-flash chat owns
   `launcher/app.js`, `launcher/style.css`, `launcher/index.html`,
   `launcher/theme-manager.js`, `launcher/theme-runtime.js` and relevant tests.
   Address RC-UI-03/04/02. Add regressions which fail before the change: delayed
   saved-theme preparation must not expose an unthemed first frame; warm
   visibility/relaunch must preserve accepted styling without disabling dialog
   isolation; 50/80/120/200 ms repeated keys must keep selected tiles visible and
   bound position lag through wrap in both directions. Preserve emergency and
   readiness/trial/boot markers. Both launcher editions use the shared fix.
2. Root presentation: the startup chat owns Root startup/power/presentation
   runtime and its Python tests. Address RC-START-05/08 separately. Reproduce
   the confirmed `preserved-foreground` branch and actual wake versus duplicate
   callback policy before fixing. Establish a narrow eligible startup context;
   preserve deliberate user foreground, explicit off, triple Home, failsafe,
   session/generation checks and recovery precedence. No blind Channels allowlist
   expansion, repeated launch loop or timeout-based false success.
3. Appearance/preview/layout persistence: the theme-UI chat owns
   `launcher/theme-panel.js`, `launcher/theme-panel.css`, `launcher/home-layout.js`,
   `root-edition/ui/root-profile.js`, preview generation, Itachi source/distribution
   metadata and relevant tests. Address RC-UI-01/06/07. Assert stable card/lane
   identity, focus and scroll during Apply; distinguish theme-derived effective
   columns from explicit/legacy user preferences across profile reload; capture
   the full 1920x1080 composition before thumbnail scaling. Preserve existing
   immutable Itachi 1.0.0 and create a new version/source-bound distribution.
4. Integration parent owns this plan, the evidence journal, release metadata,
   documentation, the combined PR and the supported System replacement gate.
   Independently test the narrow 1.1.1 to 1.1.2 transition before permitting it;
   keep all source/bundle/ownership/archive/integrity proofs and unknown-outcome
   refusal. Product migration must not be achieved through private-state edits.

Each implementation chat works in its own managed worktree, runs `npm ci` where
applicable, captures a failing regression before implementation, commits only
its owned files, and returns exact commits plus validation. The parent combines
reviewed commits in `codex/rc150-acceptance-fixes`, preserving the two unrelated
user research directories. Worktrees are cleaned only after commits and needed
evidence are preserved. No other task's worktree is touched.

## Integration and delivery

- [ ] Preserve the observation record and establish regression baselines.
- [ ] Complete the three independent implementation groups.
- [ ] Complete and review the supported retained-supervisor migration gate.
- [ ] Review each diff independently; fix substantive findings before integration.
- [ ] Merge the scoped commits locally and run the complete `scripts/test.sh`,
  affected both-edition browser/motion/first-frame tests, theme validation,
  geometry/legacy checks, release metadata and documentation checks.
- [ ] Update affected technical/user instructions and twelve locales when their
  visible behavior changes. Preserve historical results and honest limitations.
- [ ] Create one implementation PR to `release/next`, attach it, inspect CI and
  merge by merge commit after review and required checks. Refresh inventory and
  the draft release PR's current human validation block.
- [ ] Obtain a new complete trusted candidate build; verify downloaded artifacts,
  signatures, payloads, immutable theme provenance and exact package hashes.
- [ ] Install only through the supported coherent update flow after admission
  checks; repeat affected physical acceptance with the owner present. Keep
  standby and cold boot distinct and retain independent recovery.
- [ ] Close Helper and Android acceptance/approval gates honestly on exact final
  artifacts. Do not reuse earlier Helper approval or invent Android results.
- [ ] Finalize truthful acceptance and old-policy exact-head validation before
  readiness/main integration. This first rollout remains unpinned. Main merge
  and public delivery require their real gates; speed is not a bypass.

No external icon set, replacement icon mapping, new unbounded watcher or relaxed
integrity rule belongs to this fix scope. Prefer existing APIs and the smallest
change that closes the demonstrated failure.
