# Themes B: TV Installation and Persistence Implementation Plan

> **For agentic workers:** Use `executing-plans` task by task. Delegate only if execution is explicitly authorized for parallel agents. This document authorizes no TV changes by itself.

**Goal:** Install a theme from the author's public repository directly on Root and No-root TVs, keep it offline, and recover safely from failure.

**Architecture:** A small app-owned service performs bounded downloads and private storage; the shared UI/runtime consumes validated manifests and asset chunks. Theme state is independent of old software-update profile schemas.

**Tech Stack:** Legacy-compatible TV JavaScript service, bundled CA trust, DB8 candidate store, classic browser JS, existing app packaging and tests.

**Spec:** [Theme ecosystem design](../specs/2026-10-28-theme-ecosystem-design.md).

## Global constraints

- Direct TV URL entry is required; desktop/phone pairing is not a prerequisite.
- Same theme format and user flow for Root and No-root; do not assume equal permissions without evidence.
- No root elevation, firmware change or modification of Home interception for theme work.
- No arbitrary external executable code or broadening of the software updater's URL policy.
- Existing profile schema 1 and old updater contracts remain valid.
- Static 1920x1080; ES5/Chromium 38 frontend; service compiled/tested for Node 0.12.2+.
- Stage and verify all resources before changing the installed/active pointer.
- No startup network dependency or permanent polling daemon.

## Interface and state contracts

Create `theme-service/` with `service.js`, `manager.js`, `transport.js`,
`db8-store.js`, `policy.js` (the exported shared policy), `package.json`,
`services.json`, `ca-bundle.crt` and `ca-LICENSE.txt`. Build one service instance
per app ID, using the same source. Root installation does not justify running the
theme downloader with elevated privileges.

Browser/service methods, each caller-checked and with exact field validation:

| Method | Request | Result |
| --- | --- | --- |
| `capabilities` | `{}` | API versions, source support, persistence readiness, limits |
| `list` | `{}` | Installed entries, active/previous references, available storage status |
| `inspectSource` | `{url}` | Tagged single-theme offer or pinned collection ID with bounded candidate metadata |
| `selectTheme` | `{collectionId,themeId}` | Bounded offer ID with verified identity/version/preview/size/source, pinned to the indexed descriptor digest |
| `install` | `{offerId}` | Transaction ID; installs the exact inspected descriptor digest |
| `installStatus` | `{transaction}` | Phase, verified bytes, safe error code |
| `cancelInstall` | `{transaction}` | Cancel acknowledgement; does not undo an already completed install |
| `readManifest` | `{themeId,digest}` | Validated local manifest and typed rules |
| `readAsset` | `{themeId,digest,assetId,chunk}` | Bounded base64 data and final-chunk flag |
| `beginTrial` | `{themeId,digest,overrides}` | Trial ID, previous reference and expiry |
| `confirmTrial` | `{trialId}` | Accepted active reference if the unexpired trial matches |
| `cancelTrial` | `{trialId}` | Previous accepted reference |
| `recoverTrial` | `{}` | Safe boot state; unresolved trial starts Classic |
| `restoreClassic` | `{}` | Built-in active reference, trial cleared, user assets retained |
| `remove` | `{themeId,digest}` | Removed unused version; rejects active/previous references |

Downloads are single-flight per caller. Offer IDs expire after 10 minutes and bind
all hashes/source identities. Transaction/trial IDs are random and scoped to the
owning app. Error messages never include TV credentials or raw request headers.

Installation phases: `inspecting -> downloading -> verifying -> staged -> installed`;
terminal `cancelled` or `failed`. Applying a theme is a separate operation:
`accepted -> trial -> accepted(previous or new)`. A late callback cannot resurrect
a cancelled transaction or confirm an expired trial.

Store methods:

```javascript
stageAsset(transaction, assetId, bytes); // Promise<void>, immutable digest records
commitInstalled(transaction, manifest, rules); // Promise<InstalledReference>
readManifest(reference);               // Promise<{manifest,rules}>
readAsset(reference, assetId, chunk);   // Promise<{data,final}>
writeSelection(expectedRevision, next);// Promise<Selection>, compare/retry policy
collectGarbage();                      // Promise<{removedBytes}>
```

