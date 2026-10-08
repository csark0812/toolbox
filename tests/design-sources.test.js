import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const index = readFileSync('references/design-source-index.md', 'utf8')
const manifest = readFileSync('references/original-skills/SHA256SUMS', 'utf8')
  .trim()
  .split('\n')
  .map((line) => {
    const [hash, path] = line.split(/\s{2}/)
    return { hash, path }
  })

describe('design source retention', () => {
  it('keeps the five starting sources and all 29 direct resource links', () => {
    for (const url of [
      'https://x.com/vojta_holik/status/2107848427472326920',
      'https://x.com/vibrantdesign_/status/2107425600852168728',
      'https://x.com/p4nthera_/status/2107175720086589633',
      'https://x.com/himanshubuildss/status/2107063044279058483',
      'https://www.tobiadonadon.com/projects/construct/material/skills',
    ])
      expect(index).toContain(url)
    const rows = index.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line))
    expect(rows).toHaveLength(29)
    for (const row of rows) expect(row).toMatch(/https:\/\//)
  })

  it('detects changed public source bytes', () => {
    let count = 0
    for (const { hash, path } of manifest) {
      const actual = createHash('sha256')
        .update(readFileSync(join('references/original-skills', path)))
        .digest('hex')
      expect(actual, path).toBe(hash)
      count++
    }
    expect(count).toBeGreaterThan(20)
  })
})
