# TV Theme Selection Implementation Plan

**Goal:** Ship Classic and Alpine inside both TV editions and install Channel (or another public GitHub theme) independently from showcase.
**Architecture:** Keep the existing typed ThemePolicy/ThemeRuntime. Add bounded data transport/hash/decode, application-owned IndexedDB cache, a small durable accepted-choice/trial marker and a standard remote-friendly theme panel. No updater trust or TV service permissions change.
**Spec:** ../specs/2026-10-28-theme-ecosystem-design.md; latest maintainer instruction supersedes its proposed built-in list with Classic + Alpine.

## Constraints

Chromium 38/ES5 output; max 6 MiB image data/theme, 24 MiB cached payloads; sequential HTTPS GitHub downloads with exact commit resolution and per-file hashes; no executable author files. Standard Settings and recovery. Default remains Classic until explicit user choice. Existing app order, inputs, Home routing and Columns preference remain independent. Theme data is app-owned and excluded from legacy updater/profile contracts; a profile rollback must clear the active theme choice to avoid restoring an incompatible appearance. No physical-TV acceptance claim without testing a device.

- [x] Package Alpine's immutable reviewed bytes under a built-in identity in both editions; show Alpine as built-in, Channel as external in catalog.
- [x] Implement SHA-256/UTF-8, bounded transport, canonical GitHub source/collection resolution, compatibility checks, image header/dimension/decode checks and immutable file validation; test hash vectors and hostile inputs.
- [x] Persist downloaded packages transactionally in IndexedDB; reject quota/oversize/invalid cache; keep offline copies. Implement 20-second trials, durable marker before applying, confirm/cancel/timeout rollback and startup Classic recovery after interruption. Keep accepted selection independent of image cache.
- [x] Add Themes to both standard Settings screens. Provide built-in/installed selection, URL input and explicit collection selection, install progress/error, remove external themes, and standard preview confirmation with remote navigation/focus trapping.
- [x] Add startup/restore hooks and all explicit package/preview/resource inventories. Verify both editions, settings isolation, reload/offline, cancellation and failures.
- [x] Update user instructions in all 12 guides, canonical theme guide, developer limits, toolkit instructions and showcase links. Preserve candidate/release distinction.
- [x] Run scoped unit/browser/compatibility/package tests, update existing PRs, leave current release candidate untouched and retain explicit hardware acceptance gates.

Hardware acceptance remains explicitly unperformed: no test-device connection was supplied or used. Candidate completion is source/package/browser verification, not a physical-TV compatibility claim.
