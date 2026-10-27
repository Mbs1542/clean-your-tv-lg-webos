# Development and technical references

[User documentation](../README.md) · [Contributing](../../CONTRIBUTING.md) ·
[Historical records](../history/README.md)

These references are for source builds, diagnosis and maintenance. You do not need
to run their commands to use the graphical installer. Read the current user guide
before using a low-level recovery or installation procedure.

## Build and run from source

- [Build requirements and packages](../BUILD.md), [TV web compatibility](../TV-WEB-BUILD.md), and [desktop build/previews](DESKTOP-BUILD.md).
- [CLI reference](../CLI.md), [manual installation](../MANUAL_INSTALL.md), [Android development](../../android/DEVELOPMENT.md).
- [Root bundle](../../root-edition/package/README.md), [Root development](../../root-edition/DEVELOPMENT.md), [Root runtime contract](../../root-edition/runtime/README.md).
- [Homebrew Installer](../../homebrew/README.md) is **unreleased**; [packaging and promotion gates](../../homebrew/DEVELOPMENT.md).

## Understand behavior and diagnose failures

- [Companion entry points](../COMPANION-APPS.md), [Helper diagnostics](../HELPER-DIAGNOSTICS.md), [Home/settings diagnostics](../SETTINGS-DIAGNOSTICS.md).
- [Root doctor](../../root-edition/DOCTOR.md), [current Root limits](../../root-edition/STATUS.md), [Root validation](../../root-edition/TESTING.md).
- [Interrupted Root installation](../ROOT-INSTALL-CANCELLATION.md), [private Python](../OPTIONAL-PYTHON.md), [native cache cleanup](../WAM-CLEANUP.md).
- [Firmware update control](../LG-FIRMWARE-UPDATES.md), [experimental HDMI sound recovery](ROOT-AUDIO-RECOVERY.md), [Developer Mode renewal Beta](../DEVELOPER-MODE-BETA.md).
- [TLS trust](../TLS-TRUST.md), [icons](../../assets/icons/README.md), [brand assets](../../assets/brand/README.md), [published Helper baseline](../../native/published/README.md).

## Release and update maintenance

- [Release integration flow](../RELEASE-FLOW.md), [release checklist](../RELEASE_CHECKLIST.md), [packaging/signing/publication](../RELEASE-PROCESS.md).
- [Current update guidance](../UPDATES.md), [Root updater](../../root-edition/UPDATES.md), [legacy Home-only updater procedures](LEGACY-HOME-UPDATES.md).
- [Private signed Root candidate acceptance](SIGNED-ROOT-CANDIDATE-ACCEPTANCE.md): explicit pre-publication admission without changing the installed supervisor or stable feed.
- [Original 1.3.0 OTA contract correction](ROOT-OTA-13-COMPATIBILITY.md), [update lab runbook](UPDATE-LAB-RUNBOOK.md), [remaining transaction work](UPDATE-TRANSACTION-REMAINING.md).
- [Root cold-boot investigation](ROOT-COLD-BOOT.md), [Home readback boundary](ROOT-HOME-READBACK.md), [Homebrew acceptance matrix](HOMEBREW-INSTALL-ACCEPTANCE.md).

## Evidence and old designs

Dated validation, investigation, design and implementation records describe their
original scope. They are not an alternative set of current instructions. Find them
through [history](../history/README.md); preserve their links and results when
updating a current guide.

Do not append release-by-release stories to user guides. Update the current task
instruction and link a dated record when its evidence matters. Keep unpublished
features clearly separate and retain recovery safeguards. Agent-assisted reports
follow [explicit user consent](../../AGENTS.md#installation-results-and-user-consent).
