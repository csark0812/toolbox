import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { artists: load('artists'), photos: load('photos') }
}
reset()

export const artists = () => state.artists
/** Every photo, keyed by its path (`photos/<artistId>/<name>`). */
export const photos = () => state.photos

/** Stores an artist, replacing the one with the same id. */
export function saveArtist(artist) {
  state.artists = state.artists.map((entry) => (entry.id === artist.id ? artist : entry))
}
