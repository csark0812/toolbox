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
    const planningSkills = ['crystallize', 'grill', 'handoff', 'second-opinion']
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
    const research = readFileSync(join(root, 'investigate/references/parallel-research.md'), 'utf8')
    const planEvidence = readFileSync(
      join(root, 'second-opinion/references/parallel-plan-evidence.md'),
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
    const council = readFileSync(join(root, 'code-review/references/council-dispatch.md'), 'utf8')
    const perspectiveInvestigate = readFileSync(
      join(root, 'investigate/references/parallel-perspective.md'),
      'utf8',
    )
    const adversarialDebate = readFileSync(
      join(root, 'second-opinion/references/adversarial-debate.md'),
      'utf8',
    )
    const adversarialKernel = readFileSync(
      join(root, 'subagents/references/adversarial.md'),
      'utf8',
    )
    const broad = readFileSync(join(root, 'investigate/references/parallel-broad.md'), 'utf8')

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
    expect(council).toMatch(/Parent model: \[Auto \| <named model>\]/)
    expect(council).toMatch(/model=\[inherit-auto \| slug\]/)
    expect(council).toMatch(/inherit-auto` means \*\*omit\*\* the Task\/Subagent `model` argument/)
    expect(council).toMatch(/Council dispatch does not redefine that gate/)
    expect(council).not.toMatch(/## Checklist before spawn/)
    expect(council).not.toMatch(/model=\[slug\]/)
    expect(discovery).toMatch(/tier metadata.*not spawn instructions/s)
    expect(discovery).toMatch(/Tier→slug mapping is only for the named-parent branch/)
    expect(discovery).toMatch(/Parent model: \[Auto \| <named model>\]/)
    expect(taskPrompt).toMatch(/plan `model=inherit-auto` → omit the tool `model` argument/)
    expect(taskPrompt).toMatch(/adversarial\.md/)

    // Related entry recipes reconciled away from forced slugs
    expect(perspectiveInvestigate).toMatch(/model=\[inherit-auto \| slug\]/)
    expect(perspectiveInvestigate).not.toMatch(/model=\[slug A\]/)
    expect(perspectiveInvestigate).toMatch(/Goal: adversarial/)
    expect(adversarialDebate).toMatch(/model=\[inherit-auto \| slug\]/)
    expect(adversarialDebate).not.toMatch(/model=\[slug A\]/)
    expect(adversarialDebate).toMatch(/Goal: adversarial-staged/)
    expect(adversarialDebate).toMatch(/stance=premises/)
    expect(adversarialDebate).toMatch(/stance=completeness/)
    expect(adversarialDebate).toMatch(/stance=defend/)
    expect(adversarialKernel).toMatch(/Staged debate/)
    expect(adversarialKernel).toMatch(/Context asymmetry/)
    expect(adversarialKernel).toMatch(/iterate/)
    expect(broad).toMatch(/model=\[inherit-auto \| slug\]/)
    expect(broad).not.toMatch(/model=\[cheapest\]/)
    expect(broad).toMatch(/Parent model: \[Auto \| <named model>\]/)
  })

  it('investigate enforces find-and-verdict-only (no fix in verdict)', () => {
    const skill = readFileSync(join(root, 'investigate/SKILL.md'), 'utf8')
    expect(skill).toMatch(/Find and verdict only/)
    expect(skill).toMatch(/Do not propose code edits, diffs/)
    expect(skill).toMatch(/Completion gate:.*no code fix/s)
  })

  it('code-review defaults to primary; council only on escalation', () => {
    const skill = readFileSync(join(root, 'code-review/SKILL.md'), 'utf8')
    const council = readFileSync(join(root, 'code-review/references/council-dispatch.md'), 'utf8')
    const synthesis = readFileSync(join(root, 'code-review/references/synthesis.md'), 'utf8')
    const review = readFileSync(join(root, 'code-review/references/review.md'), 'utf8')
    const escalation = readFileSync(join(root, 'code-review/references/escalation.md'), 'utf8')
    const multi = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')

    expect(skill).toMatch(/Primary-first/)
    expect(skill).toMatch(/no Task members/)
    expect(skill).toMatch(/Escalate only when matched/)
    expect(skill).toMatch(/references\/escalation\.md/)

    expect(review).toMatch(/Primary review/)
    expect(review).toMatch(/zero Task\/Subagent members/)

    expect(escalation).toMatch(/Primary/)
    expect(escalation).toMatch(/Targeted specialists/)
    expect(escalation).toMatch(/Council/)
    expect(escalation).toMatch(/Fit check timing/)
    expect(escalation).toMatch(/entry-skill carve-out/)
    expect(escalation).not.toMatch(/Fit check ON/)

    expect(council).toMatch(/escalation only/)
    expect(council).toMatch(/Primary path/)
    expect(council).toMatch(/without.*member Tasks/)
    expect(council).toMatch(/entry-skill carve-out/)
    expect(council).toMatch(/do not.*re-run Fit check/i)
    expect(council).not.toMatch(/run \[`subagents` when-not-to-spawn\]/)

    expect(synthesis).toMatch(/Primary-only/)
    expect(synthesis).toMatch(/Escalated hard gate/)

    expect(multi).toMatch(/Entry-skill carve-out/)
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

  it('code-review anti-thrash guard calibrates re-review instead of reflex councils', () => {
    const skill = readFileSync(join(root, 'code-review/SKILL.md'), 'utf8')
    const antiThrash = readFileSync(join(root, 'code-review/references/anti-thrash.md'), 'utf8')
    const surfaces = readFileSync(join(root, 'code-review/references/surfaces.md'), 'utf8')
    const ledger = readFileSync(join(root, 'code-review/references/fix-loop-ledger.md'), 'utf8')
    const council = readFileSync(join(root, 'code-review/references/council-dispatch.md'), 'utf8')
    const synthesis = readFileSync(join(root, 'code-review/references/synthesis.md'), 'utf8')
    const prompt = readFileSync(join(root, 'code-review/references/task-prompt-review.md'), 'utf8')
    const output = readFileSync(join(root, 'code-review/references/output.md'), 'utf8')
    const selection = readFileSync(join(root, 'code-review/references/agent-selection.md'), 'utf8')

    expect(skill).toMatch(/references\/anti-thrash\.md/)
    expect(skill).toMatch(/no Task members/)

    expect(antiThrash).toMatch(/# Anti-thrash preflight/)
    expect(antiThrash).toMatch(/closure-re-review/)
    expect(antiThrash).toMatch(/new-scope-review/)
    expect(antiThrash).toMatch(/Thrash signal/)
    expect(antiThrash).toMatch(/targeted contextual/)
    expect(antiThrash).toMatch(/Same-hotspot commit-stack thrash/)
    expect(antiThrash).toMatch(/Thrash: inventory-required/)
    expect(antiThrash).toMatch(/Never write/)
    expect(antiThrash).toMatch(/Green cleanup/)
    expect(antiThrash).toMatch(/Over-fire/)
    expect(antiThrash).toMatch(/## Hard stop \(before Task \/ council\)/)
    expect(antiThrash).toMatch(/before any Task\/Subagent or council spawn/)
    expect(antiThrash).toMatch(/git log --oneline --stat -n 12/)

    const review = readFileSync(join(root, 'code-review/references/review.md'), 'utf8')
    expect(review).toMatch(/Hard stop/)
    expect(review).toMatch(/Theme: <id>/)
    expect(review).toMatch(/Continuity persistence/)

    expect(surfaces).toMatch(/closure-re-review/)
    expect(surfaces).toMatch(/targeted contextual/)
    expect(surfaces).toMatch(/## Full contextual/)
    expect(surfaces).toMatch(/anti-thrash\.md/)

    expect(ledger).toMatch(/## Same-invariant sweep/)
    expect(ledger).toMatch(/## Thrash signal/)
    expect(ledger).toMatch(/## Repeated-review guard/)
    expect(ledger).toMatch(/## Predicate glossary/)
    expect(ledger).toMatch(/## Contract-class catalog/)
    expect(ledger).toMatch(/shell-argv-free-text-sinks/)
    expect(ledger).toMatch(/session-pin-plane-attach/)
    expect(ledger).toMatch(/Two or more Action blockers/)
    expect(ledger).toMatch(/Never write/)
    expect(ledger).toMatch(/anti-thrash\.md/)

    expect(council).toMatch(/Pass class:/)
    expect(council).toMatch(/Anti-thrash completed/)
    expect(council).toMatch(/anti-thrash\.md/)

    expect(synthesis).toMatch(/thrash collapse/)
    expect(synthesis).toMatch(/closure-re-review/)

    expect(prompt).toMatch(/## Contextual ledger overlay/)
    expect(prompt).toMatch(/sibling variants would fail/)
    expect(prompt).toMatch(/Thrash signal:/)
    expect(prompt).toMatch(/inventory-required/)
    expect(prompt).toMatch(/Orchestrated on \*\*escalated\*\* runs only/)

    expect(output).toMatch(/Stayed targeted contextual/)
    expect(output).toMatch(/Pass: targeted contextual/)
    expect(output).toMatch(/Thrash:/)
    expect(output).toMatch(/inventory-required/)
    expect(output).toMatch(/Reviewer: primary/)
    expect(output).toMatch(/## Continuity persistence/)
    expect(output).toMatch(/Persist \(cold-chat recovery\)/)
    expect(ledger).toMatch(/### Persistence/)

    expect(selection).toMatch(/escalated council only/)
    expect(selection).toMatch(/Primary-only reviews do not run this doc/)
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
    expect(skill).toMatch(/Hard gate/)
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

  it('handoff is model-invoked with subagent artifact path and user prompt-only branch', () => {
    const skill = readFileSync(join(root, 'handoff/SKILL.md'), 'utf8')
    const dispatch = readFileSync(
      join(root, 'handoff/references/handoff-subagent-dispatch.md'),
      'utf8',
    )
    const subagents = readFileSync(join(root, 'subagents/SKILL.md'), 'utf8')

    expect(skill).not.toMatch(/disable-model-invocation/)
    expect(skill).toMatch(/User-request/)
    expect(skill).toMatch(/prompt-only/)
    expect(skill).toMatch(/Model-invoked/)
    expect(skill).toMatch(/Hard gate/)

    expect(dispatch).toMatch(/model=inherit-auto/)
    expect(dispatch).toMatch(/write-handoff-artifact/)

    expect(subagents).toMatch(/handoff/)
    expect(subagents).toMatch(/handoff-subagent-dispatch/)
  })
})
