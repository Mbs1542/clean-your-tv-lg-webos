# CSS-only Itachi Theme Implementation Plan

**Approved scope:** The user approved the visual mockup, requested an installable
package, then explicitly ruled out all app-image replacement. That instruction
supersedes the earlier high-resolution-logo approach.

**Goal:** Offline theme containing wallpaper, preview and typed CSS only. Keep
all app image sources, bytes, dimensions, IDs and launch behavior unchanged.

**Architecture:** Optional modern-icon-css-v1 capability, bounded icon-only filter
functions and screen blending. Older browsers reject the optional effect; the
normal Chromium 38 build remains unchanged. Renderer exposes existing alpha/light
corner metadata as CSS states. Explicit CSS focused-card border none/0 uses a
trusted 110% scale and readable selected caption instead of a border. Card color
CSS can override inline brand background within this mode. No replacement assets.

- [x] Remove the abandoned appIcons contract, mappings, assets and renderer source changes.
- [x] Add failing typed CSS/runtime checks, implement bounded support and feature gates.
- [x] Verify both actual renderer editions, unchanged icon src/dimensions, cached
      installation/offline reload, Settings suspension and Classic reset.
- [ ] Build/pin/validate source with the existing toolkit and package its existing
      bounded LAN sharing utility; include clear required-Home/browser instructions.
- [ ] Verify package hashes, run scoped/full checks and obtain independent review.

No TV installation, Home routing change or publication is authorized by this task.
Netflix resolution remains limited by the TV original, per the CSS-only constraint.