Selection contains `schemaVersion:1`, `active`, `previous`, `trial`, `overrides`
and a storage revision. References contain stable theme ID, descriptor digest and
theme API version. No app inventory or routing settings are stored here.

`theme-service/manager.js` exports `createManager(store, {transport, clock})`;
`clock.now()` returns milliseconds. The returned object implements the methods
in the table, accepting the same request objects. Tests create a fresh manager
over the same store to model process restart. `beginTrial` returns `trialId`;
`recoverTrial` returns `{active, unconfirmed}` with a null unconfirmed value when
no interrupted trial exists.

## B1. Prove download, persistence and service packaging on actual TVs

**Create:** `tests/themes/device-probe.cjs`,
`docs/development/THEME-DEVICE-ACCEPTANCE.md` and a temporary probe package through
the normal package builder. Do not publish this probe as a supported feature.
**Read:** `docs/TLS-TRUST.md`, `system-updater/core.py`, `root-edition/build.py`,
`scripts/build-cytv.py`, `root-edition/package_identity.py` and relevant release constraints.

- [ ] Test a Home-owned JS service on one No-root and one Root configuration. Record model, webOS/firmware, Node version, package versions, caller identity and effective privileges locally.
- [ ] Fetch a small fixed public GitHub descriptor over verified TLS. Test raw-content and release-asset redirects, timeout, incorrect TV clock and TLS failure. No insecure certificate fallback.
- [ ] Register a private DB8 kind under the service owner, then write/read chunked synthetic image data, a manifest and an active pointer. Check actual quota and latency with active+staged versions present.
- [ ] Close Home, terminate/restart its service, restart the TV, test standby/wake and cold boot separately, then read the exact original hashes offline.
- [ ] Install a new app build with the same IDs, roll back, and check storage/caller registration. Test reinstall/uninstall only on an explicitly authorized disposable setup; report those untested if unavailable.
- [ ] Verify both existing app package/identity contracts allow the added service without a new privileged component or relaxing old update checks.
- [ ] Record a decision: use DB8 if permissions, persistence, atomic pointer update and bounded capacity pass; otherwise evaluate app-owned service filesystem storage against the same tests. No unproven fallback gets labeled supported.
- [ ] Update spec section 7 with measured storage choice and bounds before B3/B6. If neither option works on a target, keep external themes unavailable there and state the unresolved requirement; built-ins/toolkit may continue.
- [ ] Remove probe files/services after preserving required evidence; follow installation-report consent rules before publishing any device report.

Gate: actual TV evidence is required. Browser APIs, emulator success and a package
installation alone do not satisfy this task. Implementation planning does not
give permission for destructive device tests.

## B2. Implement source resolution and bounded transport

**Create:** `theme-service/transport.js`, `tests/themes/transport.cjs`,
`tests/themes/source-resolution.cjs`.
**Consumes:** A3 manifest policy. **Produces:** inspectable immutable offers.

- [ ] Support public `github.com/owner/repo` and explicit `cytv-theme.json` links. Resolve repository-root default branch once through the public API to a full commit SHA.
- [ ] For a repository URL prefer a valid root `cytv-themes.json` index; only
  absence permits single-theme fallback. Pin the index revision, validate its
  schema/size/entry limits and unique identities, and expose bounded candidate
  metadata for selection. Reject recursion, cross-repository entries and unsafe
  relative paths. Bind each selected offer to the indexed descriptor digest.
- [ ] Support commit-pinned raw paths and GitHub release assets. Normalize Unicode/escaping carefully; validate normalized host, scheme, port, credentials, repo identity and path on every redirect.
- [ ] Keep the initial host policy limited to required GitHub/API/raw/asset CDN hosts. The expected repo/asset path is checked in addition to host; no generic CDN open proxy.
- [ ] Reject user-info, custom ports, private/loopback/link-local targets, encoded path escapes and unexpected redirects. A resolver does not forward tokens or cookies.
- [ ] Reuse bundled CA files and verified TLS configuration. Compile with the existing legacy-service build tool; use compatible URL APIs, buffers and timeouts.
- [ ] Enforce descriptor/style/asset lengths while streaming, regardless of Content-Length. Implement idle/total timeouts, at most three validated redirects, one asset at a time and explicit cancellation.
- [ ] Test replay/change between inspect and install: a changed manifest or wrong digest must fail, not install a different version.
- [ ] Test HTTP 404/429, GitHub rate limit, redirected private address, wrong digest, content-type mismatch and content larger than the declared/max size. Commit `feat: resolve and download bounded public theme assets`.

