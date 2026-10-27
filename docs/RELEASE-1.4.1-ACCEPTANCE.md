# 1.4.1 scoped C3 update and rollback acceptance

C3 signed candidate acceptance, 2026-10-28: OLED55C3RLA, firmware 43.21.71, webOS 11.2.0; macOS ARM64 host, remote model not recorded. Candidate source 3d5e0cb0, build 40562857636, production signing run 40564937758 with publish=false. The separately authorized acceptance controller admitted the signed offer; the unchanged System Updater 1.1.0 worker upgraded Root 0.4.0 to 0.5.1 and Root Updater 0.3.0 to 0.3.2, completed real launcher/profile health, then completed ordinary retained rollback. The full profile matched before/after both operations; all 27 supervisor hashes, 40 Root recovery hashes and the local baseline matched the original after rollback. Initial Root off was preserved. After explicitly enabling Root, the owner confirmed Home, arrows/OK/Back, app launch, volume/audio and triple-Home emergency off; controls/audio were confirmed again after rollback. Final state is Root off with LG Home routing. No pinned code/key, public feed or published asset was changed. Normal public-feed discovery, anonymous downloads, automatic timeout rollback, standby/cold boot, firmware blocking and other devices were not tested. This is scoped candidate acceptance, not public delivery or universal compatibility.

## Evidence references

- [Candidate build 40562857636](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40562857636).
- [Production signing with publish=false](https://github.com/Razdva122/clean-your-tv-lg-webos/actions/runs/40564937758).
- [Acceptance controller PR #127](https://github.com/Razdva122/clean-your-tv-lg-webos/pull/127).
- [Candidate scope and remaining gates](RELEASE-1.4.1.md).

The temporary unpublished signing draft has been removed; signed evidence remains private locally. Public stable remains 1.4.0. This record does not finalize the overall release acceptance or satisfy final-head platform/publication gates.
