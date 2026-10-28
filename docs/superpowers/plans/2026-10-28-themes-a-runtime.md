# Themes A: CSS and Runtime Implementation Plan

> **For agentic workers:** Use `executing-plans` to implement this plan task by task. Use `subagent-driven-development` only if parallel delegation is explicitly authorized for execution. Steps use checkbox syntax for tracking. Do not implement while the user is only reviewing the plan.

**Goal:** Make the existing TV UI maintainable for theme authors, implement a safe custom-CSS contract, and deliver selectable built-in themes.

**Architecture:** Preserve the existing DOM/navigation engine and expose stable visual parts. Compile author CSS on the host into typed rules; validate and serialize those rules on the TV. Keep trusted Settings and recovery outside the theme boundary.

**Tech Stack:** Existing classic JavaScript/UMD, PostCSS, Python packaging, Playwright; emitted ES5 and Chromium 38 CSS. Reuse the installed build dependencies.

**Spec:** [Theme ecosystem design](../specs/2026-10-28-theme-ecosystem-design.md).

## Global constraints

- Static 1920x1080 rendering; 1–8 columns; ES5/Chromium 38 compatibility.
- Theme Home, application list/library and Inputs only. Standard Settings and recovery.
- Author CSS is supported through a documented validated subset, with geometry controlled by the manifest/engine.
- No external JavaScript, runtime network CSS/fonts or changes to Home routing.
- Existing profile schema 1 and old updater contracts remain valid.
- Main-repository feature PRs target `release/next`; release PRs alone target `main`.
- Technical docs in English; all twelve localized user guides updated when controls ship.

## File and interface map

| Source | Responsibility |
| --- | --- |
| `launcher/style.css` | Trusted base, geometry, stacking and interaction structure |
| `launcher/theme-defaults.css` (new) | Classic visual defaults separated from structure |
| `launcher/theme-policy.js` (new) | Canonical UMD manifest/rule policy, validation and safe CSS serializer; imported by host tools and TV |
| `launcher/theme-runtime.js` (new) | Apply/suspend/reset appearance and coordinate existing UI geometry |
| `launcher/theme-panel.js`, `launcher/theme-panel.css` (new) | Standard theme-selection UI, shared by both editions |
| `theme-api/compile.cjs` (new) | Host CSS parser/compatibility compiler into typed rules |
| `theme-api/contract.json` (generated export) | Documented API metadata derived from canonical policy |
| `themes/builtin/` (new) | Four theme sources and licensed assets |
| `scripts/build-themes.cjs`, `scripts/export-theme-runtime.py` (new) | Build built-ins and reproducible author-runtime export |
| `tests/themes/` (new) | Policy, compiler, renderer, lifecycle and package checks |

Core signatures to implement and keep consistent across workstreams:

```javascript
// theme-policy.js: UMD global ThemePolicy and CommonJS exports
validateManifest(raw);               // -> normalized Manifest or ThemeError
validateRules(raw);                  // -> normalized RuleBundle or ThemeError
compileRules(bundle, assetHandles);  // -> CSS string; all values serialized here
// theme-api/compile.cjs: CommonJS
compileSource({manifest, css, assets}); // -> {manifest, rules, assets, report}
// theme-runtime.js: browser global ThemeRuntime
apply({manifest, rules, assetHandles, overrides}); // -> {themeId, themeVersion}
suspend();                          // -> previous appearance retained in memory
resume();                           // -> restore accepted appearance
reset();                            // -> Classic, no theme sheet/asset handles
```

`ThemeError` contains `code`, `field` and a safe human-readable `message` prefixed
with the stable code so diagnostics/tests can identify it; never
raw network responses, private paths or device details. Define error codes once:
`manifest-invalid`, `api-unsupported`, `css-selector`, `css-property`, `css-value`,
`css-budget`, `asset-invalid`, `layout-invalid`. Transport/store add their own codes
in plan B without changing these names.

## A1. Capture baseline and public styling surface

**Modify:** `launcher/index.html`, `launcher/app.js`, `launcher/style.css`,
`launcher/i18n.css`, `launcher/renewal-panel.css`, `root-edition/ui/root-settings.css`.
**Create:** `docs/development/THEME-CSS.md`, `tests/themes/baseline.cjs`.
**Existing tests:** `tests/launcher-geometry.cjs`, `tests/legacy-launcher.cjs`.

