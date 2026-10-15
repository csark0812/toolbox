let nextId = 1
// Creates a note. Title is required.
export function createNote({ title, body = '', tags }) {
  if (!title) throw new Error('title is required')
  return { id: nextId++, title, body, tags }
}
