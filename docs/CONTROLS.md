# Remote controls and emergency exit

[Documentation](README.md) · [Recovery](RECOVERY.md)

## Use Home

| Control | Result |
| --- | --- |
| Arrows, OK or pointer | Navigate and open apps. |
| Hold OK on a tile | Move or hide it; Back cancels. [Details](APP-MANAGEMENT.md). |
| Short Home | Open your launcher while Home control is enabled. |
| Short Back | Normal app navigation and exit confirmation. |
| Volume, mute, power | Normal TV controls. Standby and a true cold boot are different test paths. |

The Magic Remote pointer and wheel pass through. Wheel-to-tile navigation is not
implemented. The launcher does not take over app-specific Back behavior.

## Return to LG Home

**Press Home three times within two seconds.** Home interception stops and LG
Home opens. Saved preferences remain. On legacy No-root Helper versions through
0.6.13, use a two-second Home hold instead.

Do this once after installation so you know the recovery path works on your TV.
If controls are still unavailable, stop setup and use [recovery](RECOVERY.md).

## Resume deliberately

- **No-root:** open Home Helper from LG's app list and confirm starting Home control.
- **Root:** use the documented Root activation control after checking the retained status.

Opening the launcher alone does not clear an emergency stop. Regular control is
also available through the **Change Home** setting. Do not reset recovery data or
remove stop files to force activation.

## Back, app exits and startup

Holding Back uses webOS's app exit behavior; it is not the emergency-stop gesture.
The No-root Helper can return to the launcher after watched apps exit, and LG Home
may briefly appear. Firmware-specific long-Back behavior still needs device
confirmation. Root uses its own system routing; do not assume one edition's
results prove the other.

Startup can initially show a black screen or LG Home. Standby/wake success does
not prove cold-boot reliability or a fixed startup time. See [device limits](COMPATIBILITY.md).
