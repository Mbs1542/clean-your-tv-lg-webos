# Theme ecosystem design

Status: planning only. Product decisions were clarified with the maintainer on
2026-10-28. No theme engine, repository, catalog, deployment or voting service was
created by this planning task. Hardware-dependent feasibility gates below are
requirements, not verified capabilities.

Baseline inspected: `eeb4b8b0319b34503b233a3e1bff07e1460273d1` in the maintained
checkout. Re-read the current source before implementation; do not reset or switch
another task's branch to this baseline.

## 1. Confirmed product decisions

1. Ship several built-in themes and support installing a community theme by URL
   directly on the TV. Desktop installation is not a prerequisite for this flow.
2. Authors write their own CSS. Provide a documented, versioned styling surface,
   compatibility checks and a template rather than asking authors to edit app code.
3. Theme Home, the application list/library and the Inputs picker. Keep Settings,
   installation, confirmations, recovery and software-update screens standard.
4. Create a separate public repository named `clean-your-tv-lg-theme` for author
   tools, examples and documentation. Publishing an npm package is not required.
5. Put showcase sources and the community registry in the main
   `clean-your-tv-lg-webos` repository.
6. Accept showcase submissions through GitHub pull requests, automated validation
   and maintainer approval. Private use of a public theme URL needs no showcase PR.
7. Defer voting to a subsequent release. The first showcase has no vote backend,
   fake counts, simulated likes or nonfunctional reaction buttons.
8. When introduced, voting is anonymous: applause is positive; shrug is neutral
   and does not subtract from applause. A visitor can change their reaction.
9. Popularity nominates themes for inclusion. Maintainers check quality, licenses,
   package size and real-TV behavior before bundling a specific version.

## 2. Recommended initial boundaries

These are engineering defaults to review with this design, not additional claims
of user approval or existing platform capabilities:

- Initial external sources: public GitHub repositories, commit-pinned raw files
  and release assets. Any author's public repository is eligible. Private
  repositories, credentials, arbitrary web hosts and URL shorteners are excluded
  from the first transport implementation.
- A repository root URL resolves `cytv-themes.json` when present, otherwise the
  existing single-theme `cytv-theme.json` descriptor. A collection lists themes
  for explicit selection on TV; an explicit descriptor URL selects one directly.
  A moving branch is resolved once to an exact commit; installed assets never
  follow a branch live. An invalid collection is an error, not a silent fallback.
- Source format: `theme.json`, `theme.css`, images and license/credit files.
  Distribution format: a versioned descriptor, typed style rules and individually
  hashed assets. Avoid archive extraction in the first TV installer.
- Static JPEG/PNG/WebP images; no HTML, JavaScript, plugins, remote CSS imports,
  remote fonts, videos, executable assets or install scripts in theme packages.
- Authors can select packaged static fonts and localized fallbacks. Uploading
  arbitrary fonts is an extension after font validation and fallback testing.
- Preserve 1920x1080 rendering, ES5/Chromium 38 compatibility and current 1–8-column
  navigation. This is a build target, not universal TV compatibility evidence.
- Ship Classic, OLED Black, Aurora and Gallery initially. Include a small set of
  original or redistribution-permitted wallpapers with explicit credits.
- Theme choice, wallpaper choice and user overrides are independent. Applying a
  theme does not replace app IDs, hidden apps, inputs, ordering or Home routing.
- Authors choose a default `layout.columns` from 1–8. Shared on-TV Columns
  settings allow an explicit user override or By theme. Precedence is user choice,
  then the active theme's default, then Classic's 5. Changing themes must not erase
  a user override. Legacy profiles preserve their effective count; theme/default
  mode preservation across authoritative backup restore requires the theme-state
  storage contract rather than extending an old supervisor schema implicitly.

## 3. Repository evidence and consequences

