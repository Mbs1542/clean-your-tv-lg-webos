# Themes C: Author Toolkit Implementation Plan

> **For agentic workers:** Use `executing-plans` task by task. Do not create/publish a remote repository during a planning-only request. Delegate only when parallel execution is explicitly authorized.

**Goal:** Make `clean-your-tv-lg-theme` a complete starting point for creating CSS themes, previewing locally, publishing installable data and submitting to showcase.

**Architecture:** A separate public toolkit repository consumes a pinned, hashed runtime export from the main repository. Themes contain data/assets; all executable tooling comes from the toolkit and trusted runtime.

**Tech Stack:** Node 22 developer tools, npm lockfile, existing exported PostCSS compiler and Playwright renderer; no npm package publication required.

**Spec:** [Theme ecosystem design](../specs/2026-10-28-theme-ecosystem-design.md).

## Global constraints

- Repository name is `clean-your-tv-lg-theme`; showcase remains in the main repository.
- The toolkit supports custom CSS using exactly the TV policy and actual pinned renderer.
- A theme author's repository contains no executable code required for installation.
- Main app clone, root access and a physical TV are unnecessary for author preview.
- Local preview does not prove hardware compatibility.
- Technical docs are English; include a Russian quick-start translation for the maintainer's initial audience without making it a divergent specification.
- All template/example assets have redistribution credits; never embed personal TV inventories.
- Support several independent theme folders in one author repository. A guide
  for launching/opening browser preview is sufficient; an embedded editor,
  desktop application and visual authoring studio are outside initial scope.

## Planned repository layout

```text
clean-your-tv-lg-theme/
  README.md
  LICENSE
  CONTRIBUTING.md
  package.json
  package-lock.json
  runtime.lock.json
  bin/theme.cjs
  lib/{runtime,project,server,build,submission}.cjs
  template/
    theme.json
    theme.css
    assets/
    CREDITS.md
    LICENSE
    .gitignore
  examples/{minimal,aurora,gallery}/
  docs/
    quick-start.md
    quick-start.ru.md
    css-reference.md
    layout-reference.md
    wallpapers.md
    preview.md
    publish.md
    install-on-tv.md
    showcase.md
    compatibility.md
    troubleshooting.md
  tests/
  .github/workflows/{test,release}.yml
```

`.runtime/`, local screenshots and `dist/` are generated and ignored. Exported
runtime/compiler modules retain their main-repository relative structure so the
compiler can import the exact `launcher/theme-policy.js`. A manifest in the
runtime export lists every file and digest; the toolkit rejects unexpected files.

CLI contract, defined by `bin/theme.cjs`:

| Command | Behavior |
| --- | --- |
| `runtime:fetch` | Fetch the exact trusted runtime URL/digest from the checked-in lock, verify and install atomically |
| `theme -- init DIRECTORY --name NAME` | Create a new folder from template; refuse an existing nonempty folder |
| `theme -- validate DIRECTORY` | Validate source, image limits, credits, CSS/API and produce actionable errors |
| `theme -- preview DIRECTORY --edition no-root` | Serve actual runtime locally; support `root` edition too |
| `theme -- screenshots DIRECTORY` | Produce fixed-state previews with renderer/API provenance |
| `theme -- build DIRECTORY --out OUTPUT` | Produce installable descriptor/rules/assets and report |
| `theme -- submission DIST --source URL` | Produce a registry record and PR instructions; does not post a PR automatically |

## C1. Create trusted bootstrap and repository skeleton

**New-repo files:** README, package/lock, runtime lock, `bin/theme.cjs`,
`lib/runtime.cjs`, tests/runtime.cjs, LICENSE/CONTRIBUTING.
**Dependency:** A7 author-runtime artifact, even if initially a local candidate.

