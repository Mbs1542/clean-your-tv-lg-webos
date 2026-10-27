# Recover Root Edition

## Restore LG Home

Press **Home three times within two seconds**, releasing between presses, or
turn **Home settings → Change Home** off. This disables Root intent and restores
LG routing; explicit activation is required to turn Root on again.
To return to No-root, verify LG routing first, then explicitly open Home Helper.
Root recovery never resumes it automatically.

From the computer with the retained TV connection:

```sh
cytv status
cytv doctor --report
cytv restore
cytv status
```

Status and doctor are read-only. Restore requests a routing change; inspect its
result rather than assuming completion. These commands never provision Python.
Keep referenced `/var/lib/clean-your-tv-python/` slots even after app removal.

## After an interrupted operation

Preserve the original operation ID, journals, LS2 snapshots, baselines and retained
drivers. Unknown package outcomes require diagnosis; installed versions or an
idle installer do not replace a matching terminal receipt. Do not resubmit setup,
overwrite private code/pins, delete state or manually seed a Home setting.
For supported exact-operation continuation and removal, use
[manual recovery](../docs/MANUAL_INSTALL.md#candidate-shared-product-continuation)
and [CLI recovery](../docs/CLI.md#interrupted-operations).

For update failure, open **Root Updater** or **Software updates → Recovery**.
Verified whole-edition rollback restores components and the pre-update profile;
later settings changes can be lost. Availability depends on retained transaction
evidence. See [update recovery](UPDATES.md#failure-and-recovery).

Original 1.3.0 supervisor users must read [the 1.4.0 OTA block](UPDATES.md).
Other devices retain their own [acceptance limits](STATUS.md).

## Recovery design history

The [original metadata-recovery investigation](HISTORY-RECOVERY.md) is retained
verbatim for evidence. It describes historical manifest work, not a current TV
modification procedure. Current Root uses an isolated package and a verified
[runtime recovery contract](runtime/README.md).

<a id="110-runtime-and-update-recovery"></a>
**1.1.0 runtime and update recovery.** See [HISTORY-RECOVERY.md](HISTORY-RECOVERY.md#110-runtime-and-update-recovery).

<a id="one-transaction-four-things-to-restore"></a>
**One transaction, four things to restore.** See [HISTORY-RECOVERY.md](HISTORY-RECOVERY.md#one-transaction-four-things-to-restore).

<a id="before-activation"></a>
**Before activation.** See [HISTORY-RECOVERY.md](HISTORY-RECOVERY.md#before-activation).

<a id="recovery-triggers"></a>
**Recovery triggers.** See [HISTORY-RECOVERY.md](HISTORY-RECOVERY.md#recovery-triggers).

<a id="offline-metadata-preparation"></a>
**Offline metadata preparation.** See [HISTORY-RECOVERY.md](HISTORY-RECOVERY.md#offline-metadata-preparation).

<!-- Anchors retained for links to earlier guide headings. -->
<a id="root-edition-recovery-contract"></a>
