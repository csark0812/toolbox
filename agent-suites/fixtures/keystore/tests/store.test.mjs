import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { addToCart, closeSession, openSession } from '../src/sessions.mjs'
import { createStore } from '../src/store.mjs'

const fresh = () => createStore(join(mkdtempSync(join(tmpdir(), 'kv-')), 'store.log'))

test('sets, gets and deletes', (t, done) => {
  const store = fresh()
  store.set('a', { n: 1 }, (err) => {
    assert.ifError(err)
    store.get('a', (getErr, value) => {
      assert.ifError(getErr)
      assert.deepEqual(value, { n: 1 })
      store.del('a', (delErr, removed) => {
        assert.ifError(delErr)
        assert.equal(removed, true)
        store.get('a', (againErr, gone) => {
          assert.equal(gone, undefined)
          done()
        })
      })
    })
  })
})

test('compacts to one line per live key', (t, done) => {
  const file = join(mkdtempSync(join(tmpdir(), 'kv-')), 'store.log')
  const store = createStore(file)
  store.set('b', 2, () =>
    store.set('a', 1, () =>
      store.set('b', 3, () =>
        store.compact((err, size) => {
          assert.ifError(err)
          assert.equal(size, 2)
          assert.equal(
            readFileSync(file, 'utf8'),
            '{"op":"set","key":"a","value":1}\n{"op":"set","key":"b","value":3}\n',
          )
          done()
        }),
      ),
    ),
  )
})

test('tracks a session cart', (t, done) => {
  const store = fresh()
  openSession(store, 7, 'ana', () =>
    addToCart(store, 7, 2, (err, session) => {
      assert.ifError(err)
      assert.deepEqual(session, { user: 'ana', cart: 2 })
      closeSession(store, 7, (closeErr, removed) => {
        assert.equal(removed, true)
        done()
      })
    }),
  )
})

test('refuses an undefined value', (t, done) => {
  fresh().set('x', undefined, (err) => {
    assert.match(err.message, /no value for x/)
    done()
  })
})