- [ ] Create the repository only during authorized implementation; initialize an ordinary checkout and use its contribution rules. Do not create it now for this plan.
- [ ] Put only needed developer dependencies in its lockfile. Match exported compiler dependencies and pin the Playwright/browser baseline used for screenshots.
- [ ] Implement explicit runtime fetch: HTTPS, fixed trusted release URL, size/hash checks, safe unpacking in a temporary directory and an atomic directory switch. Reject traversal, symlinks, duplicates and unlisted files.
- [ ] Keep fetching separate from `npm ci --ignore-scripts`; do not rely on npm lifecycle hooks to execute downloaded code implicitly.
- [ ] Add failure tests for wrong hash, partial download, unsupported API and changed runtime release. The previous verified runtime remains usable offline.
- [ ] Document Node 22 installation and platform-neutral npm commands for macOS, Linux and Windows. Commit `chore: bootstrap the theme author toolkit`.

## C2. Ship a small complete template and style reference

**Create:** template and examples, `lib/project.cjs`, tests/project.cjs,
CSS/layout/wallpaper/compatibility docs.
**Consumes:** A3 contract export. **Produces:** author source accepted by A4.

- [ ] Generate the CSS property/part tables from the runtime contract, including value ranges, fallback behavior, error codes and supported states.
- [ ] Include a valid minimal theme with a stable slug, display title, author, version, API version, source-repository field, layout defaults and license metadata.
- [ ] Document `themes/<slug>/` collections with independent versions, descriptors
  and credits. Existing commands accept a selected theme folder; users need not
  create one repository per theme.
- [ ] Include an annotated CSS example such as:

```css
.ctv-card {
  background-color: #182330;
  border-radius: 20px;
  border-color: #41546c;
}
.ctv-card.is-focused {
  border-color: #dceaff;
}
.ctv-clock {
  color: #f2f5fa;
}
```

- [ ] Explain that clock/text scale and navigable-card layout settings have bounds; arbitrary positions, hidden focus controls and CSS outside the public parts are unsupported.
- [ ] Include Classic-derived minimal, Aurora and Gallery examples, each with credit files and visible differences. Avoid examples requiring author-supplied third-party logos.
- [ ] Validate safe file naming, image dimensions, licenses and all examples in CI. Test scaffold never overwrites user files. Commit `feat: add documented theme templates and examples`.

## C3. Provide a faithful local preview

**Create:** `lib/server.cjs`, tests/preview.cjs, docs/preview.md.
**Consumes:** A7 runtime and A4 compiler. **Produces:** local preview with live reload.

- [ ] Serve only the explicit runtime inventory and validated project assets, bound to `127.0.0.1`. A requested path cannot escape these roots or expose `.git`, credentials or arbitrary files.
- [ ] Compile source CSS on save; successful output replaces the preview theme. On an error keep the previous valid preview and show the filename/line/error outside the theme surface.
- [ ] Reuse actual app HTML/JS and the trusted mock service bridge. Do not create a separately drawn approximation of the launcher.
- [ ] Provide remote arrows/OK/Back, pointer simulation, Root/No-root, 1–8 columns, locale, long names, no apps, missing icons, bright/dark wallpaper and standard Settings scenarios.
- [ ] Make all preview service calls resolve through mock adapters; the preview never connects to a real TV, installs packages or launches actual applications.
- [ ] Test invalid CSS preserves preview; reload does not reset the selected test case; standard settings remain unthemed; traversal requests return 404.
- [ ] Write a literal start/open walkthrough: prerequisites, toolkit working
  directory, dependency installation and pinned runtime preparation, preview
  command with a chosen theme folder, actual printed localhost URL, browser open,
  save/reload, keep terminal running, Ctrl+C and startup/port troubleshooting.
  Follow it on a clean machine; no embedded editor or desktop installer required.
- [ ] Commit `feat: preview themes with the actual Home renderer`.

## C4. Build deterministic themes and review images

**Create:** `lib/build.cjs`, tests/build.cjs, docs/publish.md,
fixture/source-to-distribution golden data.
**Consumes:** compiler/manifest policy. **Produces:** `dist/cytv-theme.json`, typed
rules, content-hashed assets, screenshot files and `validation-report.json`.

