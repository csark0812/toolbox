const PRICE_PER_SIDE_CENTS = 9

/** The job ticket for printing `pages` (page numbers) of a document. */
export function jobTicket(document, pages, { copies = 1, duplex = false } = {}) {
  if (!Number.isInteger(copies) || copies < 1) throw new RangeError(`bad copy count: ${copies}`)
  const sheetsPerCopy = duplex ? Math.ceil(pages.length / 2) : pages.length
  return {
    title: document.title,
    pages,
    copies,
    sheets: sheetsPerCopy * copies,
    priceCents: pages.length * copies * PRICE_PER_SIDE_CENTS,
  }
}

/** The ticket as the printer's text format. */
export function formatTicket(ticket) {
  return [
    `title: ${ticket.title}`,
    `pages: ${ticket.pages.join(',')}`,
    `copies: ${ticket.copies}`,
    `sheets: ${ticket.sheets}`,
    `price: $${(ticket.priceCents / 100).toFixed(2)}`,
  ].join('\n')
}
