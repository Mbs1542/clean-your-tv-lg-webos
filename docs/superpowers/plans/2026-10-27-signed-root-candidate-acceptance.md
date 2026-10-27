# Signed Root candidate acceptance implementation plan

> For agentic workers: use executing-plans to implement and verify each gate before contacting the TV.

**Goal:** Exercise an unpublished production-signed Root candidate and retained rollback on the existing C3 without replacing its original supervisor, keys or recovery baseline.

**Architecture:** Reuse the main-only `publish-release.yml` workflow with `publish=false` against a temporary private draft. A separately authorized acceptance controller authenticates and executes the installed supervisor's captured sources, validates the production-signed envelope and every package through that original verifier/inspector, and substitutes only offer discovery during admission. The original Manager creates its own transaction under its own product lease; the unchanged worker performs installation, health and rollback. No journal fabrication, trust changes, stable feed changes or fake healthy receipts.

## Scope and limits

- This is explicit maintainer tooling, not a user-facing update feature or new public feed.
- Normal `latest` discovery and anonymous GitHub downloads are not accepted by this run.
- Keep the synthetic local v0.0.0 release and exact baseline cache bytes; component versions retain their actual installed values.
- Private draft URLs are not anonymously downloadable. Stage signed candidate bytes in the existing content-addressed cache after original inspection, without overwriting existing entries.
- Initial preflight is read-only; mutation requires a separate install action and a real UI-captured complete profile. Rollback uses the original service API.
- Temporary draft/signing evidence is not a shipping release. Preserve evidence privately and remove the temporary unpublished draft/tag before final publication binds a new frozen SHA. Never alter published v1.4.0.
- Preserve all unrelated device data, original recovery records, Home off/emergency state and baseline caches. No power or firmware changes follow from this controller.

## Tasks

- [x] Diagnose and integrate Windows POSIX-fixture discovery correction through PR #126.
- [x] Start all-platform feedback rebuild at source 3d5e0cb0.
- [x] Add maintenance controller with read-only preflight and explicit admission, using captured receipt-verified source imports, exact production envelope verification, original package inspection, exclusive atomic cache publication and original Manager/worker ordering.
- [x] Cover wrong signature/edition/release, code/hash/ownership/bytecode tampering, existing-cache conflict, incompatible infrastructure, unfinished transaction, invalid profile, no mutation on failed preflight, original worker continuation and retained baseline preservation.
- [x] Document exact draft assembly/signing commands, immutable artifact/source binding, private profile capture and no claim of public feed acceptance. No new translated user instructions are needed because no user-facing behavior changes.
- [ ] Review and merge tooling PR to release/next; reconcile candidate inventory and description. Tooling does not itself establish acceptance.
- [ ] Verify all successful platform artifacts at the selected source, including native Windows embedded Root IPK/LF and Android signature/provenance; assemble a clean source snapshot and create temporary private numeric draft assets.
- [ ] Dispatch existing trusted main signing with publish=false; verify output signatures, source binding and all component digests locally before any TV write.
- [ ] With owner present, capture the real current profile, inspect C3 baseline and read-only candidate preflight. Only after all gates pass admit the update, observe actual launcher health and compare versions/profile hashes; require owner confirmation of physical controls/audio.
- [ ] Invoke ordinary retained rollback, observe original worker/health, compare original component/profile/code hashes and owner-confirmed controls. Preserve uncertain state and stop rather than retry any unknown package outcome.
- [ ] Prepare redacted results and exact destination for owner consent before publishing a new installation-result report. Reconcile issue labels and release gates; no production merge until acceptance and final-head checks are complete.

## Review and verification ledger

- Independent read-only review found no remaining controller trust or mutation defects. Added a non-POSIX test-discovery guard before fixture imports.
- Local continuation coverage runs original public 1.3.0 Manager/Device through real offline installer terminals; spawn is observed after lease release. It does not execute the restored CLI.worker loop end-to-end. Actual unchanged-worker execution remains a physical acceptance gate.
- Public CLI fixture is bound to source commit 7cce1da4244d67375a0ac890a02710b32864f6a9 and SHA-256 a2cdfb299126162d4b814e68c57850c736803e00fc8aac998a49ece4e4ee3cbc.
