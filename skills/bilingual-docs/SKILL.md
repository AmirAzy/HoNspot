---
name: bilingual-docs
description: Keep documentation in two languages from drifting apart. Use when a project writes docs in English and another language, when a translated page is out of date or missing, when links and anchors break across locales, when Persian or Arabic (RTL) text mixes with code and numbers, or when a translation reads like machine output rather than an author.
license: MIT
---

# Bilingual documentation

Two languages, one document. The failure is never the first translation — it is the second month, when
the English page gains a section, the other does not, and readers of the second language silently get
advice that no longer applies.

## When to use

- A repository or product maintains docs in more than one language.
- A translated page is missing a section, a link, or an entire file that exists in the other language.
- RTL text (Persian, Arabic, Hebrew) is mixed with code, numbers, paths or English product names.
- Someone proposes "we will translate at the end" for documentation that is being written now.

## Ground rules

1. **The same tree in both languages.** `docs/en/x.md` and `docs/fa/x.md`, identical filenames, so a
   link is predictable and a missing file is obvious.
2. **Translate the prose, never the commands.** Code, paths, flags, output, error strings and API names
   stay in their original form, in Latin script. A translated command is a broken command.
3. **Every page is a complete page.** A translation is not a summary; a summary is a different document
   and must say so at the top.
4. **Numbers stay numbers.** Do not localise digits in technical values, ports, versions, sizes or
   checksums. A code that is read aloud must be the same code in both languages.
5. **A change is not done until both sides are done**, or the pull request says which side is pending
   and who will do it. Silence is what creates drift.
6. **Machine translation is a draft, not a deliverable.** It gets the nouns right and the intent wrong,
   and it cannot tell when the original was already imprecise.

## Procedure

1. **Set the naming contract.** Files are named in ASCII, in the primary language of the repository,
   and mirrored exactly. Anchors differ by language — check them separately rather than assuming a
   translated heading keeps the same slug.

2. **Write the glossary before the second translation.** Keep a small file of the ten to thirty terms
   that recur (a template is in [references/glossary-template.md](references/glossary-template.md)):
   the term, the chosen translation, and the term that must **not** be used. Consistency matters more
   than elegance; two words for one concept make two concepts.

3. **Translate section by section, in the same order**, keeping headings structurally parallel. When a
   section cannot be translated faithfully (a legal note, a joke, a pun in a sample), keep the meaning
   and drop the joke — and never drop the caveat.

4. **Handle bidi explicitly.** Wrap Latin fragments in backticks or HTML marks when they sit inside
   RTL prose, avoid a sentence that starts with a Latin word and a number, and never put a code block
   inside a numbered list item if the list itself is RTL.

5. **Run a parity check** as part of the build, not by eye:

   ```bash
   # every English page has a counterpart, and vice versa
   comm -3 <(cd docs/en && ls *.md | sort) <(cd docs/fa && ls *.md | sort)
   # rough size divergence: a page half the length is usually a stale translation
   for f in docs/en/*.md; do other="docs/fa/$(basename "$f")"; [ -f "$other" ] &&
     echo "$(wc -c <"$f") $(wc -c <"$other") $f"; done
   ```

6. **Have a reader of the second language read it.** Not a translator — a reader. The question is
   whether the page answers the question it promises to answer.

7. **Review the pair together.** A reviewer who only reads one side cannot see the drift; put both
   files in the same pull request, in adjacent hunks.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| Translating commands and paths | `میزبان` is not a command; the reader copies it and nothing happens |
| Auto-translating and shipping unread | Confident, fluent, and wrong about the one caveat that mattered |
| "We'll sync translations later" | Later never has an owner, and the second language quietly becomes the old version |
| Different file names per language | Links become language-specific, and every new page needs two edits in two places |
| Localised digits in technical values | Breaks copy-paste, greps, and the checksum that was the point of the sentence |
| Translating the marketing, skipping the limits | The limits are the part that prevents harm |

## Definition of done

- [ ] File names mirror exactly between locales; nothing is missing on either side.
- [ ] Commands, paths, identifiers, versions and checksums are untouched and in Latin script.
- [ ] Terminology follows the glossary; any new term was added to it.
- [ ] Links and anchors resolve **in each language** — anchors are not shared.
- [ ] The parity check runs in CI or is part of the review, not a memory exercise.
- [ ] A speaker of the second language has read the page for sense, not for word-for-word accuracy.
- [ ] If one side lags, it says so on the page and in the pull request, with an owner.

## Report format

```
Locales:     <en, fa> — mirrors: yes/no, missing: <files>
Untouched:   <commands/identifiers spot-checked>
Glossary:    <terms added or changed>
Links:       <checked per locale, broken: none>
Reader:      <who read the translation, and what changed as a result>
Pending:     <sections still untranslated, with an owner and a date>
```

A glossary you can copy, with the pitfalls specific to Persian technical writing, is in
[references/glossary-template.md](references/glossary-template.md).
