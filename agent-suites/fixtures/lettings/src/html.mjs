const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Escapes text for use inside HTML. */
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ENTITIES[char])

/** Formats pence as pounds, e.g. 120000 → £1,200.00. */
export const pounds = (pence) =>
  `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** A tenant portal page. */
export const page = (title, body) =>
  `<!doctype html><html><head><title>${escapeHtml(title)}</title></head><body>${body}</body></html>`
