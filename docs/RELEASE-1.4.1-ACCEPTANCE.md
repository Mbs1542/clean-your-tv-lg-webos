# 1.4.1 scoped C3 update and rollback acceptance

C3 signed candidate acceptance, 2026-10-28: OLED55C3RLA, firmware 43.21.71, webOS 11.2.0; macOS ARM64 host, remote model not recorded. Candidate source 3d5e0cb0, build 40562857636, production signing run 40564937758 with publish=false. The separately authorized acceptance controller admitted the signed offer; the unchanged System Updater 1.1.0 worker upgraded Root 0.4.0 to 0.5.1 and Root Updater 0.3.0 to 0.3.2, completed real launcher/profile health, then completed ordinary retained rollback. The full profile matched before/after both operations; all 27 supervisor hashes, 40 Root recovery hashes and the local baseline matched the original after rollback. Initial Root off was preserved. After explicitly enabling Root, the owner confirmed Home, arrows/OK/Back, app launch, volume/audio and triple-Home emergency off; controls/audio were confirmed again after rollback. Final state is Root off with LG Home routing. No pinned code/key, public feed or published asset was changed. Normal public-feed discovery, anonymous downloads, automatic timeout rollback, standby/cold boot, firmware blocking and other devices were not tested. This is scoped candidate acceptance, not public delivery or universal compatibility.

## Latest scoped acceptance: source eeb4b8b0

C3 candidate acceptance, 2026-10-28: OLED55C3RLA, firmware 43.21.71 / webOS 11.2.0; macOS ARM64 host; remote model unknown. Source eeb4b8b0, build 40643645644, signing 40644813064 (publish=false). Signed acceptance admission and the unchanged System Updater 1.1.0 worker upgraded Root 0.4.0 to 0.5.1 and Updater 0.3.0 to 0.3.2, preserving the full profile. The owner confirmed navigation, app launch, short Home, volume/audio and settings fit/focus. Power-button wake showed LG Home before delayed Clean Your TV and reset uptime; seamless standby is not established. Physical AC boot showed Live TV then Clean Your TV; after one minute Home/buttons/audio worked. Triple Home disabled interception and remained off. Ordinary retained rollback restored original versions, full profile, all 27 supervisor/40 Root recovery hashes and Homebrew settings; the owner confirmed controls/audio and LG Home routing. Firmware lifecycle, indicator-state and column-count device matrices, automatic timeout rollback, public-feed discovery and other devices remain unverified. Final Root state is off. Stable remains 1.4.0.

- [Owner-approved issue report](https://github.com/Razdva122/clean-your-tv-lg-webos/issues/115#issuecomment-6462650356).
- [Candidate build 40643645644](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40643645644).
- [Production signing with publish=false, 40644813064](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40644813064).

## Earlier-source evidence references

- [Candidate build 40562857636](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40562857636).
- [Production signing with publish=false](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40564937758).
- [Acceptance controller PR #127](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/127).
- [Candidate scope and remaining gates](RELEASE-1.4.1.md).

The earlier-source signing draft was removed. The latest signing draft remains unpublished; signed package evidence remains private locally. Public stable remains 1.4.0. Neither scoped record finalizes the overall release acceptance or satisfies final-head platform/publication gates.
