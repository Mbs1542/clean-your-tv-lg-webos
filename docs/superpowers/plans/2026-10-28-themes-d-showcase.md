# Themes D: Showcase and Later Voting Implementation Plan

> **For agentic workers:** Use `executing-plans` task by task. Static showcase is the first delivery. Voting infrastructure is explicitly deferred; do not provision it while implementing the static milestone.

**Goal:** Publish a reviewed community-theme showcase in the main project, then add anonymous reactions and a human-reviewed route from popular themes to built-in releases.

**Architecture:** Registry records and static assets live in the main repository. Its existing Pages build exports both the current preview and `/themes/`. A later, separate API owns mutable reactions; release tooling always pins selected theme digests.

**Tech Stack:** Static HTML/CSS/JS, Node validation/generation, existing GitHub Actions/Pages. Future voting has provider-neutral HTTPS API and SQL persistence contracts; hosting is selected at that milestone.

**Spec:** [Theme ecosystem design](../specs/2026-10-28-theme-ecosystem-design.md).

## Global constraints

- Showcase lives in `clean-your-tv-lg-webos`; tools/template live in `clean-your-tv-lg-theme`.
- Submissions arrive through PR, automated checks and maintainer approval.
- First release has no voting backend, fake counts or inactive vote buttons.
- Future applause is positive; shrug is neutral and never subtracted.
- Anonymous voting offers limited abuse resistance, not one-person-one-vote guarantees.
- Popularity nominates candidates; inclusion requires quality/license/device review.
- Existing preview URLs and Pages deployment remain functional.
- Current branch rule applies: PRs target `release/next`; public main publication follows release PRs.

## Planned files and contracts

```text
showcase/
  registry/<source-owner>--<repository>--<slug>.json
  assets/<theme-key>/<manifest-digest>/
  src/{index.html,theme.html,showcase.css,showcase.js}
  schema.json
  README.md
scripts/{check-theme-submissions.cjs,build-showcase.cjs,build-site.py}
tests/showcase/{registry,site,submission-security}.cjs
```

Registry schema:

```typescript
type ThemeRecord = {
  schemaVersion: 1;
  id: string;                    // normalized source namespace + theme slug
  title: string;
  description: string;           // plain text, bounded; no HTML
  author: { name: string; sourceProfile: string };
  sourceRepository: string;      // public canonical GitHub repo
  sourceCommit: string;          // 40-hex commit for reviewed source
  descriptorUrl: string;
  descriptorSha256: string;
  themeVersion: string;
  themeApiVersion: number;
  license: string;
  creditsFile: string;
  previewFiles: string[];        // locally reviewed/generated files
  tags: string[];                // controlled vocabulary
  addedAt: string;               // review date assigned by maintainer
  reviewedAt: string;
  evidence: { kind: 'browser' | 'device'; summary: string; url?: string }[];
};
```

Public `catalog.json` contains approved records plus availability/reviewed-version
metadata. It does not expose private reporter information or raw diagnostics.
The main renderer and toolkit submission generator consume the same schema.
Human approval is represented by the reviewed merge and fixed digest, not a
boolean that the submitting author can set to approve themselves.

## D1. Define submission records and moderation procedure

**Create:** `showcase/schema.json`, `showcase/README.md`,
`scripts/check-theme-submissions.cjs`, `tests/showcase/registry.cjs`.
**Dependency:** A3/A4 stable manifest/compiler policy; coordinate C5 generator.

- [ ] Define exact field lengths, ID normalization, semantic-version and SHA rules,
  allowed source URLs, tags and relative preview/credit paths. Reject duplicate
  identities and collisions across source repositories.
- [ ] Add valid/invalid record fixtures: XSS strings, unsafe URLs, unpinned refs,
  mismatching author identity, duplicate ID, absent credits and unsupported API.
- [ ] Accept several themes from the same author/repository with distinct slugs.
  Keep one record, reviewed digest and detail page per theme. Collection approval
  never implicitly approves its other themes or future versions. TV copy links
  select the specific reviewed theme rather than a mutable collection choice.
- [ ] Write the contribution guide: what files to submit, how checks work,
  maintainer review responsibilities, version updates, removal and appeals.
- [ ] Require ownership evidence for the claimed source/author: author-controlled
  repo content with matching metadata or explicit permission for a submitted
  third-party work. Attribution alone is not redistribution permission.
- [ ] Define review results: needs changes, approved fixed version, unavailable
  source, removed listing. These are catalog states, not replacements for the
  repository's issue-status label rules.
- [ ] Commit `feat: define community theme registry submissions`.

## D2. Validate untrusted submissions and generate review evidence

**Create:** `tests/showcase/submission-security.cjs` and a submission-validation
workflow, or a dedicated job in the existing test workflow.
**Consumes:** fixed registry record and source data. **Produces:** safe preview/report artifacts.

