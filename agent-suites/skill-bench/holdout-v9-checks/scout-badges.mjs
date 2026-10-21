// Hidden acceptance for the badge field rename: records use code, name and stage everywhere (the
// export and the section rules included), the census CSV keeps the headings the district office
// imports by, and every command prints exactly what it did.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const AWARDS = {
  S014: 'NAV   Navigator              stage 3  2026-09-24\nSWM   Swimmer                stage 3  2026-05-07\nNAV   Navigator              stage 2  2026-03-12\nMUS   Musician               stage 1  2026-02-01\n',
  S021: 'DIG   Digital Maker          stage 2  2026-06-11\nNAV   Navigator              stage 1  2026-04-16\n',
  S030: 'SWM   Swimmer                stage 5  2026-07-02\nNAV   Navigator              stage 4  2026-10-08\nDIG   Digital Maker          stage 2  2026-01-22\n',
  S042: 'MUS   Musician               stage 3  2026-09-30\n',
}
const SECTIONS = {
  Beavers:
    'S014  NAV-2  Navigator\nS021  DIG-2  Digital Maker\nS030  DIG-2  Digital Maker\nS014  MUS-1  Musician\nS021  NAV-1  Navigator\n',
  Cubs: 'S014  SWM-3  Swimmer\nS014  NAV-3  Navigator\nS042  MUS-3  Musician\nS014  NAV-2  Navigator\nS021  DIG-2  Digital Maker\nS030  DIG-2  Digital Maker\n',
  Scouts:
    'S030  SWM-5  Swimmer\nS030  NAV-4  Navigator\nS014  SWM-3  Swimmer\nS014  NAV-3  Navigator\nS042  MUS-3  Musician\n',
}
const CENSUS =
  'bc,nm,lvl,scout,at\nNAV,Navigator,2,S014,2026-03-12\nSWM,Swimmer,3,S014,2026-05-07\nNAV,Navigator,3,S014,2026-09-24\nMUS,Musician,1,S014,2026-02-01\nNAV,Navigator,1,S021,2026-04-16\nDIG,Digital Maker,2,S021,2026-06-11\nSWM,Swimmer,5,S030,2026-07-02\nNAV,Navigator,4,S030,2026-10-08\nDIG,Digital Maker,2,S030,2026-01-22\nMUS,Musician,3,S042,2026-09-30\n'
const run = (...args) => execFileSync(process.execPath, args, { cwd: dir, encoding: 'utf8' })
for (const [scout, expected] of Object.entries(AWARDS))
  assert.equal(run('bin/awards.mjs', scout), expected, `awards for ${scout}`)
for (const [section, expected] of Object.entries(SECTIONS))
  assert.equal(run('bin/section.mjs', section), expected, `section ${section}`)
assert.equal(run('bin/census.mjs'), CENSUS, 'the census CSV is byte-identical')

const exported = JSON.parse(readFileSync(join(dir, 'data/awards.json'), 'utf8'))
assert.equal(exported.length, 10)
for (const record of exported)
  assert.deepEqual(
    Object.keys(record).sort(),
    ['at', 'code', 'name', 'scout', 'stage'],
    'the export uses the new names',
  )
const rules = JSON.parse(readFileSync(join(dir, 'data/sections.json'), 'utf8'))
for (const rule of Object.values(rules))
  assert.equal(rule.field, 'stage', 'section rules name the stage field')

const { awardsFor, highestStages, loadAwards } = await import(
  pathToFileURL(join(dir, 'src/awards.mjs')).href
)
const { censusCsv } = await import(pathToFileURL(join(dir, 'src/census.mjs')).href)
const { forSection } = await import(pathToFileURL(join(dir, 'src/sections.mjs')).href)
const awards = loadAwards(
  JSON.stringify([
    { code: 'NAV', name: 'Navigator', stage: '2', scout: 'X1', at: '2026-01-01' },
    { code: 'NAV', name: 'Navigator', stage: 4, scout: 'X1', at: '2026-02-01' },
    { code: 'ART', name: 'Artist', stage: 4, scout: 'X1', at: '2026-03-01' },
  ]),
)
assert.deepEqual(Object.keys(awards[0]).sort(), ['at', 'code', 'name', 'scout', 'stage'])
assert.equal(awards[0].stage, 2, 'stages are still read as numbers')
assert.deepEqual(
  awardsFor(awards, 'X1').map((award) => `${award.code}-${award.stage}`),
  ['ART-4', 'NAV-4', 'NAV-2'],
)
assert.deepEqual([...highestStages(awards, 'NAV')], [['X1', 4]])
assert.equal(forSection(awards, { field: 'stage', from: 3, to: 5 }).length, 2)
assert.equal(
  censusCsv(awards),
  'bc,nm,lvl,scout,at\nNAV,Navigator,2,X1,2026-01-01\nNAV,Navigator,4,X1,2026-02-01\nART,Artist,4,X1,2026-03-01\n',
  "the census keeps the district's headings and column order",
)
const readme = readFileSync(join(dir, 'README.md'), 'utf8')
assert.doesNotMatch(readme, /`(bc|nm|lvl)`:/, 'the README describes the new fields')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
