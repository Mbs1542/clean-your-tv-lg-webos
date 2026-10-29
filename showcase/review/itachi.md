# Itachi 1.0.0 candidate review

Requested by the project maintainer for the release-candidate showcase. Source,
fixed distribution commit and byte hashes are recorded in the registry and manifest.
The distribution contains wallpaper, preview, typed JSON rules and notices only.
No replacement app icons or author JavaScript are included. Home's native icon
selection is generic; theming never rewrites image sources.

Root and No-root actual-renderer tests pass with fixed clock and synthetic app
inventory. Original YouTube/Netflix samples are existing brand artwork used only
in the preview, not distributed as replacement files. CSS enlargement, cache restore,
Settings isolation and reset are covered. General theme isolation/browser suites
cover library, Inputs and recovery. See ../../docs/development/ITACHI-THEME.md.

The exact reviewed LicenseRef-Personal-Fan-Theme is intentionally distinct from
MIT: CSS/configuration is MIT; generated images permit personal non-commercial
fan use and redistribution with the notice, subject to underlying character rights.
No character ownership, endorsement or commercial-use permission is asserted.
The allowlist adds this exact identifier, not arbitrary license expressions.

All twelve localized setup guides were reviewed for scope: no setup/control changes
are introduced by this catalogue listing. Existing Appearance/showcase/PC-push
instructions remain current. Minimum shared Home engine is 1.6.0 and optional
modern-icon-css-v1 support is required. Unsupported browsers reject before mutation.

Browser review is not hardware acceptance. TV model, firmware/webOS and remote:
unknown/untested. Host platform: macOS. Installation, Home routing, sound, standby,
cold boot, OTA and rollback: untested. No TV modifications or public release.
