// Hidden acceptance for the cricket subs: every household gets its real bill, the cap goes to
// exactly the households with the family membership (and to no one else), and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/subs.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'household  1  Whitfield  3 members  £250.00  (family cap)',
    'household  2  Brennan    3 members  £360.00',
    'household  3  Lowe       1 member   £120.00',
    'household  4  Singh      2 members  £180.00',
    'household  5  Reyes      1 member    £40.00',
    'household  7  Ashworth   4 members  £250.00  (family cap)',
    'household  9  Duffy      2 members  £180.00',
    'household 12  Okafor     4 members  £250.00  (family cap)',
    'season total £1630.00',
    '',
  ].join('\n'),
  'every household gets its real bill',
)
const { householdBills } = await import(pathToFileURL(join(dir, 'src/subs.mjs')).href)
const adults = (household, n, joined = '') =>
  Array.from({ length: n }, (_, i) => ({
    name: `P${i} H${household}`,
    household,
    junior: false,
    joined,
  }))
const members = [
  ...adults(0, 3),
  ...adults(1, 3),
  ...adults(2, 3),
  ...adults(3, 3),
  ...adults(40, 3),
]
const pence = (family) =>
  Object.fromEntries(householdBills(members, family).map((b) => [String(b.household), b.pence]))
assert.deepEqual(
  pence([3, 40]),
  { 0: 36000, 1: 36000, 2: 36000, 3: 25000, 40: 25000 },
  'cap for households 3 and 40 only',
)
assert.deepEqual(
  pence([0]),
  { 0: 25000, 1: 36000, 2: 36000, 3: 36000, 40: 36000 },
  'cap for household 0 only',
)
assert.deepEqual(
  pence([]),
  { 0: 36000, 1: 36000, 2: 36000, 3: 36000, 40: 36000 },
  'no family memberships, no cap',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