- [ ] Run `npm ci --ignore-scripts --no-audit --no-fund` and capture the actual current renderer with synthetic inventories before editing.
- [ ] Inventory every CSS selector, inline geometry/color assignment, z-index, themeable surface, dialog and font reference. Include states reached through both edition-specific settings entry points.
- [ ] Record baseline screenshots/geometry for dock, scrolled grid, focused tile, reorder, Add app, library, Inputs, Settings and confirmation at 1/4/5/8 columns. Use a fixed date/time and await fonts.
- [ ] Add `.ctv-*` public part classes and `.is-*` state mirrors without changing existing IDs or event routing. Document selectors that authors may use and fields reserved to the engine.
- [ ] Add a test that each documented part exists in its applicable UI state and that state mirrors follow pointer and remote focus.
- [ ] Run existing geometry and legacy UI checks; compare screenshots. Require no intentional appearance change in this task.
- [ ] Commit only this task's sources/tests/docs with `refactor: document stable Home styling parts`.

Deliverable: current Home looks and behaves the same, with a concrete author-facing
surface map. Do not rewrite the 1000-line app wholesale to prepare for themes.

## A2. Separate appearance, structure and standard dialogs

**Modify:** the CSS files from A1, `launcher/index.html`, `root-edition/preview.py`,
`scripts/preview.py`, packaging resource lists and affected preview tests.
**Create:** `launcher/theme-defaults.css`, `launcher/theme-runtime.js` with the
initial suspend/resume hook, `tests/themes/isolation.cjs`.
**Consumes:** public parts from A1. **Produces:** trusted theme surface and dialog hook.

- [ ] Add a failing browser check: injected appearance changes Home but leaves Settings/confirmation text, backgrounds, bounds and focused buttons at baseline.
- [ ] Move visual Home defaults into `theme-defaults.css`; retain structure in `style.css`. Organize both by background/header/dock/cards/library/inputs and document ownership. Format existing dialog CSS for readable editing.
- [ ] Replace broad dialog selectors with a standard-dialog root scope. Put themeable Home content inside its own bounded stacking context and keep dialogs outside it.
- [ ] Add one shared trusted visibility hook, `ThemeRuntime.suspend/resume`, to both Settings entry points. In this task its implementation only detaches/reattaches the theme sheet and effects.
- [ ] Ensure opening an error or recovery screen also suspends theme CSS before the screen is shown; close/back resumes only an accepted theme.
- [ ] Update explicit source inventories in `root-edition/preview.py`, `scripts/preview.py`, relevant packaging and tests. Verify every referenced resource exists in both produced editions.
- [ ] Run baseline/isolation/geometry tests and `scripts/test.sh preview`; commit `refactor: separate Home appearance from trusted dialogs`.

Audit existing CSS for clarity and containment; do not theme desktop Python UI or
Android installer screens as a side effect. They are outside the agreed scope.

## A3. Define manifest and typed CSS policy

**Create:** `launcher/theme-policy.js`, `tests/themes/policy.cjs`,
`tests/themes/fixtures/` with valid and malicious data.
**Consumes:** parts map. **Produces:** `validateManifest`, `validateRules`, `compileRules`.

- [ ] Implement the schema/API/version/identity/limit fields from spec section 6. Use a single declarative table for parts, properties, value types, limits and defaults, exported for docs/compiler consumption.
- [ ] Export a shared discovery-index validator for `cytv-themes.json`: schema
  version, bounded entries/bytes, unique repository-plus-slug identities, titles,
  theme versions, descriptor references and SHA-256 digests. Reject recursion,
  unknown fields, unsafe paths and cross-repository entries; transport still
  verifies the resolved URLs and downloaded descriptors independently.
- [ ] Write rejection tests before implementation. Include malformed/unknown API, duplicate names, `__proto__`/constructor keys, out-of-range layout, non-finite numbers, selector escape and forged raw CSS.

