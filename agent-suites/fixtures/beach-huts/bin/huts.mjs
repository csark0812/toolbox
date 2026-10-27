import { bookingsFor, loadHuts } from '../src/huts.mjs'

const season = loadHuts()
for (const hut of season.huts) {
  const bookings = bookingsFor(season, hut)
  const taken = bookings.map(({ family, from, to }) =>
    from === to ? `${family} wk${from}` : `${family} wk${from}-${to}`,
  )
  console.log(`Hut ${hut}: ${taken.join(', ') || 'free all summer'}`)
}