| Existing source | Finding | Consequence |
| --- | --- | --- |
| `launcher/app.js` | Grid dimensions, focus enlargement, scroll and hit-testing share calculated geometry; recent fix covers 1–8 columns | Preserve one geometry calculation; arbitrary CSS must not silently disagree with navigation |
| `launcher/style.css` | 377 lines; visual values and structural rules are mixed | Separate structural CSS, default appearance and documented author hooks |
| `launcher/renewal-panel.css`, `launcher/i18n.css`, `root-edition/ui/root-settings.css` | Settings/dialog styles exist in separate sheets with some broad selectors | Audit scope and stacking; keep trusted screens visually independent |
| `scripts/compile-tv-web.cjs` | PostCSS/Babel compatibility transform and strict emitted-CSS checks | Extend the existing compiler; do not introduce a second TV target or assume runtime CSS variables |
| `scripts/preview.py`, `preview/bridge.js` | Real launcher with synthetic inventory and no-TV service stubs; static export exists | Reuse this runtime for local theme preview and generated screenshots |
| `root-edition/preview.py` | Explicit resource allowlists and HTML replacement when staging Root | Add every new resource deliberately to both editions and verify parity |
| `launcher/user-data.js`, `root-edition/ui/root-profile-data.js` | Strict settings fields; 4 MiB profile limit | Image bytes do not belong in existing profile/localStorage snapshots |
| `system-updater/core.py`, `tests/system_updates/profile.cjs` | Independently installed supervisors and pinned legacy paths validate profiles | Do not send new fields to old update contracts; theme state initially lives independently |
| `updater-service/transport.js` | Downloader trusts only the main project's release paths | Do not broaden software-update trust to arbitrary theme repositories |
| `.github/workflows/preview-pages.yml` | One Pages artifact is deployed from main | Add showcase to that artifact; a second deployment must not overwrite the preview |
| `scripts/ci-scope.py` | Existing scopes: tv, installer, android, setup, preview | Add explicit theme/catalog path coverage and avoid silently skipping checks |

## 4. System boundaries and ownership

### Main repository

- Own the theme API specification, pure shared runtime policy, CSS compiler,
  reference renderer, TV theme manager, bundled themes, showcase registry and site.
- Export a versioned author-runtime artifact containing the schema/policy,
  compiler and actual compiled preview UI. Use a fixed source revision and hashes.
- Store community registry records, reviewed previews and credits, not every
  author's source repository or their private TV screenshots.
- Keep software-signing keys and release-updater trust separate from theme data.

### `clean-your-tv-lg-theme` repository

- Own the onboarding README, template, examples, CLI wrapper and author workflow.
- Pin the main repository's author-runtime release in `runtime.lock.json`.
- Share the same policy and reference UI bytes instead of maintaining copied forks
  of the launcher or divergent validators.
- Provide commands for init, validate, preview, screenshots, build and submission
  record creation. These run on the author's computer, not on the TV.

### Author repository

- Own original CSS/images and their licenses; publish a descriptor and hashed
  distribution assets at a commit or release.
- Support one or several themes per repository. Each theme has its own slug,
  version, source folder, built descriptor, previews and license/credits. A
  collection is a discovery index, not an all-or-nothing installation bundle.
- Keep theme identity stable across updates. A new version is a new immutable
  manifest digest. A tag is a convenient address, not proof that bytes cannot change.
- Follow showcase submission requirements only when requesting public listing.

## 5. CSS design and actual safety boundary

Custom CSS has real value and real limits. Syntax checks and selector prefixes
alone do not make arbitrary CSS safe or preserve remote navigation.

### Authoring contract

Provide stable classes such as `.ctv-home`, `.ctv-header`, `.ctv-clock`,
`.ctv-dock`, `.ctv-card`, `.ctv-icon`, `.ctv-label`, `.ctv-library`,
`.ctv-input-row`, and state classes `.is-focused`, `.is-selected`, `.is-moving`.
The complete allowed selector grammar and properties are versioned alongside the
schema. Internal element IDs and current DOM nesting are not a public contract.

Authors write ordinary CSS for colors, gradients, borders, radii, limited shadows,
text styles, named packaged fonts and supported transitions. Author-time custom
properties are resolved by the compiler into literal values. Native runtime
custom-property support is not required on Chromium 38.

