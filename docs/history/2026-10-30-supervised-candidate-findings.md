# Release 1.5.0 supervised candidate findings — 2026-10-30

Status: acceptance in progress; not ready for main. The maintainer explicitly
requested recording all defects for one later fix scope, continuing tests on the
existing candidate and **no rebuilding for now**. Do not fix product code or
replace installed packages during this observation pass.

## Evidence and environment

Candidate source: `9e5059fdf8831920eaf7e0e44fc60cb4f966ed5f`.
Trusted build: `40944127403`, attempt 1. The preceding artifact comparison
established identical TV component bytes to the installed candidate's build
`40936979918`, attempt 1; this is not a new installation claim.

Established test device: maintainer-owned OLED55C3RLA, firmware 43.21.71,
webOS SDK 11.2.0, Root edition 0.6.0 / shared engine 1.6.0;
System Updater retained at 1.1.1. Installer host: macOS. Remote model unknown.
The first remote connection attempt this session timed out; these new findings
are the owner's physical observations, not fresh debugger measurements.

Requested initial scenario: launch Home Root manually and test navigation,
theme appearance, app launch and sound. Actual Home-interception state has not
yet been freshly confirmed. Do not infer routing, sound, emergency, standby,
cold-boot or update/rollback acceptance from the visual observations below.

## Defects — all require a later fix

| ID | Status | Trigger / expected result | Owner-observed result | Remaining detail |
| --- | --- | --- | --- | --- |
| RC-UI-01 | NEEDS FIX | View the Itachi preview; preview should render correctly and represent the theme. | Itachi preview is broken. | Exact preview surface and visual failure not yet specified. |
| RC-UI-02 | NEEDS FIX | Hold a navigation button to scroll icons; movement/focus animation should remain smooth and coherent. | Icon animation works very poorly during held-button scrolling. | Exact theme, direction and visual symptom not yet isolated; do not assume an Itachi-only cause. |
| RC-UI-03 | NEEDS FIX | Launch Home Root with Alpine already applied; the first visible themed frame should use the saved theme. | Standard theme appears first, then changes to saved Alpine after several seconds. Reproduced after standby/wake when short Home opened the launcher, and on manual launch after a disabled-state cold boot. | Delay not measured; startup/loading cause not diagnosed. No separate delay duration was supplied for the cold-boot reproduction. |
| RC-UI-04 | NEEDS FIX | Showing Home, including short Home from an app, should immediately display the saved theme. | Reproduced by the owner: icons initially appear in their original colors and wallpaper is absent; about half a second later the expected styling appears. | Suggests delayed theme presentation; exact loading/rendering cause is not diagnosed. Keep separate from RC-UI-03's several-second initial launch until a common cause is established. |
| RC-START-05 | NEEDS FIX | After ordinary remote-off/wake with Change Home active, inspect initial foreground and subsequent Home routing. | LG Channels opened and remained; Home Root did not appear automatically. Short Home opened Home Root successfully. | Post-wake arrows, video and sound work. Exact wait duration and off interval not specified; automatic foreground behavior needs investigation, separately from retained routing. |
| RC-UI-06 | NEEDS FIX | Apply an installed theme while viewing Appearance; the theme-selection area should remain visually stable. | The entire theme-selection area jerks on every theme application. | Exact displacement, scroll position and re-render/layout cause not yet measured. Functional application and focus checks passed separately. |
| RC-UI-07 | NEEDS FIX | Channel should use its expected single-row default layout. | Owner reports Channel appears with the default eight rows rather than one. | Preserve the owner's row terminology; exact row/column geometry and interaction with saved layout preferences have not been isolated. Do not infer a cause or mark the expected layout accepted. |
| RC-START-08 | NEEDS FIX | Cold start with Change Home enabled should automatically present Home Root within the observed startup window. | LG Channels opened; Home Root did not appear during one minute without Home input. | Keep this cold-start result separate from standby/wake RC-START-05. Follow-up confirmed short Home, arrows/OK, playback/audio/volume and retained active intent; automatic foreground remains failed. |

