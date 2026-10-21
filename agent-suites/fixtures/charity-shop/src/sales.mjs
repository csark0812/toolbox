/** Sales of goods given to the shop, as opposed to new goods bought in to sell. */
export const donated = (sales) => sales.filter((sale) => sale.kind === 'donated')

/** The total of these sales, in pence. */
export const takings = (sales) => sales.reduce((sum, sale) => sum + sale.pence, 0)

/** Pence as pounds, for printing: 2400 is `£24.00`. */
export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
