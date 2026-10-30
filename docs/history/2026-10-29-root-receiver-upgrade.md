# Root receiver upgrade diagnostic — 2026-10-29

This is a maintainer-owned TV QA record. It describes an installed candidate plus
explicit computer maintenance, not acceptance of the subsequently changed source.
No public release was published for this test.

## Device and artifact identity

- TV: LG OLED55C3RLA; firmware 43.21.71; webOS SDK 11.2.0.
- Remote model: unknown; this diagnostic used authenticated TV inspection and
  genuine renderer controls. Physical remote navigation remains untested here.
- Installer platform: macOS 15.6.1 arm64.
- Source: `7fb6986f4d7805170dbef70a51590d4e01827e1d`, release candidate 1.5.0.
- Full successful build: Actions run 40883883545, attempt 1.
- Root-only signing: Actions run 40887134184; publishing job skipped.
- Genuine primary Root 0.4.0 → 0.6.0; Root Updater 0.3.0 → 0.3.3;
  infrastructure 0.4.0 → 0.6.0. Retained System Updater remained 1.1.1.
- No separate theme fixture app was used. Root Home routing intent remained off.

Installed signed component SHA-256 values:

| Component | SHA-256 |
| --- | --- |
| Root 0.6.0 IPK | `a3d0c6ea342903d69238540a0af1260c26e3341add76b3fe965e49bf798100a9` |
| Root Updater 0.3.3 IPK | `03178adacfd00391cf54d9dd87587cee04b717598507e85c55948d982382ca72` |
| Root infrastructure 0.6.0 | `c0dfbc5fe452f4f60f84bdd277835ad2df1e382aa80a409663dfe79f76dc0776` |

## Expected and observed

Expected: the genuine updated Home can start its temporary LAN receiver and accept
a theme sent by the computer without permitting incoming Mac connections.

The normal update completed with all component terminal evidence, transaction
`complete` and Home resume `complete`. Opening Receive from computer nevertheless
showed receiver unavailable. A genuine PalmServiceBridge call returned a denied
method error. Protected service bytes matched the recovery receipt and contained
the receiver, but the historical provision snapshot correctly retained its old
five-method permission contract.

Reviewed host maintenance attached only the four fixed receiver methods to the
existing Home control group using a separate root-owned API file and resumable
receipt in the protected package manifest. The legacy snapshot, its four LS2
files, private worker sources, integrity pins and signing keys were not rewritten.
The receiver's identity comes from that protected manifest; no SDK-directory
permission repair was performed. The first guarded maintenance attempt refused
unsafe SDK metadata before issuing a grant; the narrower receiver identity path
was then covered by a failing regression test and independent review.

After registration, the bus reported the correct API/client groups, but the
running service still rejected the new methods. Inspection showed a Node process
whose command line had become its single service bus ID; the retained supervisor's
path-based restart did not select it. Standard webos-service `quit` acknowledged
shutdown. Reactivation loaded the installed service; a request without a session
then reached the receiver handler and returned `invalid-request`, rather than
being denied by the service boundary.

## Actual transfer checks

1. Opened genuine Root Settings → Appearance → Receive from computer.
2. Confirmed a TV address and six-digit PIN appeared, without publishing either.
3. Sent Channel from the PC toolkit using its normal outgoing HTTP implementation.
   The TV returned HTTP 202; Mac firewall settings were unchanged.
4. Confirmed Channel 1.3.3 in the TV-installed theme list and its Apply action.
5. Activated Apply through the genuine UI. Current theme became Channel, trial
   state was false and the receiver pane closed after receipt.

Private maintenance source/bundle digests and replies were retained with the
pre-install device backup. No addresses, PINs, credentials, app inventory or
personal screenshots are included here.

## Source verification

The required full `scripts/test.sh` run passed on macOS with the configured Python
dependencies and Node 0.12.2 compatibility runtime. Focused regressions were first
observed failing and then passed: 26 permission-maintenance cases and 50 System
Updater device cases, including PID reuse during process identity inspection.
Independent review found and resolved that process race before integration.
These are source checks, not acceptance of new signed TV artifacts.

## Remaining acceptance

The installed signed artifact does not contain the new automatic reconciliation
or improved supervisor process discovery. Explicit host maintenance demonstrates
the failure and a bounded repair; it does not establish durable OTA behavior.
The new source must be rebuilt, signed and tested with its exact component hashes,
including an upgrade from the legacy permission contract and the supported
supervisor preparation boundary. Verify receiver API start/status/read/stop and
service restart behavior on that build.

Showcase download/filtering/removal, physical remote focus, standby, cold boot,
normal OTA rollback and No-root/Helper/Android acceptance were not established by
this diagnostic. The earlier built artifacts and this one TV do not establish
universal compatibility. The user continues hands-on candidate review.
