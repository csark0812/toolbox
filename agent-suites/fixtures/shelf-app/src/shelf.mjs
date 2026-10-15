// A reading list: add, remove and list books.
export function createShelf() {
  const books = []
  let nextId = 1
  return {
    addBook(title) {
      const book = { id: nextId++, title }
      books.push(book)
      return book
    },
    removeBook(id) {
      const index = books.findIndex((book) => book.id === id)
      if (index === -1) throw new Error(`No book ${id}`)
      books.splice(index, 1)
      return true
    },
    byTitle() {
      return [...books].sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0))
    },
    count: () => books.length,
  }
}