Geometry is declared through bounded layout settings in `theme.json`: columns,
card aspect preset, dock placement preset, spacing scale, text scale and focus
scale. The engine produces all positions, card bounds, hit areas and focus frames
from one result. New layout presets need an engine release and navigation tests.
Document clearly that custom CSS does not mean arbitrary DOM replacement or
unrestricted positioning of focusable elements.

### CSS pipeline

`theme.css -> PostCSS AST -> compatibility transform -> policy validation -> typed
rule bundle -> TV revalidation -> trusted serializer -> ordinary scoped CSS`.

The TV accepts the typed rule bundle, not unchecked CSS text or a claim that an
author ran the compiler. Selectors are arrays of approved part/state tokens;
values are validated color/length/gradient/shadow/etc. nodes. No raw-value escape
hatch. The trusted serializer only emits syntax from these validated nodes.

Reject global selectors, sibling escape, arbitrary attribute selectors, unknown
pseudo-classes, `@import`, unlisted `url()`, fixed-position overlays, arbitrary
z-index, hiding focusable elements, `pointer-events` overrides, `!important`,
unbounded filters, infinite animations and unsupported browser features.
Image references resolve to verified local asset handles, never network URLs in
the installed stylesheet. Limit rule count, nesting, shadows and transition time.

Keep structural elements outside author-controlled transform/size rules. Style
the visual children, and reserve the navigation/focus layer to the engine. Theme
focus colors are allowed but an engine-owned visible ring remains available.

### Standard Settings and recovery

- Place themed content inside a bounded stacking context; trusted dialogs sit
  outside it. Scope all emitted rules to the theme surface.
- Suspend the theme sheet/effects before opening Settings or confirmations and
  resume the accepted theme when returning to Home. Both edition entry points
  use one trusted hook. Menus retain their established standard appearance.
- Apply a new theme as a trial with a standard confirmation panel and a proposed
  20-second countdown. Cancel, Back or timeout restores the previous theme.
- Persist the trial marker before applying CSS. If the UI exits/crashes before
  confirmation, the next boot starts in Classic and offers recovery. A JS timer
  cannot rescue a hung renderer; bounded CSS and next-start fallback address that
  distinct failure. Existing triple-Home emergency release remains authoritative.
- Theme failure must not be reported as launcher/update failure if a usable
  Classic Home can render. Conversely, a theme must never counterfeit update health.

## 6. Format, identity and limits

Version these independently: `schemaVersion`, `themeApiVersion`, author
`themeVersion` and application version. Initial API is `1`; incompatible major
APIs are rejected before installing. Compatible optional fields have explicit
defaults. Unknown required capabilities are rejected, not silently ignored.

Identity consists of a normalized source repository plus a theme slug. Keep
display name separate. Registry identity verification checks the author's control
of the referenced source; a random descriptor cannot impersonate a listed theme.

Canonical IDs are `builtin:classic` for original bundled examples and
`github:owner/repository:theme-slug` for external sources, normalized to lowercase.
A promoted community theme keeps its external ID. Manifest `id` maps to stored
reference `themeId`; `themeVersion` is used consistently for the author's version.

The distribution contract uses these exact top-level fields:

```typescript
type ThemeManifest = {
  schemaVersion: 1;
  themeApiVersion: 1;
  id: string;
  title: string;
  description: string;
  author: { name: string; url: string };
  themeVersion: string;
  source: { repository: string; commit: string };
  requires: { minimumHomeVersion: string; capabilities: string[] };
  layout: {
    preset: 'dock-grid' | 'icon-grid' | 'side-grid' | 'channel-list';
    columns: number; spacingScale: number;
    textScale: number; focusScale: number;
  };
  defaults: { wallpaperAssetId: string | null; dim: number; accent: string };
  rules: { path: string; size: number; sha256: string };
  assets: { id: string; path: string; mediaType: string;
    size: number; sha256: string; width: number; height: number }[];
  documents: { path: string; size: number; sha256: string }[];
  previewAssetId: string;
  license: { identifier: string; textPath: string; creditsPath: string };
};
```