Reported by the maintainer in this chat on 2026-10-30. No code fix, rebuild,
package installation or successful retest is established by this record.
Keep the original failures open until the later combined fix is verified.

## Acceptance still to observe

Owner-confirmed first-stage result: video starts, sound and volume work, and
ordinary Back behaves normally. The specific app/video and remote model were
not named. This does not accept app exit confirmation or audio after an
update/rollback transition.

Fresh read-only connection subsequently succeeded and confirmed the established
model/firmware/component versions above, with no pending host operation.

Before the Home-routing stage, the installed verified Python binding and stock
Root `deploy.py status` succeeded. Actual routing was LG Home, the prior routing
journal was restored, and persistent intent was disabled. Recovery integrity
was verified; its hardware-validation flag was false, so no fresh physical
recovery pass is claimed. The existing independent SSH connection is available
for supported restore. Three existing state/receipt files, including the
recovery journal, were copied to private off-device storage with hashes before
the requested bounded manual Home/emergency test. No activation was performed
by this preflight.

The owner subsequently completed the requested Change Home stage: explicit
enable, short Home from an app, triple Home within two seconds, then waiting
ten seconds and pressing Home again. All behaved as expected except the visible
short-Home flash recorded as RC-UI-04. Therefore routing to Home Root and the
physical emergency return to LG/no automatic re-enable are owner-confirmed
for this run; the visual transition is not accepted. These observations do
not establish standby/wake, cold boot or a frozen-renderer emergency result.
Independent read-only status after that report confirmed LG Home routing,
a restored journal and disabled persistent intent.

After deliberately re-enabling Change Home, the owner tested app exit:
cancelling exit kept the app open, and confirming exit returned to Home Root.
The app was not named. This accepts the observed cancel/confirmed-exit path on
this device, not all apps or a post-update/rollback transition.
Read-only pre-standby status independently confirmed routing to Home Root,
enabled persistent intent in its active phase and the pending active routing
journal. During the requested ordinary remote-off/wake scenario, the owner
reported LG Channels as the opened screen. The requested 30-second off interval
was not explicitly confirmed. No cold boot was requested or established.
Automatic Home appearance and post-wake controls/audio remain unverified;
see RC-START-05 rather than marking this scenario passed.
Independent read-only post-wake status still reported Home Root as the Home
destination, with persistent intent enabled/active and its active routing
journal pending. This establishes retained routing state, not the foreground
screen or physical short-Home delivery after wake.
The owner then confirmed LG Channels remained and Home Root never appeared
automatically during the observation. Short Home opened Home Root; arrows,
video and sound worked afterward. The first launcher appearance again used
the standard theme, changing to the saved theme several seconds later
(RC-UI-03). Accept post-wake manual Home routing and the reported controls/audio
only; automatic foreground/theme presentation remain failed/open findings.

The owner completed all four subsequent controls checks as expected:
holding Back for about 1.2 seconds visited LG Home; short Home returned to
Home Root; explicitly disabling Change Home restored LG Home on short Home;
manually launching Home Root afterward did not re-enable Home replacement.
This is physical owner confirmation of those paths, not startup, interrupted
update recovery or frozen-renderer acceptance. Current last reported Home
replacement state is disabled.

The owner confirmed Classic and Alpine apply immediately, app order is
preserved, Back from Showcase returns normally without losing focus, and Alpine
remains active after leaving Settings. Every application visibly jerks the
theme-selection area (RC-UI-06); do not treat these functional passes as visual
acceptance. Subsequent theme-trial results follow below.

The owner subsequently confirmed the Showcase test behaved normally: downloading
Channel left Alpine active; allowing the 20-second unconfirmed trial to expire
returned to Alpine; a second trial cancelled with Back also returned to Alpine.
Channel's unexpected eight-row layout remains RC-UI-07 despite the functional
trial/cancellation passes.

