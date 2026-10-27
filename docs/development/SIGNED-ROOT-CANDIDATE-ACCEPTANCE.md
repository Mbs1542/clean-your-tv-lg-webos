# Private signed Root candidate acceptance

This is maintainer-only acceptance tooling for an unpublished candidate, not a
public update channel or a workaround for an unsupported TV. It requires explicit
owner authorization for update and retained rollback with the owner present.

The original v1.3.0 System Updater reads only GitHub's public `latest` feed.
An unpublished candidate cannot be discovered there. Never overwrite a published
feed, patch a pinned supervisor/key, fabricate a transaction or bypass a signature
to make a candidate appear. The acceptance controller substitutes only offer
selection during admission; the original production verifier and worker remain
responsible for trust, installation, health and rollback.

## Host and signing gates

1. Record the exact successful `cytv.yml` feedback run, source SHA and versions.
   Require Android and all four desktop platform jobs to succeed. Retain the
   Actions artifact digests and independently verify embedded payloads, native
   Windows Root IPK/LF, Android signer/source/versionCode and Helper exact bytes.
2. Assemble with the existing `scripts/assemble-release.py` verifier from a clean
   snapshot of that source. Feedback builds are `workflow_dispatch`, so they do
   not satisfy `validate_build_run` or the final production merge gate. Verify
   this provenance separately; do not forge a push event or a main merge.
3. Create a temporary **private draft**, `prerelease=false`, at the numeric
   candidate tag and exact candidate source. Upload the checked assembly's assets,
   both system manifests, BUILD-INFO and checksums. Record the draft ID and source.
   Draft contents are not public delivery. Do not use `--latest`, publish it or
   modify an existing published release.
4. Reuse the trusted signing workflow on `main`:

   ```sh
   gh workflow run publish-release.yml --ref main -f tag=v1.4.1 -f publish=false
   ```

   Substitute the actual selected version. `publish=false` signs and saves
   `signed-release-feeds` as an Actions artifact; it does not upload signed assets,
   publish, start a cycle or send shipping notices. The production private key
   remains inside the protected Actions environment. Record workflow run/head SHA.
5. Download that artifact. Verify the exact root system envelope with the checked
   production public key and `system-updater/policy.js`; bind its raw SHA-256 to
   the request. Verify BUILD-INFO, candidate source and every manifest component
   against the assembled assets. Preserve this evidence privately. A signature
   alone does not establish the selected build's provenance.

## Device admission

Read the connected model/firmware and current versions. Retain original supervisor
code/infrastructure hashes, current/prior state and local rollback cache hashes.
A synthetic local release `v0.0.0` is normal: its component versions and captured
bytes are the actual computer-provisioned rollback baseline. Do not replace it
with a reconstructed public-release descriptor or clear an aborted journal.

Use the already trusted SSH profile and verified pinned Python binding. Run
`scripts/root-candidate-acceptance.py` through an isolated `-I -B` interpreter with
its request on stdin; do not stage executable code into the installed supervisor.
The controller reads the infrastructure receipt, captures every authenticated
source and uses a private import namespace, rather than loading adjacent bytecode
or ambient modules. It verifies the production envelope through the original
installed Node verifier. Original package inspection must accept **every** candidate
and prior cache before the controller can mutate anything.

The exact JSON request fields are `action` (`preflight` or `install`), `release`
(`vX.Y.Z`), `envelopeSha256` (raw envelope JSON SHA-256), `envelope` (base64 of
those exact JSON bytes), and `packages` (component name to base64 package bytes).
Only `install` additionally accepts `profile`, the actual UI-captured profile.
Root edition is fixed; request data cannot select paths, commands, keys or modules.
Unknown/duplicate fields and non-finite JSON values are rejected. Output contains
only phase, release, component names/versions/digests; do not log the input request.

Start with `action=preflight`. It must report versions/hashes only and write no
cache, journal, lease or legacy-lockdown state. A failed preflight is a stop, not
permission to repair state manually. Existing cache conflicts must be rejected.

For `action=install`, supply the complete profile captured from the **running UI**
using `RootProfile.capture({system:true})`, including embedded icons, actual
configuration, order/language/layout. Store it privately; do not manufacture an
empty profile or copy a historical capture. Compare its digest after installation
and rollback; do not expose app inventories or private profile data publicly.

The controller rechecks all gates under the original product lease, publishes
absent signed packages through the original exclusive atomic cache writer, then
calls original `Manager.install`. The original Manager alone writes the new
transaction. Release the lease before starting the unchanged original worker.
Draft URLs are not anonymously readable: this run uses exact signed cache bytes,
and therefore does not establish anonymous public-download acceptance.

## Observe and roll back

Observe the original System service status. Do not synthesize healthy receipts:
the real launcher must restore the saved profile, render its actual tiles and
send its ordinary health signal. Require completed component installer terminals,
verified package/infrastructure hashes and normal Home resumption. Unknown package
outcomes require supported recovery; do not retry an install or force rollback.

After successful update, obtain owner confirmation of Home, arrows/OK/Back,
volume/audio and emergency behavior. Explicit/emergency off must stay off. Keep
standby, normal restart and true AC-off results separate; update acceptance alone
does not accept all lifecycle paths or firmware blocking.

Invoke retained rollback through the **ordinary installed System Updater service**.
Observe its unchanged worker, real launcher/profile health and completed rollback
terminals. Compare original versions, exact baseline/code/profile hashes and
owner-confirmed controls. Preserve journals, original caches and rollback evidence.

## Evidence and final release boundary

Record the candidate build and signing run IDs, source commits, artifact/envelope/
component hashes, model/firmware, actual tested paths, failures and untested paths.
This accepts separately authorized offer admission, signed package handling,
original worker update and rollback. It does **not** accept normal public feed
selection, anonymous draft download, fresh computer provision or all TV models.

Before posting a new installation-result report, show the exact redacted text and
destination and obtain the owner's consent under AGENTS.md. Routine release/issue
maintenance authorization does not authorize publishing private installation logs.

Preserve the signed evidence privately, then remove the temporary **unpublished**
draft/tag before the final release pipeline binds the actual frozen merge SHA.
Never overwrite a published version. Record acceptance honestly, rerun all required
platform builds at the final frozen head, verify intended TV component bytes still
match the accepted bytes, and complete Release policy before main integration.
Production publication and shipping notices remain the normal protected workflow.
