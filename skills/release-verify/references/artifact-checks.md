# Inspecting each kind of artefact

The idea is the same everywhere: open it, look inside, run it once from where a user would.

## Universal steps

```bash
sha256sum artefact                 # shasum -a 256 on macOS, Get-FileHash on Windows
stat -c %s artefact                # exact bytes; "89 MB" is not a size
git rev-parse HEAD                 # the commit that must appear in your notes
```

## Binaries and installers

```bash
# Windows self-extractor / 7z / zip payload
7z l app.exe                       # list without running
7z x app.exe -o/tmp/inspect        # unpack and look at the tree
# macOS
hdiutil attach App.dmg && ls /Volumes/App
# Linux
tar -tzf app.tar.gz | head -50
dpkg-deb -c app.deb                # file list of a .deb
```

Check: entry point present, only intended locales/assets included, no `.map` files or secrets,
expected version string inside the binary (`strings | grep -i version`, or the app's own About box).

## Container images

```bash
docker image inspect image:tag | jq '.[0].Config.Labels, .[0].Config.Entrypoint'
docker run --rm image:tag --version
docker history --no-trunc image:tag | head
dive image:tag                     # layer contents, if available
docker sbom image:tag              # dependency listing, if supported
```

Check: tag matches the digest you tested, not `latest` moving under you; architecture
(`linux/amd64` vs `arm64`); no build tools or credentials in the final layer; non-root user.

## npm / PyPI / crates packages

```bash
npm pack --dry-run                 # exactly what would be published
npm pack && tar -tzf *.tgz | head -40
npm view <pkg>@<version> dist.integrity dist.tarball
pip download pkg==1.2.3 -d /tmp/x --no-deps && unzip -l /tmp/x/*
```

Check: `files` field in `package.json` did not accidentally include tests or secrets; `main`/`exports`
point at files that exist; `private: true` for anything that must never be published.

## Static sites

```bash
npx serve dist -l 5000            # serve exactly what you will upload
curl -sI http://localhost:5000/   # 200 and the right content-type
curl -sI http://localhost:5000/some/route   # 200 or a deliberate 404, not the shell for everything
```

Check: asset paths work when served from a subdirectory, missing files 404 instead of falling back to
`index.html`, and no source maps or `.env` files were copied into the output.

## Mobile builds

```bash
# Android
aapt dump badging app.apk | head -5           # package, versionCode, permissions
apksigner verify --print-certs app.apk
# iOS
plutil -p Payload/App.app/Info.plist | grep -E 'CFBundleShortVersionString|CFBundleVersion'
```

Check: `versionCode` / build number actually incremented (a stale one is the most common cause of "the
update will not install"), the ABI list matches what you claim, and permissions are the minimum.

## Documentation-only releases

Yes, these need verification too: every relative link resolves, the code samples in the docs still
compile or run, and the screenshots match the current UI. A docs release that ships a broken example
is a bug report generator.

## What gets recorded, every time

| Field | Why |
| --- | --- |
| `sha256` | Lets anyone, including you next month, prove the file is the file |
| Exact bytes | Detects truncated uploads; a size that changes without a note is a red flag |
| Commit | The only way to rebuild it |
| Build date (UTC) | Disambiguates two builds with the same version |
| Verified-on list | Turns "should work" into a claim someone can check |
| Known-unverified list | The part everyone forgets and every user eventually finds |
