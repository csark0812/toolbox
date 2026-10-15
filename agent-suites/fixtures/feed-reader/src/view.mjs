// Renders the cached feed for the sidebar.
const time = (ms) => new Date(ms).toISOString().slice(11, 16)

export function renderFeed({ items }) {
  const newest = Math.max(...items.map((item) => item.publishedAt))
  return [`Updated ${time(newest)} UTC`, ...items.map((item) => `- ${item.title}`)].join('\n')
}
