import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
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

  it('registry.md lists each shipped skill slug', () => {
    const registry = readFileSync(join(root, '.skeleton/registry.md'), 'utf8')
    for (const slug of EXPECTED_SKILLS) {
      expect(registry).toContain(slug)
    }
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

  it('subagents model routing is Auto-first and cheapest-good-enough', () => {
    const skill = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')
    const routing = readFileSync(join(root, 'subagents/references/model-routing.md'), 'utf8')
    const types = readFileSync(join(root, 'subagents/references/subagent-types.md'), 'utf8')
    const splitting = readFileSync(join(root, 'subagents/references/task-splitting.md'), 'utf8')
    const research = readFileSync(
      join(root, 'subagents/references/explore-escalation-dispatch.md'),
      'utf8',
    )
    const planEvidence = readFileSync(
      join(root, 'subagents/references/second-opinion-evidence-dispatch.md'),
      'utf8',
    )

    expect(existsSync(join(root, 'subagents/references/model-routing.md'))).toBe(true)
    expect(skill).toMatch(/model-routing\.md/)
    expect(skill).toMatch(/subagent-types\.md/)
    expect(skill).toMatch(/task-splitting\.md/)
    expect(skill).toMatch(/cheapest good enough/i)
    expect(skill).toMatch(/When-not-to-spawn/)
    expect(skill).not.toMatch(/disable-model-invocation/)

    expect(routing).toMatch(/Anti-fast \(parallel\)/)
    expect(routing).toMatch(/Example dispatches \(validation\)/)
    expect(routing).toMatch(/Auto reachable: no/)
    expect(routing).toMatch(/Do not use.*\*-fast/)

    expect(research).toMatch(/Parallel research/)
    expect(research).toMatch(/model=inherit-auto/)
    expect(research).not.toMatch(/model=composer-2\.5-fast/)
    expect(planEvidence).toMatch(/model=inherit-auto/)
    expect(planEvidence).not.toMatch(/model=composer-2\.5-fast/)

    expect(types).toMatch(/explore/)
    expect(splitting).toMatch(/Minimum viable context/)
  })

  it('Auto-parent model inheritance is a fail-closed pre-spawn invariant', () => {
    const skill = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')
    const routing = readFileSync(join(root, 'subagents/references/model-routing.md'), 'utf8')
    const discovery = readFileSync(join(root, 'subagents/references/agent-discovery.md'), 'utf8')
    const taskPrompt = readFileSync(join(root, 'subagents/references/task-prompt.md'), 'utf8')
    const council = readFileSync(
      join(root, 'subagents/references/review-council-dispatch.md'),
      'utf8',
    )
    const perspectiveInvestigate = readFileSync(
      join(root, 'subagents/references/explore-escalation-dispatch.md'),
      'utf8',
    )
    const adversarialDebate = readFileSync(
      join(root, 'subagents/references/second-opinion-dispatch.md'),
      'utf8',
    )
    const adversarialKernel = readFileSync(
      join(root, 'subagents/references/adversarial.md'),
      'utf8',
    )
    const broad = readFileSync(
      join(root, 'subagents/references/explore-escalation-dispatch.md'),
      'utf8',
    )

    // Canonical invariant stays in subagents + model-routing.
    expect(skill).toMatch(/model-routing\.md/)
    expect(skill).toMatch(/Pre-spawn gate/)

    expect(routing).toMatch(/Routing precedence \(canonical order\)/)
    expect(routing).toMatch(/Pre-spawn model-routing gate/)
    expect(routing).toMatch(/Fail closed \(do not spawn\)/)
    expect(routing).toMatch(/Plan vs tool syntax/)
    expect(routing).toMatch(/Explicit routing \(named parent only\)/)
    expect(routing).toMatch(/Correct — Auto parent/)
    expect(routing).toMatch(/tier=Premium · model=inherit-auto/)
    expect(routing).toMatch(/Incorrect — Auto parent with an explicit slug/)
    expect(routing).toMatch(/model=gpt-5\.3-codex-high-fast/)
    expect(routing).toMatch(/Correct — named parent/)
    expect(routing).toMatch(/Correct — explicit user override/)
    expect(routing).toMatch(/User model overrides: reviewer=gpt-5\.3-codex-high-fast/)
    expect(routing).toMatch(/Correct — usage-limit retry/)
    expect(routing).toMatch(/Task\/Subagent\(/)
    expect(routing).toMatch(/There is \*\*no\*\* `model` argument/)

    // Fail-closed contradictions (disclosed)
    expect(routing).toMatch(/Plan says `Parent model: Auto` but any member has an explicit slug/)
    expect(routing).toMatch(
      /Plan says `model=inherit-auto` but the generated Task\/Subagent call contains a `model` property/,
    )

    // Entry/auxiliary docs reference the kernel instead of redefining the gate.
    expect(council).toMatch(/Parent model: \[Auto \| named\]/)
    expect(council).toMatch(/model=inherit-auto/)
    expect(council).toMatch(/code-review\/SKILL\.md/)
    expect(council).toMatch(/Pre-spawn model-routing gate/)
    expect(discovery).toMatch(/tier metadata.*not spawn instructions/s)
    expect(discovery).toMatch(/Tier→slug mapping is only for the named-parent branch/)
    expect(discovery).toMatch(/Parent model: \[Auto \| <named model>\]/)
    expect(taskPrompt).toMatch(/plan `model=inherit-auto` → omit the tool `model` argument/)
    expect(taskPrompt).toMatch(/adversarial\.md/)

    // Related entry recipes reconciled away from forced slugs
    expect(perspectiveInvestigate).toMatch(/model=inherit-auto/)
    expect(perspectiveInvestigate).not.toMatch(/model=\[slug A\]/)
    expect(perspectiveInvestigate).toMatch(/Goal: adversarial/)
    expect(adversarialDebate).toMatch(/model=inherit-auto/)
    expect(adversarialDebate).not.toMatch(/model=\[slug A\]/)
    expect(adversarialDebate).toMatch(/Goal: adversarial-staged/)
    expect(adversarialDebate).toMatch(/stance=premises/)
    expect(adversarialDebate).toMatch(/stance=completeness/)
    expect(adversarialDebate).toMatch(/stance=defend/)
    expect(adversarialKernel).toMatch(/Staged debate/)
    expect(adversarialKernel).toMatch(/Context asymmetry/)
    expect(adversarialKernel).toMatch(/iterate/)
    expect(broad).toMatch(/model=inherit-auto/)
    expect(broad).not.toMatch(/model=\[cheapest\]/)
    expect(broad).toMatch(/Parent model: \[Auto \| named\]/)
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

    expect(skill).toMatch(/How to review/)
    expect(skill).toMatch(/Review only/)
    expect(skill).toMatch(/Merge-blockers default/)
    expect(skill).not.toMatch(/anti-thrash/)
    expect(skill).not.toMatch(/fix-loop/)
    expect(skill).not.toMatch(/Escalate only when matched/)
    expect(skill).toMatch(/review-council-dispatch\.md/)
    expect(skill).toMatch(/subagents/)

    expect(review).toMatch(/Introduced-only/)
    expect(review).toMatch(/path:line/)
    expect(review).not.toMatch(/Hard stop/)
    expect(review).not.toMatch(/Task\/Subagent/)

    expect(output).toMatch(/Review · source:/)
    expect(output).toMatch(/Filing: merge-blockers only/)
    expect(output).not.toMatch(/Pass class:/)
    expect(output).not.toMatch(/Thrash:/)
    expect(output).not.toMatch(/Reviewer: primary/)

    expect(sources).toMatch(/git diff/)
    expect(blockers).toMatch(/merge-blockers only/)
  })

  it('iterate owns thrash vocabulary moved from code-review', () => {
    const antiThrash = readFileSync(join(root, 'iterate/references/anti-thrash.md'), 'utf8')
    const ledger = readFileSync(join(root, 'iterate/references/fix-loop-ledger.md'), 'utf8')

    expect(antiThrash).toMatch(/Thrash signal/)
    expect(antiThrash).toMatch(/Thrash: inventory-required/)
    expect(ledger).toMatch(/## Predicate glossary/)
    expect(ledger).toMatch(/session-pin-plane-attach/)
  })

  it('excludes install-mirror skill trees from scan perimeter (registry SSOT is flat)', () => {
    const config = readFileSync(join(root, '.skeleton/config.yaml'), 'utf8')
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

  it('iterate mandates blind Task spawn and split closure semantics', () => {
    const skill = readFileSync(join(root, 'iterate/SKILL.md'), 'utf8')
    const protocol = readFileSync(join(root, 'iterate/references/protocol.md'), 'utf8')
    const dispatch = readFileSync(
      join(root, 'iterate/references/blind-reviewer-dispatch.md'),
      'utf8',
    )
    const exitGate = readFileSync(join(root, 'iterate/references/exit-gate.md'), 'utf8')
    const multi = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')
    const adversarial = readFileSync(join(root, 'subagents/references/adversarial.md'), 'utf8')

    expect(skill).toMatch(/iterate/)
    expect(skill).toMatch(/Closure: ready/)
    expect(skill).toMatch(/violation/)
    expect(skill).toMatch(/name: iterate/)

    expect(protocol).toMatch(/Hard gate/)
    expect(protocol).toMatch(/Closure: ready/)
    expect(protocol).toMatch(/violation/)

    expect(dispatch).toMatch(/model=inherit-auto/)
    expect(dispatch).toMatch(/Forbidden inputs/)
    expect(dispatch).toMatch(/Cohesion: attested-local/)

    expect(exitGate).toMatch(/Closure: ready/)
    expect(exitGate).toMatch(/attested-local/)
    expect(exitGate).toMatch(/Clean streak/)

    expect(multi).toMatch(/iterate/)
    expect(multi).toMatch(/blind-reviewer-dispatch/)
    expect(adversarial).not.toMatch(/blind-reviewer-dispatch/)
  })

  it('handoff is token-minimal with channel, pack, and prompt vs artifact', () => {
    const skill = readFileSync(join(root, 'handoff/SKILL.md'), 'utf8')
    const pack = readFileSync(join(root, 'handoff/references/pack.md'), 'utf8')
    const output = readFileSync(join(root, 'handoff/references/output.md'), 'utf8')
    const dispatch = readFileSync(
      join(root, 'handoff/references/handoff-subagent-dispatch.md'),
      'utf8',
    )
    const subagents = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')

    expect(skill).not.toMatch(/disable-model-invocation/)
    expect(skill).toMatch(/Pointers not bodies/)
    expect(skill).toMatch(/channel:prompt/)
    expect(skill).toMatch(/pack\.md/)
    expect(skill).not.toMatch(/## Original ask/)

    expect(pack).toMatch(/not limits/)
    expect(pack).toMatch(/\*\*pointers\*\*/)
    expect(pack).toMatch(/\*\*prompt\*\*/)

    expect(output).toMatch(/Handoff · channel:/)
    expect(output).toMatch(/Omit empty sections/)

    expect(dispatch).toMatch(/channel:artifact/)
    expect(dispatch).toMatch(/output\.md/)

    expect(subagents).toMatch(/handoff/)
    expect(subagents).toMatch(/handoff-subagent-dispatch/)
  })

  it('tiers.md defines orchestrator vs process skill groups', () => {
    const tiers = readFileSync(join(root, 'docs/tiers.md'), 'utf8')
    expect(tiers).toMatch(/Orchestrators — agent-to-agent/)
    expect(tiers).toMatch(/Process skills — atoms/)
    expect(tiers).toMatch(/Composition/)
    expect(tiers).toMatch(/layered prompts/)
    expect(tiers).toMatch(/context-pack\.md/)
    expect(tiers).toMatch(/\*\*subagents\*\*/)
    expect(tiers).toMatch(/\*\*iterate\*\*/)
    expect(tiers).toMatch(/\*\*handoff\*\*/)
    expect(tiers).toMatch(/\*\*code-review\*\*/)
    expect(tiers).toMatch(/\*\*second-opinion\*\*/)
    expect(tiers).not.toMatch(/Typical chains/)
    expect(tiers).not.toMatch(/Subagent kernel/)
  })

  it('process skills are thin and dispatch lives under subagents', () => {
    const so = readFileSync(join(root, 'second-opinion/SKILL.md'), 'utf8')
    const soDispatch = readFileSync(
      join(root, 'subagents/references/second-opinion-dispatch.md'),
      'utf8',
    )
    const grill = readFileSync(join(root, 'grill/SKILL.md'), 'utf8')
    const intent = readFileSync(join(root, 'grill/references/intent-phase.md'), 'utf8')

    expect(so).toMatch(/\*\*Process skill\*\*/)
    expect(so).toMatch(/second-opinion-dispatch\.md/)
    expect(so).not.toMatch(/adversarial-debate\.md/)
    expect(existsSync(join(root, 'second-opinion/references/adversarial-debate.md'))).toBe(false)
    expect(soDispatch).toMatch(/Goal: adversarial-staged/)

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

  it('subagents context-pack is SSOT for member envelopes and composability', () => {
    const pack = readFileSync(join(root, 'subagents/references/context-pack.md'), 'utf8')
    const subagents = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')
    const adversarial = readFileSync(join(root, 'subagents/references/adversarial.md'), 'utf8')
    const handoffPack = readFileSync(join(root, 'handoff/references/pack.md'), 'utf8')
    const sliceEnv = readFileSync(join(root, 'iterate/references/slice-envelope.md'), 'utf8')

    expect(subagents).toMatch(/context-pack\.md/)
    expect(subagents).toMatch(/100k|100,000/)
    expect(pack).toMatch(/Composability \(layered prompts\)/)
    expect(pack).toMatch(/100k/)
    expect(pack).toMatch(/Slice/)
    expect(pack).toMatch(/Closure/)
    expect(pack).not.toMatch(/Typical chains/)
    expect(pack).toMatch(/Pointers not bodies/)
    expect(pack).toMatch(/Omit empty/)
    expect(pack).toMatch(/Domain recipes/)
    expect(adversarial).toMatch(/context-pack\.md/)
    expect(adversarial).not.toMatch(/Requirements \/ acceptance \(if any\):/)
    expect(handoffPack).toMatch(/context-pack\.md/)
    expect(sliceEnv).toMatch(/context-pack\.md/)
    expect(existsSync(join(root, 'iterate/references/routing.md'))).toBe(false)
  })

  it('grill ask.md is mid-turn SSOT without After you answer', () => {
    const ask = readFileSync(join(root, 'grill/references/ask.md'), 'utf8')
    expect(ask).toMatch(/## Context/)
    expect(ask).toMatch(/## Questions/)
    expect(ask).toMatch(/Where/)
    expect(ask).toMatch(/Recommended:/)
    expect(ask).toMatch(/N=1/)
    expect(ask).not.toMatch(/## After you answer/)
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
