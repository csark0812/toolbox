// Hidden acceptance for the keystore promise migration: every store method returns a promise with
// the same results, the session helpers and hook runner are promise-based too, no callback-style
// API is left anywhere (including the config-named hooks and the migration script's on-demand
// import), and the CLI, the migration and the bytes on disk are unchanged.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, file)).href)
const { createStore } = await load('src/store.mjs')
const sessions = await load('src/sessions.mjs')
const { runHooks } = await load('src/hooks.mjs')
const scratch = mkdtempSync(join(tmpdir(), 'keystore-check-'))
const isPromise = (value) => value && typeof value.then === 'function'
try {
  const file = join(scratch, 'a.log')
  const store = createStore(file)
  const set = store.set('b', { n: 1 })
  assert.ok(isPromise(set), 'set returns a promise')
  await set
  await store.set('a', 2)
  await store.set('b', [3])
  assert.ok(isPromise(store.get('a')), 'get returns a promise')
  assert.deepEqual(await store.get('b'), [3])
  assert.equal(await store.get('zzz'), undefined)
  assert.deepEqual(await store.keys(), ['a', 'b'])
  assert.equal(await store.del('a'), true)
  assert.equal(await store.del('a'), false)
  await assert.rejects(store.set('x', undefined), /no value for x/)
  assert.equal(await store.compact(), 1)
  assert.equal(readFileSync(file, 'utf8'), '{"op":"set","key":"b","value":[3]}\n')
  assert.deepEqual(await createStore(join(scratch, 'missing.log')).keys(), [])
  const broken = join(scratch, 'broken.log')
  copyFileSync(join(dir, 'package.json'), broken)
  await assert.rejects(createStore(broken).get('a'), SyntaxError, 'a corrupt log rejects')

  const s = createStore(join(scratch, 's.log'))
  const opened = sessions.openSession(s, 9, 'kofi')
  assert.ok(isPromise(opened), 'openSession returns a promise')
  await opened
  assert.deepEqual(await sessions.addToCart(s, 9, 2), { user: 'kofi', cart: 2 })
  assert.deepEqual(await sessions.addToCart(s, 9, 1), { user: 'kofi', cart: 3 })
  await assert.rejects(sessions.addToCart(s, 10, 1), /no session 10/)
  assert.equal(await sessions.closeSession(s, 9), true)

  const hooked = join(scratch, 'h.log')
  copyFileSync(join(dir, 'data/kiosk.log'), hooked)
  const hookResult = runHooks(createStore(hooked), 'beforeCommand')
  assert.ok(isPromise(hookResult), 'runHooks returns a promise')
  await hookResult
  assert.equal(
    readFileSync(hooked, 'utf8'),
    '{"op":"set","key":"locale","value":"pt-BR"}\n{"op":"set","key":"theme","value":"light"}\n',
    'the configured compact hook ran',
  )

  const log = join(scratch, 'cli.log')
  copyFileSync(join(dir, 'data/kiosk.log'), log)
  const kv = (...args) =>
    spawnSync(process.execPath, ['bin/kv.mjs', '--file', log, ...args], {
      cwd: dir,
      encoding: 'utf8',
    })
  const steps = [
    [['get', 'theme'], 0, '"light"\n'],
    [['get', 'session:41'], 0, '(not set)\n'],
    [['set', 'volume', '{"level":4}'], 0, 'ok\n'],
    [['keys'], 0, 'locale\ntheme\nvolume\n'],
    [['del', 'locale'], 0, 'deleted\n'],
    [['del', 'locale'], 0, '(not set)\n'],
    [['get', 'volume'], 0, '{"level":4}\n'],
    [['get'], 2, ''],
  ]
  for (const [args, status, out] of steps) {
    const run = kv(...args)
    assert.deepEqual([run.status, run.stdout], [status, out], `kv ${args.join(' ')}`)
  }
  assert.equal(
    readFileSync(log, 'utf8'),
    '{"op":"set","key":"theme","value":"light"}\n{"op":"set","key":"volume","value":{"level":4}}\n',
    'the log on disk has the same bytes',
  )
  const target = join(scratch, 'migrated.log')
  copyFileSync(join(dir, 'data/kiosk.log'), target)
  assert.equal(
    execFileSync(process.execPath, ['scripts/migrate-v1.mjs', 'data/v1-settings.json', target], {
      cwd: dir,
      encoding: 'utf8',
    }),
    'imported 3 settings, 5 keys in store\n',
  )
  assert.equal(
    readFileSync(target, 'utf8'),
    '{"op":"set","key":"locale","value":"pt-BR"}\n{"op":"set","key":"setting:brightness","value":70}\n{"op":"set","key":"setting:kioskName","value":"Lobby West"}\n{"op":"set","key":"setting:theme","value":"high-contrast"}\n{"op":"set","key":"theme","value":"light"}\n',
  )
  const walk = (folder) =>
    readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
    )
  for (const sub of ['src', 'bin', 'scripts', 'tests'])
    for (const path of walk(join(dir, sub)).filter((p) => p.endsWith('.mjs'))) {
      const text = readFileSync(path, 'utf8')
      assert.doesNotMatch(text, /\bcb\b|\bcallback\b/, `callback left in ${path}`)
      assert.doesNotMatch(
        text,
        /\(\s*\w*[eE]rr\w*\s*,\s*\w+\s*\)\s*=>/,
        `(err, value) => left in ${path}`,
      )
    }
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
