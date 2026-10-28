# v1.4.1 — Root OTA compatibility and update controls

This is an unpublished candidate for the next production release. Public stable
remains v1.4.0. The version is selected for test packaging; hardware acceptance,
final frozen-head platform builds and signed publication verification are pending.

| Component | Published v1.4.0 | Candidate |
| --- | --- | --- |
| Overall release | 1.4.0 | 1.4.1 |
| Home / renewal service | 1.5.0 | 1.5.1 |
| Home Helper | 0.6.19 | 0.6.19, exact published bytes |
| cytv installer | 0.5.0 | 0.5.1 |
| Root edition | 0.5.0 | 0.5.1 |
| Both edition Updaters | 0.3.1 | 0.3.2 |
| Android installer / versionCode | 0.4.0 / 13 | 0.4.1 / 14 |
| New System Updater provisions / protocol | 1.1.0 / 1 | 1.1.1 / 1 |
| Homebrew Installer | Unreleased | Unreleased; no promotion record |

## Included changes

- #118 / #115: preserve the original v1.3.0 Root managed executable paths and
  LS2 contract while retaining audio recovery inside existing managed modules.
  New provisions validate signed infrastructure before offering installation.
  Guarded retained rollback and computer recovery require completed signed System
  provenance. Final frozen-source signed upgrade and rollback acceptance remains
  outstanding; scoped earlier-source acceptance is linked below. Fresh
  v1.4.0 Root installations have a different pinned contract and need reviewed
  computer migration; do not blindly retry or overwrite retained recovery code.
- #119 / #108 / #109: suppress upgrade offers when all component versions match,
  and use the same edition-specific availability result for the settings indicator
  and Update all. The updated UI also guards older pinned supervisors. Failed
  checks preserve the last confirmed indicator and remote focus. Physical current,
  newer, checking, failed and supervisor-absent cases remain pending.
- #120 / #110: restore Root Home access to Homebrew configuration APIs through a
  CYTV-owned grant for its existing control group, with localized diagnostics and
  explicit installer repair/revocation. Scoped C3 follow-up confirmed switch operation, restart persistence and
  effective four-name blocking off/on across restarts. No firmware
  check/download/install was requested; other network paths/early checks and
  final changed-product acceptance remain unverified.
  See [firmware controls and limitations](LG-FIRMWARE-UPDATES.md).
- #121 / partial #107: preserve LF in Windows-built POSIX scripts and handle
  redirected legacy-console encodings without crashing. Final native Windows
  embedded-IPK identity and line-ending checks remain required. BX/webOS 5 routing,
  recovery and removal are unresolved; no new BX support is claimed.
- #126: fix native Windows discovery of the POSIX firmware-registration fixture;
  all thirteen POSIX cases remain enabled and the replacement platform build passed.
- #127: add separately authorized maintainer-only signed candidate admission with
  read-only preflight and the unchanged supervisor worker. No installed component
  or public-feed behavior changes.
- #128: fit main settings at 720p by reducing whitespace only in both editions.
  Keep text/control sizes, 1080p styling and fallback scrolling. Host browser
  checks cover all twelve languages, remote focus outlines and Return Home.
- #129 / partial #110: keep an owned firmware API grant revocable when installed
  SDK app metadata is unavailable or writable. Revocation authenticates the
  protected manifest and private receipt; enabling retains strict SDK checks.
  This does not repair an unsafe SDK tree or resolve the remaining access and
  lifecycle work. C3 follow-up confirmed actual revocation denial after service refresh;
  final changed-product acceptance remains pending.
- #130: refresh app-library, renewal and companion browser fixtures for the
  current profile/System updater contracts. Build both recovery apps through
  production builders and cover present/absent supervisors, focus and cancellation
  without update mutations. Product behavior and component targets are unchanged.
- #131: size launcher cards for one through eight columns with space for the
  enlarged focus frame. Share dimensions across placement, dock, scrolling and
  top-button navigation, including Add app; preserve sparse-layout maximum size
  and existing icon processing. Compiled-browser geometry and navigation checks
  passed on Linux; the full Linux/macOS CI passed. Scoped C3 follow-up checked columns 1/8 by physical remote and 2–7 by
  CDP geometry/navigation; a full physical-remote matrix remains unverified.
  Earlier feedback packages before eeb4b8b0 omit this correction.
