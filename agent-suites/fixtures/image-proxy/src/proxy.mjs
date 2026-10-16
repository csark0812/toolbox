import { isAllowed } from './hosts.mjs'

/** GET /img?url=... */
export async function handleImage(req, { fetchImage }) {
  const params = new URL(req.url, 'http://proxy.internal').searchParams
  const source = params.get('url')
  if (!source || !isAllowed(source))
    return { status: 400, headers: {}, body: 'image host not allowed' }
  const image = await fetchImage(source)
  return { status: 200, headers: { 'cache-control': 'public, max-age=86400' }, body: image }
}
