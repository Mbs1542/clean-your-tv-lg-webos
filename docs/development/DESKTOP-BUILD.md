# Desktop build and previews

Developer reference. For installation, use [desktop setup](../DESKTOP_INSTALL.md).

## Build and validation

Install `cytv/build-requirements.txt`, then run:

```sh
python scripts/build-cytv.py --desktop
```

Build natively on each target. macOS creates `dist/desktop/cytv.app` and an
architecture-specific ZIP. Linux x64 creates `dist/cytv-linux-x64.deb` with a
`Terminal=false` application-menu entry. Windows creates
`dist/cytv-windows-x64-desktop.zip`, containing `cytv-desktop/cytv-desktop.exe`
and its `_internal` runtime. It uses a native PyInstaller windowed directory build;
the console build remains separate. Windows CI extracts the ZIP and runs its
offline smoke check; release assembly includes the desktop ZIP.

Every desktop build verifies its embedded payload and launches the frozen window
with an offline `--smoke-test`; this does not contact a TV. Widget tests cover
selection, secret entry, safe cancellation and destructive confirmation defaults.
The Qt libraries remain separate dynamic files in the app/package.

### Offline interface previews

With desktop dependencies installed, `python scripts/preview-installer.py --language ru`
saves screenshots of the real Qt widgets to `build/installer-preview/`. These use
sample TV data and do not discover, connect to, or modify a TV. Add `--all-locales`
to capture every supported language at the minimum window size.
