// Hidden acceptance for renaming feeds to rations: src/rations.mjs exports rationPlan, dailyHayKg
// and rationCost, the yard's own code (src/rations.mjs, bin/, ops/, tools/, tests/) no longer uses
// feeds.mjs or the old names outside strings and comments, and nothing anyone sees moves: the
// board (columns picked by name in config/board.json, sorted by `--sort dailyHay`), the
// accountant's CSV header, the morning cron, the hay-order package run from its own folder, and
// the vet portal's `dailyHay` and `feedPlan` from `livery-yard/feeds`.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
const dir = resolve(process.argv[2])
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
const NAMES = '(feedPlan|dailyHay|feedCost)'
// Using an old name: defining, calling, importing, exporting or aliasing it. Object keys and
// strings (a column id, a CSV header) are not uses.
const OLD_USES = [
  new RegExp(`\\b(function|const|let|var|class)\\s+${NAMES}\\b`),
  new RegExp(`\\b${NAMES}\\s*\\(`),
  new RegExp(`\\b(import|export)\\s*\\{[^}]*\\b${NAMES}\\b[^}]*\\}`),
  new RegExp(`\\bas\\s+${NAMES}\\b`),
]
// Error messages count; stack frames and echoed source lines do not.
const messages = (stderr) =>
  stderr
    .split('\n')
    .filter((line) => /^(\w*Error\b|\w+: )/.test(line))
    .join('\n')

const alt = join(dir, '.horses-alt.json')
const altHorses = [
  {
    name: 'Wren',
    box: 20,
    owner: 'Hart, L.',
    weightKg: 333,
    workload: 'light',
    livery: 'full',
    hardFeed: 'senior',
  },
  {
    name: 'Otto',
    box: 1,
    owner: 'B. Quinn',
    weightKg: 702,
    workload: 'hard',
    livery: 'diy',
    hardFeed: 'senior',
  },
  {
    name: 'Sorrel',
    box: 12,
    owner: 'B. Quinn',
    weightKg: 488,
    workload: 'rest',
    livery: 'part',
    hardFeed: 'cool',
  },
  {
    name: 'Ivy',
    box: 6,
    owner: 'Hart, L.',
    weightKg: 251,
    workload: 'medium',
    livery: 'part',
    hardFeed: null,
  },
  {
    name: 'Major',
    box: 3,
    owner: 'A. Ferris',
    weightKg: 610,
    workload: 'hard',
    livery: 'full',
    hardFeed: 'cool',
  },
]
const bad = join(dir, '.horses-bad.json')
writeFileSync(alt, JSON.stringify(altHorses))
writeFileSync(
  bad,
  JSON.stringify([
    ...altHorses,
    {
      name: 'Jet',
      box: 8,
      owner: 'C. Dee',
      weightKg: 400,
      workload: 'show',
      livery: 'full',
      hardFeed: null,
    },
  ]),
)

const run = (cwd, command, args) =>
  spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 15000 })
const cases = []
for (const file of [[], [alt], [bad]]) {
  cases.push(['board', ...file])
  for (const sort of ['dailyHay', 'feedCost', 'hardFeedKg', 'name', 'box', 'workload', 'hay'])
    cases.push(['board', '--sort', sort, ...file])
  for (const month of ['2026-10', '2026-02', '2024-02']) cases.push(['invoices', month, ...file])
  cases.push(['morning', '2026-10-22', ...file])
}
cases.push(['invoices', 'October'], ['invoices'])

