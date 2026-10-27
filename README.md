![Clean Your TV — for LG webOS](assets/brand/readme-logo.png#gh-light-mode-only)
![Clean Your TV — for LG webOS](assets/brand/readme-logo-dark.png#gh-dark-mode-only)

# Clean Your TV

A personal home screen for LG webOS: your apps, your order, and a configurable
dock, without sponsored rows in this launcher. It runs on the TV; your computer
can be switched off after setup. It does not remove advertisements from other
LG screens or obtain root access.

[Try the browser demo](https://razdva122.github.io/clean-your-tv-lg-webos/) ·
[Installation guide](docs/INSTALL.md) · [Help and recovery](docs/RECOVERY.md)

![Example app grid and dock](docs/launcher-menu.png)

*Example layout; apps are not bundled. The browser demo simulates TV behavior.*

## Choose your edition

| Your TV setup | Edition |
| --- | --- |
| LG Developer Mode, without root | **No-root** — Home and the on-TV Home Helper. Keep Developer Mode active. |
| Existing root access and trusted root SSH | **Root** — native Home routing and independent recovery. Do not enable Developer Mode over root. |

Both use the same launcher. Compatibility depends on the model, firmware and
remote: [check requirements and known limits](docs/COMPATIBILITY.md) first.

## Download and install

<!-- release:downloads -->
Current stable release: **[v1.4.0](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/tag/v1.4.0)** — [release notes](docs/RELEASE-1.4.0.md).
<!-- /release:downloads -->

[![Download Windows x64 graphical installer — GUI ZIP](assets/brand/downloads/windows.svg)](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/latest/download/cytv-windows-x64-desktop.zip)
[![Download macOS Apple Silicon graphical installer — ZIP](assets/brand/downloads/macos-arm64.svg)](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/latest/download/cytv-macos-arm64.zip)
[![Download macOS Intel graphical installer — ZIP](assets/brand/downloads/macos-x64.svg)](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/latest/download/cytv-macos-x64.zip)
[![Download Linux x64 graphical installer — DEB](assets/brand/downloads/linux.svg)](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/latest/download/cytv-linux-x64.deb)
[![Download Android ARM64 installer — APK](assets/brand/downloads/android.svg)](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/latest/download/cytv-android-arm64.apk)

1. Download the installer for your computer or an ARM64 Android phone. The buttons follow the latest published release.
2. Prepare TV access and choose No-root or Root in the wizard.
3. Install, then check Home, Back, normal controls and emergency exit before daily use.

**[Follow the installation guide →](docs/INSTALL.md)**

Windows: extract the whole ZIP before opening the app. macOS: choose Apple Silicon
or Intel to match your Mac. See [desktop instructions](docs/DESKTOP_INSTALL.md)
or [Android requirements](android/README.md) for platform details.

## Everyday use

- **Home** opens your launcher while Home control is enabled.
- **Hold OK** on a tile to move or hide it; **+ / Add app** adds an installed app to the grid.
- **Press Home three times within two seconds** to stop Home control and return to LG Home. This does not erase settings.
- After an emergency exit, resume explicitly through **Home Helper** (No-root) or the Root activation control. Opening Home alone does not clear the stop.

[Remote controls](docs/CONTROLS.md) · [Arrange apps](docs/APP-MANAGEMENT.md) ·
[Update or remove](docs/MAINTENANCE.md)

## Before you rely on it

- Test results are specific to devices and versions. Read [compatibility](docs/COMPATIBILITY.md); a successful install alone does not prove daily reliability.
- The original **1.3.0 Root updater cannot install 1.4.0 through OTA**. Keep recovery records and read [the update limitations](docs/UPDATES.md) before attempting that transition.
- No-root needs an active Developer Mode session. Automatic renewal is optional Beta; continue monitoring LG's official timer.
- The on-TV **Homebrew Installer is unreleased**. Use the published computer/Android installer; [candidate details](homebrew/README.md) are for coordinated testing.

## Guides and help

[All documentation](docs/README.md) · [Guides in 12 languages](docs/LANGUAGES.md) ·
[Report a problem or a successful installation](docs/FEEDBACK.md)

If an AI agent helps with installation, it should prepare a short, redacted result
and ask your permission before posting an issue. See [instructions for agents](AGENTS.md#installation-results-and-user-consent).

For contributors: [build and technical references](docs/development/README.md),
[contributing](CONTRIBUTING.md), and [release history and test evidence](docs/history/README.md).

<details>
<summary>Versions in the stable download</summary>

<!-- release:components -->
| Component | Stable version |
| --- | --- |
| cytv installer | 0.5.0 |
| Home | 1.5.0 |
| Home Helper | 0.6.19 |
| Root edition | 0.5.0 |
| Both edition Updaters | 0.3.1 |
| Android installer / versionCode | 0.4.0 / 13 |
<!-- /release:components -->

System Updater: 1.1.0 / protocol 1. See the [release notes](docs/RELEASE-1.4.0.md)
and [C3 acceptance and limits](docs/RELEASE-1.4.0-ACCEPTANCE.md).

</details>

## Credits and license

Built on [OmkarK97/webos-vibehack](https://github.com/OmkarK97/webos-vibehack)
and [Gathin23/cleanyourtv](https://github.com/Gathin23/cleanyourtv).
Not affiliated with LG. [MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md).

<!-- Anchors retained for links to earlier guide headings. -->
<a id="clean-your-tv--lg-webos"></a>
<a id="languages"></a>
<a id="install-with-cytv"></a>
<a id="candidate-install-root-from-the-tv"></a>
<a id="what-you-need"></a>
<a id="what-it-does"></a>
<a id="how-it-works"></a>
<a id="remote-control-guide"></a>
<a id="resume-after-an-emergency-exit"></a>
<a id="get-started"></a>
<a id="no-root-source-installation"></a>
<a id="browser-preview"></a>
<a id="run-locally"></a>
<a id="developer-mode-auto-renewal--beta"></a>
<a id="current-components-and-hardware-evidence"></a>
<a id="project-layout"></a>
<a id="credits"></a>
<a id="software-updates"></a>