Do not fetch a whole Git checkout or run the author's release workflow on the TV.
The repository root pointer locates already built data; toolkit build is required.

## B3. Implement transactional store and asset delivery

**Create:** `theme-service/db8-store.js` or the explicitly accepted file adapter,
`tests/themes/store.cjs`, `tests/themes/store-faults.cjs`.
**Consumes:** B1 accepted storage behavior. **Produces:** store methods above.

- [ ] Store assets by digest and metadata by namespaced identity; keep staging separate from installed references. Use explicit private DB8 ownership and indexes if DB8 passed B1.
- [ ] Chunk binary data into 32 KiB units before base64. Account for base64/JSON overhead in storage budgets; do not read a whole wallpaper in one Luna message.
- [ ] Commit the manifest pointer only after all expected chunks and hashes are verified. Use the accepted store's revision/atomic update mechanism to reject lost updates.
- [ ] Test interruption after every write boundary: accepted old version must remain readable, incomplete new versions absent from list, and unreferenced staging collectible.
- [ ] Keep active and previous versions pinned; share identical assets by hash. Refuse deletion of pinned data. Quota error preserves old data and offers user-directed cleanup.
- [ ] Test corrupted chunks, missing records, duplicated install, concurrent selection and garbage collection. Invalid persistent content must be revalidated before CSS use.
- [ ] Enforce foreign-caller rejection and no wildcard DB permissions. Commit `feat: persist theme versions transactionally`.

## B4. Build service orchestration and trial recovery

**Create:** `theme-service/manager.js`, `theme-service/service.js`,
`tests/themes/service.cjs`, `tests/themes/trial.cjs`.
**Modify:** app bootstrap and `launcher/theme-runtime.js` using an edition adapter.
**Consumes:** B2/B3 and A5. **Produces:** service API and durable accepted selection.

- [ ] Write the service dispatch table exactly as specified; validate caller/fields before work and bind transaction IDs to the caller.
- [ ] Persist a trial before exposing theme rules to the renderer. Never equate download completion with user acceptance.
- [ ] Confirm only the current unexpired trial. Cancellation restores previous; unresolved restart uses Classic and leaves a standard recovery action.
- [ ] Apply the 20-second standard confirmation UI; stop the trial when Home is hidden instead of accepting an unseen theme. Returning from another app cannot auto-confirm.
- [ ] Add failure injection for service termination, WebView exit, timeout and repeated confirmation.

```javascript
// Inside the async test, using the store/transport fixtures exercised in B2/B3.
const assert = require('node:assert/strict');
const {createManager} = require('../../theme-service/manager');
async function verifyInterruptedTrial(testStore, transport, clock, candidate) {
  const manager = createManager(testStore, {transport, clock});
  const trial = await manager.beginTrial(candidate);
  const restarted = createManager(testStore, {transport, clock});
  const recovered = await restarted.recoverTrial({});
  assert.equal(recovered.active.themeId, 'builtin:classic');
  assert.equal(recovered.unconfirmed.digest, candidate.digest);
  await assert.rejects(() => restarted.confirmTrial({trialId: trial.trialId}));
}
```

- [ ] Keep software-update healthy receipts tied to the existing rendered-app checks. Theme recovery may reach valid Classic Home; theme state cannot mark a broken grid healthy.
- [ ] Ensure service work stops when no install is active; do not create a persistent scheduled activity. Commit `feat: recover interrupted theme activation`.

## B5. Add direct URL installation to standard Appearance settings

**Modify:** `launcher/theme-panel.js`, `launcher/theme-panel.css`,
`launcher/catalogs.js`, both edition settings adapters and preview bridge.
**Create:** `tests/themes/install-ui.cjs`.

