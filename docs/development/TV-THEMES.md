# Theme selection, storage and transport (candidate)

Classic and Alpine are packaged in both editions. Classic is the unchanged default until an explicit choice; Alpine uses `builtin:alpine`. Channel remains an external, independently versioned showcase distribution. The historical external Alpine listing is archived; its published immutable bytes are retained.

## Trusted modules

- `theme-data.js`: public GitHub URL/collection resolution; commit pinning; bounded sequential XHR; SHA-256; typed manifest/rule validation; image signature/header/dimension checks and native image decode; Blob handle cleanup.
- `theme-store.js`: app-origin IndexedDB `ctv-themes-v1`, object store `packages`, keyed by descriptor digest. Writes are complete transactions. It bounds installed payload bytes at 24 MiB and eight cached versions, additionally subject to the device's own quota. Download failures do not commit partial packages.
- `theme-manager.js`: `tvhome.theme.choice.v1` accepted pointer plus `tvhome.theme.trial.v1` durable preview/startup marker. Store the marker before applying CSS; Keep commits the accepted pointer; Back/Revert/20-second timeout restores the previously accepted appearance. Incomplete trial/startup on relaunch falls back to Classic without erasing downloaded packages. Binary assets never enter localStorage.
- `theme-panel.js/css`: standard on-TV Themes settings, remote focus/navigation, URL input, explicit collection choice, installation progress/error, version selection/removal and clear-cache recovery. The trial confirmation stays outside the themed surface and leaves the app ribbon visible. Parent Settings are hidden only during the trial and restored afterwards.
- `theme-locales.js`: twelve-language settings labels. Validation/network diagnostics may use English technical messages.
- `builtin-theme-files.json`: explicit Alpine file inventory, mirrored by packaging/preview allowlists. `builtin-themes.json` pins the bundled descriptor digest. Alpine bytes and notices come from the immutable toolkit source/distribution recorded in the initial catalog review; the trusted built-in descriptor has a separate identity.

No new Luna service permissions, updater source allowlist changes, root commands, repository scripts or external CSS execution are involved. Existing emergency Home release, key-up delivery and Home routing remain independent.

## Source behavior

Accept a public `https://github.com/OWNER/REPO` or an exact `https://raw.githubusercontent.com/OWNER/REPO/FULL_COMMIT/.../cytv-theme.json` (or `cytv-themes.json`). A repository URL resolves HEAD through the GitHub commits API, then probes the root collection; a genuine 404 falls back to a root single-theme descriptor. An invalid collection does not fall back. Collection selection is explicit and binds the entry ID/version/digest. Subsequent manifest-relative files stay under the same pinned distribution directory. Credentials, queries, arbitrary hosts, moving raw URLs and traversal are rejected. Redirects are rejected when the browser exposes the final response URL. GitHub rate limits and TLS/CORS failures surface as errors without changing the accepted theme.

Descriptors are at most 64 KiB; rules 128 KiB; image assets at most 2 MiB/1920×1080 each, previews 300 KiB/960×540, total assets 6 MiB. Every named rule/image/license/credits file must match size and SHA-256. Package transfer is sequential with 15-second per-request timeout and a 60-second package deadline. Native decode must complete within eight seconds/image, after bounded header inspection. Unreferenced cached files, unsupported APIs/layout scales, malformed images and incompatible minimum Home versions are rejected. Prepared handles are released on cancellation/rejection/replacement.

Installed versions do not follow a branch or contact the author on startup. To update, install the newer descriptor, preview and confirm it, then remove the old inactive version. Removing an active version requires switching first. Clear downloaded themes restores Classic and empties only the theme cache.

## Profiles and updates

Theme state is separate from legacy `HomeData`/Root profile and updater contracts. Ordinary app-origin storage survives a normal relaunch; browser tests cover that path. Existing profile backup/export does not include the binary theme library. An authoritative profile restore clears the accepted pointer/trial and starts Classic, while leaving downloaded versions available for reselection. Package/application removal may clear its app-origin data. No independent profile/OTA schema is silently extended.

## Verification and remaining hardware gate

`tests/themes/transport.cjs` checks SHA-256/UTF-8 vectors, URL boundaries and real Channel payload integrity. `tests/themes/selection-ui.cjs` runs both real renderer editions against app-owned IndexedDB and simulated pinned transport: built-ins, external installation, user columns, offline reload, cancellation, timeout, interrupted trial, bad hash rejection, storage ceiling and removal. Existing isolation/geometry/legacy-input suites remain required. Package and compatibility tests must include the new files in both editions.

Browser verification does not establish TV-origin IndexedDB availability/quota/persistence, platform TLS/CORS, actual remote/IME input, standby/cold boot, updater rollback or device compatibility. Before public release record device model, firmware/webOS, remote, edition, exact package versions, installation platform, actual expected/observed results and untested cases. No device was changed or verified by the browser tests. The current release candidate remains untouched; this feature belongs to the following preparation branch.

## Candidate browser acceptance record (2026-10-29)

Passed: `scripts/test.sh tv preview`, `npm run test:themes:browser`, geometry, legacy UI, Chromium 38/ES5 compatibility, twelve-language catalog checks and scoped lifecycle/transport tests. Subsequent review fixes were verified with focused unit/browser regressions.

An isolated desktop Chrome run also resolved, downloaded, hash-verified, decoded, previewed and accepted Channel 1.3.2 directly from its public GitHub raw commit URL without a transport mock. This verifies that desktop CORS/transport path, not TV TLS support. No credentials or device addresses were used.

Independent review reproduced and fixed stale asynchronous rollback overwriting a newer reset/preview, schema-valid collection paths being rejected and prerelease version comparison. Regressions also cover preparing cancellation, confirmation-save failure and blocked interaction behind the trial confirmation.

Browser captures: [standard Themes settings](theme-tv-review/settings.png) and [Alpine trial](theme-tv-review/alpine-trial.png); [snapshot provenance](theme-tv-review/provenance.json). Model, firmware/webOS, actual remote, installer platform and device tests remain unknown/not tested. Hardware installation, routing, sound, standby, cold boot, OTA and rollback have not been verified here. These artifacts do not authorize a public release or merge into the frozen candidate.
