---
name: release-verify
description: Verify a release artefact before it is announced, and write release notes that do not overclaim. Use when publishing a binary, container image, package, static site or mobile build, when a build "succeeded" but nobody opened it, when checksums or versions are missing, or when a release note needs to state what was and was not tested.
license: MIT
---

# Verify what you are about to ship

A build that produced a file is not a build that produced a working file. The gap between those two
sentences is where bad releases live: wrong version numbers, missing assets, an artefact from the
previous commit, a package whose entry point is empty.

## When to use

- Before tagging or announcing any release.
- A pipeline reports success and you are about to trust it.
- Someone asks "was this tested on X?" and the honest answer is "the build ran".
- Writing release notes, a changelog entry, or a store listing.

## Ground rules

1. **Test the artefact, not the working tree.** If you cannot install, unpack or run the thing you
   are publishing, you have not verified it.
2. **Version identity must be provable.** The version in the artefact must be readable *from the
   artefact* and match the tag, the changelog and the manifest. Drift between those four is the most
   common release bug.
3. **Every artefact gets a checksum and an exact byte count.** "About 90 MB" is not a release note.
4. **Reproducibility is a claim, so test it.** If the build is meant to be deterministic, build twice
   and compare; if it is not, do not imply it.
5. **Say what you did not test.** An unverified platform in the release notes costs one sentence; an
   unverified platform discovered by users costs trust.
6. **Have the rollback ready before you need it** — the previous version, the exact command, and
   whether the data is still compatible.

## Procedure

1. **Freeze the source.** Note the commit hash that produced the artefact (`git rev-parse HEAD`).
   Record it in the release notes or the build metadata; without it, the artefact is unreproducible.

2. **Check the identity chain**: source version → build metadata → artefact's own reported version →
   tag → changelog heading. All five agree or you stop.

3. **Inspect the artefact as a consumer would.** Unpack it, list its contents, check the entry point
   exists, check that only the intended files shipped.

4. **Run it once, from the artefact**, in the environment closest to the user's: install the package
   in a clean directory, run the container with no extra config, open the built site over a static
   server, install the app on a device.

5. **Exercise the one path that matters.** Not a click-around: the flow whose failure would make the
   release pointless. For a network feature, that means an actual connection, not a screen that
   renders.

6. **Record size and `sha256`**, publish them next to the download, then verify the published copy
   matches by re-downloading it if the pipeline can silently truncate.

7. **Write the notes with three sections**: what changed, what was verified (with how), what was not.
   Link the changelog rather than duplicating it.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| "CI is green, so the artefact is fine" | CI proves the build ran; it does not prove the artefact contains the app |
| Shipping the debug/dev build to save time | Different binary, different bugs, and usually a warning the user has to dismiss |
| Publishing without a checksum | The download cannot be verified by anyone, including you |
| Notes that list features but not limits | Users discover the gaps the hard way and stop trusting the notes |
| Deleting the previous release | You have just deleted your rollback |
| Tagging after the build | The artefact then belongs to no commit in particular |

## Definition of done

- [ ] The commit hash behind the artefact is recorded.
- [ ] Version is consistent across source, manifest, artefact, tag and changelog.
- [ ] The artefact was unpacked/installed and inspected as a consumer would.
- [ ] The critical path was exercised **on the artefact**, and the result is stated.
- [ ] `sha256` and exact byte size published; the download re-verified.
- [ ] Release notes name what was verified and what was not.
- [ ] A rollback command and the previous artefact are still available.

## Report format

```
Artefact:   <name>, <bytes>, sha256 <hash>
Source:     <commit>
Identity:   <source → manifest → artefact → tag → changelog: agree?>
Inspected:  <what you listed/unpacked and what surprised you>
Ran:        <exact command or install, and the path you exercised>
Verified:   <platforms/environments actually used>
Unverified: <platforms/environments implied but not tested>
Rollback:   <how, to what>
```

Per-artefact inspection commands — binaries, images, npm packages, static sites, mobile builds — are
in [references/artifact-checks.md](references/artifact-checks.md).