- [ ] Add Installed / Built-in / Add by link sections, source input, validation error, offer preview, progress, cancel, Apply, Revert and Remove unused theme.
- [ ] A collection link shows theme choices before the installation offer;
  a direct descriptor skips the chooser. Download only the selected theme.
  Test multiple themes from one source, independent versions and a changed index
  between selection and install. No bulk auto-install or removal on index change.
- [ ] Show normalized author/source/version and byte size before download. An unlisted personal theme does not require a catalog approval or pretend to be reviewed.
- [ ] Keep focused controls reachable with arrows/OK/Back and pointer. Handle remote keyboard submission and cancellation, very long URLs and return focus after dialogs.
- [ ] Poll status only while the install screen is active or use a bounded service subscription; stop on close/cancel/terminal result. Late responses are keyed by transaction.
- [ ] Add separate wallpaper picker/dimming/accent overrides while keeping the author's default easily restorable.
- [ ] Errors distinguish unsupported API, invalid theme, offline/TLS failure, unavailable source and storage capacity. Do not show technical stack traces as user copy.
- [ ] Extend local preview with deterministic successful/failing service scenarios; verify no real TV/network calls. Commit `feat: install community themes by link on TV`.

## B6. Preserve compatibility through packaging, updates and rollback

**Modify:** `scripts/build-cytv.py`, `root-edition/build.py`, package service metadata,
`scripts/helper_build.py` as needed for shared compilation, package tests,
`tests/system_updates/profile.cjs`, relevant install/remove code only where required.
**Read:** `system-updater/core.py`, `system-updater/device.py`,
`root-edition/updater/profile.py`, `launcher/profile-bootstrap.js`,
`root-edition/ui/root-profile.js`, `docs/TLS-TRUST.md`.

- [ ] Include the app-owned service/policy/CA files explicitly in each Home package. Verify service identities, permissions and code versions in actual IPKs.
- [ ] Test legacy Node 0.12.2 and current Node on transport/store fixtures; test ES5 output rather than only modern source execution.
- [ ] Keep old profile capture output unchanged; add regressions that theme selection does not introduce unknown fields into legacy capture or existing system-supervisor requests.
- [ ] Verify B1's persistence promises in old->new, new->new, failed upgrade and rollback-to-pre-theme-Home cases. A pre-theme Home ignores independent theme state and opens normally.
- [ ] A newer Home reads only supported API versions; incompatible stored theme falls back without data destruction. New-version migration uses a new record, never overwrites the last compatible accepted version.
- [ ] If independent preservation fails, stop the compatibility claim and design an explicit supervisor-capability migration; never patch a frozen supervisor contract implicitly.
- [ ] Define uninstall/data-clear cleanup and reinstall limitations, scoped by service owner. Never recursively remove unrelated DB kinds/files.
- [ ] Commit `build: preserve theme storage across supported app updates` only after evidence supports that wording.

## B7. Acceptance, guides and release reconciliation

**Create:** `docs/THEMES.md`, device matrix in `docs/development/THEME-DEVICE-ACCEPTANCE.md`.
**Modify:** `docs/README.md`, `docs/development/README.md`, all twelve relevant
`docs/i18n/` guides, release inventory and checks when freezing a candidate.

- [ ] Run policy/compiler/service/storage/UI checks, `scripts/test.sh`, staged compatibility and geometry/browser tests.
- [ ] On real TVs, install from an unlisted public repo, disconnect internet, restart Home/TV and use the theme. Test a broken URL, hash mismatch and an unconfirmed trial.
- [ ] Check D-pad/pointer/Inputs/app launch and triple-Home escape. Record standby and cold-boot results separately; theme success cannot imply sound/OTA/routing acceptance.
- [ ] Document supported source links, normal flow, limits, recovery, update behavior and data-removal behavior. Include actual screenshots only with publication consent.
- [ ] Reconcile related issue statuses against remaining work; release notices only after verified package/feed publication.
- [ ] Verify shipping docs describe published capabilities and keep unverified device rows explicit.

## Completion gate

Both editions can install the same independently published theme by TV URL,
validate it, retain it across the tested lifecycle, restore Classic and keep the
existing updater contracts functional. If a device/storage experiment is still
unresolved, report the precise missing evidence instead of declaring this complete.
