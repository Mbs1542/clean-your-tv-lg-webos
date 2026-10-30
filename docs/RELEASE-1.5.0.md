# v1.5.0 — Themes, Showcase and direct computer transfer

The maintainer selected this release with two declared Root limitations:
Appearance can shift 110 px during Apply, and automatic Home after standby can
fail. Read the scope below before updating. Builds, exact-artifact acceptance
and publication verification are recorded in
[release PR #141](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/141).

| Component | Previous v1.4.1 | Release 1.5.0 |
| --- | --- | --- |
| Overall release | 1.4.1 | 1.5.0 |
| Home / renewal service | 1.5.1 | 1.6.0 |
| Home Helper | 0.6.19 | 0.6.20, rebuilt from source |
| cytv installer | 0.5.1 | 0.6.0 |
| Root edition | 0.5.1 | 0.6.1 |
| Both edition Updaters | 0.3.2 | 0.3.3 |
| Android installer / versionCode | 0.4.1 / 14 | 0.5.0 / 15 |
| New System Updater provisions / protocol | 1.1.1 / 1 | 1.1.2 / 1 |

## Maintainer decision and known limitations

On 2026-10-30, after being offered either fixes before release or release of the
current build with declared limitations, the maintainer explicitly selected
**“Выпустить текущую с ограничениями”** (“Release the current build with limitations”).
The approved product scope is frozen source
`1f41a9cf3d66a6858de71e91dcebcef417e81bd4`, installed Root IPK SHA-256
`419de466e43095b426d9652c102fabd2c3ebd5a58c4dbb0f4928056b6d4b9f64`.
It excludes unpublished CSS work and an unimplemented standby correction.

- **Appearance shift — [#170](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/170):** applying a theme can shift the Appearance area by 110 px.
  RC-UI-06 remains failed; it is an accepted known limitation and planned follow-up.
- **Standby automatic Home — [#171](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/171):** after standby/wake, LG Channels can remain visible instead of
  automatically opening Home Root. RC-START-05 remains failed; it is an accepted
  known limitation and planned follow-up, not a delivered standby fix.

The targeted eight-finding result is **six passed, two failed and explicitly
accepted as known limitations**. The owner reported the latest cold start first
showed LG Channels and then opened Home Root automatically within the requested
one-minute observation window; exact latency is unknown. This cold-start pass
does not turn the separate standby failure into a pass.

On the maintainer's OLED55C3RLA, firmware 43.21.71 / SDK 11.2.0, the new installed
Root package passed actual theme/Columns/profile retention, affected Itachi 1.0.2
indicator/caption and 33-icon CSS checks, native-image error recovery, repeat
navigation and renderer reload checks. Physical held-arrow/key-release and warm
Home first-frame passes belong to the earlier frozen-baf9 Root package beginning
`633eabe8`; they are not new handheld acceptance of `419de466`.

The limited decision covers these two known failures only. Complete trusted
exact-head CI, matching final Root package bytes, signatures/integrity, existing
exact Helper approval and final publication verification remain mandatory. No
all-pass result, universal compatibility or extra permission to bypass a gate is
claimed. See the [dated decision and hardware scope](history/2026-10-30-supervised-candidate-findings.md).

## Included changes

- #139 and #149: built-in Classic/Alpine, downloaded theme preview cards and
  embedded Showcase in Appearance. Channel is external. Installed identities are
  hidden from Showcase; Refresh reads reviewed repository updates. Installed
  themes apply immediately; Showcase trials require Keep within 20 seconds.
  Installed cards occupy one horizontal row, with the highlighted active version
  first and full-card scrolling for remote focus. Alpine 1.4.4 uses its scenic
  translucent styling for the expanded input selector.
  Confirmed removal of the active downloaded theme restores Classic first.
  Late catalogue updates preserve the selected control, including Back, without
  taking focus from the Settings footer.
- #149: direct PC → TV theme transfer using a temporary TV receiver on TCP 8879,
  six-digit PIN, ten-minute lifetime and one bounded upload. No incoming PC port
  is required. Received data passes the normal integrity/image/cache validation.
  Alpine supports its bounded UHD wallpaper; Channel has corrected focus contrast.
- #139: theme-controlled layouts and optional user Columns, categorized settings
  and synchronized update indicators in both editions. Standard settings and
  recovery remain outside the themed surface. The separate retro/font request
  in #69 is only partially addressed and remains open.
- #153: separate Root-only candidate signing from a complete trusted CI build;
  signed QA artifacts only, without publishing a release or approving a No-root
  Helper transition. Catalogue completion preserves Back and Settings focus.
- #147: fix No-root Home request/reply transport inside the renewal service's
  jail, retaining the legacy channel for older Home. Coordinated Home/Helper
  packages are required; #146 remains open until verified delivery.
- #151: optional Show Add app tile and a Settings app picker, preserving app
  editing and keyboard navigation when Home is empty.
- #142: No-root Helper control-file ownership fix (#140); rebuild 0.6.20 from
  source so the fix is delivered. Reject unsupported Root interfaces before
  installation mutation (partial #133).
- #145: reviewed-source cancellation of exact never-activated Root installs,
  including historical inventories and pre-registration finalize failures.
  Device-specific recovery for #101/#133/#143 remains separate and unverified.
- #154 (#152): retry a failed installer TLS handshake once on the same secure
  endpoint, adding only the two static-RSA AES-GCM suites while retaining the
  default TLS minimum/security level. No plaintext fallback. Actual pairing and
  launcher/Helper compatibility on the reported EF950V remain unverified.
- #156 (#155): bounded No-root Helper recovery after watchdog timeout or its own
  confirmed watchdog kill, with a separate orphan-protection latch. Stop and
  triple Home remain persistent; input cleanup must finish before retry, and
  buffered events cannot revive a killed relay. At most five attempts per ten
  minutes. Actual NANO80T standby/input acceptance is pending; #96 is not claimed
  fixed by this change.
- #158: add the reviewed external Itachi Sharingan theme to Showcase, prefer
  available larger native app icons within the existing validation limits, and
  support optional bounded CSS white-logo effects on compatible renderers.
  Original image files remain unchanged. Scoped Itachi 1.0.2/native-icon checks
  on the maintainer C3 are recorded above; other devices remain untested.
- #167: update shared on-TV rendering in both editions with a theme-styleable
  scenic ribbon position indicator, one focused app caption when the hero title
  is visible, and recovery from missing native icon images. The reviewed Toolkit
  Itachi 1.0.2 replaces the candidate catalogue entry. Reference-app ordering,
  simulated HDMI inputs and the main browser preview's theme selector/showcase
  are also updated; this PR includes TV behavior, not only preview changes.
- #169 (#168): preserve existing app-origin theme and Columns preferences when a
  normal System update restores its profile snapshot. Legacy backup restore
  still resets Classic; invalid or interrupted appearance still falls back safely.
- #169 (#162): avoid redirecting settings focus from an Apply control because
  a stale Columns selection disappeared. The current combined candidate still
  exhibits a 110 px Appearance shift in the actual-TV UI06 check; that original
  finding remains unresolved.
- #134: reusable candidate-build evidence and scoped acceptance tooling. The
  first release still follows the trusted policy currently present on main.

Computer theme transfer uses PC → TV only. The old PC-hosted sharing server,
TV download form and `share` command are removed from the matching author tools.
Instructions in all twelve user guides follow the TV-address/PIN workflow.

Published themes can also be installed by their da.gd ID or full short link.
Home shows the expanded address, uses a bounded plain-text lookup and then applies the
normal GitHub/package checks. The matching author toolkit provides TV link,
Copy ID/Copy link and a keyless release workflow with one ID per theme/version.
No new TV service method or listening endpoint is introduced by this feature.
The earlier is.gd experiment failed at TLS on the C3 original network path and is
replaced before publication. The da.gd development resolver loaded the pinned
Channel descriptor and verified all 12 files on that same TV without a network
workaround. The earlier signed-candidate da.gd UI checks passed on this fixture, as recorded
in the dated findings; the full GitHub URL
and PC-to-TV transfer remain available. No certificate checks are disabled.

## Upgrade boundaries

Root 0.6.1 versions the startup/wake corrections made after the earlier 0.6.0
candidate. The supported supervisor replacement captures the installed packages
as a local baseline before admitting the newer Root component; earlier 0.6.0
device observations retain their original artifact scope.

Use a complete matching installer/update set. A standalone Home IPK does not
replace retained Root workers or their LS2 permission contract. New Root
provisions record receiver capabilities; historical snapshots replay their
original permissions. Receiver access on those snapshots uses a separate fixed
API attachment and resumable receipt through the protected SDK manifest; it does
not rewrite the legacy snapshot or its four managed LS2 files. Trusted runtime
reconciliation maintains this attachment after updates and at boot, independently
of the Homebrew configuration permission choice. Only the receiver uses protected
manifest identity; Homebrew grants retain their stricter SDK checks.

Root QA on the first 1.5.0 build exposed both missing receiver permissions and a
stale service process: webos-service replaces its command line with the bus ID.
The prepared System Updater 1.1.2 recognizes that title only together with matching
UID, private working directory, executable and stable process start identity.
Existing supervisors are replaced only through the documented explicit
preparation/recovery flow. The successful [maintainer diagnostic](history/2026-10-29-root-receiver-upgrade.md)
used explicit host maintenance and a standard service restart; it is not acceptance
of a rebuilt candidate. Actual upgrade receiving, provisioning and rollback still
need matching artifact verification before release. Do not edit private pins or
permission files to force acceptance.

The maintainer approved the limited-evidence Helper 0.6.20 transition against
published Home 1.5.1 / Helper 0.6.19 for the
[exact recorded package and canonical archive hashes](history/2026-10-30-helper-0.6.20-approval.md).
The final combined build must reproduce those approved Helper bytes and rollback
baselines; changed bytes require new evidence and authorization. This is a scoped
risk approval, not a physical No-root/Helper or Android phone acceptance result.
Root testing does not establish those results.

## Candidate acceptance plan

1. Build all candidate platforms from one committed source and retain checksums.
   For this first rollout, keep the candidate unpinned: the trusted policy on
   main requires a successful build at the exact final candidate head. Bind
   acceptance to its run, attempt and artifact hashes. Pinned build reuse becomes
   available only after these release-flow changes reach main.
2. Read current TV/Root/update state and preserve an independent recovery path.
   Apply the genuine candidate through the supported update path; stop on failed
   admission or uncertain state rather than replacing files by hand.
3. Verify Classic/Alpine, UHD readability, remote focus and column capabilities.
   Open Showcase, refresh, download Channel, Try/Keep, apply an installed theme
   without a timer, restart and confirm offline persistence.
4. Remove Channel with cancellation and confirmation, including active removal;
   verify fallback to Classic and its return to Showcase.
5. Send an unpublished local theme from PC to TV, validate/Apply/restart/remove;
   test cancellation and receiver closure, fresh PIN and invalid transfer rejection.
6. Verify the rebuilt No-root Helper after standby/wake: Home routing and
   arrows/OK/Back/volume/pointer, triple Home/manual resume, Stop during recovery
   and persistent fault behavior. Keep cold boot separate. Revalidate Helper
   rollback against the new archive; earlier 0.6.20 source builds are different.
7. Validate installer pairing against the relevant legacy TLS endpoint, including
   first pairing and saved-key reconnect. A connection fix does not establish
   full webOS 2.2.3 compatibility. Published-version reporter confirmation remains
   pending for #152.
8. Record actual package hashes, model/firmware, input method and expected/actual
   results. Home routing, sound, standby, cold boot, full OTA/rollback and other
   devices remain separate gates unless directly exercised on these artifacts.

Scoped combined-candidate results and the explicit limited-release decision
are recorded in the [dated findings](history/2026-10-30-supervised-candidate-findings.md).
The original failures remain historical observations. RC-UI-06 and RC-START-05
remain failed known limitations; final trusted artifacts must preserve the tested
Root bytes before that evidence is used for release. Older device results retain
their original artifact scope and do not establish universal compatibility.
