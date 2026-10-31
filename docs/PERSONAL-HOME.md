# Personal Home build

This fork adds an optional personal layer to the No-root edition: media rows, a power-on photo, a photo
screensaver and automatic power-off. All of it is off until `launcher/personal.js` exists. Without that
file the launcher builds and behaves like upstream.

The work was verified on one set only, running webOS TV Lite 8.4.9 with firmware 13.48.25. That is not
evidence for other models.

## What it adds

| Feature | Files | Behaviour |
| --- | --- | --- |
| Media rows | `launcher/media-feed.js`, `media-feed.css` | Continue on Stremio, continue on Jellyfin, popular on Stremio, recently added on Jellyfin. OK opens the app, not the title, because neither app reads launch parameters. |
| Hebrew and right-to-left | `launcher/he-catalog.js`, `launcher/i18n.js`, `launcher/app.js` | Hebrew strings and a mirrored dock. Set `language: 'he'`. |
| Weather | `launcher/media-feed.js` | Current weather in the header, from `latitude` and `longitude`. |
| Power-on photo (optional) | `launcher/intro.js` | Off without `intro` in `personal.js`. Shown for 4 seconds, counted only while visible. A key press only dismisses it. |
| Loading image (optional) | `scripts/build.sh` | If `personal-splash.png` exists, it replaces `splash.png` in the staged package only. |
| Screensaver and power-off | `launcher/idle-policy.js`, `launcher/screen-saver.js` | Crossfading photos, then power-off. Time counts only while Home is on screen. A press that clears the photos does nothing else. |

Helper changes in the same branch:

- The maker's boot ad (`com.webos.app.bootingad`) no longer cancels the return to Home after power-on.
- Leaving any app outside `com.webos`, `com.palm` and `com.lge` returns to Home, including apps installed
  after setup.
- Key presses queued during power-on no longer open an app (`holdActivation()` in `launcher/app.js`).
- A dock changed in the build overrides the saved order once, through `tvhome.dock.applied`, without
  unhiding apps.

## Configuration

Copy `launcher/personal.example.js` to `launcher/personal.js` and rebuild. These private files are
gitignored and end up inside the IPK on the TV:

| File | Holds |
| --- | --- |
| `launcher/personal.js` | Language, Jellyfin URL, user id and API key, Stremio `authKey`, weather position, intro path, saver timers and photo list, dock |
| `launcher/personal-intro.jpg` | Power-on photo, optional |
| `launcher/personal-splash.png` | Loading image, optional |
| `launcher/personal-saver/` | Screensaver photos |
| `launcher/apps.js` | The TV's app list, written by setup |
| `.lgtv-key.json` | SSAP pairing key |

Use a Jellyfin API key made for this TV alone, so it can be revoked without touching anything else.

Saver timers are `afterMs` and `offAfterMs` in `saver`. `0` turns either one off. Photos and timers are
read at build time, so changing them means a rebuild.

## Implementation notes

- **Sleep is not inactivity.** `idle-policy.js` treats a gap of more than 10 seconds between one-second
  ticks as the TV having slept, and restarts the count. Otherwise the TV would power off as it wakes.
- **Power-off goes through the helper.** A web app calling `tvpower` has no effect on this firmware. The
  path is Home, then the `powerOff` method of `com.gathin.tvhome.renewal`, then the helper, which sends
  `ssap://system/turnOff` on its registered connection.
- **Jellyfin may be asleep.** A proxy that wakes it can answer `200` with HTML, so only a JSON answer counts.
- **Stremio's library.** Titles played outside the library come back as `removed` and `temp`, so the row
  filters on `!removed || temp`. Past 90% counts as finished.
- **New launcher files** must also be listed in `scripts/preview.py` (both lists) and `root-edition/preview.py`.

## Build and test

```bash
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt -r cytv/requirements.txt
bash scripts/build.sh
bash scripts/test.sh ui tv installer setup android preview
```

`scripts/build.sh` needs `ZIG` pointing at the binary from the `ziglang` Python package, and the webOS CLI
on `PATH`. Packages are written to `dist/`.

## Limits

These cannot be changed without root:

- The system "Home loading" screen.
- The maker's logo and boot ad.
- Developer Mode itself. Its session must be renewed, and losing it deletes every sideloaded app.

## Keeping up with upstream

`main` here carries this work, so it no longer matches upstream's `main`. Bring upstream in with
`git fetch upstream && git merge upstream/main` on `mbs-home`, then run the full suite. The upstream
release workflows are not meant to run on this fork, and none has run here so far.
