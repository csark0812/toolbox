# Evidence ladder

<!-- source-of-truth: how far a load-bearing claim has been proven, and where to look past text search -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**Portable ambient reference.** Use it when a verdict, finding or safety claim depends on one or two facts. Push each load-bearing fact as far down the ladder as is cheap. State the level it reached. A claim that sounds right is not evidence.

| Level | Name       | What it takes                                                                                    |
| ----- | ---------- | ------------------------------------------------------------------------------------------------ |
| 1     | Asserted   | Someone said so. Not evidence on its own.                                                        |
| 2     | Located    | A real `file:line`, or the dependency's own source at the pinned version.                        |
| 3     | Traced     | The failure path was walked step by step and shown not to reach (or to reach) the outcome.       |
| 4     | Executed   | A script or test calls the real code and fails loudly if the claim is wrong. Its output is kept. |
| 5     | Reproduced | The behavior was observed in the running application or the reported environment.                |

**Rules**

- Find the single fact the conclusion rests on before listing every possible risk. If that fact holds, most of the risks go away. Spend the effort there.
- Report the level per fact, for example "safe because X (level 4: `scripts/check-x.mjs` output attached)". If a fact stopped at level 1 or 2, write **unproven**.
- A text search that finds nothing is a result. Report it as level 2 for absence, and name the search.
- Level 4 is usually one small script that imports the same library the application ships and calls the exact function in question.

**Look where grep stops**

Text search misses these paths. Check the ones that apply:

- Dependency source at the pinned version, plus local patches.
- Timing: microtasks, teardown and unmount, retries, ordering across processes.
- Data crossing a boundary: wire formats, API JSON, database columns, files read by another language.
- Configuration: feature flags, environment variables, build-time switches.
- Callers several hops downstream, reached through a registry, reflection, or a string key.

## Attribution

The ladder and the "where grep stops" list are adapted from the `blast-radius` skill in [pstack](https://github.com/backnotprop/pstack). Copyright (c) 2026 Lauren Tan, MIT License.
