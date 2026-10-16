const WORDS_PER_MINUTE = 230

/** Words in a piece of prose. A contraction like `don't` counts once. */
export function countWords(text) {
  return (text.match(/\w+(?:'\w+)*/g) ?? []).length
}

/** Sentences, counted by their closing punctuation. */
export function countSentences(text) {
  return (text.match(/[.!?]+(?=\s|$)/g) ?? []).length
}

export const readingMinutes = (words) => Math.ceil(words / WORDS_PER_MINUTE)

/** Counts for one Markdown chapter. Headings are part of the text the reader sees. */
export function chapterStats(markdown) {
  const text = markdown.replace(/^#+\s*/gm, '')
  const words = countWords(text)
  return { words, sentences: countSentences(text), minutes: readingMinutes(words) }
}