```javascript
const assert = require('node:assert/strict');
const policy = require('../../launcher/theme-policy');
const valid = require('./fixtures/valid-rules.json');
assert.deepEqual(policy.validateRules(valid), valid);
const escaped = JSON.parse(JSON.stringify(valid));
escaped.rules[0].selector[0].part = 'body';
assert.throws(() => policy.validateRules(escaped), /css-selector/);
const injected = JSON.parse(JSON.stringify(valid));
injected.rules[0].declarations[0].value =
  {type: 'raw', text: 'red;}body{display:none'};
assert.throws(() => policy.validateRules(injected), /css-value/);
```

- [ ] Define `valid-rules.json` exactly as below; add typed length/gradient/shadow fixtures using the same policy table. The contract serializer, not user input, owns punctuation/selectors.

```json
{"schemaVersion":1,"rules":[{"selector":[{"part":"card","states":[]}],"declarations":[{"property":"background-color","value":{"type":"color","rgba":[24,35,48,1]}}]}]}
```

- [ ] Selector arrays represent at most three descendant part tokens; states are approved state names without the `is-` prefix. The serializer supplies `.ctv-`, `.is-` and the fixed theme-root scope. A typed value never contains free-form CSS text; reject unknown fields and inherited object properties.
- [ ] Implement canonical serialization. Validate identifiers, numbers and relative asset IDs; reject unknown node types. No string fallback for unsupported CSS values.
- [ ] Require rules to target approved visual parts/states only. Disallow global/attribute/sibling selectors, unknown pseudo-classes, `!important`, external URLs, hiding interactions and custom structural transforms.
- [ ] Add table-driven tests for every allowed property family and every disallowed escape; verify emitted CSS with the existing compatibility compiler.
- [ ] Run `node tests/themes/policy.cjs` and `npm run test:compat`; commit `feat: define versioned theme manifest and CSS policy`.

## A4. Compile source CSS into the runtime contract

**Create:** `theme-api/compile.cjs`, `tests/themes/compiler.cjs`,
`scripts/build-themes.cjs`.
**Modify:** `scripts/compile-tv-web.cjs` only to export/reuse its existing stylesheet
transform, and `package.json` with focused theme commands.
**Consumes:** A3 table/validator. **Produces:** `compileSource` and reproducible assets.

- [ ] Write a test compiling a small valid author stylesheet; assert matching rules/CSS after device revalidation and serialization.
- [ ] Reuse PostCSS parsing and existing Chromium 38 transform. Resolve author-time variables, then reject unresolved/custom runtime features.
- [ ] Parse approved selectors into part/state tokens and approved values into typed nodes. Use an audited parser for CSS values if existing PostCSS APIs are insufficient; pin it in the host lockfile. Do not ship Node-22-only parsers to a Node-0.12 TV service.
- [ ] Reject imports before resolution; never fetch `@import`, external `url()` or configuration from a theme folder. The compiler does not load that folder's JS, package scripts or PostCSS plugins.
- [ ] Add adversarial fixtures with escaped keywords/URLs, comments, nested functions, CSS variables hiding URLs, huge shadows and unsupported syntax. Errors identify file/line/property and a supported alternative.
- [ ] Hash distribution assets and normalized descriptors. Build twice and compare all file digests; remove timestamps and machine paths from reproducible output.
- [ ] Run `node tests/themes/compiler.cjs`, `npm run lint:compat` and policy tests; commit `feat: compile author CSS into validated theme rules`.

## A5. Apply themes through one geometry and appearance path

**Modify:** `launcher/app.js`, `launcher/index.html`, `launcher/style.css`,
`launcher/theme-runtime.js` from A2.
**Create:** `tests/themes/runtime.cjs`,
`tests/themes/geometry.cjs`.
**Consumes:** normalized manifest/rules and verified asset handles. **Produces:** runtime API.