const actual = {}
const record = (key, r) => {
  actual[key] = hash(`${r.status}\0${r.stdout}\0${messages(r.stderr)}`)
  if (!process.env.RECORD && expected()[key] !== actual[key])
    assert.fail(
      `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nexit ${r.status}`,
    )
}
try {
  for (const [command, ...args] of cases) {
    const key = [command, ...args].join(' ').replaceAll(dir + '/', '')
    if (command === 'morning') record(key, run(dir, 'sh', ['ops/morning.sh', ...args]))
    else record(key, run(dir, process.execPath, [`bin/${command}.mjs`, ...args]))
  }
  for (const args of [[], ['2'], ['3', alt], ['1', bad]])
    record(
      ['hay-order', ...args].join(' ').replaceAll(dir + '/', ''),
      run(join(dir, 'tools/hay-order'), process.execPath, ['index.mjs', ...args]),
    )

  // The vet practice's portal, by package name.
  const portal = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const { dailyHay, feedPlan } = await import('livery-yard/feeds')
       const { loadHorses } = await import('./src/horses.mjs')
       const all = [...loadHorses(), ...loadHorses(${JSON.stringify(alt)})]
       let error = ''
       try { dailyHay({ weightKg: 400, workload: 'show' }) } catch (e) { error = e.message }
       console.log(JSON.stringify({ hay: all.map(dailyHay), plan: feedPlan(all), error }))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  )
  actual.portal = hash(portal)
  if (!process.env.RECORD)
    assert.equal(actual.portal, expected().portal, `livery-yard/feeds answers changed:\n${portal}`)
} finally {
  rmSync(alt, { force: true })
  rmSync(bad, { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

// The new module and names.
const exported = JSON.parse(
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `console.log(JSON.stringify(Object.keys(await import('./src/rations.mjs'))))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  ),
)
for (const name of ['rationPlan', 'dailyHayKg', 'rationCost', 'hardFeedKg'])
  assert.ok(exported.includes(name), `src/rations.mjs exports ${name}`)
for (const name of ['feedPlan', 'dailyHay', 'feedCost'])
  assert.ok(!exported.includes(name), `src/rations.mjs does not export the old name ${name}`)

// No old names used in the yard's own code, outside strings and comments. Only the file that
// package.json exports as ./feeds for the vet portal may keep them.
const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
const feedsEntry = pkg.exports?.['./feeds']
const publicFile = typeof feedsEntry === 'string' ? resolve(dir, feedsEntry) : null
const code = (text) =>
  text
    .replace(/`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, '""')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
const walk = (path) =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((name) => walk(join(path, name)))
    : [path]
const own = ['bin', 'ops', 'tools', 'tests'].flatMap((folder) =>
  existsSync(join(dir, folder)) ? walk(join(dir, folder)) : [],
)
own.push(join(dir, 'src/rations.mjs'))
for (const file of own) {
  if (file === publicFile || !/\.(mjs|js|sh)$/.test(file)) continue
  const text = readFileSync(file, 'utf8')
  assert.doesNotMatch(text, /feeds\.mjs/, `${file} still uses src/feeds.mjs`)
  // Shell scripts carry their JavaScript inside a quoted string, so they are read as they are.
  for (const pattern of OLD_USES)
    assert.doesNotMatch(
      file.endsWith('.sh') ? text : code(text),
      pattern,
      `${file} still uses an old name`,
    )
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    board: '41c1a22c3b9c3225',
    'board --sort dailyHay': 'de44750f3bb6d2c2',
    'board --sort feedCost': 'ed5f920e927c6e07',
    'board --sort hardFeedKg': 'c092ecec2018b26d',
    'board --sort name': '8458026c21456143',
    'board --sort box': 'ec7143713f5eb28d',
    'board --sort workload': 'c717ce2aad480dd3',
    'board --sort hay': '1335d7fbcd582ee9',
    'invoices 2026-10': '0df6f14396eb5ee9',
    'invoices 2026-02': 'e3f95a31ccdf3fa3',
    'invoices 2024-02': 'dc0a8f4bb6cc6d17',
    'morning 2026-10-22': '0a06b6f1f2ee5692',
    'board .horses-alt.json': '34d5ea380b98fd82',
    'board --sort dailyHay .horses-alt.json': '9479b7a644653aef',
    'board --sort feedCost .horses-alt.json': 'c27fb0e11d00fc3c',
    'board --sort hardFeedKg .horses-alt.json': '915db0da1b19ddab',
    'board --sort name .horses-alt.json': 'd17fe47fe5b43f2e',
    'board --sort box .horses-alt.json': '2fd0afb467e20a96',
    'board --sort workload .horses-alt.json': '914c333ebd12b526',
    'board --sort hay .horses-alt.json': '1335d7fbcd582ee9',
    'invoices 2026-10 .horses-alt.json': 'c59cf7766388a089',
    'invoices 2026-02 .horses-alt.json': 'dca764f2599446a7',
    'invoices 2024-02 .horses-alt.json': 'bfd97e7e76235487',
    'morning 2026-10-22 .horses-alt.json': '2b9c899ce59a55b4',
    'board .horses-bad.json': 'a5c201a113274def',
    'board --sort dailyHay .horses-bad.json': 'a5c201a113274def',
    'board --sort feedCost .horses-bad.json': 'a5c201a113274def',
    'board --sort hardFeedKg .horses-bad.json': 'a5c201a113274def',
    'board --sort name .horses-bad.json': 'a5c201a113274def',
    'board --sort box .horses-bad.json': 'a5c201a113274def',
    'board --sort workload .horses-bad.json': 'a5c201a113274def',
    'board --sort hay .horses-bad.json': '1335d7fbcd582ee9',
    'invoices 2026-10 .horses-bad.json': 'a5c201a113274def',
    'invoices 2026-02 .horses-bad.json': 'a5c201a113274def',
    'invoices 2024-02 .horses-bad.json': 'a5c201a113274def',
    'morning 2026-10-22 .horses-bad.json': '3acea07d5d6776fc',
    'invoices October': 'ec7671bc487bb64a',
    invoices: 'ec7671bc487bb64a',
    'hay-order': '65c3f850d87a36dc',
    'hay-order 2': '7cb33504671f3237',
    'hay-order 3 .horses-alt.json': 'bf3e76e8aa0e1247',
    'hay-order 1 .horses-bad.json': 'a5c201a113274def',
    portal: '5b71f51e50a5d677',
  }
}
