import { fmtWhen, slug } from '../util.mjs'

const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function rss(shows, site = 'https://example.invalid') {
  const items = shows
    .map(
      (show) =>
        `  <item><title>${escape(show.artist)}</title><link>${site}/shows/${slug(show.artist)}</link>` +
        `<description>${escape(fmtWhen(show.startsAt, show.timeZone))}</description></item>`,
    )
    .join('\n')
  return `<rss version="2.0"><channel>\n${items}\n</channel></rss>`
}
