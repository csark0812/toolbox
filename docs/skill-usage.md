# Skill usage analytics

<!-- source-of-truth: how real Claude Code skill use is archived, measured and reported. -->
<!-- doc-meta: owner=eng -->
<!-- review-deps: paths=scripts/skill-usage.mjs,scripts/lib/skill-usage/** -->

The skill bench measures skills on frozen tasks. This tool measures them in real work: why each toolbox skill was called, whether it was the right skill, whether it worked, and which requests should have called a skill but did not. It reads Claude Code transcripts only. Codex sessions are out of scope.

The report is advisory. It shows which episodes to read. Change a skill only through [skill evolution](skill-evolution.md) and the [skill bench](skill-bench.md).

## Commands

| Command                                         | What it does                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run usage:archive`                         | Copy new skill episodes and missed-trigger candidates out of `~/.claude/projects`                                                                           |
| `npm run usage:judge -- --limit 20 --missed 10` | Judge a sample of new episodes and candidates with Opus in a sealed workspace (uses your Claude subscription). Add `--skill <slug>` to judge one skill only |
| `npm run usage:report`                          | Write `report.md` and `report.json`                                                                                                                         |
| `npm run usage`                                 | All three, in order                                                                                                                                         |

Run `usage:archive` at least every few weeks. Claude Code deletes transcripts after 30 days by default, and only archived episodes survive. A `SessionEnd` hook can archive each session as it ends:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node <toolbox>/scripts/skill-usage.mjs archive --hook",
            "async": true
          }
        ]
      }
    ]
  }
}
```

## Where the data lives

Everything is written to `~/.toolbox/skill-analytics/`, or to `TOOLBOX_ANALYTICS_DIR` if you set it. It holds private prompts from every project, so it never goes in this repository.

| Path                       | Contents                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `episodes/*.json`          | One skill call: trigger, prompt, args, reasoning, actions, reply, next prompt, free signals |
| `candidates/*.json`        | A turn with no toolbox skill that matched a skill's fingerprint                             |
| `bodies/<sha>.md`          | The exact skill text each episode loaded                                                    |
| `judgments.jsonl`          | Episode verdicts, cached by episode id and rubric version                                   |
| `misses.jsonl`             | Missed-trigger verdicts                                                                     |
| `judge-errors.jsonl`       | Judge replies that could not be read. These cases are retried next run                      |
| `report.md`, `report.json` | The latest report                                                                           |

Bench, judge and harness sessions are skipped by where they started (see `isBenchPath` in `scripts/lib/skill-usage/claude-transcript.mjs`).

## What is measured

An episode runs from a skill call to the user's next real prompt. Task notifications, tool results and interrupts stay inside it.

| Question           | Free signals (every episode)                                                                        | Judge (sample)                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| How was it called? | Typed `/skill`, chosen by the agent, nested in another skill, briefed by another agent              |                                                                                  |
| Why?               | The prompt, the skill args, the agent's reasoning before the call                                   | Intent in a few words                                                            |
| Right skill?       | Another toolbox skill started in the same episode; the next prompt names a different skill          | Routing fit and a better skill                                                   |
| What happened?     | Tool calls, errors, permission denials, subagents, tokens, duration, interrupts                     | Whether the agent followed the skill text                                        |
| Did it work?       | Next prompt is a correction, a repeat, an acceptance or a new topic; commits, PRs, last test result | Outcome, a 1–5 score, failure mode, evidence quotes, the skill sentence involved |
| Which version?     | Hash of the loaded skill text, matched to a git commit of `<slug>/SKILL.md`                         |                                                                                  |

### Missed triggers

A missed trigger leaves no record, so the tool finds candidates first. Each turn with no toolbox skill call is tested against cheap fingerprints in `scripts/lib/skill-usage/fingerprints.mjs`. For example, `taste` matches three or more edits to UI files, or a landing-page request. The judge then decides, from the skill's description and its "Not …" limits, whether the request called for the skill. The report estimates recall as calls ÷ (calls + estimated misses), and quotes the description phrase each miss should have matched. Since routing depends only on the description, that phrase is the first place to look.

Two free signals need no judge. A user typing `/skill` right after the agent worked without it is the clearest miss. The report also names the non-toolbox skills that ran in candidate tasks. Only some compete: a design plugin such as `taste-skill:*` does, a browser helper does not.

## Limits

- **Transcript format.** It is internal to Claude Code and changes between versions. Unknown records are counted, not fatal, and each episode stores the Claude Code version.
- **Heuristics.** The next-prompt classifier is keyword-based. Read the judged columns before trusting a rate.
- **Small counts.** Rates under five cases show as counts only.
