# Home transport source QA — 2026-10-29

[Transport design and release gates](../development/HOME-CONTROL-TRANSPORT.md) ·
[PR #147](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/147)

## Device and artifact scope

Authorized maintainer QA on the project-owned LG OLED55C3RLA. Firmware
43.21.71, reported webOS SDK 11.2.0, TV Node 20.12.2; branded webOS version not
collected. Physical Magic Remote Home was exercised by the owner; exact remote
model unknown. The relay observed the built-in LGE M-RCU input interfaces.
Installer platform: macOS with the checked source package builder and SSH/Luna
transport; exact macOS version not collected.

No-root components were initially absent. Existing Root Home was disabled, its
routing override absent, global installation ownership terminal, and the prior
system rollback complete. Root packages, persistent intent and infrastructure
were not replaced. The temporary source-QA packages were installed with Root SSH
through the Developer package installer; the controller and renewal service
subsequently ran under their ordinary unprivileged jails, not as root processes.
This does not test installation through official Developer Mode SSH on an
unrooted TV.

Source: `74ccc7b527a6d773c5e3715fe243b012c5ad6e13`. Private QA component versions:
Home/renewal **1.5.2**, Helper **0.6.20**. These versions were staged only in the
QA packages; repository release metadata and immutable public assets were not
changed. Helper was compiled from current source, including its ARM binaries;
Home used the compiled launcher with a minimal empty QA app inventory.

| Package | SHA-256 |
| --- | --- |
| Home | `46bb2cafb50120dff59f5671dbe6355cef47cdc60a135b686c7ae0e69c4aee6a` |
| Helper | `cf82f41cb6a5363a278c31aae21950406befff05b21f0dbc42bbc6daf6244c86` |

This is scoped source QA, not acceptance of a frozen signed release build. A
future release must version, rebuild and pin its successful build and match the
accepted component scope; the published Helper 0.6.19 still lacks the correction.

## Expected and observed results

| Check | Expected | Observed |
| --- | --- | --- |
| Package installation | Both installs reach a confirmed terminal result | Both reached `installed`; no unresolved QA receipt |
| Channel provisioning | Own state/channel directories have the shared owner/group and 2770 mode | Both were 5999:5000 / 2770 after actual package installation |
| Native context | Unprivileged controller can access the service channel | Controller UID 5431 / primary GID 5000; new channel visible |
| Service context | Unprivileged renewal sees its own channel without needing the other app mount | Service UID 6923 / primary GID 5000; own channel visible, Helper application state absent in that process's filesystem namespace |
| Launcher status | `homeStatus` completes from actual PalmServiceBridge context | `returnValue:true`, initial `enabled:false`, without `ENOENT` |
| Explicit off/on | Each write succeeds and correlated status agrees | True → false → true completed with matching readback |
| One-time LG visit | LG Home becomes foreground while routing preference is preserved | LG Home foreground confirmed; status after explicit launcher reopening remained enabled |
| Invalid write | A string cannot replace the boolean preference | Rejected; enabled state remained true |
| Physical Home | A single physical Home opens the QA launcher from another app | Owner confirmed; native log recorded HOME and successful launcher requests |
| Triple-Home emergency | Controller exits and sets its latch | Owner confirmed LG Home; native log recorded EXIT 27, controller stopped and latch present |
| Return observed after LG Home | Distinguish another app from Helper restarting | Foreground was a separate project QA app; this Helper remained stopped and latched |
| Cleanup | Restore initial No-root absence and disabled Root without switching the parallel test's screen | Both QA packages removed with terminal/readback checks; Root stayed disabled; no foreground launch requested during cleanup |

No underlying transport failure was found in this run. The different jail
visibility directly supports the source diagnosis: a service cannot write the
old Helper application path even though the native controller works. It does not
measure the reporter's C1 and is not C1 compatibility evidence.

## Problems and limits

The first host connection attempt used direct Paramiko key loading on an
encrypted key. Reused the already-unlocked SSH agent; no password, SSH trust,
credential or TV security change was needed. Installation had not begun before
that host-only correction.

Linux CI at the tested source passed runtime checks, then failed an existing
legacy-browser test: an Add app dialog intercepted the Inputs click in the
`no-inset` profile. The same profile passed locally on the same Playwright
Chromium build, including an eight-times CPU slowdown. No speculative product
change was made for that single non-reproduced failure.
[Tests attempt 2](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40839842839/attempts/2)
passed on Linux and macOS, including the legacy-browser scenario, settings UI
and the real Linux multi-UID/setgid check. Frozen desktop runtime checks also
passed on Windows and Intel macOS.

Untested: physical Back/navigation/volume and other keys, actual model-specific
key-up delivery, standby/wake, true AC-off cold boot, renewal enable/persistence,
Developer Mode expiry/removal, signed OTA and whole-edition rollback, long-term
reliability, audio/eARC and other TV models. Opening status did not intentionally
enable renewal. The emergency latch was not automatically cleared or resumed.

Only the temporary QA packages were removed. Existing Root, other applications,
parallel QA and owner settings were preserved. Private profiles, pairing keys,
addresses, app inventories and raw device logs are excluded from this record.
