# Itachi · Sharingan — CSS-only local candidate 1.0.0

Dark Itachi wallpaper, crimson eyes and a bottom scenic app ribbon. Every app
image remains the original source supplied by Home. There are no replacement
icons, icon mappings, image downloads, canvas conversions or upscaled logos.
The theme contains two images only: wallpaper and preview.

## Requirements

Home must include the optional `modern-icon-css-v1` authoring/runtime support
from this change. Its browser must support CSS `filter`, `mix-blend-mode: screen` and `isolation: isolate`. The presence of a Themes menu alone is insufficient.
Unsupported browsers/older Home reject the capability before changing appearance.
The general CYTV Chromium 38 floor is unchanged, but this optional theme effect
is not compatible with that oldest browser. This is a local candidate, not a
published CYTV release or a physical-TV compatibility claim.

## Install from computer

1. Extract the complete ZIP; install Node.js 22+ on the computer if needed.
2. Run `sh share.command` on macOS/Linux, `share.cmd` on Windows, or
   `node share.cjs` in the extracted directory.
3. Keep the terminal open. On the TV open **Settings → Themes → From computer**,
   enter the computer address and temporary PIN shown by the script, then review
   and select the theme. Both devices must be on the same private network.
4. Sharing expires after ten minutes; Ctrl+C stops it earlier. Installed assets
   work offline. Run `node share.cjs --check` to check all package hashes.
5. Select Classic to remove the theme CSS. Original app files never changed.

The server reuses the existing toolkit's bounded LAN transport and does not
install automatically. No TV changes were made while preparing this package.
Root and No-root use the same theme. Physical-TV installation, remote controls,
standby, cold boot, OTA and rollback remain untested.

## CSS and image quality

For white/near-white-background originals, the theme uses:

```css
.ctv-icon.is-light {
  filter: grayscale(1) invert(1) brightness(1.3);
  mix-blend-mode: screen;
}
.ctv-icon.is-glyph { filter: brightness(0) invert(1); }
```

The renderer exposes `is-light` and `is-glyph` based on its existing corner/alpha
sample. `screen` visually hides the inverted black backdrop; it does not change
PNG alpha or source bytes. Dark, middle and bright flat backdrops additionally use bounded CSS contrast
filters selected by sampled background luminance. This is approximate and can
lose details on complex/gradient artwork; it is not universal background removal.

Netflix stays at its original TV resolution. A vector-derived replacement would
be sharper, but it was explicitly excluded by the user. Sharpening cannot recover
missing detail. No Netflix/YouTube or other brand image is included in the theme.

CSS requests transparent card backgrounds and no focused-card border. The trusted
renderer retains a 110% focused-card scale and readable selected caption. Five
visible columns are fixed. Clock/date sizes are set in CSS. Settings/recovery
remain standard and suspend the effects.

## Rebuild from source

From the main checkout, after committing the theme source:

```sh
npm ci --ignore-scripts --no-audit --no-fund
python3 scripts/export-theme-runtime.py --out build/itachi-css-runtime --allow-dirty
node ../clean-your-tv-lg-theme/bin/theme.cjs validate themes/itachi --runtime build/itachi-css-runtime
node scripts/build-itachi-theme.cjs --runtime build/itachi-css-runtime --out build/itachi-theme-1.0.0
```

Use fresh export/build output paths on another run. The sibling author toolkit is
required only to build; the extracted sharing package uses Node standard modules.
See LICENSE.txt/CREDITS.txt for wallpaper provenance.

## По-русски

Тема меняет исходные иконки только через CSS, без подмены файлов. Чёткость Netflix
остаётся исходной. Эффект белого логотипа подходит для светлого или прозрачного
фона; для однотонных цветных фонов есть приближённое выделение контрастом, сложные картинки могут потерять детали. Нужен обновлённый Home с поддержкой
`modern-icon-css-v1` и браузер с CSS filter/screen; старый Home тему не примет.
Для передачи распакуйте ZIP, запустите share.command/share.cmd (Node.js 22+) и
введите адрес/PIN из терминала в разделе получения темы с компьютера на ТВ.
На физическом телевизоре этот кандидат ещё не проверен.
