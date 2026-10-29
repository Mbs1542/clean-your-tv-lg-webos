# v1.5.0 — Themes, Showcase and direct computer transfer

This is an unpublished release candidate. It is not approved for stable publication.
The previous published release is v1.4.1. Builds, exact-artifact TV acceptance,
Helper rollback compatibility and remaining release gates are tracked in
[release candidate #141](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/141).

| Component | Published v1.4.1 | Candidate |
| --- | --- | --- |
| Overall release | 1.4.1 | 1.5.0 |
| Home / renewal service | 1.5.1 | 1.6.0 |
| Home Helper | 0.6.19 | 0.6.20, rebuilt from source |
| cytv installer | 0.5.1 | 0.6.0 |
| Root edition | 0.5.1 | 0.6.0 |
| Both edition Updaters | 0.3.2 | 0.3.3 |
| Android installer / versionCode | 0.4.1 / 14 | 0.5.0 / 15 |
| New System Updater provisions / protocol | 1.1.1 / 1 | 1.1.2 / 1 |

## Included changes

- #139 and #149: built-in Classic/Alpine, downloaded theme preview cards and
  embedded Showcase in Appearance. Channel is external. Installed identities are
  hidden from Showcase; Refresh reads reviewed repository updates. Installed
  themes apply immediately; Showcase trials require Keep within 20 seconds.
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
- #151: optional Show Add app tile and a Settings app picker, preserving app
  editing and keyboard navigation when Home is empty.
- #142: No-root Helper control-file ownership fix (#140); rebuild 0.6.20 from
  source so the fix is delivered. Reject unsupported Root interfaces before
  installation mutation (partial #133).
- #145: reviewed-source cancellation of exact never-activated Root installs,
  including historical inventories and pre-registration finalize failures.
  Device-specific recovery for #101/#133/#143 remains separate and unverified.
- #134: reusable candidate-build evidence and scoped acceptance tooling. The
  first release still follows the trusted policy currently present on main.

## Upgrade boundaries

Use a complete matching installer/update set. A standalone Home IPK does not
replace retained Root workers or their LS2 permission contract. New Root
provisions record receiver capabilities; historical snapshots replay their
original permissions. Actual upgrade receiving, supported provisioning and
rollback must be verified before release; do not edit private pins or permission
files to force acceptance. System Updater 1.1.2 contains capability-aware replay
for new provisions; existing supervisors are replaced only through the documented
explicit preparation/recovery flow.

Helper 0.6.20 requires a new exact-archive rollback approval against the published
Home/Helper baseline. The earlier 0.6.19 approval does not authorize this transition.
No physical No-root/Helper or Android phone acceptance is claimed by Root testing.

## Candidate acceptance plan

1. Build all candidate platforms from one committed source and retain checksums.
   Pin the successful trusted build before physical acceptance.
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
6. Record actual package hashes, model/firmware, input method and expected/actual
   results. Home routing, sound, standby, cold boot, full OTA/rollback and other
   devices remain separate gates unless directly exercised on these artifacts.

No current-candidate physical result has been recorded yet. Prior C3 theme
fixtures and v1.4.1 acceptance retain their original scope and do not certify
this candidate's packages or new Root receiver upgrade path.
