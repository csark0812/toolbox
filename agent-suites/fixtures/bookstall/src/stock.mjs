/** The book with this ISBN, or undefined. */
export function findBook(stock, isbn) {
  return stock.find((book) => book.isbn === isbn)
}

export const price = (pence) => `£${(pence / 100).toFixed(2)}`
