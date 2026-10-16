// Hidden acceptance for the loan status enum: a frozen LoanStatus in src/status.mjs holds the four
// statuses, no other module in src/ or bin/ spells them as string literals, and loading, sweeping,
// fines, circulation, reminders, saved JSON and every CLI command behave exactly as before.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
/** True when `fn` throws anything. */
const rejects = (fn) => {
  try {
    fn()
  } catch {
    return true
  }
  return false
}
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
const { LoanStatus } = await load('status.mjs')
assert.ok(LoanStatus && Object.isFrozen(LoanStatus), 'LoanStatus is a frozen object')
assert.deepEqual(Object.values(LoanStatus).sort(), ['lost', 'out', 'overdue', 'returned'])
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of [...walk(join(dir, 'src')), ...walk(join(dir, 'bin'))]) {
  if (file === join(dir, 'src', 'status.mjs')) continue
  const code = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  const literal = code.match(/(['"`])(out|returned|overdue|lost)\1/)
  assert.equal(literal, null, `${file} still spells the status ${literal?.[0]}`)
}
const { loadLoans, normalizeLoan, saveLoans } = await load('store.mjs')
const { sweep, fineFor } = await load('overdue.mjs')
const { checkout, checkin } = await load('circulation.mjs')
const { reminderFor } = await load('notify.mjs')
const { statusCounts } = await load('report.mjs')
assert.equal(normalizeLoan({ status: ' Late ' }).status, 'overdue')
assert.equal(normalizeLoan({ status: 'RETURNED' }).status, 'returned')
const loans = loadLoans(join(dir, 'data/loans.json'))
assert.deepEqual(sweep(loans, '2026-10-15'), ['L2', 'L4'])
assert.deepEqual(statusCounts(loans), { out: 2, overdue: 2, lost: 2, returned: 1 })
assert.deepEqual(
  loans.map((l) => fineFor(l, '2026-10-15')),
  [0, 350, 575, 3400, 0, 2500, 0],
)
assert.deepEqual(
  loans.map((l) => reminderFor(l)?.slice(0, 16) ?? null),
  [
    null,
    'B-102 was due on',
    'B-207 was due on',
    'B-311 is marked ',
    null,
    'B-420 is marked ',
    null,
  ],
)
const loan = checkout(loans, { bookId: 'B-118', memberId: 'm9', today: '2026-10-15' })
assert.equal(loan.status, 'out')
assert.ok(rejects(() => checkout(loans, { bookId: 'B-207', memberId: 'm9', today: '2026-10-15' })))
assert.equal(checkin(loans, 'L6', '2026-10-16').status, 'returned', 'lost books can be checked in')
assert.ok(rejects(() => checkin(loans, 'L5', '2026-10-16')))
const tmp = mkdtempSync(join(tmpdir(), 'loans-check-'))
try {
  saveLoans(join(tmp, 'out.json'), loans)
  const saved = JSON.parse(readFileSync(join(tmp, 'out.json'), 'utf8'))
  assert.deepEqual(
    saved.map((l) => l.status),
    ['out', 'overdue', 'overdue', 'lost', 'returned', 'returned', 'out', 'out'],
  )
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
const GOLDEN = {
  'report --today 2026-10-15':
    'On loan   2\nOverdue   2\nLost      2\nReturned  1\nFines due 68.25\n',
  'report --today 2026-12-31':
    'On loan   0\nOverdue   0\nLost      6\nReturned  1\nFines due 159.00\n',
  'overdue --today 2026-10-15':
    'm1: B-102 was due on 2026-10-01. Please bring it back.\nm4: B-207 was due on 2026-09-22. Please bring it back.\nm2: B-311 is marked lost. Contact the desk about a replacement.\nm5: B-420 is marked lost. Contact the desk about a replacement.\n',
  'list --today 2026-10-15':
    'L1 B-101    out      due 2026-10-22\nL2 B-102    overdue  due 2026-10-01\nL3 B-207    overdue  due 2026-09-22\nL4 B-311    lost     due 2026-06-22\nL6 B-420    lost     due 2026-03-22\nL7 B-133    out      due 2026-10-31\n',
  'list --status returned --today 2026-10-15': 'L5 B-118    returned due 2026-08-22\n',
  'list --status out --today 2026-11-01': '',
  'overdue --today 2026-10-01':
    'm4: B-207 was due on 2026-09-22. Please bring it back.\nm2: B-311 is marked lost. Contact the desk about a replacement.\nm5: B-420 is marked lost. Contact the desk about a replacement.\n',
}
for (const [args, want] of Object.entries(GOLDEN))
  assert.equal(
    execFileSync(process.execPath, ['bin/loans.mjs', ...args.split(' ')], {
      cwd: dir,
      encoding: 'utf8',
    }),
    want,
    `loans ${args}`,
  )
assert.ok(
  rejects(() =>
    execFileSync(process.execPath, ['bin/loans.mjs', 'list', '--status', 'late'], {
      cwd: dir,
      stdio: 'pipe',
    }),
  ),
  'an unknown --status is still rejected',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