- [ ] Fetch only listed public data from the pinned source, with B2-equivalent URL,
  size and hash rules. Treat every record, image, stylesheet and license as untrusted data.
- [ ] Use the MAIN project's trusted compiler/runtime to inspect it. Never run
  author `npm install`, scripts, workflows, plugins or repository build commands.
- [ ] Run under an unprivileged `pull_request` job with read-only contents and no
  publishing secrets; set time/memory/download limits. Separate preview generation
  from any privileged main deployment.
- [ ] Run the browser on trusted application code plus validated theme data. Block
  external network during render. Use synthetic icons/inventory and fixed clock.
- [ ] Generate Home/library/Inputs screenshots and an isolation screenshot showing
  standard Settings. Attach compiler/compatibility/resource reports to CI artifacts.
- [ ] Require submitted public previews to correspond to the validated version;
  maintainer commits approved previews or the trusted deployment reproduces and
  pins them. Do not hotlink a mutable arbitrary image into the public site.
- [ ] Test theme text cannot become shell interpolation, template HTML or JavaScript;
  a hostile filename cannot escape artifacts; changed hashes prevent publication.
- [ ] Document how to inspect artifacts and approve the exact candidate. Commit
  `ci: validate theme submissions without running author code`.

## D3. Build static showcase and individual theme pages

**Create:** `showcase/src/`, `scripts/build-showcase.cjs`, tests/showcase/site.cjs.
**Consumes:** approved registry and local review assets. **Produces:** static `/themes/` tree.

- [ ] Build a responsive card grid with title, author, preview, description,
  built-in/community badge, license, version and supported API information.
- [ ] Add search and filters for style/API/source category. Initial sorts are
  recent, updated and curated. Do not label curated entries "most liked".
- [ ] Add detail pages with multiple screenshots, source/credits, browser-vs-device
  evidence, installation instructions and Copy TV link with a selectable-text fallback.
- [ ] Explain URL installation and link to the toolkit author guide. Links to a
  candidate-only feature must be explicitly labeled until TV support is released.
- [ ] Render untrusted fields as text; allow only normalized safe source links.
  Handle a removed/unavailable source with a clear state instead of broken CTAs.
- [ ] Test keyboard focus, narrow mobile layout, loading images, long titles,
  empty filters, unavailable themes and base paths under the repository Pages URL.
- [ ] Use actual theme screenshots as the central visual content. Reserve the
  supplied clap/shrug pill treatment for the later functional voting stage.
- [ ] Commit `feat: add the community theme showcase`.

## D4. Integrate one Pages build without replacing the current preview

**Create:** `scripts/build-site.py` and site-export tests.
**Modify:** `.github/workflows/preview-pages.yml`, `scripts/ci-scope.py`,
existing preview navigation only where needed, docs entry points.

- [ ] Compose the existing `scripts/preview.py --build` output and the new
  showcase output into one staging directory. Keep the existing root preview,
  `/launcher/`, `/root-launcher/` and `/preview/` paths intact.
- [ ] Export `/themes/index.html`, detail pages and catalog JSON with relative
  paths that work at `/<repository>/themes/`, not only domain root.
- [ ] Add explicit CI coverage for registry, showcase, toolkit-contract lock and
  site-build changes; include submission checks without running all TV hardware tests
  merely for a textual registry edit.
- [ ] Retain the workflow's "current main commit" deployment check. Only reviewed
  main jobs publish; PRs produce inspection artifacts without deploying to production.
- [ ] Run existing `tests/test_preview.py` plus site-link/resource tests. Verify
  neither builder copies workspace keys, settings, research or private images.
- [ ] Document the initial publication cadence: registry PR -> release/next ->
  normal main release -> public showcase. Faster independent catalog delivery
  requires an explicitly approved branch/release-policy change.
- [ ] Publish only during the authorized implementation/release task, then verify
  the deployed page and Copy TV link before claiming availability.
- [ ] Commit `build: publish showcase alongside the existing preview`.

## D5. Prepare built-in promotion procedure

**Create:** `docs/development/THEME-PROMOTION.md`,
`themes/builtin/selection.json` when the first selection is made.
**Consumes:** reviewed community digest and device/license evidence.

- [ ] Define a candidate checklist: source ownership, redistribution licenses for
  every image/font, visual quality, readability, D-pad/pointer behavior, supported
  locales, resource budget and old/modern-TV evidence.
- [ ] Record an exact source commit/theme version/descriptor hash and author credit
  for each inclusion. Bundle those reviewed bytes; never fetch latest during a build.
- [ ] Add theme/package size checks and ensure all built-ins work entirely offline.
  Keep Classic permanent and decide additions/removals through ordinary release review.
- [ ] Preserve stable identity across community/built-in copies. Do not silently
  switch a user's installed accepted version when a same-named theme is bundled.
- [ ] Before voting, initial examples are editorial choices. After voting, include
  a dated popularity snapshot and abuse-review note in the candidate decision.