The owner then confirmed the complete Keep/library/removal sequence: keeping
Channel added it to the installed list and hid it from Showcase; cancelling
active-theme deletion preserved the theme; confirming deletion activated Classic
and made Channel available in Showcase again. The owner restored Alpine.
These functional results do not close the existing preview/layout/motion bugs.

Before the next requested disabled-state cold-start scenario, read-only status
confirmed LG Home routing, disabled persistent intent, restored routing journal
and verified recovery integrity. Off-device recovery evidence and the independent
SSH recovery path remain available. Cold-start behavior is still untested at
this checkpoint; no package or code changes were made.

The owner completed the requested disabled-state cold-start test: LG Channels
opened after power-up, short Home opened LG Home, and manually launched Home
Root retained Alpine. Arrows and sound worked. The first Home Root appearance
again showed the standard theme before Alpine (RC-UI-03). The disabled Home
choice was preserved, so LG Channels foreground here is not evidence of the
enabled-state automatic-foreground defect RC-START-05. Exact power-off durations
were not separately restated. Enabled-state cold start remains untested.
Independent post-cold-start status confirmed LG Home, a restored journal,
disabled intent, verified recovery integrity and availability of explicit
persistent activation. The independent SSH recovery connection succeeded.

For the subsequent requested enabled-state cold-start sequence, the owner
reported LG Channels again and no automatic Home Root appearance for one full
minute. This fails the observed automatic-foreground scenario (RC-START-08).
The requested pre-cycle explicit enable/short-Home check and exact off intervals
were not separately restated. Do not infer loss of routing, a recovery fault,
or post-cold-start controls/audio success before the follow-up.
Read-only status after the report confirmed Home Root remained the configured
Home destination, intent remained enabled/active and recovery integrity was
verified. The routing journal was pending as in the earlier active state.
Therefore this readback does not show a disabled-intent recovery event; it
does not establish the missing automatic foreground's cause or physical key
delivery. Exact post-cycle status is retained privately.
The owner then confirmed short Home opened Home Root and arrows, OK, video,
sound and volume worked after this enabled-state cold start. The standard theme
again appeared before saved Alpine (RC-UI-03). This accepts the reported manual
Home/control/audio paths only; RC-START-08 remains open and no automatic-startup
pass is recorded.

The owner confirmed tile editing: Back cancelled a pending move and restored
the original order; OK retained a confirmed move; launching the moved tile
opened the intended app. The tile was returned to its original position.
No move/focus defect was reported in this bounded test; held-button scrolling
animation RC-UI-02 remains a separate open finding.

The owner confirmed hiding a tile followed by Undo restored it; the Add app
tile visibility switch hid the plus tile; the Settings Add app picker opened
while the plus tile was hidden; Back exited normally. The visibility switch
was restored to its original state. No app installation/removal was performed
or inferred from these launcher-only controls.

The owner confirmed mute/unmute restored sound and Magic Remote pointer
navigation/clicks worked. No remote model or wheel result was supplied.

The owner confirmed Classic and Alpine worked with the TV disconnected from
the network. After closing/reopening Home Root offline, Alpine was retained,
but the standard theme appeared first again (RC-UI-03). Network connectivity
was restored afterward. No downloaded-theme offline test or explicit offline
preview/control result was reported; keep those scopes untested. Offline
reproduction shows the theme delay is not confined to online launches; it does
not establish a network-independent root cause.

## Automated installed-TV continuation

After the owner pointed out that many UI cases could be automated, remaining
automatable cases moved to debugger-operated checks on the installed candidate.
These do not replace physical remote/input, sound or power observations.