The author source file omits generated hashes, source commit, required application
version and output paths; the trusted build fills these from committed sources
and the pinned runtime. Built-in original sources use the main repository origin.
License text/credits are listed and hashed in the descriptor's separate bounded
`documents` array (`path`, `size`, `sha256`); maximum 32 KiB per document and two
documents. They are not misrepresented as image assets.

Initial numeric ranges: columns 1–8, spacingScale 0.8–1.2, textScale 0.9–1.25,
focusScale 1.05–1.15, dim 0–0.85. These bounds still require combined geometry and
contrast checks. The engine's exact Classic defaults remain the baseline. Following the maintainer's
visual review, the candidate supports four trusted compositions: the original
low shelf, a square icon grid, a fixed clock/menu sidebar with a grid, and a
numbered channel-style list. Authors choose a preset; external CSS cannot
reposition hit areas. Every preset retains the user's 1–8 column override.
Spacing/text/focus scales remain fixed at Classic values in this candidate.

Distribution descriptor fields:

- schema/API version, stable identity, title, author, description and theme version;
- exact source commit or release reference, minimum Home version and capabilities;
- style bundle and asset list with relative names, media types, byte lengths and
  SHA-256 values; bundled preview; layout defaults and wallpaper defaults;
- license identifier, asset credits and license-file references.

SHA-256 detects byte mismatch; it does not establish the trustworthiness of a
self-published author. Showcase review and built-in release verification are
separate trust decisions.

Proposed initial ceilings, adjusted only through a documented API/policy change:

| Item | Limit |
| --- | --- |
| Descriptor | 64 KiB UTF-8 |
| Typed style bundle | 128 KiB, 512 rules, 4096 declarations |
| Asset count | 16 |
| Single wallpaper | 1920x1080 maximum decoded dimensions; 2 MiB encoded |
| Preview | 960x540 maximum; 300 KiB encoded |
| Total theme assets | 6 MiB encoded |
| Installed-theme storage | 24 MiB serialized application ceiling, subject to lower device quota |
| Asset bridge chunks | 32 KiB binary before base64 encoding |
| Concurrent asset downloads | 1 |
| Redirects | At most 3, each target validated |
| Network request timeout | 15 seconds idle, 60 seconds total |

Limit encoded bytes AND decoded dimensions before activation; inspect actual
image headers and require successful bounded decode. Extension or MIME alone is
insufficient. Reject traversal, absolute paths, symlinks, duplicate normalized
names, unexpected files, non-finite numbers and oversized strings. Developer
examples use synthetic/public assets, never a user's inventory or screenshot.

## 7. TV installation, storage and lifecycle

### User flow

Settings -> Appearance -> Installed themes / Built-in themes / Add by link.
The standard URL field supports remote keyboard and ordinary paste when available.
Accept public repo root or explicit descriptor URL; show a useful example.

Resolve -> show author/version/preview/size/source -> user chooses Install ->
download and verify -> stage -> preview trial -> Keep or Revert. Progress is
cancellable; a failed transfer never replaces the accepted theme. Installation
alone does not activate without the user's Apply action/trial confirmation.

In showcase, each theme has Copy TV link and its exact version. A short catalog
code can be added later; long URLs are usable in v1 and no phone pairing service is
required. An on-TV browseable catalog is an independent enhancement, not required
to satisfy direct URL installation.

### Primary storage candidate and mandatory experiment

Use a small Home-owned theme service per edition, sharing its implementation:
`com.gathin.tvhome.themes` and `com.cleanyourtv.root.preview.themes`. It verifies
its caller and performs bounded HTTPS work. Do not route theme URLs through the
privileged software updater or attach theme work to Home interception.

The preferred common persistence candidate is private DB8 records owned by the
theme service: metadata, content-addressed asset chunks and an atomic active-theme
pointer. DB8 is documented for persistent JSON. Quota, binary-as-base64 overhead,
service ownership, update/reinstall behavior and speed must be measured on actual
Root and No-root installations before this storage design is accepted.

Do not substitute browser cache/IndexedDB as a persistence guarantee. If DB8 fails
the experiment, evaluate an app-owned service file store with explicit permission,
update and rollback preservation tests. Do not silently fall back to privileged
file access. Revise this storage section before dependent implementation tasks;
built-in themes and author tooling can proceed independently.

