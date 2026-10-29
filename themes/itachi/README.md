# Itachi · Sharingan — CSS-only local candidate 1.0.0

Dark Itachi wallpaper, crimson eyes and a bottom scenic app ribbon. Every app
image remains the original source supplied by Home. There are no replacement
icons, icon mappings, external image downloads, canvas conversions or generated logos.
Fresh installer capture and Root inventory listing prefer an available larger native icon from
the same TV app, with the existing address/path/size limits and fallback. The theme
does not choose a brand-specific file or change application resources.
The theme contains two images only: wallpaper and preview.

## Requirements

Home must include the optional `modern-icon-css-v1` authoring/runtime support
from this change. Its browser must support CSS `filter`, `mix-blend-mode: screen` and `isolation: isolate`. The presence of a Themes menu alone is insufficient. Root has an independent
package version; theme minimum versions are checked against the shared Home
renderer version embedded by the Root build, not the Root package number.
Unsupported browsers/older Home reject the capability before changing appearance.
The general CYTV Chromium 38 floor is unchanged, but this optional theme effect
is not compatible with that oldest browser. This is a local candidate, not a
published CYTV release or a physical-TV compatibility claim.

## Install in the release candidate

Open **Settings → Appearance → Themes → Theme showcase**, choose Itachi and
review/try it. Keep within the confirmation period; accepted files work offline.
The catalogue is included in the next Home candidate, not older published Homes.
For a local ZIP, use the current author toolkit's PC-to-TV push workflow with the
TV receiver code in Appearance. This ZIP contains only data, not an installer or
replacement icons. Select Classic to remove the theme CSS.
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

Netflix stays at the resolution of the native TV resource selected by Home. A vector-derived replacement would
be sharper, but it was explicitly excluded by the user. Sharpening cannot recover
missing detail. No Netflix/YouTube or other brand image is included in the theme.

CSS requests transparent card backgrounds and no focused-card border. The trusted
renderer retains a 110% focused-card scale and readable selected caption. Five
visible columns are fixed. CSS enlarges the original image paint by 1.6×, or 2×
for wide images and 1.25× for transparent glyphs; original resolution is unchanged. Clock/date sizes are set in CSS. Settings/recovery
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
required only to build; the delivered theme contains data only.
See LICENSE.txt/CREDITS.txt for wallpaper provenance.

## По-русски

Тема меняет исходные иконки только через CSS, без подмены файлов. Чёткость Netflix
остаётся исходной. Эффект белого логотипа подходит для светлого или прозрачного
фона; для однотонных цветных фонов есть приближённое выделение контрастом, сложные картинки могут потерять детали. Нужен обновлённый Home с поддержкой
`modern-icon-css-v1` и браузер с CSS filter/screen; старый Home тему не примет.
В следующем кандидате: Настройки → Оформление → Темы → Showcase → Itachi.
ZIP можно передать через актуальный авторский toolkit с кодом приёмника ТВ.
На физическом телевизоре эта тема ещё не проверена.
