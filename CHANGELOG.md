# Changelog

All notable changes to this pack are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A breaking change here is a change to a skill's **trigger** (the description) or to the contract of its
definition of done — those change when the skill loads and what it demands.

## [Unreleased]

Nothing yet.

## [1.0.0] — 2026-10-30

First release: nine skills, the validator and link checker that keep them honest, and documentation in
English and Persian.

### Added — skills

- `debug-connectivity` — name/route/port/protocol split, with command tables per OS and container, and
  a verbatim failure-signature table.
- `diagnose-slow` — baseline before optimisation, phase timing before profiling, budgets instead of
  ambitions.
- `release-verify` — the identity chain, artefact inspection per type, checksums published, and an
  explicit "not tested" section in the notes.
- `plan-migration` — inventory with a number, compatibility matrix that dictates the order, every step
  shippable, scaffolding deleted rather than deprecated.
- `review-diff` — findings ranked by blast radius, a failure scenario per finding, and specific checks
  for generated code.
- `write-postmortem` — blameless but not soft: trigger ≠ cause, sourced UTC timeline, action items with
  owner, date and verification.
- `api-contract` — which changes break old clients, one error envelope, cursors, idempotency keys and
  deprecation with a sunset.
- `bilingual-docs` — mirrored paths, a glossary, bidi and zero-width-non-joiner handling, and the rule
  that commands are never translated.
- `write-a-skill` — the meta skill: trigger first, one page, anti-patterns over best practices, and the
  ten-question rubric.

### Added — tooling

- `scripts/validate-skills.mjs` — frontmatter, name/directory match, description bounds, required
  sections, unfinished-content markers, reference integrity in both directions, size limits, and a
  generated `catalog.json` that CI compares byte for byte.
- `scripts/check-links.mjs` — every relative link in every markdown file, with anchors reported as
  warnings.
- `catalog.json` + `catalog.schema.json` — a machine-readable index of the pack.
- CI on Node 20 and 22: validator, links, and bilingual parity between `docs/en` and `docs/fa`.

### Known limits

- Effect on a given agent is documented per example, not benchmarked across models.
- Skills are written in English; the pack's documentation is bilingual. Translated skills are out of
  scope for 1.0.0 — a machine-translated instruction file is a liability, not a feature.
- The example transcripts are edited for length; they are illustrative, not raw logs.
