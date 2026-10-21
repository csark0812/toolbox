// Hidden acceptance for the laundrette bills: a card is billed only for its own programmes (C1 is
// not charged for C12's washes, nor C2 for C21's), the replacement dryer's lower-case card reads
// are billed to the right customer, restarts stay free, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/bills.mjs', '2026-10'], { cwd: dir, encoding: 'utf8' }),
  [
    'C1   Rosa Ortiz    9 programmes   £31.40',
    'C2   Ben Achebe    5 programmes   £17.10',
    'C3   Ivy Marsh     4 programmes   £14.10',
    'C12  Wen Li        6 programmes   £23.20',
    'C21  Dara Quinn    5 programmes   £19.10',
    '',
  ].join('\n'),
  'every account customer gets their real October bill',
)
const { bill } = await import(pathToFileURL(join(dir, 'src/billing.mjs')).href)
const { parseLog } = await import(pathToFileURL(join(dir, 'src/log.mjs')).href)
const entries = parseLog(
  [
    '2026-12-01T09:00,W1,C7,quick,start',
    '2026-12-01T09:05,W1,C7,quick,restart',
    '2026-12-01T10:00,W2,C70,hot,start',
    '2026-12-01T11:00,W3,C107,standard,start',
    '2026-12-01T12:00,D2,c7,dry-10,start',
    '2026-12-01T13:00,D2,c70,dry-20,start',
    '2026-12-02T09:00,W1,C17,quick,start',
  ].join('\n'),
)
const pence = (card) => bill(entries, card, '2026-12').pence
assert.equal(pence('C7'), 420, 'C7 pays for its own wash and dryer only')
assert.equal(pence('C70'), 680, 'C70 pays for its own wash and dryer only')
assert.equal(pence('C107'), 410)
assert.equal(pence('C17'), 320)
assert.equal(pence('C1'), 0, 'C1 is not charged for C17, C107 or anything else that contains it')
assert.equal(bill(entries, 'C7', '2026-12').programmes, 2)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
