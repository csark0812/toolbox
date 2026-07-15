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

  it('planning top-level refs are fail-loud stubs (no docs/prds bodies)', () => {
    const planningSkills = ['crystallize', 'grill', 'handoff', 'second-opinion']
    for (const slug of planningSkills) {
      const dir = join(root, slug, 'references/planning')
      if (!existsSync(dir)) continue
      for (const name of readdirSync(dir)) {
        if (!name.endsWith('.md')) continue
        const body = readFileSync(join(dir, name), 'utf8')
        expect(body).toMatch(/Portable stub \(incomplete\)/)
        expect(body).not.toMatch(/^Save to `docs\/prds\//m)
      }
    }
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
})
