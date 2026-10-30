# Publishing this repository

**فارسی پایین صفحه** · English first.

Unlike a source package, this folder **is a git repository with history**: nine commits, each one
shippable, in the order the work was actually done. There is nothing to initialise — add a remote and
push.

```bash
git log --oneline          # the history you are about to publish
git remote add origin https://github.com/<your-user>/hone.git
git push -u origin main
```

## The one decision: your name in the links

Every internal link uses the placeholder `OWNER/hone`. Point them at your account:

```bash
node scripts/set-repo.mjs <your-user> hone
node scripts/set-repo.mjs --check      # verify nothing is left
```

(The script is in `scripts/`; it rewrites the READMEs, the docs, the CI file, the issue templates and
`catalog.json`'s `$schema`.)

## The commits were authored as "Hone Maintainers"

If you would rather they carry your name — normal for a portfolio repository — re-author the whole
history in one command:

```bash
git rebase --root --exec "git commit --amend --no-edit --reset-author"
```

Set your identity first (`git config user.name "…"`, `git config user.email "…"`), then force-push only
if the branch is already published.

## Recommended repository settings

| Field | Suggested value |
| --- | --- |
| Description | `Nine skills for AI coding agents: diagnose, verify, migrate, review, postmortem — text only, no dependencies.` |
| Topics | `ai-agents` `skills` `prompt-engineering` `developer-tools` `code-review` `documentation` |
| Features | Issues on; Discussions optional; Wiki and Projects off |
| Branch protection | require the `CI` workflow to pass before merging |
| Releases | tag `v1.0.0`; there are no binaries, so nothing to attach |

## Verifying before you push

```bash
npm test                  # validator + links, no install step
node scripts/check-links.mjs
git status                # should be clean
```

## Checklist

- [ ] `npm test` passes.
- [ ] `node scripts/set-repo.mjs <you> hone` has been run, and `--check` is clean.
- [ ] History re-authored if you want your name on it.
- [ ] Repository description and topics set.
- [ ] CI ran green on the first push.

---

# انتشار این مخزن

برخلاف یک بستهٔ سورس، این پوشه **خودش یک مخزن گیت با تاریخچه است**: نُه کامیت، هر کدام مستقل و
قابل انتشار، به همان ترتیبی که کار انجام شد. چیزی برای `git init` کردن نمانده — فقط remote اضافه کن
و پوش کن.

```bash
git log --oneline
git remote add origin https://github.com/<your-user>/hone.git
git push -u origin main
```

## یک تصمیم: نام شما در لینک‌ها

همهٔ لینک‌های داخلی از جایگزین `OWNER/hone` استفاده می‌کنند:

```bash
node scripts/set-repo.mjs <your-user> hone
node scripts/set-repo.mjs --check
```

## نویسندهٔ کامیت‌ها فعلاً «Hone Maintainers» است

اگر می‌خواهید اسم شما روی تاریخچه باشد — که برای یک مخزن نمونه‌کار معمول است — با یک دستور کل
تاریخچه را بازنویسی کنید:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
git rebase --root --exec "git commit --amend --no-edit --reset-author"
```

## تنظیمات پیشنهادی مخزن

| فیلد | مقدار |
| --- | --- |
| Description | `Nine skills for AI coding agents: diagnose, verify, migrate, review, postmortem — text only, no dependencies.` |
| Topics | `ai-agents` `skills` `prompt-engineering` `developer-tools` `code-review` `documentation` |
| Features | Issues روشن؛ Wiki و Projects خاموش |
| Branch protection | گذراندن ورک‌فلوی `CI` |
| Releases | تگ `v1.0.0`؛ باینری ندارد که ضمیمه شود |

## چک‌لیست

- [ ] `npm test` سبز است.
- [ ] `node scripts/set-repo.mjs <you> hone` اجرا شده و `--check` تمیز است.
- [ ] اگر می‌خواهید، تاریخچه با نام خودتان بازنویسی شده.
- [ ] Description و Topics تنظیم شده.
- [ ] CI روی پوش اول سبز شده.