Installation stages content by digest, verifies all records, then commits only
the installed-manifest pointer. Active and previous versions remain pinned until
a successful trial. Garbage collection only removes unreferenced complete data
or abandoned staging records; it never evicts active/previous themes to make room.
Quota failures ask the user to remove an unused theme.

Read only the selected image into the WebView. Release image handles on replace
or suspend; stop theme effects when hidden. Startup shows the saved theme if local
reads are ready within the bounded startup budget, otherwise Classic immediately.
No startup network dependency. Theme updates require an explicit check/install;
there is no background poller in the first release.

### Profile and app-update compatibility

Keep existing profile schema 1 unchanged initially. Store theme selection,
overrides and assets independently, namespaced by edition and theme API. Verify
that app replacement and compatible rollback preserve that store.

An older Home without theme support uses its built-in appearance. A newer Home
that cannot read the stored theme API falls back to Classic without destroying
the store. Reinstall/uninstall/data-clear behavior is documented separately.

If durable preservation cannot be demonstrated independently, add an explicit
capability-negotiated theme backup extension to a newly provisioned supervisor.
Do not add fields to old supervisor requests or assume updating Home changes an
immutable supervisor. This is a release gate, not an optional follow-up.

## 8. Author workflow

The new toolkit repo contains `template/`, `examples/`, `bin/`, `docs/`,
`runtime.lock.json`, `package.json`, a lockfile and trusted CI workflows.

Author clarification: documentation explaining how to launch and open preview is
sufficient. Do not add a desktop application, embedded CSS editor or visual theme
studio to the initial scope. Authors edit CSS in their preferred editor and the
browser preview reloads after a successful save/validation.

For multiple themes use `themes/<slug>/{theme.json,theme.css,assets/}` and build
each into its own distribution directory. The root `cytv-themes.json` discovery
index has a versioned schema and lists stable identities, titles, versions and
descriptor references with SHA-256 digests. It contains no executable code.
Entries are bounded, unique and restricted to the same source repository;
relative references resolve from the pinned index location. Reject recursive
indexes and unsupported versions. An index may discover a version but never
authorize an unverified installation. Only the selected theme is downloaded.
Each theme updates and is reviewed independently; adding/removing a collection
entry does not install/remove anything on a user's TV. Showcase records, later
votes and built-in promotion belong to each theme, not to the repository.

Suggested public commands (contracts to implement, not commands available today):

1. `npm ci --ignore-scripts --no-audit --no-fund`
2. `npm run theme -- init ../my-theme --name "Forest"`
3. `npm run theme -- preview ../my-theme --edition no-root`
4. `npm run theme -- validate ../my-theme`
5. `npm run theme -- screenshots ../my-theme`
6. `npm run theme -- build ../my-theme --out ../my-theme/dist`
7. `npm run theme -- submission ../my-theme/dist --source SOURCE_URL`

For a collection, pass a specific source folder, for example
`npm run theme -- preview ../my-themes/themes/forest --edition no-root`.
The quick start must explain prerequisites and the exact working directory,
runtime preparation, the actual localhost URL printed by the command, opening
that URL in a browser, keeping the terminal running, editing/saving CSS, switching
to another theme folder, stopping with Ctrl+C and resolving startup/port errors.
Do not assume any example command is available before toolkit implementation.

Preview must render the real pinned launcher with mock apps and controls for
remote navigation, pointer, language, column count and standard Settings. Include
light/dark image fixtures, long labels, missing icons and an empty app list.
Screenshots declare browser simulation and renderer version; never label them
real-TV evidence. The build produces reproducible distribution files and a
human-readable validation report. It never executes code from a theme directory.

Document: quick start, CSS part reference, every allowed property/value, layout
presets, wallpaper preparation, licenses, API compatibility, local preview, TV URL
installation, troubleshooting, updates, showcase submission and promotion criteria.
The maintainer repository exports the runtime; toolkit updates its lock through a
reviewable PR and verifies hashes. Theme authors do not clone the whole main repo.

