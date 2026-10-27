# Recover TV controls or an interrupted installation

## Return to LG Home

Press Home **three times within two seconds**, releasing between presses. This
stops Home interception and opens LG Home; it preserves preferences. Helper
through 0.6.13 uses holding Home for about two seconds instead.

The emergency stop persists across startup. To resume No-root, open **Home Helper**,
choose **Start Helper** and confirm. To resume Root, turn **Change Home** on in
Home settings. Opening Home alone does not restart a stopped Helper.
**Open LG Home** only visits LG Home once; it keeps the saved Home choice.

If controls fail again, leave LG Home active and save diagnostics. Do not repeatedly
clear stop flags after a fault. A Quick Access assignment to Home offers another
way to open it, but does not restart Helper.

## Interrupted setup or removal

<a id="interrupted-setup-or-removal-in-110"></a>
<a id="interrupted-no-root-installation-in-the-unpublished-140-candidate"></a>

1. In cytv, select the **same saved TV connection** and choose **Check TV status**.
2. For No-root, use **Recover and reinstall** if offered. Review the separate
   removal confirmation; the default is No. Removal can reset Home preferences.
3. For Root, use **Finish Root setup** only when offered for a verified installation.
4. If recovery fails or the result is uncertain, choose **Save diagnostic report…**
   and stop. Retain that attempt's report and recovery files.

Recovery checks installer state and removal results before offering installation.
An unknown package outcome is not automatically retried. Returning to LG Home
alone does not finish removal. The removal confirmation cannot be bypassed with
`--yes` or approved by noninteractive setup.

Console users: run `cytv status` with the same profile, then
`cytv doctor --report`. [CLI recovery details](CLI.md#interrupted-operations).
Status, restore and removal do not download Python; referenced recovery runtimes
are retained. For Root routing recovery, use the
[Root restore commands](../root-edition/ROLLOUT.md#controls-and-recovery).

## Private Python and low /var space

Root Python preparation checks ABI, directory safety and free space separately.
The initial threshold is **320 MiB**; later staging can require more. Reusing an
existing runtime still requires verification. Freeing space cannot fix ABI or
ownership failures; do not lower thresholds or change ownership broadly.

On an already rooted TV, these SSH commands inspect space without deleting data:

```sh
df -Pk /var/lib
du -xsk "/var/lib/wam/Default/Session Storage"
```

Check the filesystem containing `/var/lib`. `/var/palm` can be a separate mount;
`du -x` avoids counting other mounted filesystems. Removing apps may free a
different partition.

For cache cleanup, use cytv's explicit Root maintenance action and read
[WAM cleanup](WAM-CLEANUP.md). It only requests native `cache` and `codecache`
cleanup; it does not clear Session Storage, reboot or resume installation.
**Session Storage contains app session state**: deleting it can lose sessions or
unsaved work. A safe manual procedure must prevent WAM writers and respawns;
closing visible apps alone is insufficient. Leave Local Storage, Service Worker,
databases, Python slots and recovery records alone. Recheck space after cleanup;
reclaimed space does not prove Root or Python installation succeeded.

## No-root source installations

For one-script installs, run commands from the repository folder and expose the
local webOS CLI:

```sh
export PATH="$PWD/build/tools/node_modules/.bin:$PATH"
```

Replace `lgtv` below with your device name. The script default is
`clean-your-tv-<IP-with-dashes>`, such as `clean-your-tv-192-168-1-50`, unless you
set `DEVICE`. Manual installs use `lgtv`.

To open Helper explicitly:

```sh
ares-launch -d lgtv com.local.nativehome
```

If a quick power cycle leaves tiles unresponsive, use triple Home and check arrows
on LG Home. Report the Helper version and whether it happens with Helper stopped.
Test standby and cold boot separately. [Compatibility and known limits](COMPATIBILITY.md).

<!-- Anchors retained for links to earlier guide headings. -->
<a id="no-root-controls-and-recovery"></a>
