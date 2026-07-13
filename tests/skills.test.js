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

  it('soft-default planning appendix keeps docs/prds recipes', () => {
    const sample = join(root, 'crystallize/references/planning/soft-default/prd-format.md')
    expect(existsSync(sample)).toBe(true)
    const body = readFileSync(sample, 'utf8')
    expect(body).toMatch(/Opt-in soft-default recipe/)
    expect(body).toMatch(/docs\/prds\//)
  })
})
