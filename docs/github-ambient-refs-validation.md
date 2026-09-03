# GitHub ambient refs — validation results

<!-- source-of-truth: whether toolbox can use remote GitHub URLs as ambient skill reference SSOT. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-03 -->

## Gate (from plan)

Ship link migration only if **T1 + T2** pass on a supported host. **T2 hard-fail → stay on local copies / fall back to companion `shared` skill** (see [Rollback](#rollback)).

## Automated results

| ID       | Case                               | Result              | Evidence                                                                                                       |
| -------- | ---------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| T1       | HTTP reachability (raw URL)        | **PASS**            | `tests/github-ambient-refs.test.js` — `main` and pinned SHA return 200 + markers                               |
| T6       | Pin stability                      | **PASS**            | Pinned SHA content assertions. `main` can drift (expected)                                                     |
| T2a      | Fetch-class load                   | **PASS**            | Node `fetch` / WebFetch-class can load raw markdown                                                            |
| T2b      | Local Read of `https://`           | **FAIL (expected)** | Filesystem / Cursor `Read` cannot open `https://` paths — agents must use a network fetch tool                 |
| T2       | Agent follows URL in prompt        | **PASS**            | Live Cursor SDK (`2026-07-15`): suite scenario quoted remote `dialogue-contract` markers + `REMOTE_AMBIENT_OK` |
| T2-skill | Agent follows URL in fixture skill | **PASS**            | Live Cursor SDK (`2026-07-15`): followed fixture `SKILL.md` GitHub URL                                         |

Scenarios under `agent-suites/github-ambient-refs` stay `skip: true` for default validation. Validation cannot prove network fetch. Run the direct scenario explicitly:

```bash
# Set skip: false on the scenario(s), then:
npm run agent:test:live -- --suite github-ambient-refs --keep-recordings
```

## Manual checklist

| ID  | Case                                  | Result                   | Notes                                                  |
| --- | ------------------------------------- | ------------------------ | ------------------------------------------------------ |
| T3  | Project `skills add` + GitHub links   | Pending consumer dogfood | No local ambient copies under skill `references/`      |
| T4  | Global `-g` install, no toolbox clone | Pending                  | Same ambient URLs. Network required                    |
| T5  | Offline / no network                  | **known limitation**     | Remote SSOT requires network                           |
| T7  | Default validation                    | **N/A**                  | Cannot validate fetch without a direct agent run       |
| T8  | Customize coexistence                 | Pending                  | Local customize / alwaysInclude must win when injected |

## URL shape (shipped)

Production skill bodies use **raw + `main`**:

`https://raw.githubusercontent.com/csark0812/toolbox/main/references/<file>.md`

Pinned SHA URLs remain preferred for deterministic tests. `main` drifts with hub pushes. Consumers pick up ambient edits on next skill-follow (network). They do not wait for `skills update` for those files alone.

## Repository contract

- Shared references are ordinary public files under root `references/`.
- Skill bodies use full GitHub raw URLs. Use short labels (`[output-schema.md](https://…)`).
- Toolbox does not use generated per-skill copies or Skeleton reference materialization.
- Skeleton audits these files through the normal Markdown scan perimeter.
- Offline / no-network: known limitation (T5).

## Rollback

If remote ambient resolution regresses in supported hosts:

1. Restore local copies only if supported hosts cannot fetch public GitHub files.
2. Document the host/tool failure mode here.
3. Keep this file as the experiment record.
