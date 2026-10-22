import { artists, photos, saveArtist } from './store.mjs'

const EDITABLE = ['studio', 'medium', 'bio']

const photosOf = (artistId) =>
  Object.keys(photos()).filter((path) => path.startsWith(`photos/${artistId}/`))

const publicView = (artist) => ({
  id: artist.id,
  name: artist.name,
  studio: artist.studio,
  medium: artist.medium,
  bio: artist.bio,
  photos: photosOf(artist.id),
})

/** The public trail: approved artists, by name. */
export function publicListings() {
  return {
    status: 200,
    body: artists()
      .filter((artist) => artist.approved)
      .map(publicView)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}

/** Changes the signed-in artist's own listing. */
export function updateListing(request, session) {
  if (!session?.artistId) return { status: 401, body: { error: 'sign in' } }
  const artist = artists().find((entry) => entry.id === session.artistId)
  if (!artist) return { status: 401, body: { error: 'sign in' } }
  const changes = Object.fromEntries(
    Object.entries(request.body).filter(([key]) => EDITABLE.includes(key)),
  )
  const updated = { ...artist, ...changes }
  saveArtist(updated)
  return { status: 200, body: publicView(updated) }
}
