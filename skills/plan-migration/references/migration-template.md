# Migration plan template

Copy this into an issue or a `MIGRATION.md`, fill it in, and keep it updated. A plan that is not
updated becomes a wish list, and the first thing readers stop trusting.

## 1. Summary

```text
From:      framework 3.9 → 4.2
Why now:   <support ends / feature needed / security fix>
Surface:   214 call sites in 63 files, 7 packages
Deadline:  <date or "no external deadline">
Owner:     <one name — migrations with three owners have none>
```

## 2. Inventory (with commands, not impressions)

```bash
rg -l '\boldApi\(' --type ts | wc -l
rg -n '\boldApi\(' --type ts | awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -20
npm ls legacy-package
```

Record the number. Every later progress statement is a fraction of it.

## 3. Compatibility matrix

| Component | Current | Target | Constraint |
| --- | --- | --- | --- |
| Runtime | 20 | 22 | Framework 4.2 needs ≥ 22.11 |
| Framework | 3.9 | 4.2 | Requires runtime first |
| Build tool | 5 | 6 | Independent; can go last |
| Database driver | 3 | 4 | Must match the ORM's major |

Write the ordering conclusion explicitly, because this table usually decides it:

> Runtime first, because framework 4.2 refuses to boot on 20. Build tool is independent and can ship
> any time; do it first for a cheap win and a rehearsal of the release process.

## 4. Steps

Each row is one pull request, shippable on its own.

| # | Step | Proves it | Reversible | Left on old path |
| --- | --- | --- | --- | --- |
| 1 | Add the compatibility shim + tests | New tests fail without shim | Yes, revert | Everything |
| 2 | Codemod the mechanical rename (`rg` + `--fix`) | Build + tests | Yes | Manual cases |
| 3 | Migrate module A (25 call sites) | Module A tests | Yes | 189 sites |
| 4 | Migrate module B … | … | Yes | … |
| n | Delete the shim, the flag, the deprecated path | `rg` returns nothing | No — intended | 0 |

## 5. Per-pull-request description

```text
Step 3 of 8: migrate module A to the new client.

What changed:  25 call sites, 4 files, one adapter in src/clients/a.ts
What proves it: tests/client-a.test.ts (12 cases), plus the golden file diff is empty
Still on old:  189 call sites
Risk:          low — same request shape, verified by the recorded HTTP fixtures
Rollback:      revert this commit; the shim keeps both paths working
```

## 6. The irreversible part

Anything that rewrites data needs its own section: the backup (where, when, restored how), the
verification query before and after, and the point of no return stated in one sentence.

```text
Irreversible: the JSON → column split in step 6.
Backup:       pg_dump taken at 10:00Z, stored <location>, restore tested on a scratch database.
Verify:       SELECT count(*) FROM t WHERE new_col IS NULL; -- must be 0 after backfill
Point of no return: the drop of the old column, in step 7, after one week of dual reads.
```

## 7. Definition of done

- [ ] Inventory count is zero, verified by the same command.
- [ ] The shim is deleted (`rg` finds it nowhere).
- [ ] Deprecated code paths are gone, including their tests.
- [ ] Docs, examples and the README show the new API only.
- [ ] The changelog has one entry describing the migration for downstream users, with the breaking
      changes and what to do about them.

## 8. Abort plan

Written before starting, not after stalling:

```text
We stop if: the target version cannot run <critical dependency> at all.
If we stop: the tree is on the shim, both paths work, the shim stays with an owner and a date.
Nobody's work is lost, because every step was shippable.
```
