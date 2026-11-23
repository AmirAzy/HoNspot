# Publishing this repository

**فارسی پایین صفحه** · English first.

## Status: published

This repository is live at **github.com/AmirAzy/HoNspot**. The one-time finalize step
already ran (2026-11-23):

```bash
node scripts/set-repo.mjs AmirAzy HoNspot
node scripts/set-repo.mjs --check      # verify nothing is left
```

That rewrote every `OWNER/hone` placeholder to `AmirAzy/HoNspot` (READMEs, docs, CI file,
issue templates, `package.json`, `catalog.schema.json`). The README was also de-duplicated
(the Persian text no longer lives inside `README.md`) and the project name was unified to
**HoNspot** everywhere.

## If you fork this pack

The steps below are the original publish guide, kept for anyone starting from this history:

```bash
git log --oneline          # the history you are about to publish
git remote add origin https://github.com/<your-user>/HoNspot.git
git push -u origin main
node scripts/set-repo.mjs <your-user> HoNspot
```

## The commits were authored as "Hone Maintainers"

Fourteen of the early commits carry the author `Hone Maintainers <maintainers@hone.dev>`.
If you would rather they carry your name — normal for a portfolio repository — re-author the
whole history in one command:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
git rebase --root --exec "git commit --amend --no-edit --reset-author"
```

Only do this if nobody has forked the repository yet: it rewrites history, so the push after
it must be a force-push.

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

---

# انتشار این مخزن

## وضعیت: منتشر شده

این مخزن در **github.com/AmirAzy/HoNspot** منتشر شده و مرحلهٔ نهایی‌سازی قبلاً انجام شده
است (۲۰۲۶-۱۱-۲۳):

```bash
node scripts/set-repo.mjs AmirAzy HoNspot
node scripts/set-repo.mjs --check
```

این دستور همهٔ جایگزین‌های `OWNER/hone` را به `AmirAzy/HoNspot` تبدیل کرد. متن فارسی هم از
داخل `README.md` حذف شد و نام پروژه همه‌جا به **HoNspot** یکپارچه شد.

## اگر این مجموعه را فورک می‌کنید

دستورهای زیر راهنمای اصلی انتشار است که برای شروع از همین تاریخچه نگه داشته شده:

```bash
git log --oneline
git remote add origin https://github.com/<your-user>/HoNspot.git
git push -u origin main
node scripts/set-repo.mjs <your-user> HoNspot
```

## نویسندهٔ کامیت‌های اولیه «Hone Maintainers» است

اگر می‌خواهید اسم شما روی تاریخچه باشد — که برای یک مخزن نمونه‌کار معمول است — با یک دستور
کل تاریخچه را بازنویسی کنید:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
git rebase --root --exec "git commit --amend --no-edit --reset-author"
```

فقط وقتی این کار را بکنید که هنوز کسی مخزن را فورک نکرده باشد؛ چون تاریخچه بازنویسی می‌شود
و پوش بعد از آن باید force-push باشد.

## تنظیمات پیشنهادی مخزن

| فیلد | مقدار |
| --- | --- |
| Description | `Nine skills for AI coding agents: diagnose, verify, migrate, review, postmortem — text only, no dependencies.` |
| Topics | `ai-agents` `skills` `prompt-engineering` `developer-tools` `code-review` `documentation` |
| Features | Issues روشن؛ Wiki و Projects خاموش |
| Branch protection | گذراندن ورک‌فلوی `CI` |
| Releases | تگ `v1.0.0`؛ باینری ندارد که ضمیمه شود |