Actual receiver UI checks passed: starting displayed a six-digit PIN and opened
the TCP listener; cancelling returned to the theme list and closed the listener;
reopening generated a different PIN and reopened the listener; cancelling again
closed it. The initial theme, saved theme choice, profile and Settings visibility
were preserved. No package was rebuilt or installed. Redacted machine evidence:
ignored `build/final-supervised-2026-10-30/receiver-ui-auto.json`.

Actual PC-to-TV HTTP transfer also passed using the existing, hash-checked,
unchanged Itachi 1.0.0 distribution, descriptor digest
`d4433b759c3ef07823bdddd7e6c82a380330507ce077d2aca76ed4a279f855b9`.
The receiver returned HTTP 202; the installed renderer verified/cached that
exact theme and offered Apply. Receiving alone left the active theme and saved
choice unchanged, and the listener closed after reception. No Apply action
was performed in this transfer case. The theme was not cached beforehand;
the test-only cache entry was removed afterward. Theme, saved choice, profile
and Settings visibility were preserved. No theme, IPK or installer rebuild
occurred. Redacted evidence: ignored
`build/final-supervised-2026-10-30/receiver-push-auto.json`.

Additional actual receiver cases passed: an envelope with deliberately damaged
rules bytes (unchanged declared hash) was accepted at the HTTP transport layer
but rejected by the renderer's package validation with a visible error, unchanged
cache/theme and closed listener. Retrying with the original unmodified Itachi
bytes offered Apply; clicking Apply immediately selected/saved that exact theme
without a trial timer. The listener remained closed. Supported theme selection
then restored Alpine and the identical saved choice/profile, and only the new
test cache entry was removed. No product or distribution rebuild occurred.
The first harness attempt stopped before interaction because it incorrectly
expected the builtin list item to carry an external-package digest; correcting
that test-only assumption enabled the checks above. Evidence: ignored
`build/final-supervised-2026-10-30/receiver-negative-apply-auto.json`.

Read-only startup diagnosis after the latest cold-start test found the retained
decision `boot-presentation / preserved-foreground`, bound to the same session
as the current enabled/active persistent intent. Thus this retained decision
explicitly preserved the foreground rather than requesting Home presentation.
Current read-only settings say Home auto-launch is on, and current boot status
is hardware/active/normal with firstAppLaunched true. These current fields do
not establish all values at decision time. The exact foreground ID at the time
was not retained, so do not infer a Channels app ID or widen the allowlist from
its visible name. This narrows the latest cold-start investigation but does not
identify the separate standby/wake outcome. No setting or runtime was changed.

Read-only layout inspection found Alpine with in-memory override 8 while
`tvhome.columns.v1` was absent. A bounded actual-TV trial of the original
reviewed Channel package, without changing column preferences, then measured
themeColumns 1, effective columns 8, override 8, channel-list preset and eight
distinct card x positions. This confirms eight columns in the reproduced state;
retain the owner's original "rows" report separately. The source/host audit
shows that overrides take priority and can originate from legacy CONFIG.columns;
do not silently discard a preference or declare the desired policy resolved.
Cancelling restored the exact Alpine/layout/choice/profile state and removed
only the temporary Channel cache entry. Evidence: ignored
`build/final-supervised-2026-10-30/channel-geometry-auto.json`.

Actual partial-transfer tests passed: the UI observed receiving while the PC
held an incomplete HTTP body; closing that connection returned the receiver to
waiting with its listener usable. Cancelling during a second partial transfer
returned to the list and closed the listener. Cache, active/saved theme, profile
and original Settings visibility were unchanged. Evidence: ignored
`build/final-supervised-2026-10-30/receiver-interrupt-auto.json`.

At the owner's explicit request, three separate project chats were opened for
research only: theme startup/visibility delay (RC-UI-03/04), automatic foreground
after power transitions (RC-START-05/08), and preview/motion/selection/Channel
layout (RC-UI-01/02/06/07). They must not modify code, rebuild, write GitHub state
or access the TV while this chat continues acceptance.

