// Hidden acceptance for renaming rush jobs from "urgent" to "priority" inside the code: src/priority.mjs
// replaces src/urgent.mjs with the new names and no old ones, job objects carry `priority`, and
// every command prints byte-for-byte what it did, so the --urgent flag, the "Urgent surcharge"
// line, the urgentSurchargePence config key and the insurer's `urgent` CSV column all survive,
// for the bundled job book and for one with other key orders, odd values and a missing field.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

const alt = '.jobs-alt.json'
writeFileSync(
  join(dir, alt),
  JSON.stringify([
    {
      urgent: true,
      ref: 'K-1',
      customer: 'A. Byrne',
      item: 'Skeleton clock',
      booked: '2026-10-19',
      weekend: true,
      estimatePence: 15500,
    },
    {
      ref: 'K-2',
      customer: 'C. Diaz',
      item: 'Barometer',
      booked: '2026-10-01',
      weekend: false,
      estimatePence: 5000,
      insurer: 'HX-77',
    },
    {
      ref: 'K-3',
      customer: 'E. Fenn',
      item: 'Wall clock',
      booked: '2026-10-02',
      urgent: 'no',
      weekend: false,
      estimatePence: 3000,
    },
    {
      ref: 'K-4',
      customer: 'G. Hale',
      item: 'Chronograph',
      booked: '2026-10-03',
      urgent: 1,
      weekend: 0,
      estimatePence: 21000,
    },
    {
      ref: 'K-5',
      customer: 'I. Jones, Jr.',
      item: 'Clock "Big Ben"',
      booked: '2026-09-28',
      urgent: true,
      weekend: false,
      estimatePence: 9900,
    },
  ]),
)
writeFileSync(join(dir, '.jobs-empty.json'), '[]')
const cases = []
for (const file of [[], ['--file', alt]]) {
  cases.push(['queue', ...file], ['queue', '--urgent', ...file], ['export', ...file])
  for (const date of ['2026-10-10', '2026-10-19', '2026-10-27', '2026-11-30'])
    cases.push(['queue', '--date', date, ...file], ['queue', ...file, '--urgent', '--date', date])
}
for (const ref of ['J-1040', 'J-1041', 'J-1042', 'J-1043', 'J-1044', 'J-1045', 'J-9999'])
  cases.push(['invoice', ref])