## 9. Showcase and review

Source location in main repo: `showcase/`; public route: `/themes/` under the
existing repository Pages base path. Existing preview URLs continue to work.
One combined build produces the current preview plus showcase and catalog JSON.

A card shows title, author, reviewed screenshot, short description, compatibility,
license, version, source and Copy TV link. Filters: built-in/community, style,
API compatibility. Sorting in v1: recently added, recently updated and curated.
There is no Most liked sort until real voting exists. Detail pages explain
installation and distinguish "previewed in browser" from specific device evidence.

PR submissions add a small record under `showcase/registry/`; no arbitrary HTML,
Markdown rendering or theme build scripts. Validate identity, pinned URLs, size,
digests, CSS policy and licenses. Generate previews from the main project's trusted
renderer; keep reviewed image/credit artifacts in the registry or deployment
artifact so image content cannot change invisibly after approval.

Use unprivileged PR jobs without publishing secrets. Do not install dependencies
or execute workflows from the author's repo. Downloads are data; renderer network
access is denied during screenshot capture. Maintainers approve the exact digest.
New community versions require a new reviewed registry PR. Old reviewed versions
remain installable while their source is available; broken sources are shown as
unavailable instead of being silently replaced by unreviewed bytes.

Follow the existing branch rule: registry PRs target `release/next`; `main` accepts
final release PRs. Therefore v1 catalog publication follows normal main publication.
If faster independent catalog updates become necessary, propose and document a
dedicated catalog branch/release policy before changing it. Do not sneak ordinary
feature or catalog PRs directly into main.

## 10. Future voting and built-in promotion

Voting is a separate deployable stage after the static showcase. GitHub Pages
alone cannot own mutable shared vote counts; introduce a small authenticated-to-
itself server API and durable database then. Anonymous means no visitor account,
not a promise to identify one human reliably.

Model one current reaction per theme and anonymous browser credential: clap,
shrug or none. Switching is an atomic replacement; repeat requests are idempotent.
Both counters are visible; shrug has zero negative weight. Counts become public
only after backend confirmation. Clearing browser storage or changing browser
can bypass this identity, which must be stated honestly.

Rate limits, short-lived network abuse signals and optional server-verified
challenge reduce abuse; avoid persistent fingerprinting and publishing IPs.
Keep votes keyed to stable theme identity and record the version voted on. A
major redesign must not be presented as if old votes evaluated its new appearance.
Before launch, fix retention, deletion and rating-version rules in that stage's
design. The future plan gives concrete proposed defaults, not a provisioned vendor.

Most-clapped themes become review candidates. Include only a pinned version with
redistribution rights, English/Russian/CJK checks, D-pad/pointer acceptance,
performance evidence and a package-size budget. Take a dated vote snapshot for the
decision; suspicious votes can be excluded with a documented reason. Never let a
live counter change signed TV packages automatically.

Bundled promotion retains author attribution and original source/version. An
installed community copy and the built-in copy share identity; replacing one
does not silently change the user's accepted version. Classic is permanently
available. Before voting exists, initial themes are maintained examples, not
claimed community winners.

## 11. Delivery order and acceptance

1. Preserve current visuals and navigation while reorganizing CSS.
2. Define the author API/compiler and ship local built-in selection.
3. Prove on-TV transport/persistence in both editions, then build external install.
4. Ship toolkit and end-to-end author documentation against a pinned runtime.
5. Publish static showcase and reviewed submission pipeline.
6. Deliver voting and popularity-based promotion as a later independent milestone.

Detailed workstreams:

- [A: CSS and theme runtime](../plans/2026-10-28-themes-a-runtime.md)
- [B: TV installation and persistence](../plans/2026-10-28-themes-b-tv-installation.md)
- [C: Author toolkit](../plans/2026-10-28-themes-c-toolkit.md)
- [D: Showcase and later voting](../plans/2026-10-28-themes-d-showcase.md)