## Remaining acceptance scope

- Physical remote wheel behavior/model remains unreported; mute, pointer and
  clicks were owner-confirmed above.
- Failed automatic foreground after standby/wake and enabled cold boot needs
  a future fix and affected retest; preserved disabled-state routing and manual
  Home/control/audio observations above retain their actual scope.
- Supported System migration, update and exact-candidate retained rollback.
- Independent Helper compatibility and Android upgrade/lifecycle gates.
- Guarded renderer/worker failure and Homebrew failsafe scenarios are not
  established by ordinary triple-Home or successful HTTP/theme tests. No forced
  process failure or failsafe entry was performed during this observation pass.

## Observation-pass checkpoint

All eight findings remain open for the later combined fix scope. No product
source, package version or installed IPK was changed and no build was requested.
The three research reports are retained locally under
`/tmp/cytv-rc150-theme-flash-audit.md`,
`/tmp/cytv-rc150-startup-audit.md` and
`/tmp/cytv-rc150-theme-ui-audit.md`; their confirmed source/host mechanisms are
separate from the physical results above. Automatic foreground and first-theme
presentation remain failed; actual update/migration/rollback and independent
Helper/Android gates are not silently waived. Do not mark the candidate ready
or merge it on the strength of this partial acceptance record.

Append actual results and additional defects during this observation pass.
Unknown or untested scenarios remain unknown or untested.

## Additional diagnostic cold cycle during implementation

While a host-side read-only recorder was prepared, the owner performed another
requested enabled cold-start sequence (remote off, AC disconnection, on and one
minute without Home/Back/app launch) and reported LG Channels again. No new
candidate had been installed; this is additional evidence on the same original
installed artifacts, not acceptance of the implementation branch. Exact off
durations were requested but not separately restated. RC-START-08 remains open
pending analysis/fix and verification of new artifacts.

## Implementation verification checkpoint — 2026-10-30

After the observation pass, the maintainer authorized source fixes and new builds.
The combined implementation checkpoint is `e2e97446` on
`codex/rc150-acceptance-fixes`, compared with `origin/release/next`. The historical
eight NEEDS FIX rows above remain unchanged: they describe observed failures on
the original installed artifacts, and host regressions cannot turn them into
physical passes.

The combined source addresses saved-theme first-frame readiness and warm
presentation, held-navigation lag, stable Appearance selection, separation of
theme-derived layout from genuine explicit/legacy column preference, the Itachi
1.0.1 preview, and guarded System Updater 1.1.1-to-1.1.2 replacement. The pending
startup follow-up narrows native partner-TV foreground admission using verified
metadata for the known C3 surface, on boot and genuine wake. It preserves unknown
apps, explicit/emergency off, health/session/recovery checks and native Home
preference; no new user control, observer, endpoint or permission is introduced.
Its integration and affected checks remain separate from this source checkpoint.

Integration-parent host results: full `scripts/test.sh` passed 1,649 Python tests
with two skips plus JavaScript/native checks. Combined both-launcher startup and
motion browser checks completed in session `85009` with exit 0. After correcting
stale-pointer browser fixtures, the 12 remaining browser files passed. The fixes
and tests have not been installed on the TV by this checkpoint. No new signed
artifact, physical remote, sound, standby, cold-start or rollback result is claimed.

The documentation pass reviewed README and the documentation index, installation,
update/removal, recovery, CLI, compatibility, controls, app management and themes;
Android prerequisites/readiness; Root runtime/testing references; CONTRIBUTING
and the candidate release notes; and all twelve localized guides. The existing
navigation/theme/column/emergency steps remain accurate. Only the localized
existing replacement command needed a targeted addition for installed 1.1.1
alongside 1.1.0. An explicit or genuine legacy column choice still takes priority;
By theme selects the author's layout where supported.