for (const ref of ['K-1', 'K-2', 'K-3', 'K-4', 'K-5']) cases.push(['invoice', ref, '--file', alt])
cases.push(['invoice'], ['invoice', 'J-1041', '--urgent'], ['queue', '--rush'], ['queue', '--date'])
cases.push(
  ['queue', '--file', '.jobs-empty.json', '--urgent'],
  ['export', '--file', '.jobs-empty.json'],
)
const actual = {}
try {
  for (const [script, ...args] of cases) {
    const r = spawnSync(process.execPath, [`bin/${script}.mjs`, ...args], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 15000,
    })
    const key = [script, ...args].join(' ')
    actual[key] = hash(`${r.status}\0${r.stdout}\0${r.stderr}`)
    if (!process.env.RECORD && expected()[key] !== actual[key])
      assert.fail(
        `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nexit ${r.status}`,
      )
  }
} finally {
  rmSync(join(dir, alt), { force: true })
  rmSync(join(dir, '.jobs-empty.json'), { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

// The new names, and only the new names, inside the code.
assert.ok(!existsSync(join(dir, 'src/urgent.mjs')), 'src/urgent.mjs is gone')
const probe = JSON.parse(
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const priority = await import('./src/priority.mjs')
       const { loadJobs } = await import('./src/jobs.mjs')
       const jobs = loadJobs()
       console.log(JSON.stringify({
         exports: Object.keys(priority).sort(),
         keys: Object.keys(jobs[1]),
         yes: jobs[3].priority,
         flags: [priority.isPriority({ priority: true }), priority.isPriority({ priority: false })],
         due: priority.priorityDueDate({ booked: '2026-12-30', priority: true }, { turnaroundDays: 14, urgentTurnaroundDays: 3 }),
         order: priority.priorityQueue([{ ref: 'a', booked: '2026-01-01', priority: false }, { ref: 'b', booked: '2026-01-02', priority: true }]).map((job) => job.ref),
       }))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  ),
)
for (const name of ['isPriority', 'priorityDueDate', 'priorityQueue'])
  assert.ok(probe.exports.includes(name), `src/priority.mjs exports ${name}`)
for (const name of probe.exports)
  assert.doesNotMatch(name, /urgent/i, `src/priority.mjs still exports ${name}`)
assert.deepEqual(
  [...probe.keys].sort(),
  ['booked', 'customer', 'estimatePence', 'item', 'priority', 'ref', 'weekend'],
  'loaded jobs carry `priority` in place of `urgent`',
)
assert.equal(probe.yes, 'yes', 'the tablet value is carried through as it is')
assert.deepEqual(probe.flags, [true, false])
assert.equal(probe.due, '2027-01-02')
assert.deepEqual(probe.order, ['b', 'a'])
const code = []
for (const sub of ['src', 'bin', 'tests'])
  for (const name of readdirSync(join(dir, sub)))
    if (name.endsWith('.mjs'))
      code.push([`${sub}/${name}`, readFileSync(join(dir, sub, name), 'utf8')])
for (const [file, text] of code)
  assert.doesNotMatch(
    text,
    /\b(isUrgent|urgentQueue|urgentDueDate)\b|urgent\.mjs/,
    `${file} still uses an old name`,
  )
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    queue: '1b92773ae57dd5ad',
    'queue --urgent': '105e1810a5e622b8',
    export: '5cab89925f90bc2e',
    'queue --date 2026-10-10': '1b92773ae57dd5ad',
    'queue --urgent --date 2026-10-10': '105e1810a5e622b8',
    'queue --date 2026-10-19': '17b16a9782f9a429',
    'queue --urgent --date 2026-10-19': 'a837462a1635f3d0',
    'queue --date 2026-10-27': '0b8cbf5d70f353fc',
    'queue --urgent --date 2026-10-27': 'a837462a1635f3d0',
    'queue --date 2026-11-30': '2e7679937e6ba4cb',
    'queue --urgent --date 2026-11-30': 'a837462a1635f3d0',
    'queue --file .jobs-alt.json': '5bb18d49cd5f6148',
    'queue --urgent --file .jobs-alt.json': '1ead1ec228fd28b9',
    'export --file .jobs-alt.json': '2edfc26dc8b410ea',
    'queue --date 2026-10-10 --file .jobs-alt.json': '41a06cc03bd74acd',
    'queue --file .jobs-alt.json --urgent --date 2026-10-10': '8005b79c85fcc2a4',
    'queue --date 2026-10-19 --file .jobs-alt.json': '04ddf9a93e580167',
    'queue --file .jobs-alt.json --urgent --date 2026-10-19': '8005b79c85fcc2a4',
    'queue --date 2026-10-27 --file .jobs-alt.json': 'd652a36011baf99d',
    'queue --file .jobs-alt.json --urgent --date 2026-10-27': '3c8cd511b37c06a3',
    'queue --date 2026-11-30 --file .jobs-alt.json': 'd652a36011baf99d',
    'queue --file .jobs-alt.json --urgent --date 2026-11-30': '3c8cd511b37c06a3',
    'invoice J-1040': '4f903693730cc6a1',
    'invoice J-1041': '41305f7210cae7dc',
    'invoice J-1042': '43cf08e8e5a85898',
    'invoice J-1043': '19f19757848bd883',
    'invoice J-1044': '3e181a3014370e73',
    'invoice J-1045': 'cd00871f3c909111',
    'invoice J-9999': 'd70d301c03613431',
    'invoice K-1 --file .jobs-alt.json': '159cece7d6cc3ec3',
    'invoice K-2 --file .jobs-alt.json': 'f21c5a2d485696c7',
    'invoice K-3 --file .jobs-alt.json': '5f9472989cba07f7',
    'invoice K-4 --file .jobs-alt.json': '2bb40468cae219f6',
    'invoice K-5 --file .jobs-alt.json': '1ecafb09b80df8e2',
    invoice: '1a8674ef05dae6dd',
    'invoice J-1041 --urgent': '5976bb9dd65daf44',
    'queue --rush': 'e95d46c14f889e09',
    'queue --date': 'ac8afbde678df9ba',
    'queue --file .jobs-empty.json --urgent': '6ec369640e633357',
    'export --file .jobs-empty.json': 'd15324a4af6e9afb',
  }
}
