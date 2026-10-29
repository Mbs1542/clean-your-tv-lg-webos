# Choose and install themes

These controls are implemented in the **theme-enabled development candidate**, prepared for the next release cycle. Published packages may not include them yet. If Settings has no Themes entry, use a package from that candidate after its normal release/acceptance; copying a link into an older Home cannot add the feature. Physical-TV acceptance is still required.

## Included with Home

**Classic** and **Alpine** are built into both No-root and Root editions. They work without downloading a theme. Classic remains the initial default. Alpine has a mountain panorama, a large clock and one looping horizontal app ribbon. Its fixed eight-slot composition hides the Columns setting while active. Your saved column preference returns when you switch to an adjustable theme.

**Channel** is an ordinary external theme in showcase. It is not part of the TV package. It uses a numbered list, selected-app artwork and pixel shortcut icons; its one-column default can be overridden by the user.

## Change to an included theme

1. Open Home, select **Settings**, then **Themes**. Home stays visible beneath a compact picker of installed themes.
2. Choose **Classic** or **Alpine** in the installed list. The choice applies and saves immediately, without a confirmation timer. Downloaded themes in this list work the same way.
3. Return with **Back**, then **Back to Home**.

The accepted choice is restored on the next launch. Only **Try theme** inside **Theme showcase** starts a 20-second trial, including for cached versions. If Home closes during an unconfirmed showcase trial, the next launch starts Classic. Changing appearance does not replace your app order, hidden apps, inputs or Home-button routing. Settings, confirmations and recovery keep their standard appearance.

## Browse themes on TV

Open **Settings → Themes → Theme showcase**. Choose a miniature preview to see the theme's details. Classic and Alpine offer **Try theme** immediately; Channel offers **Download theme**, then **Try theme**. Confirm **Keep theme** within 20 seconds. Downloading alone never changes Home.

Opening Theme showcase or choosing Refresh checks the main project repository for reviewed catalogue updates without updating Home or reloading the page. After a normal merge, new entries become available; an unmerged candidate may still show the bundled fallback. Offline or failed requests use bundled previews and entries. Built-in themes match your installed Home version. Online catalogue data and previews come from one exact project commit resolved through GitHub; downloading an external theme needs Internet access. A downloaded exact version is reused instead of fetched again. Theme files come from the recorded, commit-pinned source repository. Refreshing never installs a theme or changes the current selection. Physical-TV network acceptance remains pending.

## Transfer a theme from your computer

No showcase submission, public repository or source commit is required for a local development test.

1. Run your theme in the author toolkit's **preview** or **showcase**. Choose the theme and press **Send to TV**. The toolkit compiles the current source into a fixed snapshot; saving another edit does not silently change that snapshot.
2. On TV open **Settings → Themes → Receive from computer**.
3. Enter the private IPv4 **Computer address** shown by the preview and its **Six-digit PIN**. Do not enter `http://`, a port or a file path. The address is remembered after a successful transfer; the PIN is never remembered.
4. Choose **Receive theme**, then **Try theme** to apply and save the installed copy immediately, without a timer. The installed copy works offline after the computer stops sharing.
5. After editing, press **Send to TV** again for a fresh snapshot and PIN. **Stop sharing**, closing the preview server or the ten-minute deadline closes access.

Both devices must be on the same trusted home network, with client isolation disabled and the computer firewall allowing TCP **8879**. The transfer uses local HTTP, not a cloud service; do not use an untrusted/shared network. Only compiled theme files are served, not the repository or source directory. The PIN limits casual access; it is not encryption. If several addresses are shown, use the interface connected to the TV's network. VPNs or a changed computer address may require selecting a different address. Native webOS network/origin and keyboard behavior still require physical-TV acceptance.

CLI alternative from the toolkit:

```sh
npm run theme -- share ./my-theme --runtime .runtime/candidate
```

Keep the command running and use the address and PIN it prints. Press Ctrl+C to stop it. See the toolkit walkthrough for preparing the candidate runtime.

## Add another repository by URL

