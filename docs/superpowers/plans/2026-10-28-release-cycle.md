# Release cycle implementation plan

Goal: reuse verified candidate bytes and scoped device observations instead of
restarting the release after metadata edits. Spec: ../specs/2026-10-28-release-cycle-design.md.

- [x] Add a shared conservative Git input comparison and explicit build pin schema;
  test real histories, modes, ancestry and legacy exact-source behavior.
- [x] Use the same resolver in trusted policy and publication, require complete
  candidate full-suite/platform jobs, replace polling with pending + completion
  event refresh, and support successful failed-job reruns.
- [x] Build prepared versions before acceptance, skip pinned-equivalent rebuilds,
  run the full suite in the candidate build and remove redundant publication/push
  suites while preserving feature checks and required Linux/macOS status names.
- [x] Generate the candidate's machine-owned inventory/version/build block and
  a conservative physical-test scope report. Preserve human evidence.
- [x] Update CONTRIBUTING, release flow/checklist/template and hardware-test rules;
  document bootstrap, immutable-byte carryover, failed-job recovery and limits.
- [ ] Finish final verification, push and open a draft
  PR to release/next explicitly held for the next cycle. Archive the worktree
  after all needed commits are pushed.

## Validation ledger

- Shared Git-input tests: regular documentation/evidence reuse passes; source,
  executable/symlink, embedded guides, unknown inputs and sibling ancestry fail.
- Run/attempt binding, stale acceptance reset, real Jobs API pagination, pending
  completion/failure and record preservation regressions pass.
- Independent review: four initial findings fixed; follow-up found no remaining
  actionable P1/P2 issues and independently passed 22 focused tests.
- actionlint 1.7.12 passes changed workflows.
- Local full-suite run passed TV/Root/system-update/setup/installer groups, then
  exposed Android's copied-verifier fixture missing the new shared module. Fixed
  that fixture; all 20 Android tests and both preview tests passed afterward.
- Final focused release set: 56 tests pass. Live completion-event routing and
  candidate reusable-job names require the first applicable trusted candidate run.
- No TV, release metadata, live protection or published artifacts changed.
