# CSS-only Itachi local package checks — 2026-10-29

The user requested an installable dark Itachi theme, bright red clearly readable
Sharingan eyes and larger white app logos. They explicitly excluded standalone
replacement-logo sets: themes must style existing native icons using CSS.

## Result

[Source and installation instructions](../../themes/itachi/README.md). The theme
contains only its wallpaper and preview as image assets. There is no app-ID/logo
mapping, replacement PNG collection, image-source rewrite or canvas conversion
in the theme. Filters, blend isolation, background contrast, decorative scaling,
clock/date sizes and borderless focus are authored in CSS. The renderer retains
bounded scales/cells and a visible selected caption.

Normal fresh inventory acquisition prefers available larger resources supplied
by the same TV application. Missing, rejected, oversized, empty/corrupt and
malformed metadata fall back within existing address/path/byte limits. AppLibrary
can accept a fresh embedded native icon without replacing it with stale cached
bytes; raw-URL/incomplete metadata preserves the existing embedded original.
This is independent of theme application and changes no app identity or launch ID.

The generated wallpaper was refined with built-in imagegen: vivid scarlet irises
and crisp black three-tomoe Sharingan, with the original dark composition retained.
Netflix detail remains limited by the original native resource; CSS cannot create
missing resolution. Complex artwork may lose details under contrast filtering.

## Local evidence

- Typed CSS/compiler/runtime regressions reject out-of-scope properties, unsafe
  values, unsupported browsers and unsafe scale/layout combinations before mutation.
- Actual Root and No-root renderer checks verify unchanged icon `src`/native
  dimensions during theme selection, enlarged paint, offline cache restore,
  Settings suspension and Classic reset. The test uses real staged app metadata,
  including Root's independent package version, rather than forcing both editions
  to a shared app version.
- Root packaging keeps its own version while embedding the shared renderer version
  for theme minimum-version checks. Ordinary Home uses its own manifest version.
- Full local `scripts/test.sh` passed using the project's Python environment.
  Theme browser, geometry and legacy UI suites passed. Focused follow-up checks
  cover native icon fallbacks, the independent Root renderer version, eight Root
  build cases, theme lifecycle and Chromium 38 source compatibility.
- The exact distribution passed the TV data verifier, file-hash checks, local LAN
  transfer, wrong-PIN/foreign-origin rejection and ZIP CRC verification. Both Home
  IPKs were inspected for the CSS capability and matching shared renderer version.
- Independent review found two defects during preparation (stale glyph sizing in
  an abandoned replacement approach, and invalid preferred native files preventing
  fallback). The replacement approach was removed; native fallback was corrected
  and regression-tested. No actionable issues remained in the final reviews.

Artifacts, SHA-256 sums and BUILD-INFO.json are in the ignored local
`build/itachi-delivery/` directory. Their manifests pin the actual source commit
and hashed runtime snapshot; they are local candidates, not published releases.
Untracked local research files are excluded from the explicit runtime export.

## Limits

The ordinary Chromium 38 build still passes, but this optional icon effect requires
modern CSS filter/screen/isolation support. An older browser/Home rejects it safely.
Root and No-root browser verification is not physical-TV acceptance.

TV model, firmware/webOS and actual remote: unknown/not tested. Installer platform:
macOS source build. No physical installation, Home routing, sound, standby, cold
boot, OTA or rollback test was performed, and no TV configuration was changed.
No result was published to GitHub, no theme catalog entry was submitted and no
software release was announced.
