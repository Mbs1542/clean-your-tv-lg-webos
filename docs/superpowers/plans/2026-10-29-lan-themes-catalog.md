# LAN themes and TV catalogue implementation plan

**Goal:** Transfer an unpublished theme from a PC on the home network and browse reviewed repository themes on the TV without typing repository URLs.

**Architecture:** Keep the accepted-theme manager, transactional cache, validation and 20-second confirmation. Add a separate explicit LAN transport; never widen ordinary URL-install host rules. Toolkit shares one compiled in-memory snapshot on TCP 8879 for ten minutes behind a random six-digit PIN. TV asks for a private IPv4 address and PIN, stores only the address, and fetches the complete package. No TV listening port, cloud relay, discovery scan or GitHub publication. HTTP is restricted to trusted home networks and remains a hardware acceptance gate. Catalogue is generated from the reviewed repository registry with bundled small previews; active external entries download exact pinned packages and built-ins apply offline.

**Constraints:** Both editions, Chromium 38/ES5, no author JavaScript, existing hashes/limits and recovery maintained. Only selected compiled files exposed, never source folder. No app version/release changes; hardware results not claimed. Unpublished source identity may remain github: while source commit zero denotes a development snapshot, not reviewed provenance.

## Tasks
- [x] Toolkit: add LAN share server, snapshot envelope {schemaVersion:1,descriptor:base64,files:{path:base64}}; PIN is /<six digits>/package.json. Fixed port 8879; explicit start/stop; 10-minute expiry; bounded PIN attempts, host restrictions, CORS, immutable snapshot. Tests for expired/wrong PIN, path denial, size/integrity and lifecycle. Preview button and CLI `share` compile current selected source without requiring commit or public repo.
- [x] Runtime: `ThemeData.lanSource(address,pin)`, `ThemeData.loadLan(address,pin,version,signal)` with private IPv4 parsing, strict endpoint, HTTP200/no redirects/size bounds, envelope decoding and existing verify. `ThemeManager.installLan` commits only validated/prepared packages, never stores URL/PIN. Test malformed source, limits, cancellation and native decode/rollback via both-edition UI.
- [x] Catalogue: generator creates launcher/theme-catalog.json and local preview assets from approved registry + builtins; deterministic freshness check. TV card/detail/download UI shares current installer and installed digest handling. No remote scripts, no votes. Excluded removed/unavailable entries. No separate mutable author registry.
- [x] Integration: both packaging inventories, localization and twelve user guides, toolkit instructions; targeted tests then required broader checks; independent code review; refresh previews and PRs without merging.

## Decisions
- Address entry once is intentional: ordinary packaged browser code cannot promise reliable LAN discovery on all supported TVs. Fixed port avoids URL/path entry. Address is editable; session PIN is never remembered.
- Catalogue source remains the project-reviewed registry; distribution bytes remain commit-pinned at the recorded source repository. This avoids changing theme identity or silently republishing an author's files under a new source.
- A future catalogue refresh can be added separately; first implementation ships a deterministic catalogue snapshot with the app.

## Verification and review

Both review findings were fixed: socket peer/destination validation independent of Host, and Shift+Tab navigation. Added last-row Down navigation and explicit Cancel focus. Main broad suite, both-edition browser suite, compatibility/legacy UI, 335 strings × 12 locales, catalogue freshness and 29 toolkit tests passed. No physical TV was connected; private-interface routing remains a hardware gate. UI captures use synthetic TV services. PRs remain preparation work, not merged or released.
