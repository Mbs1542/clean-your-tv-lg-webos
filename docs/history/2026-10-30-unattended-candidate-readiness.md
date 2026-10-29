# Release 1.5.0 unattended readiness — 2026-10-30

The maintainer requested all feasible checks while asleep, preparation for a later
main merge and TV shutdown afterward. This record does not authorize or announce
main merge/publication and does not replace supervised hardware acceptance.

## Exact software evidence

Candidate source: `08b6acac0972ac035370070450953ac2a3d9938f`.
Trusted push build [40936979918 / attempt 1](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40936979918)
completed Linux/macOS full validation, ARM Python checks, Android and all four
desktop platforms successfully. Homebrew also built, but remains unapproved and
unreleased. All twelve merged implementation PRs match the committed inventory.
This first rollout stays **unpinned** under the currently trusted main policy.

- Full local `scripts/test.sh` passed (1,581 Python unittest cases across ten
  invocations, two documented skips, plus included JS/native/setup checks).
- Both-edition theme browser suite, geometry at one through eight columns,
  legacy UI simulations and showcase browser security/navigation passed.
- All twelve UI languages passed separately against the actual preview server,
  including packaged Chinese fonts, remote modal focus and language persistence.
  The initial missing preview-server prerequisite was corrected before this run.
- Local `scripts/build-cytv.py --payload-only` built and verified public TV assets.
  Official `scripts/build.sh` additionally requires the unavailable ares-package
  command; its equivalent native/TV source compilation is covered by this payload
  build and the trusted candidate CI.
- All ten downloaded Actions archives matched their API SHA-256 and ZIP CRC.
  Assembly verified embedded hashes/versions in the four console installers,
  macOS GUI archives, Windows GUI, Debian and signed non-debuggable ARM64 APK:
  163 payload files on Unix/Android and 165 on Windows. It produced 22 local
  unsigned assets with checksums; nothing was published.
- Downloaded actual macOS ARM64 CLI passed `--version`, `--check-payload` and
  `--check-runtime`; actual GUI passed `--check-runtime`. The sandbox semaphore
  restriction required normal approved execution. Python ZIP extraction lost
  app-framework symlinks; validating all 66 bundle-local targets and native macOS
  extraction resolved that harness issue without changing the archive.
- Separate Root QA signing [40940440011](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40940440011)
  used `publish=false`. Its Actions SHA-256, public-key manifest signature, source,
  run/attempt and all three component sizes/hashes passed independent verification.
- Android APK metadata, original pinned certificate, RSA/SHA-256 APK v2 signature
  and complete chunked content digest passed independent verification for candidate
  and published baseline. Actual emulator upgrade/lifecycle tests were unavailable:
  cached API35 image is incomplete and no accepted ARM image SDK license is recorded.
  No new license was accepted or incomplete emulator result presented as success.
- Author bundle [40934073336](https://github.com/Razdva122/clean-your-tv-lg-theme/actions/runs/40934073336)
  matched Actions SHA-256, CRC and inner archive provenance. Its source merge
  `a3c3718b` has the same Git tree as `48a7594c`. The exact delivered toolkit
  validated Itachi against the explicit current `08b6acac` runtime export.

Detailed private/local logs, downloaded archives, manifest hashes and artifact
inventory are retained in ignored `build/overnight-1.5.0-08b6/` and
`build/release-overnight-*.log`; raw TV diagnostics,
profiles and screenshots are not public records.

## Device observation and limits

Read-only device observation: maintainer-owned OLED55C3RLA, firmware 43.21.71,
webOS SDK11.2.0, Root0.6.0/shared engine1.6.0, Root Updater0.3.3, System Updater1.1.1.
Host installer platform: macOS; physical remote model/input untested. The host
had one saved Root connection and no pending host operation at this observation.

The existing TV debugger rejected an additional client with HTTP500 while a
separate authorized same-device QA task was performing the supported signed
candidate rollback/forward update. This task did not interrupt it, install packages,
change routing or patch private permissions. Any completed, scoped observations
belong to their own artifact-bound report in candidate PR141; they do not imply
full controls/audio/startup acceptance here.

## Remaining main-readiness gates

- Complete genuine artifact-bound Root controls, startup, update/recovery and
  emergency scenarios with the owner present as required by Root TESTING.
  Keep standby and cold boot separate; no forced power/failsafe/recovery tests
  were run during this unattended task.
- Verify supported existing System Updater1.1.1 migration to the new1.1.2 runtime.
  Current explicit replacement accepts original1.1.0 only; no private-state bypass.
- Obtain new exact-archive Helper0.6.20 rollback compatibility approval against
  published Home/Helper. Root-only QA signing does not admit No-root delivery.
- Final signed Android artifact upgrade/retention and idle lifecycle remain
  pending; historical code14/emulator evidence is not code15 acceptance.
- Preserve partial issue scope:69 planned;101/133/143 needs-info;
  140/146/152/155 awaiting-release. No issue is closed or called shipped here.
- After actual acceptance, complete the old policy's successful exact-final-head
  build and truthful acceptance record. Empty physical acceptance remains a gate;
  this report must not be used as a blanket success string to bypass it.

Documentation corrections cover release scope, the no-pin rollout, published versus
candidate availability, all twelve locale prerequisite versions, Android current
metadata, active theme removal and the verified author-tool pair. The release PR
remains draft while these hardware/compatibility gates are outstanding.