- [ ] Validate all source first. For a distributable release require source files to be committed and record the full source commit; dirty work is allowed in preview but is not falsely attributed to HEAD.
- [ ] Inspect images before decode: proposed author input ceiling 16 MiB and 25 megapixels. Reject larger inputs with an instruction to resize them locally first.
- [ ] Normalize approved images to the spec's runtime limits with the pinned headless browser's canvas when needed. Run without outside network access and with bounded time/memory; preserve required attribution and meaningful crop.
- [ ] Generate screenshots for dock, scrolled app grid, Inputs and standard Settings. Record fixed clock, locale, edition, API and renderer revision. Mark them browser previews.
- [ ] Build content-addressed distribution names and canonical JSON, with no machine paths, secrets or nondeterministic timestamps. Verify two builds of the same committed sources match.
- [ ] Test wrong extension/header, corrupt image, dimension bomb, path traversal, unlicensed asset, missing font fallback and duplicate asset names.
- [ ] Document publishing the data as GitHub release assets or committed distribution files. Repository root `cytv-theme.json` can point to the built descriptor; the installer pins the resolved digest.
- [ ] Show the exact URL authors paste into TV settings and explain repo-root versus explicit-descriptor links. Commit `feat: build reproducible TV theme distributions`.
- [ ] Generate and validate a root `cytv-themes.json` index for several built
  themes, with schema version, unique identities, titles, theme versions,
  descriptor references and digests. Bound entry count/bytes; forbid recursive
  indexes and cross-repository references. Keep single-theme output supported.

## C5. Generate showcase submissions and complete the author guide

**Create:** `lib/submission.cjs`, tests/submission.cjs,
docs/showcase.md, docs/install-on-tv.md, docs/troubleshooting.md,
quick-start docs.
**Dependency:** D1 registry schema; B5 verified TV flow.

- [ ] Generate a normalized registry record containing stable identity, source commit,
  reviewed descriptor digest, assets/previews, license and compatibility metadata.
- [ ] Produce instructions to fork the MAIN repository, add the record under
  `showcase/registry/`, and open a PR targeting `release/next` under current rules.
  Do not redirect submissions to the toolkit repository.
- [ ] Explain checks/review, how to respond to CI errors, how to publish an update
  as another reviewed digest and how to request removal/correct attribution.
- [ ] Explain personal installation does not need a showcase submission, and a
  listed theme is not automatically included in the main application package.
- [ ] Generate one showcase record per theme, even when several records share a
  repository or are submitted in one PR. Document independent review/updates.
- [ ] Document TV install/apply/revert/offline use, supported source links,
  unavailable network/TLS/quota messages and the standard recovery controls.
- [ ] Add a clean-machine walkthrough test: scaffold -> preview -> validate ->
  build -> generated submission -> simulated TV import. Capture real-TV evidence
  separately using the consent process.
- [ ] Commit `docs: complete author publication and TV installation workflow`.

## C6. Cross-repository releases and maintenance

**Modify:** main export release workflow and toolkit test/release workflows,
runtime lock update documentation.

- [ ] Publish runtime artifacts only from reviewed main-project releases; generate
  an integrity manifest and compatibility table for API/renderer/application versions.
- [ ] Toolkit upgrades the pinned runtime through a PR, not floating main/latest.
  Run all template/source fixtures against the new compiler/runtime before merge.
- [ ] Keep old compatible exports available. Explain whether an engine change is
  compatible with API 1 or requires API 2 and author migration.
- [ ] Test supported desktop OSes for scaffold/build/preview; require only documented
  tools. Installing Playwright Chromium is a separate explicit development step.
- [ ] Release the toolkit and guide only after the documented distribution format
  is accepted by the actual TV candidate. Clearly mark candidate compatibility if
  publishing an early preview.

## Author journey acceptance

- [ ] A new author starts with the toolkit alone and produces a working theme.
- [ ] Every compiler error points to an actionable documented rule.
- [ ] The local preview and TV runtime consume the same validated contract.
- [ ] A published theme installs from the author's link without being in showcase.
- [ ] The generated submission passes the main registry validator without hand-editing hidden fields.
- [ ] Documentation covers creation, local preview, own-repo publishing, showcase PR, TV selection, updates and recovery.
