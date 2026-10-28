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
  explicit installer repair/revocation. Existing C3 switch availability/toggling
  was confirmed; effective blocking after restart and candidate lifecycle were not.
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
  lifecycle work. Physical revocation and final package acceptance remain pending.
- #130: refresh app-library, renewal and companion browser fixtures for the
  current profile/System updater contracts. Build both recovery apps through
  production builders and cover present/absent supervisors, focus and cancellation
  without update mutations. Product behavior and component targets are unchanged.
- #122–#125: synchronize release metadata, reorganize user/developer/history
  documentation, add installation-result consent guidance, and improve README
  installation order, simulated launcher screenshot and twelve language links.

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

The current checklists and historical implementation evidence are in PR #114.
Historical C3 acceptance of v1.4.0 does not establish acceptance of this candidate.
[Scoped C3 signed update/retained rollback acceptance](RELEASE-1.4.1-ACCEPTANCE.md)
is now recorded for candidate source `3d5e0cb0`. Normal public-feed discovery,
standby/cold boot, firmware blocking and the other stated limitations remain
unverified. `release-plan.json` keeps overall acceptance empty until the remaining
release gates are resolved; do not mark ready or merge to main from this scoped test alone.

Review README, installation, updates/removal, troubleshooting, prerequisites,
component/recovery guides and all twelve translations against this inventory.
Existing candidate-only notes remain distinct from published downloads. Exact
artifact commands, hashes, rollback checks and final-head CI results must be
recorded in the candidate PR before readiness.
