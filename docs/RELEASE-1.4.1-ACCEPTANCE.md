# 1.4.1 scoped C3 update and rollback acceptance

C3 signed candidate acceptance, 2026-10-28: OLED55C3RLA, firmware 43.21.71, webOS 11.2.0; macOS ARM64 host, remote model not recorded. Candidate source 3d5e0cb0, build 40562857636, production signing run 40564937758 with publish=false. The separately authorized acceptance controller admitted the signed offer; the unchanged System Updater 1.1.0 worker upgraded Root 0.4.0 to 0.5.1 and Root Updater 0.3.0 to 0.3.2, completed real launcher/profile health, then completed ordinary retained rollback. The full profile matched before/after both operations; all 27 supervisor hashes, 40 Root recovery hashes and the local baseline matched the original after rollback. Initial Root off was preserved. After explicitly enabling Root, the owner confirmed Home, arrows/OK/Back, app launch, volume/audio and triple-Home emergency off; controls/audio were confirmed again after rollback. Final state is Root off with LG Home routing. No pinned code/key, public feed or published asset was changed. Normal public-feed discovery, anonymous downloads, automatic timeout rollback, standby/cold boot, firmware blocking and other devices were not tested. This is scoped candidate acceptance, not public delivery or universal compatibility.

## Latest scoped acceptance: source eeb4b8b0

C3 candidate acceptance, 2026-10-28: OLED55C3RLA, firmware 43.21.71 / webOS 11.2.0; macOS ARM64 host; remote model unknown. Source eeb4b8b0, build 40643645644, signing 40644813064 (publish=false). Signed acceptance admission and the unchanged System Updater 1.1.0 worker upgraded Root 0.4.0 to 0.5.1 and Updater 0.3.0 to 0.3.2, preserving the full profile. The owner confirmed navigation, app launch, short Home, volume/audio and settings fit/focus. Power-button wake showed LG Home before delayed Clean Your TV and reset uptime; seamless standby is not established. Physical AC boot showed Live TV then Clean Your TV; after one minute Home/buttons/audio worked. Triple Home disabled interception and remained off. Ordinary retained rollback restored original versions, full profile, all 27 supervisor/40 Root recovery hashes and Homebrew settings; the owner confirmed controls/audio and LG Home routing. Firmware lifecycle, indicator-state and column-count device matrices, automatic timeout rollback, public-feed discovery and other devices remain unverified. Final Root state is off. Stable remains 1.4.0.

- [Owner-approved issue report](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/115#issuecomment-6462650356).
- [Candidate build 40643645644](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40643645644).
- [Production signing with publish=false, 40644813064](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40644813064).

## Maintainer follow-up: update controls, geometry and firmware API

C3 follow-up acceptance, 2026-10-28: OLED55C3RLA, firmware 43.21.71 / webOS 11.2.0, Homebrew 0.7.3; macOS ARM64 source installer; remote model unknown. Installed Root 0.5.1 / Root Updater 0.3.2 from candidate eeb4b8b0, retained System Updater 1.1.0. Maintenance helper source 3e01ac0e (#132) restored firmware API access without replacing installed code or changing file bytes/owners, recovery/ACL/baseline hashes, full profile or Homebrew preferences. Normal Homebrew quit/restart was needed to refresh cached API groups. The owner confirmed off/on switching. Real TV restart preserved access and the enabled preference. Revocation actually denied the app after service refresh; after SDK permissions returned to 0777, ordinary strict re-enable refused and explicit verified repair restored access. Unrelated getAppInfo and the Root Updater client remained denied. A preliminary Root status read refused once; a later read succeeded before permission changes.

With LG auto-update off and no pending installation reported by the owner, the actual UI disabled blocking and a normal restart removed loopback answers for the four checked LG names; restoring on and restarting returned all four to loopback. No firmware check/download/install was requested. The owner reconfirmed controls/audio and LG Home routing afterward. Additional checks: no indicator and disabled/skipped Update all, including repeated check, with installed versions newer than public stable; 1/8 columns accepted by physical remote and 2–7 by CDP geometry/navigation on C3. Original five columns/full profile restored. Final state: candidate Root 0.5.1 installed, Home interception off, firmware blocking on. SDK modes are not enforced across platform lifecycle changes. On-device matching-version/newer-offer/error/absent-supervisor matrices, automatic timeout rollback, all network paths/early checks, fresh/removal/other-edition/device coverage and final frozen artifacts remain unverified; public stable is 1.4.0.

[Maintainer QA report](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/110#issuecomment-6464370670). [Explicit repair PR #132](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/132). This follow-up covers the stated installed app and streamed maintenance helper; it does not freeze or publish the release.

## New blocking result: retained rollback readiness

On 2026-10-28 the next ordinary retained rollback of the installed `eeb4b8b0`
candidate restored Root 0.4.0 and Root Updater 0.3.0 but did not complete System
rollback acceptance. The actual Root UI rendered, restored the current rollback
profile and matched the full saved profile; its one-shot health path reported
`installation_operation_retained`. The original 120-second readiness deadline
expired into `recovery-required`. No fault-injection signal had been sent.

LG Home routing and disabled Root intent were independently read back. All 27
original supervisor hashes, 40 Root recovery hashes, the recovery proof and
baseline matched the earlier verified rollback. The current release descriptor
is not finalized. This result supersedes any assumption that the next unchanged
ordinary rollback must succeed; earlier successful rounds remain scoped history.

A separate-process host reproduction against the authenticated original System
CLI and installation lock reproduced the refusal during ownership contention;
the same health request succeeded after releasing that lock. Root's actual
profile code attempted health once and opened recovery without retrying. This
matches the observed symptoms but does not prove the exact device contention
timing. No health receipt was fabricated, deadline extended, journal cleared or
package installation retried. An explicit, narrowly scoped recovery command is
approved for implementation; device recovery and changed-product acceptance
remain pending. See [blocking issue #136](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/136).

Before this rollback, candidate `686d7eee` passed private artifact verification,
native macOS ARM64 smoke and production signing with `publish=false`
([run 40661994355](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40661994355)).
It has not been admitted on this TV. Public stable remains 1.4.0.

## Earlier-source evidence references

- [Candidate build 40562857636](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40562857636).
- [Production signing with publish=false](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40564937758).
- [Acceptance controller PR #127](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/127).
- [Candidate scope and remaining gates](RELEASE-1.4.1.md).

The earlier-source signing draft was removed. The latest signing draft remains unpublished; signed package evidence remains private locally. Public stable remains 1.4.0. These scoped records do not finalize overall release acceptance or satisfy final-head platform/publication gates.
