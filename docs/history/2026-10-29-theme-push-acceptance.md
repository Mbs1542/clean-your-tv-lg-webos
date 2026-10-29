# Scoped reverse theme-transfer acceptance — 2026-10-29

This maintainer-owned device run verifies the new **PC → TV** transfer direction. It is an unpublished fixture check, not approval of a public release or a whole-edition installation.

## Environment and exact scope

| Field | Observed value |
| --- | --- |
| TV | LG OLED55C3RLA |
| Firmware | 43.21.71 |
| webOS SDK | 11.2.0 |
| Edition | Root UI fixture; common receiver code shared with No-root |
| Remote | Physical remote model/input not tested; UI driven through TV debugger |
| Installer platform | macOS; exact OS version unknown |
| Toolkit | 0.1.0-candidate.1, source `c9e3bf4af26961473f8a4be549643dca0f7db207` |
| Root compatibility fix | `c3efdb0013096bbcb77f544e93858844206d49f0` |
| Main feature source | `3044a539bd4e437a422e1f1b4f8e4fbcaa2c27ff` (compiled modules checked against the working fixture) |
| PC Node | 23.11.0 |
| Test app/service | `com.cleanyourtv.themeqa` / `com.cleanyourtv.themeqa.service`, initial version 1.5.1, repeated with actual Root 0.5.1 / themeEngineVersion 1.5.1 |
| Initial IPK SHA-256 | `82eed80ef0fd3734fee027805800ae1a90d012fb0bcd194ee725042c712e1f1d` |
| Root 0.5.1 repeat IPK SHA-256 | `fbf1fc25ef3e7ca347fdddaf8760443e9f6bd453d3115ae8080c62c2ea006343` |
| Home | Existing ordinary Home 0.4.0 retained and reopened after cleanup |

The package contained the compiled actual theme/settings UI, an empty inventory and the unchanged shared receiver/register modules. Its small fixture bootstrap opened the UI without production updater/profile restoration. Its own JS service exposed only the actual receiver registrations; it had no Home routing, recovery endpoints, startup hooks or automatic receiver start. Receiver/core/register and relevant compiled UI hashes matched the tested source snapshot. This does not establish unrooted-device sandbox permissions or production-package admission.

## Actual tests

| Scenario | Expected | Observed |
| --- | --- | --- |
| Open TV Settings → Appearance → Receive from computer | Actual service starts and TV displays its address/PIN | Passed; one private address advertised |
| PC preview → Channel → Send to TV | Computer dialog accepts TV address/PIN; no PC listener | Passed |
| Wrong PIN from actual PC dialog | TV rejects upload; PC reports PIN error | Passed |
| Correct PIN from actual PC dialog | Outgoing HTTP POST reaches TV; PC reports sent, pending TV action | Passed; 202 transport acknowledgement, PIN cleared in computer form |
| TV validation | Existing envelope/hash/image checks run; Classic stays selected until Apply | Passed; Apply offered after validated cache import |
| Apply | Channel selected immediately, without trial/countdown marker | Passed |
| PIN retention | No PIN in TV localStorage | Passed |
| Single upload | TV network listener closes after receipt | Passed; subsequent TCP connection refused |
| Reload Home after reception | Channel restored from cached files with receiver closed | Passed; installed previews remained available |
| Leave receiver for another settings category | Session/listener stops | Passed; TCP port closed |
| Remove downloaded theme | Apply Classic, remove Channel, retain two built-ins | Passed in initial fixture; repeat 0.5.1 harness raced the list redraw, then fixture uninstall removed its cache |
| Cleanup | Remove fixture app/service/upload and reopen prior Home | Passed |

The active macOS incoming firewall remained in its original block-all state with Node.js blocked. The actual data path was the toolkit's outgoing HTTP request to TV TCP 8879. No firewall change, SSH tunnel, loopback transport substitute or disabled browser security was used for the transfer. SSH was used for fixture installation/inspection, and the TV debugger for operating its real UI.

## Problems and resolutions

The former computer-hosted pull method could not accept incoming TV connections on this managed Mac. The new direction moved the temporary listener to the TV and resolved that observed delivery blocker.

The first PC test harness waited for the exact string `Sent`, while the truthful product status was `Sent — finish on TV`; the TV had already received/applied the theme. The harness was corrected and the full send repeated successfully. A reload probe initially evaluated a global before the new document had loaded; guarding `window.RootLauncherRendered` corrected the probe, and repeated cache restore passed. These were test synchronization issues, not extra product workarounds.

The first full receiver browser test also inherited the system Russian locale while asserting English text. Explicit `en-US` made that test deterministic after translations were added.

Final packaging review found that Root component 0.5.1 and Home engine 1.5.1 used different version scales: comparing the component number to a theme's minimum Home version rejected valid packages. A fail-first unit and Root browser fixture reproduced this. Root now stamps its trusted bundled `themeEngineVersion`, and ThemeManager uses it with strict validation. The direct PC send/wrong PIN, TV validation/Apply, reload, installed previews, receiver cancellation and cleanup were repeated successfully on actual Root-numbered fixture 0.5.1. An automated repeat-removal probe read the row during its asynchronous redraw; the initial equivalent UI removal had passed, and the complete test app/service/upload were still removed normally. The probe now waits for the actual row/button before attempting that optional repeat.

## Limits and remaining acceptance

No normal public candidate package was installed, no production profile restoration was exercised, and no claim is made about physical-remote input, Home routing, sound, standby, cold boot, OTA or rollback. Large-upload bounds, short expiry, interrupted requests, concurrent uploads, invalid packages and cancellation during cache writes have automated coverage; they were not all repeated on this TV. The exact Node 0.12.2 HTTP test accepted and read a 2 MiB envelope fixture; that host regression does not certify every older TV. No-root browser/package checks passed; physical unrooted-TV acceptance remains outstanding.

There are no real addresses, PINs, credentials, SSIDs, app inventories, private paths or personal screenshots in this record. The fixture and temporary upload were removed; ordinary Home was restored. Normal release integration, signed artifact/build admission and affected production acceptance remain separate.

Verification after integration: full `npm run test:themes` (including the exact Node 0.12.2 receiver run), full both-edition `npm run test:themes:browser`, `bash scripts/test.sh tv preview`, Root/No-root package tests, compatibility and 353 strings across twelve languages passed. The independent toolkit suite passed 36 tests without skips against a compatible candidate runtime; refreshed-runtime verification is recorded with the branch handoff.

Final refreshed-runtime check: clean main export `676cc905807fadb6f83d946ba2e705162bb20b55` (172 files) passed all 36 toolkit tests with zero skips. The full theme browser and TV/preview suites passed again after the Root engine-version fix. The temporary toolkit worktree was removed after pushing its branch and preserving the running author preview outside Git.
