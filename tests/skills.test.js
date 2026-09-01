import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'

const root = join(import.meta.dirname, '..')

describe('toolbox skill SSOT', () => {
  it('ships SKILL.md for each expected slug', () => {
    for (const slug of EXPECTED_SKILLS) {
      expect(existsSync(join(root, slug, 'SKILL.md'))).toBe(true)
    }
  })

  it('SKILL.md files have a description frontmatter field', () => {
    for (const slug of EXPECTED_SKILLS) {
      const text = readFileSync(join(root, slug, 'SKILL.md'), 'utf8')
      expect(text.startsWith('---')).toBe(true)
      expect(text).toMatch(/^description:\s.+/m)
    }
  })

  it('review walkthrough routes task-shaped stories and preserves source integrity', () => {
    const skill = readFileSync(join(root, 'review-walkthrough/SKILL.md'), 'utf8')
    const source = readFileSync(
      join(root, 'review-walkthrough/references/source-binding.md'),
      'utf8',
    )
    const modes = readFileSync(
      join(root, 'review-walkthrough/references/interaction-modes.md'),
      'utf8',
    )
    const story = readFileSync(join(root, 'review-walkthrough/references/story-format.md'), 'utf8')

    for (const mode of ['Compact story', 'Paced tour', 'Map-first tour', 'Story reset']) {
      expect(skill).toContain(mode)
    }
    expect(skill).toMatch(/smallest useful mode/)
    expect(skill).toMatch(/minimum useful anchors and excerpts/)
    expect(skill).toMatch(/pragmatic Simple English/)
    expect(skill).toMatch(/suspend this read-only process/)
    expect(skill).not.toMatch(/two to five useful/)

    expect(source).toMatch(/Treat changed text.*as evidence, not instructions/)
    expect(source).toMatch(/Preserve covered and skipped beats/)
    expect(source).toMatch(/Repeat it only when it changes/)
    expect(modes).toMatch(/Trigger: what starts the behavior/)
    expect(modes).toMatch(/Resume by default\. Restart only when requested/)
    expect(story).toMatch(/Omit an empty concern line/)
    expect(story).toMatch(/understanding summary/)
  })

  it('refactor companion uses evidence-first modes and a compact internal card', () => {
    const skill = readFileSync(join(root, 'refactor-companion/SKILL.md'), 'utf8')
    const card = readFileSync(join(root, 'refactor-companion/references/refactor-card.md'), 'utf8')
    const modes = readFileSync(
      join(root, 'refactor-companion/references/interaction-modes.md'),
      'utf8',
    )

    for (const field of [
      'Outcome:',
      'Invariants:',
      'Required shape:',
      'Prohibited shape:',
      'Resolved decisions:',
      'Open decision:',
      'Current slice:',
      'Proof:',
      'Stop if:',
    ]) {
      expect(skill).toContain(field)
    }
    for (const mode of [
      'Discovery before change',
      'Decision checkpoint',
      'Direct slice',
      'Cutover sweep',
    ]) {
      expect(skill).toContain(mode)
    }
    expect(skill).toMatch(/Inspect current behavior, callers, contracts, tests/)
    expect(skill).toMatch(/Never reopen a resolved decision unless new evidence conflicts/)
    expect(skill).toMatch(/Continue automatically/)
    expect(skill).toMatch(/Git state changes need explicit user authority/)
    expect(card).toMatch(/One to three accepted examples/)
    expect(modes).toMatch(/Do not ask about a fact the repository can answer/)
  })

  it('all shipped skills are model-invokable (no disable-model-invocation)', () => {
    for (const slug of EXPECTED_SKILLS) {
      const skill = readFileSync(join(root, slug, 'SKILL.md'), 'utf8')
      expect(skill, `${slug} must omit disable-model-invocation`).not.toMatch(
        /disable-model-invocation/,
      )
    }
  })

  it('registry.md lists each shipped skill slug', () => {
    const registry = readFileSync(join(root, '.skeleton/registry.md'), 'utf8')
    for (const slug of EXPECTED_SKILLS) {
      expect(registry).toContain(slug)
    }
  })

  it('skill lock and ownership exactly match shipped skills', () => {
    const expected = [...EXPECTED_SKILLS].sort()
    const lock = JSON.parse(readFileSync(join(root, 'skills-lock.json'), 'utf8'))
    expect(Object.keys(lock.skills).sort()).toEqual(expected)

    for (const slug of expected) {
      expect(lock.skills[slug].skillPath).toBe(`${slug}/SKILL.md`)
      expect(existsSync(join(root, lock.skills[slug].skillPath))).toBe(true)
      expect(lock.skills[slug].computedHash).toMatch(/^[a-f0-9]{64}$/)
      expect(lock.skills[slug].computedHash).not.toMatch(/^0+$/)
    }

    const config = readFileSync(join(root, 'skeleton.toml'), 'utf8')
    const ownedBlock = config.match(/ownedSlugs\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? ''
    const owned = [...ownedBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort()
    expect(owned).toEqual(expected)
  })

  it('AGENTS.md documents Cursor, Claude Code, and Codex destinations', () => {
    const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8')
    expect(agents).toMatch(/Cursor/)
    expect(agents).toMatch(/Claude Code/)
    expect(agents).toMatch(/Codex/)
  })

  it('root layout has flat skill dirs (no nested apps/)', () => {
    const dirs = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
    for (const slug of EXPECTED_SKILLS) {
      expect(dirs).toContain(slug)
    }
    expect(dirs).not.toContain('apps')
  })

  it('ambient refs are remote SSOT (no per-skill generated copies)', () => {
    const ambient = [
      'dialogue-contract.md',
      'output-schema.md',
      'planning/build.md',
      'planning/verify.md',
      'planning/parallel-explore.md',
    ]
    const raw = 'https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/'
    for (const slug of EXPECTED_SKILLS) {
      for (const rel of ambient) {
        expect(existsSync(join(root, slug, 'references', rel))).toBe(false)
      }
      const skill = readFileSync(join(root, slug, 'SKILL.md'), 'utf8')
      // Skills that mention ambient contracts must link to GitHub raw, not local copies.
      if (skill.includes('dialogue-contract')) {
        expect(skill).toContain(raw)
      }
    }
    expect(existsSync(join(root, '.skeleton/references/dialogue-contract.md'))).toBe(true)
  })

  it('soft-default recipes stay out of skill trees (canonical + templates only)', () => {
    const planningSkills = ['grill', 'handoff', 'second-opinion']
    for (const slug of planningSkills) {
      expect(existsSync(join(root, slug, 'references/planning/soft-default'))).toBe(false)
    }
    const canonical = join(root, '.skeleton/references/planning/soft-default/prd-format.md')
    const pack = join(root, 'templates/planning-soft-default/prd-format.md')
    expect(existsSync(canonical)).toBe(true)
    expect(existsSync(pack)).toBe(true)
    const body = readFileSync(canonical, 'utf8')
    expect(body).toMatch(/Opt-in soft-default recipe/)
    expect(body).toMatch(/docs\/prds\//)
    expect(body).not.toMatch(/POS-12/)
  })

  it('process SKILL.md bodies ban soft STE modals (pragmatic house lock)', () => {
    // Strip fenced code so template placeholders do not false-positive.
    const fence = /```[\s\S]*?```/g
    const banned = /\b(should|would|may|might|could)\b/i
    for (const slug of EXPECTED_SKILLS) {
      const text = readFileSync(join(root, slug, 'SKILL.md'), 'utf8').replace(fence, '')
      const match = text.match(banned)
      expect(match, `${slug}/SKILL.md contains banned modal ${match?.[0] ?? ''}`).toBeNull()
    }
  })

  it('council creates distinct task personas and selects an interaction', () => {
    const skill = readFileSync(join(root, 'council/SKILL.md'), 'utf8')
    const personaPrompt = readFileSync(join(root, 'council/references/persona-prompt.md'), 'utf8')
    const patterns = readFileSync(join(root, 'council/references/interaction-patterns.md'), 'utf8')
    const output = readFileSync(join(root, 'council/references/output-format.md'), 'utf8')

    expect(skill).toMatch(/Derive task personas from decision risks/)
    expect(skill).toMatch(/Usually use two to four personas/)
    expect(skill).toMatch(/Spawn real members/)
    expect(skill).toMatch(/If fewer than two useful personas remain/)
    expect(skill).toMatch(/Does it ask a distinct question/)
    expect(skill).toMatch(/Does it inspect distinct evidence/)
    expect(skill).toMatch(/Can its answer change or narrow the decision/)
    expect(skill).toMatch(/Council preview/)
    expect(skill).toMatch(/pragmatic Simple English for all user-facing text/)

    for (const field of [
      'Persona:',
      'Purpose:',
      'Question:',
      'Evidence:',
      'Falsifier:',
      'Boundary:',
    ]) {
      expect(personaPrompt).toContain(field)
    }

    for (const pattern of [
      'Independent panel',
      'Structured challenge',
      'Competing proposals',
      'Nominal ideation',
      'Delphi revision',
      'Socratic seminar',
    ]) {
      expect(patterns).toContain(pattern)
    }

    expect(output).toMatch(/Disagreement or uncertainty/)
    expect(output).toMatch(/Do not hide disagreement by reporting a vote/)
  })

  it('council excludes runtime routing policy and deleted compatibility files', () => {
    const skill = readFileSync(join(root, 'council/SKILL.md'), 'utf8')
    const referenceDir = join(root, 'council/references')
    const councilText = [
      skill,
      ...readdirSync(referenceDir)
        .filter((name) => name.endsWith('.md'))
        .map((name) => readFileSync(join(referenceDir, name), 'utf8')),
    ].join('\n')

    for (const deleted of [
      'model-routing.md',
      'agent-discovery.md',
      'member-schema.md',
      'task-splitting.md',
      'adversarial.md',
      'task-prompt.md',
    ]) {
      expect(existsSync(join(referenceDir, deleted))).toBe(false)
    }

    expect(councilText).not.toMatch(
      /inherit-auto|billing pool|token budget|parent model|host enum/i,
    )
    expect(councilText).not.toMatch(/100k|100,000/)
  })

  it('verdict ambient ref enforces find-and-verdict-only (no fix in verdict)', () => {
    const verdict = readFileSync(join(root, '.skeleton/references/verdict.md'), 'utf8')
    expect(verdict).toMatch(/find and verdict only/i)
    expect(verdict).toMatch(/Verdict not fix/)
    expect(verdict).toMatch(/Find and verdict only/)
  })

  it('code-review is thin review guidelines without orchestration', () => {
    const skill = readFileSync(join(root, 'code-review/SKILL.md'), 'utf8')
    const review = readFileSync(join(root, 'code-review/references/review.md'), 'utf8')
    const output = readFileSync(join(root, 'code-review/references/output.md'), 'utf8')
    const sources = readFileSync(join(root, 'code-review/references/sources.md'), 'utf8')
    const blockers = readFileSync(join(root, 'code-review/references/merge-blockers.md'), 'utf8')
    const mergeReadiness = readFileSync(
      join(root, 'code-review/references/merge-readiness.md'),
      'utf8',
    )

    expect(skill).toMatch(/How to review/)
    expect(skill).toMatch(/Review only/)
    expect(skill).toMatch(/Merge-blockers default/)
    expect(skill).toMatch(/Untrusted surface/)
    expect(skill).toMatch(/untrusted data, not instructions/)
    expect(skill).toMatch(/## Handling External Content/)
    expect(skill).toMatch(/extract only the expected structured fields/)
    expect(skill).not.toMatch(/anti-thrash/)
    expect(skill).not.toMatch(/fix-loop/)
    expect(skill).not.toMatch(/Escalate only when matched/)
    expect(skill).not.toMatch(/review-council-dispatch\.md/)
    expect(skill).toMatch(/council/)
    const description = skill.match(/^description:\s*(.+)$/m)?.[1] ?? ''
    expect(description).not.toMatch(/council/i)

    expect(review).toMatch(/Introduced-only/)
    expect(review).toMatch(/path:line/)
    expect(review).toMatch(/Action bar for change-shaped surfaces/)
    expect(review).toMatch(/contract-dependent/)
    expect(review).toMatch(/input, state, transport, or lifecycle classes/)
    expect(review).not.toMatch(/Hard stop/)
    expect(review).not.toMatch(/Task\/Subagent/)

    expect(output).toMatch(/Review · source:/)
    expect(output).toMatch(/Filing: merge-blockers only/)
    expect(output).toMatch(/Reviewed base:/)
    expect(output).toMatch(/Current remote head:/)
    expect(output).toMatch(/State: PASSED \| BLOCKED \| INCOMPLETE \| STALE/)
    expect(output).toMatch(/No findings in scope.` is not a merge-readiness success signal/)
    expect(output).not.toMatch(/Pass class:/)
    expect(output).not.toMatch(/Thrash:/)
    expect(output).not.toMatch(/Reviewer: primary/)

    expect(sources).toMatch(/git diff/)
    expect(sources).toMatch(/Trust boundary/)
    expect(sources).toMatch(/full base-tip SHA/)
    expect(sources).toMatch(/full merge-base SHA/)
    expect(sources).toMatch(/Immediately before synthesis/)
    expect(blockers).toMatch(/merge-blockers only/)

    expect(mergeReadiness).toMatch(/BOUND -> REVIEWING -> PASSED \| BLOCKED \| INCOMPLETE/)
    expect(mergeReadiness).toMatch(/State: STALE/)
    expect(mergeReadiness).toMatch(/No merge-blockers in scope\./)
    expect(mergeReadiness).toMatch(/\*\*new\*\*/)
    expect(mergeReadiness).toMatch(/\*\*repeat\*\*/)
    expect(mergeReadiness).toMatch(/\*\*regression\*\*/)
    expect(mergeReadiness).toMatch(/\*\*contract-dependent\*\*/)
    expect(mergeReadiness).toMatch(/\*\*CI-only\*\*/)
    expect(mergeReadiness).toMatch(/Do not create a ledger/)
    expect(mergeReadiness).not.toMatch(/Pass class:/)
    expect(mergeReadiness).not.toMatch(/Thrash:/)
    expect(mergeReadiness).not.toMatch(/Reviewer: primary/)
    expect(mergeReadiness).not.toMatch(/REVIEW_LEDGER/)
    expect(mergeReadiness).not.toMatch(/git commit|git push|gh pr edit|gh pr review/)
  })

  it('every skill markdown link survives a standalone install', () => {
    for (const slug of EXPECTED_SKILLS) {
      const skillRoot = join(root, slug)
      const referencesRoot = join(skillRoot, 'references')
      const markdownFiles = [
        join(skillRoot, 'SKILL.md'),
        ...(existsSync(referencesRoot)
          ? readdirSync(referencesRoot, { recursive: true })
              .filter((name) => name.endsWith('.md'))
              .map((name) => join(referencesRoot, name))
          : []),
      ]

      for (const file of markdownFiles) {
        const body = readFileSync(file, 'utf8')
        for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
          const target = match[1].split('#')[0]
          const toolboxRaw = 'https://raw.githubusercontent.com/csark0812/toolbox/main/'
          if (target.startsWith(toolboxRaw)) {
            const repositoryTarget = join(root, target.slice(toolboxRaw.length))
            expect(existsSync(repositoryTarget), `${file} links to missing ${target}`).toBe(true)
            continue
          }
          if (!target || /^[a-z]+:/i.test(target)) continue

          const resolved = resolve(dirname(file), target)
          expect(resolved.startsWith(`${skillRoot}${sep}`), `${file} escapes to ${target}`).toBe(
            true,
          )
          expect(existsSync(resolved), `${file} links to missing ${target}`).toBe(true)
        }
      }
    }
  })

  it('standalone workflows keep required behavior when companion skills are absent', () => {
    const probe = readFileSync(join(root, 'probe/SKILL.md'), 'utf8')
    const walkthrough = readFileSync(join(root, 'review-walkthrough/SKILL.md'), 'utf8')
    const refactor = readFileSync(join(root, 'refactor-companion/SKILL.md'), 'utf8')

    expect(probe).toMatch(/Without `council`, perform the same reads serially/)
    expect(walkthrough).toMatch(/Source rules → \[source-binding\.md\]/)
    expect(walkthrough).not.toMatch(/code-review surface adapters/)
    expect(refactor).toMatch(/core workflow remains complete without companion skills/)
    expect(refactor).toMatch(/Offer an installed walkthrough or review skill only when available/)
  })

  it('retired skills are gone (subagents, iterate)', () => {
    expect(existsSync(join(root, 'subagents/SKILL.md'))).toBe(false)
    expect(existsSync(join(root, 'iterate/SKILL.md'))).toBe(false)
    expect(existsSync(join(root, 'agent-suites/subagents'))).toBe(false)
    expect(existsSync(join(root, 'agent-suites/iterate'))).toBe(false)
  })

  it('excludes install-mirror skill trees from scan perimeter (registry SSOT is flat)', () => {
    const config = readFileSync(join(root, 'skeleton.toml'), 'utf8')
    expect(config).toMatch(/\.agents\/skills\/\*\*/)
    expect(config).toMatch(/\.claude\/skills\/\*\*/)
  })

  it('sync:skills imports EXPECTED_SKILLS (no duplicated slug list)', () => {
    const sync = readFileSync(join(root, 'scripts/sync-claude-skills.mjs'), 'utf8')
    const pkg = readFileSync(join(root, 'package.json'), 'utf8')
    expect(sync).toMatch(/from ['"]\.\.\/src\/expected-skills\.ts['"]/)
    expect(sync).toMatch(/EXPECTED_SKILLS/)
    expect(sync).not.toMatch(/const SKILL_SLUGS = \[\s*'subagents'/)
    expect(pkg).toMatch(/sync:skills": "node --experimental-strip-types/)
  })

  it('handoff keeps producer controls out of prompt and artifact output', () => {
    const skill = readFileSync(join(root, 'handoff/SKILL.md'), 'utf8')
    const pack = readFileSync(join(root, 'handoff/references/pack.md'), 'utf8')
    const output = readFileSync(join(root, 'handoff/references/output.md'), 'utf8')
    const dispatch = readFileSync(
      join(root, 'handoff/references/handoff-subagent-dispatch.md'),
      'utf8',
    )

    expect(skill).toMatch(/Pointers not bodies/)
    expect(skill).toMatch(/channel:prompt/)
    expect(skill).toMatch(/pack\.md/)
    expect(skill).not.toMatch(/## Original ask/)
    expect(skill).not.toMatch(/council\/SKILL/)

    expect(pack).toMatch(/not limits/)
    expect(pack).toMatch(/\*\*pointers\*\*/)
    expect(pack).toMatch(/\*\*prompt\*\*/)
    expect(pack).toMatch(/context-pack\.md/)

    expect(output).toMatch(/Open workspace: <absolute path>/)
    expect(output).toMatch(/Goal: \[one descriptive sentence\]/)
    expect(output).toMatch(/Start with: \[one imperative sentence\]/)
    expect(output).toMatch(/## Current state/)
    expect(output).toMatch(/## Files and links/)
    expect(output).toMatch(/producer controls/)
    expect(output).not.toMatch(/Handoff · channel:/)
    expect(output).toMatch(/Omit empty sections/)

    expect(dispatch).toMatch(/channel:artifact/)
    expect(dispatch).toMatch(/output\.md/)
    expect(dispatch).toMatch(/generalPurpose/)
  })

  it('tiers.md defines orchestrator vs process skill groups', () => {
    const tiers = readFileSync(join(root, 'docs/tiers.md'), 'utf8')
    expect(tiers).toMatch(/Orchestrators — agent-to-agent/)
    expect(tiers).toMatch(/Process skills — atoms/)
    expect(tiers).toMatch(/Composition/)
    expect(tiers).toMatch(/layered prompts/)
    expect(tiers).toMatch(/context-pack\.md/)
    expect(tiers).toMatch(/\*\*council\*\*/)
    expect(tiers).toMatch(/\*\*handoff\*\*/)
    expect(tiers).toMatch(/\*\*code-review\*\*/)
    expect(tiers).toMatch(/\*\*second-opinion\*\*/)
    expect(tiers).toMatch(/Retired \*\*subagents\*\* and \*\*iterate\*\*/)
    expect(tiers).not.toMatch(/Typical chains/)
    expect(tiers).not.toMatch(/Subagent kernel/)
  })

  it('second-opinion is thin; multi-agent depth is council', () => {
    const so = readFileSync(join(root, 'second-opinion/SKILL.md'), 'utf8')
    const planReview = readFileSync(join(root, 'second-opinion/references/plan-review.md'), 'utf8')
    const grill = readFileSync(join(root, 'grill/SKILL.md'), 'utf8')
    const intent = readFileSync(join(root, 'grill/references/intent-phase.md'), 'utf8')

    expect(so).toMatch(/\*\*Process skill\*\*/)
    expect(so).toMatch(/Invent lenses first/)
    expect(so).toMatch(/Coordinator-only by default/)
    expect(so).toMatch(/council/)
    expect(so).not.toMatch(/second-opinion-dispatch/)
    expect(so).not.toMatch(/adversarial-debate\.md/)
    expect(existsSync(join(root, 'second-opinion/references/adversarial-debate.md'))).toBe(false)
    expect(existsSync(join(root, 'council/references/second-opinion-dispatch.md'))).toBe(false)
    expect(planReview).toMatch(/Do not own multi-agent orchestration/)
    expect(planReview).toMatch(/council/)

    expect(grill).toMatch(/\*\*Process skill\*\*/)
    expect(grill).toMatch(/intent-phase\.md/)
    expect(grill).toMatch(/protocol\.md/)
    expect(grill).toMatch(/ask\.md/)
    expect(grill).not.toMatch(/## Protocol/)
    expect(intent).toMatch(/Alternate frame/)
    expect(intent).toMatch(/ask\.md/)
    expect(existsSync(join(root, 'grill/references/ask.md'))).toBe(true)
    expect(existsSync(join(root, 'crystallize/SKILL.md'))).toBe(false)
    expect(existsSync(join(root, 'investigate/SKILL.md'))).toBe(false)
    expect(existsSync(join(root, 'diagnose/SKILL.md'))).toBe(false)
  })

  it('council context-pack keeps shared vocabulary and minimum context rules', () => {
    const pack = readFileSync(join(root, 'council/references/context-pack.md'), 'utf8')
    const council = readFileSync(join(root, 'council/SKILL.md'), 'utf8')
    const handoffPack = readFileSync(join(root, 'handoff/references/pack.md'), 'utf8')

    expect(council).toMatch(/context-pack\.md/)
    expect(pack).toMatch(/Shared vocabulary/)
    expect(pack).toMatch(/Composition/)
    expect(pack).toMatch(/Slice/)
    expect(pack).toMatch(/Artifact/)
    expect(pack).toMatch(/Surface/)
    expect(pack).toMatch(/Closure/)
    expect(pack).toMatch(/minimum relevant facts/)
    expect(pack).toMatch(/Prefer paths, URLs, section names/)
    expect(pack).toMatch(/Omit empty fields/)
    expect(pack).toMatch(/Do not give first-round members sibling conclusions/)
    expect(handoffPack).toMatch(/context-pack\.md/)
  })

  it('grill ask.md is mid-turn SSOT without After you answer', () => {
    const ask = readFileSync(join(root, 'grill/references/ask.md'), 'utf8')
    expect(ask).toMatch(/## Questions/)
    expect(ask).toMatch(/Questions only/)
    expect(ask).toMatch(/\(recommended\)/)
    expect(ask).toMatch(/Why <letter>/)
    expect(ask).toMatch(/Where/)
    expect(ask).not.toMatch(/> \*\*Recommended:/)
    expect(ask).not.toMatch(/## After you answer/)
    expect(ask).not.toMatch(/^## Context$/m)
    const grill = readFileSync(join(root, 'grill/SKILL.md'), 'utf8')
    expect(grill).toMatch(/ask\.md/)
    expect(grill).not.toMatch(/One decision per turn/)
  })

  it('process skills use entry gates not routing tables', () => {
    for (const slug of ['grill', 'tdd', 'second-opinion', 'probe', 'code-review']) {
      const skill = readFileSync(join(root, slug, 'SKILL.md'), 'utf8')
      expect(skill).toMatch(/## Entry gate/)
      expect(skill).not.toMatch(/Routes elsewhere/)
      expect(skill).not.toMatch(/routing\.md/)
    }
  })
})