- [ ] Document how an author updates or withdraws a future listing; retain release
  evidence and comply with license requirements for shipped copies.
- [ ] Commit `docs: define reviewed promotion of community themes`.

## Static showcase release gate

- [ ] An author can submit a real installable theme via PR and see actionable checks.
- [ ] Approved theme appears at a stable page and its URL installs the reviewed version.
- [ ] Browser-generated screenshots and hardware evidence are clearly distinguished.
- [ ] Existing preview remains reachable after deployment.
- [ ] The site has no fictitious votes or automatic code/package inclusion.
- [ ] All initial catalog data and assets are attributable and reviewed.

## V1. Later milestone: anonymous voting decisions and API

This stage is deferred by the maintainer. It is not a dependency for D1–D5 and
must not delay their publication. Before implementation, choose the backend host,
operating owner and privacy/retention terms in a small follow-up design. Recommended
implementation shape is a small serverless API plus SQL; no provider account is
created by this plan.

Proposed defaults for that future design:

- A random server-issued browser credential, stored locally, identifies a browser
  installation. It is not a user account and does not identify a unique person.
- A theme has one current reaction per credential; clap/shrug can be switched or
  cleared. Repeat requests do not add another vote.
- Votes refer to stable theme identity and record the descriptor digest seen.
  Totals are labeled lifetime; a major visual redesign needs a new rating generation
  or explicit historical-vote labeling chosen before launch.
- No device IDs, browser fingerprint or public IP records. Keep only bounded,
  short-lived abuse signals; propose 24-hour network buckets and 30-day aggregate
  abuse logs, subject to the operator's approved privacy policy.
- A challenge may be required when rate limits are hit; server verification is
  mandatory. Avoid challenges on ordinary page browsing.
- Site browsing and TV installs continue when voting is unavailable. Frontend
  shows the last confirmed counts with freshness or an unavailable state.

API contract:

| Endpoint | Purpose |
| --- | --- |
| `POST /v1/visitor` | Issue bounded anonymous credential; apply issuance abuse controls |
| `GET /v1/reactions?theme=ID` | Return clap/shrug totals and update time |
| `PUT /v1/reactions/ID` | Set `clap`, `shrug` or `none` for the credential, with version digest |
| `GET /v1/ranking` | Return confirmed aggregate popularity; cacheable public data |

An HTTPS API on another origin needs a precise CORS allowlist, JSON request
validation and server limits. CORS is not protection from direct non-browser
abuse. GitHub Pages cannot itself persist these mutable counts.

## V2. Later milestone: atomic counts and honest UI

**Proposed future files:** `showcase/voting/` for API/SQL/tests and
`showcase/src/reactions.js` for site integration.

```sql
CREATE TABLE reactions (
  theme_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('clap', 'shrug')),
  descriptor_digest TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (theme_id, voter_hash)
);
CREATE INDEX reactions_theme_kind ON reactions(theme_id, reaction);
```

- [ ] Validate theme existence/version before accepting a reaction. Store only a
  server-derived credential hash. The server issues/verifies credentials; client
  identifiers are not proof of one human.
- [ ] Use an atomic insert/update/delete transaction for changes. Read counts
  from persisted rows or transactionally maintained aggregates, not increment-only requests.
- [ ] Test concurrent repeated clap = one row; clap -> shrug moves one count;
  clear removes one; replay cannot inflate counts; rejected requests change nothing.
- [ ] Add issuance/write rate limits and short-lived abuse controls. Account for
  shared household networks; do not treat every shared IP as one voter.
- [ ] Implement the supplied two-pill treatment with accessible names, selected
  state, keyboard operation and confirmed numeric counts. Emoji alone is not the label.
- [ ] Define retry/error behavior: a failed request restores the prior confirmed
  state; changing a reaction replaces it rather than allowing both simultaneously.
- [ ] Test new browser/private mode/cleared storage limitations and document them.
  Never advertise strong unique-person voting without accounts.
- [ ] Provide backend backups, bounded logs, secret management and disable switch;
  select/verify actual hosting costs before provisioning.

## V3. Later milestone: ranking and candidate selection

- [ ] Initial ranking is simple descending confirmed applause with a stable tie
  break; shrug is displayed separately. Show recent additions separately so new
  themes are discoverable. Avoid an unexplained weighted score.
- [ ] Add a minimum-data note for new themes and an abuse-review state for suspicious
  spikes. Counts remain popularity evidence, not a quality certification.
- [ ] Generate a dated top-candidate report for a normal release review. The report
  proposes additions; it never changes package contents or merges a PR automatically.
- [ ] Apply D5 checks to exact candidate versions and include authors/credits in
  release notes. Public delivery follows normal package/feed verification.
- [ ] Audit the voting stage against the confirmed neutral shrug and anonymous
  access requirements before turning on buttons in production.