Release notes now link the
[exact Helper 0.6.20 limited-evidence approval](2026-10-30-helper-0.6.20-approval.md).
That scoped approval requires the final build to reproduce the recorded Helper
package/archive and rollback baselines; it does not provide physical No-root
acceptance. Fresh README metadata tests passed (3), and all 426 relative Markdown
targets in the 29 reviewed guides resolve. These checks validate documentation
consistency, not final artifacts or hardware compatibility.

The implementation PR must identify the changed startup policy, preserved column
preferences, Itachi version/provenance and supported supervisor transition; list
actual host checks and this documentation pass; and retain all new-artifact and
supervised device gates. Original physical failures remain open until matching
new artifacts are installed and the affected scenarios are actually observed.


### Final source integration checkpoint

The reviewed native-TV classification commit `759d754d` is now integrated.
It uses the exact observed partner-TV identity and store metadata for both
boot and genuine wake, rereads foreground after lookup, and retains existing
health, intent, native-preference, freshness and failsafe gates. No early
observer, startup hook or general CP-app allowlist was added. Manual selection
of this exact TV surface during the startup/wake window has the same policy
boundary as Live TV. The integration parent independently reran all 86 boot/wake
presentation tests successfully. Physical RC-START-05/08 acceptance remains pending
new artifacts; original failures above are not superseded by these host tests.


The changed Root runtime is now versioned 0.6.1; the overall candidate stays
1.5.0. This distinguishes corrected component bytes from the installed prerelease
0.6.0 and allows an ordinary forward update after supported supervisor migration
captures the genuine current bytes as its local baseline. Neither equal-release
nor equal-component admission was relaxed, and no device state/version was edited.
README, service package metadata and release notes agree. Metadata checks passed;
new artifact generation and the physical transition remain pending.


### Parallel preliminary builds

The maintainer explicitly requested early device testing alongside host tests.
An explicit same-repository named-branch draft build is now available and was
dispatched as run `41014826275` at `14374b32`; its validation and platform jobs
run independently. It cannot count as final release acceptance. The reviewed
preliminary Root signing mode keeps protected release/next tools, exact source,
branch, attempt, successful package job and artifact proofs, marks signed notes
as preliminary, and permits remaining validation to be pending. It executes only
trusted tools on candidate package data. Default final-success/publication gates
are unchanged. Host admission/signing regressions pass; actual preliminary signed
artifact creation and TV results are not yet established.

### Integrated source and preliminary artifact checkpoint

PR [#163](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/163) merged into
`release/next` as `809a1a7b` with green required CI. Root is 0.6.1 in release
1.5.0. The original eight physical findings retain their observed failures;
their corrections are integrated in source, pending targeted new-artifact QA.
The owner requested retesting only those eight findings, rather than repeating
unchanged physical cases.

Integration-parent host verification includes 886 Root Python tests, 128 System
tests, 150 setup checks, 15 preliminary-admission checks and affected browser
suites. Preliminary build `41015491880` is bound to frozen source `baf9b07d5d938ba0403627926d48aad2afa9ccac`; it
cannot authorize final release publication. Android native/lifecycle checks on
`14374b32` and direct upgrades on `baf9b07d5d938ba0403627926d48aad2afa9ccac` passed. The executable code bodies are
identical; PYC timestamps and provenance differ. That packaging-only difference
adds no further Android runtime gate. The exact Helper approval remains usable
only if final artifacts reproduce the approved archive and rollback baselines.

At this checkpoint the TV still has the old candidate packages; supported System
migration is in progress without a recorded outcome. No new installation,
physical fix, standby/wake, cold-start, audio or rollback result is claimed.
The candidate remains unpinned with empty final acceptance pending actual gates.

The latest supported System transition started but returned not confirmed and
its driver stopped. Diagnosis/recovery is active without blind replay. Root
0.6.1 is not installed. Preliminary Root signing run `41018163490` succeeded
and its hashes were verified; signing is not an installation/acceptance result.
