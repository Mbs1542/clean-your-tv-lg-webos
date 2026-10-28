# Themes and the candidate showcase

The theme system is in development. The current public Home release does not install themes from URLs. A screenshot, catalog listing or copied descriptor link does not enable that feature on your TV.

## Browse the catalog

The main project's Preview Pages artifact includes a **Theme showcase** link beside the edition controls. The catalog lives at `themes/` relative to that preview, preserving GitHub repository base paths. Publication follows the normal release/Pages workflow; a feature-branch preview is not a published release.

The initial candidate listings are:

| Theme | Appearance | Column policy |
| --- | --- | --- |
| Alpine | Mountain panorama, large clock, looping one-row ribbon, outline shortcut icons | Fixed eight-slot composition |
| Channel | Teletext colors, numbered app list, selected-app artwork, pixel shortcut icons | One column by default; user override allowed |

Classic remains built into Home and is not an external descriptor. The catalog has search, style/API filters, original author/credits, version, browser-review evidence and a detail page for each external theme. **Copy TV link** copies that version's commit-pinned descriptor. No votes, popularity ranking or automatic inclusion in the TV package are implemented.

## Try a theme on a computer

Use [the author toolkit](https://github.com/Razdva122/clean-your-tv-lg-theme), its [complete tutorial](https://github.com/Razdva122/clean-your-tv-lg-theme/blob/codex/example-theme-gallery/docs/tutorial.md) and an explicitly exported candidate runtime. From the toolkit root:

```sh
npm ci --ignore-scripts
npm run theme -- showcase examples --runtime .runtime/candidate --port 8877
```

Open **http://127.0.0.1:8877/**. Click a theme thumbnail, then use mouse or arrows/Enter inside the Home screen. Esc returns; hold Enter to rearrange an app. Keep the terminal running; Ctrl+C stops it. All apps/services are simulated. Saved screenshots can also be opened without a runtime.

## Choose a theme on TV

External theme selection is not in the published application yet. Use the browser preview until the download, verification, persistent storage, trial/recovery and actual on-TV controls are implemented and tested. Do not manually overwrite Home files. The future installer will consume descriptors independently from showcase membership; personal themes will not need a listing.

The candidate already implements author defaults and the shared Columns control: an explicit user choice overrides a theme default unless the theme fixes its composition. Switching back to an adjustable theme restores the saved preference. Settings, confirmations and recovery keep their standard appearance.

## Publish your own theme

Follow [the author walkthrough](https://github.com/Razdva122/clean-your-tv-lg-theme/blob/codex/example-theme-gallery/docs/tutorial.md), then [the main showcase submission rules](../showcase/README.md). A repository may contain many themes; each has its own stable ID, independent version, license/credits, descriptor and review. A PR targets `release/next`. Approval is for exact reviewed bytes, not future commits or every theme in a collection. Browser evidence does not establish TV compatibility.

## Build the complete website locally

From this main checkout with dependencies prepared, choose a fresh output directory:

```sh
python3 scripts/preview.py --build build/theme-site --showcase
python3 -m http.server 8878 --bind 127.0.0.1 --directory build/theme-site
```

Open **http://127.0.0.1:8878/**, then Theme showcase, or open `/themes/` directly. The showcase builder requires an empty destination; use a new build directory on subsequent runs. The static catalog browses reviewed distributions; the toolkit's separate live showcase applies themes to an interactive Home.

Developer details: [CSS API](development/THEME-CSS.md), [candidate gates](development/THEMES.md), [catalog review](../showcase/review/initial-themes.md).
