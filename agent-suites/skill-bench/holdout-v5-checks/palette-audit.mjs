// Hidden acceptance for contrastRatio() and --min: WCAG 2 ratios for the stated colour forms,
// symmetric and case-insensitive, TypeErrors quoting anything else, and an audit that prints
// each ratio to two decimals, marks pairs under the minimum, and uses the stated exit codes.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { contrastRatio } = await import(pathToFileURL(join(dir, 'src/contrast.mjs')).href)
const near = (actual, want, label) =>
  assert.ok(Math.abs(actual - want) < 0.01, `${label}: ${actual} is not about ${want}`)
near(contrastRatio('#000000', '#ffffff'), 21, 'black on white')
near(contrastRatio('#ffffff', '#000000'), 21, 'white on black')
near(contrastRatio('#777', '#fff'), 4.48, '#777 on white')
near(contrastRatio('#fff', '#777777'), 4.48, 'symmetric')
near(contrastRatio('#FFF', '#ffffff'), 1, 'same colour, any case')
near(contrastRatio('rgb(255, 255, 255)', '#000'), 21, 'rgb()')
near(contrastRatio('rgb(0,0,0)', 'rgb(0, 0, 0)'), 1, 'rgb() without spaces')
near(contrastRatio('#1d2733', '#FFFFFF'), 15.11, 'body text')
near(contrastRatio('#2F9E6E', '#fff'), 3.37, 'upper-case hex')
near(contrastRatio('rgb(255, 244, 214)', 'rgb(122, 74, 0)'), 6.83, 'banner')
for (const bad of ['#ggg', '#12345', 'blue', 'rgb(256, 0, 0)', 'rgb(1, 2)', '', '#1234', '123456'])
  assert.throws(
    () => contrastRatio(bad, '#ffffff'),
    (error) => error instanceof TypeError && (bad === '' || error.message.includes(bad)),
    `contrastRatio(${JSON.stringify(bad)}) throws a TypeError quoting it`,
  )
assert.throws(() => contrastRatio('#fff', 'nope'), TypeError, 'the background is checked too')

const audit = (...args) =>
  spawnSync(process.execPath, ['bin/audit.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const RATIOS = {
  harbour: [
    ['body text', '15.11'],
    ['muted text', '3.74'],
    ['link', '5.69'],
    ['button label', '3.37'],
    ['banner', '6.83'],
    ['badge', '3.58'],
  ],
  night: [
    ['body text', '14.91'],
    ['muted text', '3.83'],
    ['link', '8.46'],
  ],
}
function expectAudit(file, args, min, status) {
  const run = audit(`palettes/${file}.json`, ...args)
  const label = `audit ${file} ${args.join(' ')}`
  assert.equal(run.status, status, `${label} exits ${status}`)
  const lines = run.stdout.split('\n')
  for (const [use, ratio] of RATIOS[file]) {
    const line = lines.find((text) => text.includes(use) && !(use === 'link' && /text/.test(text)))
    assert.ok(line, `${label}: a line for ${use}`)
    assert.ok(line.includes(ratio), `${label}: ${use} shows ${ratio}: ${line}`)
    assert.equal(
      /FAIL/.test(line),
      Number(ratio) < min,
      `${label}: ${use} marked correctly: ${line}`,
    )
  }
}
expectAudit('harbour', [], 4.5, 1)
expectAudit('harbour', ['--min', '3'], 3, 0)
expectAudit('harbour', ['--min', '7'], 7, 1)
expectAudit('night', [], 4.5, 1)
expectAudit('night', ['--min', '3.5'], 3.5, 0)
for (const min of ['abc', '0.5', '22', ''])
  assert.equal(
    audit('palettes/night.json', '--min', min).status,
    2,
    `--min ${JSON.stringify(min)} exits 2`,
  )
const tests = readdirSync(join(dir, 'tests'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .join('\n')
assert.match(tests, /contrastRatio/, 'the function ships with its own tests')
assert.match(tests, /--min/, 'the option ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