Dependencies: A1–A4 precede A5–A7; B1 can start once the probe/package design is
ready and must pass before B3/B6. B2 needs A3; B4 needs B2/B3/A5; B5 needs B4/A6.
C1 needs A7, C2–C4 follow the locked API, C5 needs B5 and D1. D1–D2 need A3/A4;
D3–D4 need the approved registry; D5 needs working TV evidence. This permits
independent work without making delegation or a new worktree mandatory.

The minimum complete community-theme release allows an author to create and
preview a theme, publish it in their own repo, install it on a TV by URL, retain it
offline/restart/update, submit it to showcase and restore Classic if it fails.
Do not describe that release as complete while either edition lacks required
acceptance. A static showcase may be published earlier with clear compatibility
and unreleased-feature labels.

## 12. Validation and evidence

- Compiler/validator adversarial fixtures: escaping, path traversal, hidden URLs,
  unsupported CSS, excessive rules, malformed images, API mismatch, foreign keys.
- Real-renderer visual and geometry checks: 1–8 columns, every theme, focus/moving,
  Inputs/library/Settings, long labels, all twelve locales, image brightness extremes.
- Service fault tests: interrupted writes, bad hashes, quota, caller rejection,
  TLS/DNS failure, redirect abuse, duplicate install, stale cancellation, restart.
- Hardware matrix: oldest available webOS 3.x/4.x and a modern TV; Root and No-root;
  remote and pointer; ordinary restart, standby/wake and cold boot separately.
- Update matrix: old-to-new, new-to-new, compatible rollback, rollback to pre-theme
  Home, failed update, app reinstall and explicit removal. Record retained/lost
  data and actual supervisor versions.
- Acceptance targets: no network request before first usable Home; no additional
  always-running daemon; no decoded full-resolution gallery in memory; navigation
  remains responsive. Set measured latency/memory budgets from the baseline
  experiment rather than claiming a universal FPS or timing number.

Run the repository's prescribed `npm ci` and checks at implementation time; this
documentation-only task does not claim a tested implementation. Update twelve
localized user guides when controls ship. Maintain related issue labels during
implementation/release and follow consent rules for publishing device reports.

## 13. Primary references checked 2026-10-28

- [LG web engines and cache behavior](https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine): engine target alone does not prove platform storage behavior.
- [LG DB8 API](https://webostv.developer.lge.com/develop/references/database): persistent JSON candidate with ownership and quota errors; test actual storage limits.
- [LG JS services](https://webostv.developer.lge.com/develop/guides/js-service-usage): app-prefixed services and packaging.
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site): custom build artifact and static hosting.
- [GitHub Actions security](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target): untrusted theme submissions must not run with publishing privileges.
- [CSP style-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src): additional protection where supported; not a replacement for the theme policy.

## 14. Planning estimate

Planning range for one experienced engineer, including review and automated tests:
CSS/API/runtime 7–12 working days; transport/storage/TV flow 7–12; toolkit 4–7;
static showcase 4–6; integrated hardware/release acceptance 4–8. Total 26–45
engineering days with sequential work. Hardware access, failed feasibility gates
and review queues can extend elapsed time. Future voting: another 4–7 days after
hosting/privacy decisions. These are estimates, not a release commitment.

## 15. Requirement traceability

| Confirmed requirement | Delivery tasks |
| --- | --- |
| Maintainable CSS and author-owned styles | A1–A5, C2–C4 |
| Several built-in themes | A6–A7 |
| Add a theme by its own repository URL on TV | B1–B7, C4–C5 |
| Only Home/library/Inputs themed; Settings standard | A2, A5–A6, B4–B5 |
| Separate `clean-your-tv-lg-theme` tools repo | C1–C6 |
| Complete creation/preview/showcase/TV-selection instructions | C2–C5, B7 |
| Showcase in main repo | D1–D4 |
| PR checks and approval | D1–D2, C5 |
| Voting deferred | D3–D4 static gate, V1–V3 future milestone |
| Anonymous reactions and neutral shrug | V1–V2 |
| Popular themes become reviewed built-ins | D5, V3 |

Implementation should begin with A1/A2 and the B1 feasibility investigation.
Do not defer the No-root persistence question until after publishing the author
format and promising offline community themes.
