# Itachi 1.0.1 candidate review

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

## 1.0.1 preview correction — 2026-10-30

The full 1920×1080 renderer frame is captured before downsampling to 960×540;
the viewport is never reduced to generate the thumbnail. The regenerated image
was visually inspected: clock/date and shortcuts are separated and the complete
bottom native-icon ribbon is present. CSS rules and wallpaper are unchanged.

Source: `7bf4567db971ce7c437e928c42f653c5f2cc8da0`. Immutable distribution:
`918956e7c3bbf06b9ff8bf8306f5bbef20d45c51`. Descriptor SHA-256:
`5c31518bba7ff6793647df5589d348ef4d63123c92ab2393df50156de3ccc2b5`.
The clean candidate author runtime records the same source revision. The old
1.0.0 distribution and historical reviewed package remain unmodified.

The source-renderer browser regression checks thumbnail pixel similarity to
the complete frame, unchanged native image sources, both editions, Settings
suspension, offline restore and Classic reset. Separate Appearance checks cover
real intermediate Apply geometry at 1920×1080 and 1280×720, delayed preview
leases, cancellation and clipping in English/Russian. Review used host Chrome
and synthetic public app fixtures; it is not a physical-TV retest.
The exact immutable 1.0.1 package also passed host installation/application,
960×540 preview decoding, unchanged native icon sources and retained
installed-lane/image identity in both editions with zero page errors.

The registry URL is pinned to the local distribution commit. Publication and
remote-byte verification remain pending until that exact commit is pushed.
Integration must preserve its ancestry; a cherry-pick alone changes the commit
ID and does not publish the pinned distribution URL.
