import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SKILLS } from '../src/expected-skills.ts'

const root = join(import.meta.dirname, '..')
const dir = join(root, 'workflow/references/playbooks')
const workflow = SKILLS.find((skill) => skill.slug === 'workflow')
const declared = new Set([...workflow.required, ...workflow.optional])
const otherSlugs = SKILLS.map((skill) => skill.slug).filter((slug) => slug !== 'workflow')

describe('workflow playbooks', () => {
  const files = readdirSync(dir).filter((file) => file.endsWith('.md'))

  it('are each linked from the workflow skill', () => {
    const skill = readFileSync(join(root, 'workflow/SKILL.md'), 'utf8')
    expect(files.length).toBeGreaterThanOrEqual(8)
    for (const file of files) expect(skill).toContain(`references/playbooks/${file}`)
  })

  for (const file of files)
    it(`${file} has an owner line, numbered steps, a reply contract and only declared companions`, () => {
      const body = readFileSync(join(dir, file), 'utf8')
      expect(body).toMatch(/^\*\*You own\*\*/m)
      expect(body).toMatch(/^1\. /m)
      expect(body).toMatch(/^\*\*Reply contract:\*\*/m)
      for (const slug of otherSlugs)
        if (new RegExp(`\\b${slug}\\b`).test(body))
          expect(declared.has(slug), `${file} names undeclared companion ${slug}`).toBe(true)
    })
})
