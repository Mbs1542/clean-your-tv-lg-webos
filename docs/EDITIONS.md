# Choose your edition

Choose **No-root** if your TV uses LG Developer Mode. Choose **Root** only if it
already has working root access. Both editions use the same Home interface and
run on the TV after setup; no everyday computer or phone is needed.

| | No-root | Root |
| --- | --- | --- |
| Setup | LG Developer Mode, Key Server, local pairing | Existing root SSH, supported TV services and input |
| Root access needed | No | Yes; cytv does not obtain root |
| Home button | On-TV Home Helper | System Home routing; stop No-root Helper first |
| Emergency exit | Three short Home presses within two seconds | Three short Home presses within two seconds |
| Resume after emergency exit | Open Home Helper, choose Start Helper and confirm | Turn Change Home on in Home settings |
| Keep working | Extend the Developer Mode session before expiry | Keep recovery and root services available |
| Updates | Computer-assisted on unrooted TVs | Compatible signed edition updates after separate supervisor setup |

**Change Home** controls persistent routing. **Open LG Home** only visits LG Home
once. Older Helper through 0.6.13 uses a two-second Home hold for emergency exit.
Never run Root routing and No-root Helper together or install Developer Mode over
an existing rooted setup. Root uses separate packages; installing it does not
remove ordinary No-root Home.

## Get started

[Install with cytv](INSTALL.md) using the
[published release](https://github.com/Razdva122/clean-your-tv-lg-webos/releases/latest).
For a source build, use [manual installation](MANUAL_INSTALL.md).

Compatibility depends on the TV, firmware and installed build. Most recorded
hardware evidence is from **LG OLED55C3RLA / firmware 43.21.71**; other TVs are
not certified by a successful installation. Root cold-power and complete signed
system update/rollback acceptance remain limited. Early boot black screens are
not resolved. Read [compatibility](COMPATIBILITY.md) before changing a working setup.

[No-root recovery](RECOVERY.md) · [Root controls and recovery](../root-edition/ROLLOUT.md#controls-and-recovery) ·
[Update requirements and current Root OTA warning](UPDATES.md).
