# Reusable release validation

Approved in chat on 2026-10-28. Implement in a separate PR to release/next;
merge only after the current release is published. Do not modify live protection,
current release metadata, published assets or device state.

## Contract

A candidate is built once after version selection, before physical acceptance.
The plan may pin `build: {run_id, attempt, source}` to a complete trusted candidate build.
Acceptance must name the selected run:attempt; repinning clears stale evidence.
A rerun invalidates an already accepted attempt. Its source must be an ancestor of the candidate and every non-documentation Git
entry (blob and mode) must match. Only release-plan.json, regular README.md and
regular Markdown under docs/ are excluded. Packaged notices, embedded guides,
code, workflow, tests, versions, dependency and unknown changes invalidate reuse.
The final main merge must still match its exact second parent's complete tree.
Both publication and policy independently verify the source binding and all
required platform/test jobs. No candidate scripts execute in privileged policy.

## CI lifecycle

Feature PRs retain affected checks and may reuse successful runtime results for
identical checked-out merge inputs, selected groups, OS/image, exact Python/Node,
installed Python dependencies and UTC day in the same PR. README/plan metadata
and affected setup checks stay fresh. Explicit reruns bypass hits, cache outages
fall back to testing and candidate validation never uses this cache. The candidate build runs the full Linux/macOS
suite once alongside all platform builds. Candidate PRs run metadata checks;
Release policy enforces the complete trusted build. Publication rechecks that
record and verifies final packages/feeds without running the same full suite.
Policy reports pending immediately and refreshes on candidate build completion,
including retries. It never polls or fails merely because a build took 35 minutes.
Use GitHub failed-job reruns to retain successful jobs at unchanged source.

## Physical acceptance

Bind observations to selected run, artifact hashes, TV/firmware and scenario.
Documentation/evidence edits do not invalidate observations. Changed product paths
select the corresponding controls, startup or update/recovery matrix; unknown or
shared inputs conservatively require the full matrix. Carry evidence only when
artifact hashes and scenario preconditions match. Historical evidence never turns
untested behavior into a pass. Physical transitions retain independent recovery
and owner presence requirements. No TV changes are part of this PR.

## Candidate record

Generate a replaceable marked PR block from committed scope, versions and selected
build. Preserve human acceptance, documentation notes and text outside the block.
Report acceptance scope and untested paths explicitly. No automatic issue closure
or publication of installation reports.

## Verification

Use temporary Git histories to prove metadata reuse and rejection of source,
mode, version, workflow, embedded Markdown, ancestry and merge-tree changes.
Exercise API selection, job completeness, pending/failure and workflow-run event
routing without executing candidate code. Check real YAML with actionlint, run
setup regressions and the full repository suite. Review before opening a draft PR.
