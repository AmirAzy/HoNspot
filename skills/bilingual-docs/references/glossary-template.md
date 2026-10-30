# Glossary template, and the traps of Persian technical writing

Keep this file next to the docs, in both languages, and treat a new term as a decision — written down
once, not re-decided per page.

## The table

| English | فارسی | Use | Do not use | Note |
| --- | --- | --- | --- | --- |
| release | انتشار / نسخهٔ انتشار | انتشار | ریلیز (in prose) | "ریلیز" is fine in speech, not in documentation |
| build | ساخت | ساخت، بیلد (in code context) | ساختنِ نسخه | Verb vs noun: "ساخت" is the noun, "بسازید" the verb |
| dependency | وابستگی | وابستگی | دیپندنسی | |
| repository | مخزن | مخزن | ریپازیتوری (except when naming the GitHub feature) | |
| pull request | پول‌ریکوئست / درخواست ادغام | درخواست ادغام (first mention: pull request) | PR alone | Keep the English term in parentheses the first time |
| commit | کامیت | کامیت | ثبت | "کامیت" is understood by every reader of a git doc |
| to deploy | مستقر کردن | استقرار | دیپلوی (in prose) | "دیپلوی" survives in speech |
| endpoint | نقطهٔ پایانی | نقطهٔ پایانی | اندپوینت | |
| timeout | مهلت / تایم‌اوت | تایم‌اوت (first mention: مهلت زمانی) | — | The borrowed form is clearer to most readers |
| checksum | چک‌سام | چک‌سام | جمع کنترلی | |
| to verify | بررسی کردن | بررسی | وریفای | Verification ≠ validation: see below |
| verification vs validation | بررسی vs اعتبارسنجی | — | using them interchangeably | Verification: did we build it right. Validation: did we build the right thing |
| fallback | جایگزین | جایگزین | فالبک | |
| client | کلاینت | کلاینت | مشتری | "مشتری" only in a business context |
| server | سرور | سرور | خدمتگزار | Never use "خدمتگزار" in a technical doc |
| latency | تأخیر | تأخیر | لِیتنسی | |
| throughput | توان عبور | توان عبور | ترافیک | "ترافیک" is volume, not rate |
| idempotent | خودتکرارپذیر / ایدمپوتنت | ایدمپوتنت (first mention: تکرارپذیر بدون اثر) | — | No single good Persian word; borrow and explain once |

Rules for the table itself:

- One term, one translation. A synonym is a second concept to the reader.
- If the borrowed word is what people say out loud, use it and explain once — a perfect Persian word
  nobody recognises is worse than a borrowed one everybody does.
- Revisit the table when a term appears in three pages and still feels unresolved.

## Traps specific to Persian

**Directionality inside a sentence.** A Latin word, a number and a Persian word in one line will
reorder visually. Punctuation sticks to the wrong side.

- Wrap inline code in backticks: `` فایل `dist/app.js` را پاک کنید `` not `فایل dist/app.js را پاک کنید`.
- Avoid starting a sentence with a Latin identifier.
- Do not put a parenthesis that contains Persian text inside an English sentence (or the reverse)
  without care; the bracket will jump.
- In lists, keep the numeral and the dot together (`۱.`), and let the item text wrap.

**ZWNJ.** Persian words are joined by a zero-width non-joiner (نیم‌فاصله): `می‌شود`, `نمی‌توان`,
`کتاب‌ها`. Omitting it is not a typo a reader will forgive twice — it changes pronunciation and rhythm.
Write it deliberately, and never let a formatter strip it.

**Digits.** Two conventions compete: Persian digits (۱۲۳) and Arabic/Latin digits (123). Pick one for
prose and **never** use Persian digits in technical values. Ports, versions, byte counts, checksums,
HTTP codes and code samples stay ASCII. A version rendered as `۱.۰.۰` cannot be pasted anywhere.

**Transliteration in commands.** Never transliterate. `npm run build` stays `npm run build`.

**"You" and register.** Decide once whether the docs address the reader formally (شما) or
impersonally. Mixing them inside one page reads as assembled from parts.

**Headings and anchors.** Translated headings produce translated slugs. Links to anchors must be
checked per language: `#definition-of-done` has no counterpart in a Persian file unless you add an
explicit anchor.

**Code comments.** Translate comments in prose examples, keep them in real source files. A doc that
teaches translating comments is a doc that produces bilingual code.

## Review questions for the second-language page

1. Does it answer the same question as the original — not "is every word here".
2. Are all the warnings and limits still present?
3. Did any command, path or identifier get translated by accident?
4. Is the terminology consistent with the other pages (not just this one)?
5. Would a reader who only knows Persian be able to complete the task without switching language?
