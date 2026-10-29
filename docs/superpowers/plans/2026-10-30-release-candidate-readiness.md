# Release 1.5.0 unattended readiness plan

**Goal:** prepare candidate PR141 for a later main merge, execute all available
unattended checks, document actual remaining gates and turn the maintainer TV off.
**Source:** release/next08b6acac0972ac035370070450953ac2a3d9938f.
**Architecture:** reuse the completed trusted candidate build40936979918/1 for
artifact verification; run local host/browser regressions and read-only TV checks.
This first policy rollout stays unpinned. Main merge/publication is outside scope.
**Constraints:** no interactive questions; no supervised Root mutation/recovery,
failsafe or AC tests while owner sleeps; no private diagnostics in public records.
Existing research and other worktrees remain untouched.

- [x] Audit inventory, issue status, versions, docs and independent release gates.
- [x] Correct stale documentation and review the complete focused diff.
- [x] Run full local host checks and available browser/compatibility checks.
- [x] Verify exact trusted CI artifact SHA-256, embedded versions and payload closure.
- [x] Exercise supported native host entrypoint runtime without TV mutation.
- [x] Read TV identity, installed versions, update/recovery baseline without changes.
- [x] Record observed results, honest unsupported/supervised cases and issue statuses.
- [ ] Integrate reviewed preparation docs into release/next and update PR141.
- [x] Turn TV off through existing authenticated control and verify the outcome.