1. Browse the main project's showcase (the **Theme showcase** link on Preview Pages). Open a theme detail page and use **Copy TV link**. Transfer that exact URL using the TV keyboard or your normal TV text-entry method; the computer transfer above is the easier path for unpublished local work.
2. On TV, open **Settings → Themes → Add by URL**. Focus **Theme URL** and use OK/native keyboard to type or paste. Move to **Load** and select it.
3. Choose the returned theme. For a repository containing several themes, choose the specific entry; the installer does not select one silently. The download progress is shown. Cancel or Back stops the request.
4. After validation/saving, choose the new **Downloaded** version in Themes. Review its author/license and select it to apply and save immediately, without a timer.

Supported inputs are a public `https://github.com/OWNER/REPOSITORY` (collection index or single descriptor at its root) or an exact commit-pinned raw GitHub descriptor/collection URL. The showcase provides the second form. Private repositories, credentials, arbitrary hosts, moving raw URLs and install scripts are not accepted. Several themes may share one repository.

The installer verifies API/Home version, rule/asset limits, file sizes and SHA-256, image dimensions and actual decode. A failed download, incompatible theme or insufficient storage does not replace the current accepted theme. Source verification checks integrity, not author trust; prefer reviewed sources and inspect the supplied credits/license.

## Offline use, update and removal

After a successful install, files are stored in this Home application's IndexedDB cache. A normal restart does not contact the author. The TV still needs network access for apps and services that require it; the theme itself can be restored offline.

To update, install a new reviewed catalogue version, use a new version's link, or transfer a fresh development snapshot; select the installed version, or try and keep it through showcase. Updates are explicit: installed themes do not follow GitHub branches automatically. Several versions may be cached independently. Switch away from an active version before selecting **Remove** beside it.

The cache is bounded at eight downloaded versions and 24 MiB of payload data, subject to a lower device quota. Remove inactive versions if saving fails. **Clear downloaded themes** asks for confirmation, restores Classic and clears only this theme cache. Built-ins cannot be removed.

## Recovery

Open **Settings → Themes → Restore Classic** to discard theme appearance immediately. An interrupted trial/startup or invalid accepted theme also returns to Classic on the next launch. The downloaded library is retained unless you clear it. Use the existing emergency Home exit/recovery instructions if Home itself cannot be opened; theme recovery does not change that emergency mechanism.

Theme images/choice are not included in legacy profile backup/export. An authoritative profile restore resets the accepted theme to Classic; downloaded packages remain available for reselection if app storage is intact. Removing the application or resetting app data may erase its cache. Device storage behavior across updates, standby and cold boot still requires hardware acceptance.

## If something goes wrong

| Problem | Action |
| --- | --- |
| No Themes entry | This Home package does not include the theme-enabled candidate. |
| Link rejected | Copy the pinned raw descriptor from showcase, or use a public repository root with the documented index. |
| Download/network error | Check connectivity and source availability; GitHub API rate limits, CORS or old TV TLS can block access. Built-ins remain usable. |
| Hash/image/API error | Keep the accepted theme; ask the author for a new valid distribution. Do not disable verification. |
| Storage error | Remove inactive downloaded versions, or restore Classic and clear the theme cache. |
| New theme is unreadable | During a showcase trial, use Revert/Back or wait 20 seconds. For an installed choice, open Themes and select Classic or Restore Classic. An interrupted trial/startup recovers to Classic on relaunch. |

## Create a theme and preview on a computer

Use [the author toolkit](https://github.com/Razdva122/clean-your-tv-lg-theme) and its [author walkthrough](https://github.com/Razdva122/clean-your-tv-lg-theme/blob/codex/example-theme-gallery/docs/tutorial.md). The toolkit's local showcase is an author preview, separate from on-TV installed selection. Apps/services are simulated; it does not establish TV compatibility. See [submission rules](../showcase/README.md) to request a public listing. Personal installation does not require a showcase PR.

From the main checkout, build the preview website including the catalog into a fresh directory:

```sh
python3 scripts/preview.py --build build/theme-site --showcase
python3 -m http.server 8878 --bind 127.0.0.1 --directory build/theme-site
```

Open **http://127.0.0.1:8878/** to exercise Home/Settings, or `/themes/` for the catalog. Browser storage is separate from your TV. Developer details: [TV theme lifecycle](development/TV-THEMES.md), [CSS API](development/THEME-CSS.md), [candidate status](development/THEMES.md).
