// Hidden acceptance for the Gift Aid claim: postcodes match however they were typed (case,
// spacing), a declaration covers the four years before it was signed from the same calendar
// date, a cancellation still ends cover, September and October claim right, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const claim = (month) =>
  execFileSync(process.execPath, ['bin/claim.mjs', month], { cwd: dir, encoding: 'utf8' })
assert.equal(
  claim('2026-10'),
  [
    '2026-10-02  Mary Kitto      £ 20.00  gift aid £5.00',
    '2026-10-03  Alan Rowse      £ 30.00  gift aid £7.50',
    '2026-10-05  Jenny Hosking   £ 40.00  gift aid £10.00',
    '2026-10-09  Derek Penrose   £ 50.00  gift aid £12.50',
    '2026-10-11  Sue Angove      £ 25.00  gift aid £6.25',
    '2026-10-14  Peter Tonkin    £ 15.00  not claimed',
    '2026-10-18  Alan Rowse      £ 30.00  not claimed',
    '2026-10-22  Ruth Pascoe     £100.00  gift aid £25.00',
    '2026-10-25  Derek Penrose   £ 10.00  gift aid £2.50',
    '2026-10-27  Gwen Trewin     £ 12.00  gift aid £3.00',
    'claim: £71.75 on £332.00 donated',
    '',
  ].join('\n'),
  'October claims every covered donation',
)
assert.equal(
  claim('2026-09'),
  [
    '2026-09-06  Jenny Hosking   £ 40.00  gift aid £10.00',
    '2026-09-12  Derek Penrose   £ 20.00  gift aid £5.00',
    '2026-09-19  Sue Angove      £ 25.00  gift aid £6.25',
    '2026-09-27  Peter Tonkin    £ 15.00  not claimed',
    'claim: £21.25 on £100.00 donated',
    '',
  ].join('\n'),
  'September claims every covered donation',
)
const { giftAid } = await import(pathToFileURL(join(dir, 'src/giftaid.mjs')).href)
const aid = (declaration, date, postcode = 'TR18 1AA') =>
  giftAid({ date, name: 'Ann Jago', postcode, amount: 40, method: 'card' }, [
    { surname: 'Jago', ...declaration },
  ])
const signed = { postcode: 'TR18 1AA', signed: '2026-10-20' }
assert.equal(aid({ ...signed, postcode: 'tr18 1aa' }, '2026-10-21'), 10, 'lower-case postcode')
assert.equal(aid(signed, '2026-10-21', 'TR181AA'), 10, 'postcode with no space')
assert.equal(
  aid({ ...signed, postcode: ' tr181aa' }, '2026-10-21', 'TR18  1AA '),
  10,
  'odd spacing',
)
assert.equal(aid(signed, '2026-10-21', 'TR18 1AB'), 0, 'a different postcode does not match')
assert.equal(aid(signed, '2022-10-20'), 10, 'four years before, to the day')
assert.equal(aid(signed, '2022-10-19'), 0, 'more than four years before')
const cancelled = { ...signed, cancelled: '2026-11-01' }
assert.equal(aid(cancelled, '2026-09-01'), 10, 'backdated cover before a cancellation')
assert.equal(aid(cancelled, '2026-11-01'), 0, 'nothing on or after the cancellation')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
