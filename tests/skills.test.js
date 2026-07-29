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
      'agent-routing.md',
      'dialogue-contract.md',
      'dialogue-handoffs.md',
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
      if (skill.includes('agent-routing') || skill.includes('dialogue-contract')) {
        expect(skill).toContain(raw)
      }
    }
    expect(existsSync(join(root, '.skeleton/references/agent-routing.md'))).toBe(true)
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

  it('multi model routing is Auto-first and does not default parallel Standard to composer-2.5-fast', () => {
    const skill = readFileSync(join(root, 'multi/SKILL.md'), 'utf8')
    const routing = readFileSync(join(root, 'multi/references/model-routing.md'), 'utf8')
    const research = readFileSync(join(root, 'investigate/references/parallel-research.md'), 'utf8')
    const planEvidence = readFileSync(
      join(root, 'second-opinion/references/parallel-plan-evidence.md'),
      'utf8',
    )

    expect(existsSync(join(root, 'multi/references/model-routing.md'))).toBe(true)
    expect(skill).toMatch(/model-routing\.md/)
    expect(skill).toMatch(/cheapest good enough/i)
    expect(skill).toMatch(/Anti-fast \(parallel\)/)
    expect(skill).not.toMatch(/Standard → `composer-2\.5-fast`/)
    expect(skill).not.toMatch(/Preferred slug\s+\|\s+`composer-2\.5-fast`/)

    expect(routing).toMatch(/inherit-auto/)
    expect(routing).toMatch(/Example dispatches \(validation\)/)
    expect(routing).toMatch(/Auto reachable: no/)
    expect(routing).toMatch(/Do not use.*\*-fast/)

    expect(research).toMatch(/model=inherit-auto/)
    expect(research).not.toMatch(/model=composer-2\.5-fast/)
    expect(planEvidence).toMatch(/model=inherit-auto/)
    expect(planEvidence).not.toMatch(/model=composer-2\.5-fast/)
  })

  it('Auto-parent model inheritance is a fail-closed pre-spawn invariant', () => {
    const skill = readFileSync(join(root, 'multi/SKILL.md'), 'utf8')
    const routing = readFileSync(join(root, 'multi/references/model-routing.md'), 'utf8')
    const discovery = readFileSync(join(root, 'multi/references/agent-discovery.md'), 'utf8')
    const taskPrompt = readFileSync(join(root, 'multi/references/task-prompt.md'), 'utf8')
    const council = readFileSync(join(root, 'code-review/references/council-dispatch.md'), 'utf8')
    const perspectiveInvestigate = readFileSync(
      join(root, 'investigate/references/parallel-perspective.md'),
      'utf8',
    )
    const adversarialDebate = readFileSync(
      join(root, 'second-opinion/references/adversarial-debate.md'),
      'utf8',
    )
    const adversarialKernel = readFileSync(join(root, 'multi/references/adversarial.md'), 'utf8')
    const broad = readFileSync(join(root, 'investigate/references/parallel-broad.md'), 'utf8')

    // Canonical invariant + precedence
    expect(skill).toMatch(/Parent model = Auto.*no user model override/s)
    expect(skill).toMatch(/Routing precedence \(canonical order\)/)
    expect(skill).toMatch(/Pre-spawn model-routing gate/)
    expect(skill).toMatch(/Fail closed \(do not spawn\)/)
    expect(skill).toMatch(/Plan vs tool syntax/)
    expect(skill).toMatch(/User model overrides/)
    expect(skill).toMatch(/model=\[inherit-auto \| slug\]/)
    expect(skill).toMatch(/Explicit routing \(named parent only\)/)
    expect(skill).toMatch(/Adversarial/)
    expect(skill).toMatch(/adversarial-staged/)

    // inherit-auto is a sentinel, not a slug; examples live in model-routing.
    expect(skill).toMatch(/dispatch-plan sentinel only/)
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

    // Fail-closed contradictions
    expect(skill).toMatch(/Plan says `Parent model: Auto` but any member has an explicit slug/)
    expect(skill).toMatch(
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
    expect(broad).toMatch(/model=\[inherit-auto \| slug\]/)
    expect(broad).not.toMatch(/model=\[cheapest\]/)
    expect(broad).toMatch(/Parent model: \[Auto \| <named model>\]/)
  })

  it('code-review defaults to primary; council only on escalation', () => {
    const skill = readFileSync(join(root, 'code-review/SKILL.md'), 'utf8')
    const council = readFileSync(join(root, 'code-review/references/council-dispatch.md'), 'utf8')
    const synthesis = readFileSync(join(root, 'code-review/references/synthesis.md'), 'utf8')
    const review = readFileSync(join(root, 'code-review/references/review.md'), 'utf8')
    const escalation = readFileSync(join(root, 'code-review/references/escalation.md'), 'utf8')
    const multi = readFileSync(join(root, 'multi/SKILL.md'), 'utf8')

    expect(skill).toMatch(/Primary-first/)
    expect(skill).toMatch(/no Task members/)
    expect(skill).toMatch(/Escalate only when matched/)
    expect(skill).toMatch(/references\/escalation\.md/)

    expect(review).toMatch(/Primary review/)
    expect(review).toMatch(/zero Task\/Subagent members/)

    expect(escalation).toMatch(/Primary/)
    expect(escalation).toMatch(/Targeted specialists/)
    expect(escalation).toMatch(/Council/)

    expect(council).toMatch(/escalation only/)
    expect(council).toMatch(/Primary path/)
    expect(council).toMatch(/without.*member Tasks/)
    expect(council).toMatch(/Fit check/)

    expect(synthesis).toMatch(/Primary-only/)
    expect(synthesis).toMatch(/Escalated hard gate/)

    expect(multi).toMatch(/Entry-skill carve-out/)
  })

  it('excludes install-mirror skill trees from scan perimeter (registry SSOT is flat)', () => {
    const config = readFileSync(join(root, '.skeleton/config.yaml'), 'utf8')
    expect(config).toMatch(/\.agents\/skills\/\*\*/)
    expect(config).toMatch(/\.claude\/skills\/\*\*/)
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
    expect(antiThrash).toMatch(/targeted closure/)
    expect(antiThrash).toMatch(/Commit-stack thrash/)
    expect(antiThrash).toMatch(/Green cleanup/)

    expect(surfaces).toMatch(/closure-re-review/)
    expect(surfaces).toMatch(/targeted contextual/)
    expect(surfaces).toMatch(/anti-thrash\.md/)

    expect(ledger).toMatch(/## Same-invariant sweep/)
    expect(ledger).toMatch(/## Thrash signal/)
    expect(ledger).toMatch(/## Repeated-review guard/)
    expect(ledger).toMatch(/Two or more Action blockers/)
    expect(ledger).toMatch(/anti-thrash\.md/)

    expect(council).toMatch(/Pass class:/)
    expect(council).toMatch(/Anti-thrash completed/)
    expect(council).toMatch(/anti-thrash\.md/)

    expect(synthesis).toMatch(/thrash collapse/)
    expect(synthesis).toMatch(/closure-re-review/)

    expect(prompt).toMatch(/## Contextual ledger overlay/)
    expect(prompt).toMatch(/sibling variants would fail/)
    expect(prompt).toMatch(/Thrash signal:/)
    expect(prompt).toMatch(/Orchestrated on \*\*escalated\*\* runs only/)

    expect(output).toMatch(/Stayed targeted contextual/)
    expect(output).toMatch(/Pass: targeted contextual/)
    expect(output).toMatch(/Reviewer: primary/)

    expect(selection).toMatch(/escalated council only/)
    expect(selection).toMatch(/Primary-only reviews do not run this doc/)
  })
})