- #132 / #110: add explicit `--repair-package-permissions` to Root
  `enable-firmware-access`. The current private updater package/cache selects
  every installed byte before only owned SDK write bits are narrowed; unknown
  entries, links, owners, drift and pending operations stop repair. Default enable,
  automatic maintenance and revoke retain strict behavior. SDK modes are not
  enforced across platform lifecycle changes; repeat explicit maintenance when
  required. Host tests and exact PR CI pass; final candidate artifact/lifecycle
  acceptance remains separate. Earlier feedback packages omit this installer and
  runtime helper change.
- #122–#125: synchronize release metadata, reorganize user/developer/history
  documentation, add installation-result consent guidance, and improve README
  installation order, simulated launcher screenshot and twelve language links.

- #135: allow authorized maintainer/project-owned test-device QA records without
  per-report confirmation, while retaining exact draft/destination consent for
  other users and shared privacy limits. Record scoped C3 follow-up for the
  eeb4b8b0 app and streamed #132 helper; final frozen artifacts and the stated
  untested cases remain separate.

Candidate maintenance [PR #137](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/137)
adds explicit `cytv recover-system-rollback --edition root` and
`--new-recovery-attempt` for a completed package rollback whose readiness expired.
It verifies retained evidence and requires genuine launcher health; unknown
installer outcomes remain blocked. Ordinary retries never extend the attempt;
an explicit new attempt requires expiry and preserves the entire prior audit
under its UUID/hash. Packages and pinned supervisor code/keys stay unchanged.
[Scoped C3 maintenance acceptance](RELEASE-1.4.1-ACCEPTANCE.md#scoped-maintenance-acceptance-explicit-rollback-readiness-recovery)
records the exact streamed helper bytes, initial failure and successful recovery;
final committed-source checks and release inventory integration remain separate.

No exclusions. The inventory is recorded in `release-plan.json` and candidate
[PR #114](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/114).

## Packaging and rollback

Rebuild Home, Root, both edition Updaters, private runtime/infrastructure,
desktop/console installers on all four platforms and signed non-debuggable Android.
Keep Android application/signing identity and private storage unchanged. New
supervisor 1.1.1 ships through computer provisioning; app-only updates do not
replace retained supervisors. Protocol 1 and the original v1.3.0 managed contract
remain required. Preserve Helper 0.6.19 SHA-256
`52510c9115a518a05849f6618516b41886aea54b7f74ea4763ffeeaf63c03e7b`.

Verify signed whole-edition upgrade, preserved profiles, automatic and retained
rollback, controls, audio, explicit/emergency off and rollback baseline. Record
standby, normal restart and true AC-off boot separately. Do not overwrite journals,
retained drivers or immutable published assets. Homebrew Installer remains disabled
for promotion (`homebrew/release.json` is absent).

## Acceptance and documentation

A later ordinary C3 rollback restored packages/profile but lost one-shot readiness
and reached `recovery-required` ([#136](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/136)).
Explicit streamed maintenance recovery subsequently completed that transaction:
fresh real Root health, terminal System rollback, preserved full profile and
original hashes, and disabled Root/LG Home routing were independently verified.
The first maintenance prototype failed; its complete audit was preserved before
the separately authorized new attempt. This scoped recovery does not fix the
ordinary readiness race or replace changed-product OTA/rollback acceptance.
Do not freeze or publish while the remaining gates are unresolved.

The current checklists and historical implementation evidence are in PR #114.
Historical C3 acceptance of v1.4.0 does not establish acceptance of this candidate.
[Scoped C3 signed update/retained rollback acceptance](RELEASE-1.4.1-ACCEPTANCE.md)
is recorded for sources `3d5e0cb0` and `eeb4b8b0`, followed by the published
maintainer report for update controls, geometry and streamed #132 repair. Preserve
those exact report paragraphs and their scope. Changed-product signed OTA/ordinary
retained rollback and automatic/fault recovery remain mandatory and pending after
#132 (recorded at `686d7eee`); `71d43f26` changes only documentation/inventory.
Complete mandatory acceptance, settle final documentation/inventory/acceptance,
then freeze code/build once and verify exact final artifacts. Normal public-feed
publication verification follows delivery; stable feeds must remain unchanged
for acceptance. Remaining untested state/network/device matrices and seamless
standby stay explicit coverage limits. `release-plan.json.acceptance` remains
empty until the remaining release gates are resolved; do not mark ready or merge
to main from scoped evidence alone. Open PR #134 does not govern this release.

Review README, installation, updates/removal, troubleshooting, prerequisites,
component/recovery guides and all twelve translations against this inventory.
Existing candidate-only notes remain distinct from published downloads. Exact
artifact commands, hashes, rollback checks and final-head CI results must be
recorded in the candidate PR before readiness.
