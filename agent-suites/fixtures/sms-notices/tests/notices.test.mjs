import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { GSM_BASIC, GSM_EXTENDED, nonGsmCharacters } from '../src/charset.mjs'
import { fill } from '../src/notices.mjs'

test('the GSM tables have the right sizes', () => {
  assert.equal([...GSM_BASIC].length, 127)
  assert.equal([...GSM_EXTENDED].length, 10)
})

test('finds characters outside GSM', () => {
  assert.deepEqual(nonGsmCharacters('Café [ok] €5'), [])
  assert.deepEqual(nonGsmCharacters('está ló'), ['á', 'ó'])
  assert.deepEqual(nonGsmCharacters('👍👍'), ['👍'])
})

test('fills placeholders', () => {
  assert.equal(fill('Hi {name}', { name: 'Ana' }), 'Hi Ana')
  assert.throws(() => fill('Hi {name}', {}), /\{name\}/)
})

test('prints the message', () => {
  const run = spawnSync(
    process.execPath,
    ['bin/notice.mjs', 'ready-pl', 'name=Ola', 'code=K7', 'locker=12', 'date=pt', 'pin=4410'],
    { cwd: new URL('..', import.meta.url), encoding: 'utf8' },
  )
  assert.equal(run.stdout, 'Cześć Ola, paczka K7 czeka w skrytce 12. Odbierz ją do pt, PIN 4410.\n')
  assert.match(run.stderr, /ś ć ą not in the GSM alphabet/)
})
