/** Kiosk sessions on top of the store. */
export function openSession(store, id, user, cb) {
  store.set(`session:${id}`, { user, cart: 0 }, cb)
}

export function addToCart(store, id, count, cb) {
  store.get(`session:${id}`, (err, session) => {
    if (err) return cb(err)
    if (!session) return cb(new Error(`no session ${id}`))
    const next = { ...session, cart: session.cart + count }
    store.set(`session:${id}`, next, (setErr) => (setErr ? cb(setErr) : cb(null, next)))
  })
}

export function closeSession(store, id, cb) {
  store.del(`session:${id}`, cb)
}
