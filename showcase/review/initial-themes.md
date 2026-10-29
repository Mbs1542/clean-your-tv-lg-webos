# Initial Alpine and Channel catalog review

Review date: 2026-10-28. This is candidate evidence for the existing theme PR, not a published Home release or final merged approval. The maintainer requested these first project themes. The generated registry/files remain subject to normal PR review.

## Exact provenance

- Author repository: https://github.com/razdva122/clean-your-tv-lg-theme
- Source commit A: `7af0aaf9826804f0cfa5ca5ef3dc08da751d3e4f`.
- Distribution commit B: `02bba75b1d59f8b97c548b6ea3370e01402de341`, retained by toolkit tag `themes-2026-10-28`. Catalog URLs still pin the commit, not the tag.
- Build runtime: main `68b8f51e5400a29aabaa84fda33275d772614d86`, explicitly marked dirty candidate snapshot. Each distribution validation-report.json preserves its inventory digest.
- Browser: installed Google Chrome 156.0.8078.73, explicit executable; synthetic demo inventory and fixed-clock captures. Browser coverage uses the actual compiled renderer; no author scripts are loaded.

| Theme | Version | Descriptor SHA-256 |
| --- | --- | --- |
| Alpine | 1.4.2 | `f12d022e0d5531fb0bc6e8c7a165195fdaecebd9b13d162751769af498d785f6` |
| Channel | 1.3.2 | `d94f984c28be6903401f8748626679644c82e6de21b79a47eccd2359859658b0` |

## Checks and observations

Both sources compiled against the same trusted contract; the toolkit's 21 tests passed. Coverage includes image decoding, real renderer switching, user column preference, fixed Alpine composition, Channel adjustable list, shortcut glyph replacement and restoring Classic. Alpine library checks open/close it by remote keys and verify a translucent backdrop plus retained focus. Existing main-browser suites cover the ribbon/reorder and Channel navigation in both editions.

The catalog includes hashed Home, Inputs and standard Settings previews for both themes and an Alpine library preview. Home/Inputs/Settings captures use the actual source styles; the library capture uses synthetic available apps. Review copies are palette-compressed to meet the 300 KiB limit without changing geometry. Asset paths/hashes and registry/source identity are verified locally; a live `--remote` check against B passed for both records and every named descriptor/rule/image/document byte. Repeat it during release acceptance.

Theme Settings and confirmation/recovery surfaces remain standard. Classic remains a separate built-in preview, not a third downloadable descriptor. No votes or popularity claims are included.

## Licensing and attribution

Author ownership is represented by committed sources in the project maintainer's toolkit repository; preview brand artwork is credited in the bundled notices. Channel's styling is MIT. Alpine's styling is MIT and the Fronalpstock wallpaper by Hannes Röst remains CC BY-SA 3.0; the credits name the source, original author, license URI, resizing, crop and dim treatment. The exact registry value `MIT AND CC-BY-SA-3.0` is allowlisted explicitly in schema and validator. It does not mean the wallpaper is relicensed MIT. Header glyphs are original project artwork. The preview credit documents include the demo artwork notices and applicable icon license text.

The relevant wallpaper terms are [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/legalcode.en). No generic license-expression parser or automatic license approval was introduced.

## Device evidence and limits

TV model, firmware/webOS, physical remote and installer platform: unknown/not applicable to this browser-only review. Edition browser coverage: No-root and Root renderer tests. Physical installation, actual TV theme selection/storage, remote behavior, Home routing, sound, standby, cold boot, OTA and rollback: untested. No TV changes were performed. URL installation remains in development and is not established by these listings.

## Website acceptance

The complete static site built with `scripts/preview.py --build OUTPUT --showcase`. Actual-catalog browser checks passed the root entry link, two listings, desktop/mobile layout, decoded screenshots, Channel search, Alpine pinned-link copy and detail image counts (four for Alpine, three for Channel), with no page errors. Fixture security/transport/site/browser tests and preview export tests passed separately.

[Catalog browser capture](catalog.png) · [Alpine detail capture](alpine.png). The catalog artifact is local/PR evidence; publication still follows release/next → main → existing Pages workflow.

The search-blur click regression was reproduced during actual-catalog acceptance. Filtering no longer detaches/reinserts cards when their order is unchanged; the fixture browser suite now types into search and clicks the result directly.
