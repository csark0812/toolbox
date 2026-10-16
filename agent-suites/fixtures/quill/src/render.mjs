import { escapeHtml } from './escape.mjs'
import { tagList } from './tags.mjs'

const page = (title, body) =>
  `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>\n<body>\n${body}\n</body>\n</html>\n`

const paragraphs = (body) =>
  body
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para.trim())}</p>`)
    .join('\n')

export function renderPost(post) {
  return page(
    post.title,
    [
      `<article>`,
      `<h1>${escapeHtml(post.title)}</h1>`,
      `<p class="meta">${post.date} · ${escapeHtml(post.author)}</p>`,
      tagList(post),
      paragraphs(post.body),
      `</article>`,
    ].join('\n'),
  )
}

export function renderIndex(posts) {
  const items = posts
    .map(
      (post) => `<li><a href="/${post.slug}.html">${escapeHtml(post.title)}</a> ${post.date}</li>`,
    )
    .join('\n')
  return page('Blog', `<h1>Blog</h1>\n<ul>\n${items}\n</ul>`)
}
