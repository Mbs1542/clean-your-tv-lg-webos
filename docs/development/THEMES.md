# Theme development status (unreleased)

This work is prepared for the cycle after the current 1.4.1 candidate. It has not
been merged into that candidate and does not establish physical-TV acceptance.
The complete design remains in the [theme ecosystem specification](../superpowers/specs/2026-10-28-theme-ecosystem-design.md).

## Implemented in this preparation branch

- Public Home, library and Inputs styling parts, separated Classic appearance,
  and trusted Settings/language/confirmation/update suspension in both editions.
- A shared Theme API 1 validator/serializer and host CSS compiler. Author data
  cannot supply executable scripts, plugins, arbitrary selectors or raw CSS values.
- Shared on-TV Columns settings: 1–8, or By theme. Explicit user choice takes
  priority over the author's `layout.columns`; Classic falls back to 5. Changes
  immediately use the existing layout/focus engine and retain app order/hidden IDs.
- A small separately stored column preference and effective count in the existing
  profile format. Authoritative restore clears a newer local preference once,
  then subsequent starts retain post-restore choices. Old supervisor schemas are
  unchanged. Legacy backups preserve the effective number, not the By theme mode;
  preserving that mode with installed theme state belongs to the storage gate below.
- A data-only reviewed showcase registry, pinned per-theme detail pages, static
  catalog, moderation states and read-only PR checks. The initial catalog is empty.
- A separate candidate author toolkit with templates, multi-theme repositories,
  actual-renderer browser preview, validation/build, screenshots and PR drafts.
  The main project exports its renderer/compiler with file hashes and provenance.

See [CSS reference](THEME-CSS.md) and [showcase contribution guide](../../showcase/README.md).
The toolkit is [clean-your-tv-lg-theme](https://github.com/Razdva122/clean-your-tv-lg-theme); its quick start explains the exact
working directory, launch command, browser address, live reload and shutdown.
No official downloadable author-runtime release is published yet. Local work
uses an explicitly exported candidate, with dirty snapshots labelled as such.

## Release gates and remaining work

- Built-in theme sources/selection and accepted-theme persistence are not wired
  into Home yet. `ThemeRuntime.apply` is exercised by the author preview and tests.
- Runtime accepts four trusted composition presets (`dock-grid`, `icon-grid`,
  `side-grid`, `channel-list`) with a configurable column count. Spacing/text/focus
  scales still require the Classic values; other combinations are explicitly
  rejected rather than silently disagreeing with navigation geometry.
- Before activating downloaded images, require successful bounded decode in
  addition to the compiler's image structure/dimension checks.
- Validate app-owned theme storage and service permissions on actual Root and
  No-root TVs, including quota, interruption, update and rollback preservation.
  DB8 remains a candidate, not a confirmed implementation.
- External URL installation, durable staging/trials/offline assets and recovery
  are workstream B. The current public application has no external theme installer.
- Generate complete real-renderer review scenarios and obtain separate device
  evidence before accepting the full community-theme release. Browser screenshots
  are not remote, standby, cold-boot, OTA or rollback acceptance.
- Voting is a later stage. No synthetic counts, voting controls or automatic
  popularity-based package changes are included.

## Source checks

Run `npm ci --ignore-scripts --no-audit --no-fund`, then:

```sh
npm run test:themes
npm run test:themes:browser
npm run test:geometry
npm run test:legacy-ui
scripts/test.sh
```

Browser checks use installed Chrome by default. CI sets `BROWSER_CHANNEL=chromium`
after installing Playwright Chromium. Showcase browser checks also support an
explicit `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for an existing system Chrome.

The Pages workflow creates one artifact with the existing preview plus `/themes/`:

```sh
python3 scripts/preview.py --build build/theme-pages
node scripts/build-showcase.cjs build/theme-pages/themes
```

Use an empty showcase output directory. Build rejects a nonempty directory so
removed listings cannot survive unnoticed as stale generated pages.
