# PC-to-TV Theme Push Implementation Plan

> Execute in this session, with isolated file ownership for delegated tasks. Use test-driven development and verification-before-completion.

**Goal:** Make outgoing PC upload to a temporary TV receiver the primary Send to TV workflow and exercise it on the maintainer TV.
**Architecture:** A shared bounded ES5 HTTP receiver lives behind edition-owned LS2 methods. Browser UI reads buffered chunks via authenticated LS2 and installs through the existing validated cache path. The local author toolkit sends a compiled snapshot using Node HTTP, avoiding Mac incoming connections.
**Tech Stack:** Existing Node/webos-service, PalmServiceBridge, ES5-compatible browser JS, existing Playwright and Python package builders. No new dependency.
**Spec:** ../specs/2026-10-29-tv-theme-push-design.md

## Global constraints

TCP 8879; 10-minute session; 20 wrong PINs; 10 MiB envelope; 15-second HTTP request; 48 KiB read chunks. No firewall modification, public hosts, credentials in logs, author execution, application routing/startup change, or changes to adjacent release worktrees.

## Tasks

- [ ] Shared receiver: first add a failing `tests/themes/receiver.cjs` requiring `theme-receiver/core.js` and `register.js`; test actual HTTP POST status/state/read/stop, forbidden identities, host/origin, wrong PIN, oversized/malformed data, abort/expiry. Implement `create(options)` with async `start()`, `status(sessionId)`, `read(sessionId,offset)`, `stop(sessionId)`; `register(service,{appId})` exposes the four spec methods and validates LS2 identity. Run `node tests/themes/receiver.cjs`.
- [ ] Packaging: add source import shims for both services and register on bootstrap. `scripts/theme_receiver.py` supplies canonical `theme-receiver/core.js`, `theme-receiver/register.js` and a packaged shim. Inject it in Root and No-root IPK/direct shell builds. Test both payload inventories and ES5 syntax, then probe an isolated receiver service on TV through private TCP.
- [ ] Web UI: test then implement `launcher/theme-receiver.js` (`start`, `status`, `read`, `stop`, bounded RPC) and `ThemeManager.installEnvelope`. Primary Receive from computer shows TV address/PIN and imports verified chunks; cancellation/navigation closes session, errors preserve installed choice, Apply uses existing no-timer path. Keep legacy form separately. Update all explicit HTML/asset/export inventories. Browser-test both editions.
- [ ] Toolkit: in a separate toolkit worktree, test then implement outgoing sender and primary in-page address/PIN dialog/CLI, preserving bounded snapshot creation and secondary legacy sharing. Tests must make a real outgoing HTTP request, reject nonprivate hosts, redirects, wrong PIN and misleading success text. Do not edit the old toolkit checkout or PR.
- [ ] Localization/documentation: update twelve languages, author instructions, primary/secondary transfer descriptions and protocol/permissions. Run theme unit/browser suites, focused packaging and legacy checks, then `scripts/test.sh tv preview`.
- [ ] Device acceptance: build and hash isolated fixture including the actual receiver/register code, invoke start from real TV UI, send from actual PC preview, verify wrong PIN and successful import/Apply/offline reload/removal; verify listener teardown, source hashes and cleanup. Record observed results/limits, commit/push only follow-up branches, archive the temporary toolkit worktree after preserving its preview runtime outside Git.
