/** An in-memory post store. */
export function createStore() {
  return { posts: [], nextId: 1 }
}

/** Adds a draft post and returns it. */
export function createPost(store, { title, body = '' }) {
  if (!title?.trim()) throw new TypeError('A post needs a title')
  const post = { id: store.nextId++, title: title.trim(), body, status: 'draft' }
  store.posts.push(post)
  return post
}

export function publish(store, id) {
  const post = store.posts.find((entry) => entry.id === id)
  if (!post) throw new RangeError(`No post ${id}`)
  post.status = 'published'
  return post
}
