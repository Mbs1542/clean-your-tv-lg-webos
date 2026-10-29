# PC-to-TV theme push (approved direction)

The maintainer requested implementation of the previously proposed reverse transfer as the primary author workflow and physical testing on their TV. Mac incoming connections remain blocked; no firewall changes or SSH tunnel substitute the actual data path.

## Flow and boundaries

TV Settings → Appearance → Receive from computer starts a temporary receiver through the edition's existing JS service. It shows TV private IPv4 addresses and a six-digit PIN. The PC preview's primary Send to TV dialog accepts those values. Its loopback-only toolkit server compiles the selected theme and sends an outgoing HTTP POST to the TV. Browsers never POST across network origins themselves. The TV UI verifies the same descriptor/rule/image/document hashes and image bounds, writes its existing IndexedDB cache and offers Apply without a timer. Existing URL/catalogue behavior and trusted Settings appearance remain intact. Legacy computer-pull transfer stays available as an explicitly secondary method.

## Protocol

- TV listens on TCP 8879 only during an explicit session, up to 10 minutes, ending on cancellation, leaving the pane, success, expiry or 20 wrong PINs.
- POST `/v1/theme`, `Content-Type: application/json`, `X-CYTV-PIN: SIX_DIGITS`, body is the existing `schemaVersion:1, descriptor:base64, files:{path:base64}` envelope.
- Require private/loopback local and peer IPv4 addresses, exact local-IP Host/port, no browser Origin header, one upload, at most 10 MiB and a 15-second request deadline. Reject oversized, malformed, concurrent and unauthenticated requests. No scripts, arbitrary filesystem writes, redirects or public hosts.
- HTTP 202 means transport received bytes, not installed/applied. The HTTP listener closes after receipt. UI errors remain visible on TV. The PC says to complete installation on TV.
- Edition-local Luna methods `themeReceiverStart`, `themeReceiverStatus`, `themeReceiverRead`, `themeReceiverStop` require the actual owning application ID from LS2, never an author-supplied identity. Start returns a random session ID, PIN, private addresses and deadline. Status returns waiting/receiving/received, byte length. Read returns at most 48 KiB as base64 for a requested exact offset; buffers remain private, expire, and are released on stop.
- The UI assembles bounded chunks, uses ThemeData.unpackLan and native image preparation via ThemeManager.installEnvelope, then stops the service session. Pending operations use view/generation checks and dispose on close. No PIN is persisted, logged or embedded in URLs. The TV address may be remembered on the PC only.

## Packaging and compatibility

One ES5 core/register implementation is shared by both services. Source shims support normal repository imports; packaging injects canonical modules into each service's own directory. Existing services, routing and recovery commands are not exposed through HTTP. New web assets enter every explicit inventory and candidate export. The primary toolkit changes live in its own isolated follow-up checkout, with no edits to the old release preparation branch.

## Acceptance

Automated real HTTP tests cover authentication, size/deadline bounds, host/origin, one-shot state, expiry, cancellation, offset bounds and LS2 identity. Browser tests cover both editions, entry/exit, assembly, validation errors and immediate Apply. Toolkit tests cover outgoing requests and the browser dialog. Physical acceptance uses a disposable app/service identity with no Home routing/startup changes: PC UI → actual private TV HTTP listener → validated install → Apply → close receiver → reload from cache → remove. Record exact artifacts, model/firmware/edition and untested fields. Root fixture evidence does not prove unrooted permissions or normal release-package acceptance. Clean up only task-created device apps/files and restore ordinary Home.
