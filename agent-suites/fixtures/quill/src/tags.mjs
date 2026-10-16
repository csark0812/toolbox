import { escapeHtml } from './escape.mjs'

/** The tag links shown under a post. */
export function tagList(post) {
  const links = post.tags.map(
    (tag) => `<a class="tag" href="/tags/${encodeURIComponent(tag)}.html">#${escapeHtml(tag)}</a>`,
  )
  return `<p class="tags">${links.join(' ')}</p>`
}