- [ ] Extract the existing layout arithmetic into a pure `computeGeometry(layout)` helper in `launcher/app.js` or a single `launcher/home-geometry.js` if needed for shared tests; expose that exact helper to the runtime.
- [ ] Keep the recent card/focus-gap formula as the Classic baseline. Calculate dock, card, frame, scroll and hit areas from one geometry result. Do not store two independent CSS/JS width values.
- [ ] Define bounded manifest layout presets; start with the current dock-and-grid arrangement. Color/theme CSS must not alter spatial navigation topology.
- [ ] Write browser checks for 1–8 columns, first/last/partial row, Add app, reorder, Inputs and pointer hit-testing with minimum/maximum accepted settings.
- [ ] Implement `apply`, `suspend`, `resume`, `reset`. Reuse one theme style element; revoke previous asset handles and cancel effects before replacement.
- [ ] Preserve focus by app/input ID across a theme change, falling back to a valid nearby element only if that ID disappeared.
- [ ] Verify missing/bad image -> theme fallback color; invalid style -> Classic; no network in apply or first paint; all hidden-page effects stop.
- [ ] Run renderer, isolation, geometry and legacy tests; commit `feat: apply themes without breaking Home navigation`.

## A6. Build the four initial themes and standard picker

**Create:** `themes/builtin/{classic,oled-black,aurora,gallery}/`,
`launcher/theme-panel.js`, `launcher/theme-panel.css`, `tests/themes/panel.cjs`.
**Modify:** `launcher/renewal-panel.js`, `root-edition/ui/root-settings.js`,
`launcher/catalogs.js`, `root-edition/ui/root-locales.js`, resource inventories.
**Consumes:** A5 runtime. **Produces:** shared picker used by both editions.

- [ ] Classic reproduces baseline; OLED Black disables background/glow; Aurora uses a dark gradient/image; Gallery supports an image plus readable shade behind content.
- [ ] Create independent wallpaper selection, dimming and accent overrides. Follow-theme resets overrides explicitly, never app layout/order.
- [ ] Add the standard Appearance entry in both editions. Provide theme previews, Apply, Cancel and Restore Classic with D-pad and pointer access.
- [ ] Define `ThemePanel.open()` and bind both edition entries to it. Keep installation hooks optional until plan B ships; no fake Add-link button.
- [ ] Add the 20-second apply trial. Persist-before-apply/next-boot behavior is integrated with B4; built-in-only prototype uses an injected test store, not a claimed durable implementation.
- [ ] Test focus return after closing, repeated apply, timeout, cancel, missing wallpaper and a failed save. A failed save leaves the accepted theme unchanged.
- [ ] Record asset licenses/credits. Run UI tests with every locale and wide/tall labels; commit `feat: add built-in themes and Appearance picker`.

## A7. Package parity, export and runtime release gate

**Modify:** `scripts/build-cytv.py`, `root-edition/build.py`,
`root-edition/preview.py`, `scripts/preview.py`, `scripts/ci-scope.py`,
`scripts/test.sh`, `.github/workflows/tests.yml`, relevant package tests.
**Create:** `scripts/export-theme-runtime.py`, `tests/themes/export.cjs`,
`docs/development/THEME-API.md`.

- [ ] Build built-ins before app packaging and merge only the enumerated outputs into each edition. No recursive copy of an author's checkout or local workspace.
- [ ] Export schema/policy/compiler, compiled reference UI, mock bridge, fixtures, licenses and a content-hash inventory. Include renderer source commit and API version.
- [ ] Test both editions contain every required file and use identical shared policy bytes. Verify the actual staged CSS/JS, not only source files.
- [ ] Extend CI scope so changes under `theme-api/`, `themes/`, `tests/themes/` and export scripts trigger all affected checks.
- [ ] Run `npm run test:compat`, `npm run lint:compat`, compiled `test:legacy-ui`, `test:geometry`, theme checks and `scripts/test.sh` before the candidate.
- [ ] Perform old/modern real-TV checks before claiming performance; record browser-preview results separately. Preserve triple-Home/watchdog/key-up behavior.
- [ ] Commit `build: package and export the shared theme runtime`.

## Runtime workstream completion

- [ ] Every confirmed requirement maps to an implemented/tested task above or a named dependency in B/C/D.
- [ ] Default Classic appearance and existing geometry tests pass after the refactor.
- [ ] Theme CSS cannot style the standard settings screens through the published contract.
- [ ] Both editions render all four built-ins with a reachable recovery path.
- [ ] Author runtime export is reproducible and versioned; no npm publication is required.
- [ ] Claims distinguish browser checks, package checks and actual hardware evidence.
