export async function addShow(store, { id, title, priceCents, seats }) {
  await store.set(`show:${id}`, { id, title, priceCents, seats })
}

/** Seats of a show that nobody has booked yet. */
export async function availableSeats(store, showId) {
  const show = await store.get(`show:${showId}`)
  if (!show) return null
  const taken = new Set(
    (await store.keys(`seat:${showId}:`)).map((key) => key.slice(`seat:${showId}:`.length)),
  )
  return show.seats.filter((seat) => !taken.has(seat))
}
