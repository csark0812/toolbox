export const WORD_LIMIT = 120

export const wordCount = (text) => text.split(' ').length

/** Proposals whose abstract is over the limit, with their word counts. */
export function overLimit(submissions) {
  return submissions
    .map((submission) => ({ ...submission, words: wordCount(submission.abstract) }))
    .filter((submission) => submission.words > WORD_LIMIT)
}

/** The CSV export: one header row and one row per proposal. */
export function toCsv(submissions) {
  const header = ['id', 'title', 'track', 'speaker', 'email', 'words']
  const rows = submissions.map((submission) => [
    submission.id,
    submission.title,
    submission.track,
    submission.speaker.name,
    submission.speaker.email,
    wordCount(submission.abstract),
  ])
  return [header, ...rows].map((row) => row.join(',')).join('\n')
}

/** Each speaker once, with the number of proposals they sent, in order of first proposal. */
export function speakers(submissions) {
  const byEmail = new Map()
  for (const { speaker } of submissions) {
    const entry = byEmail.get(speaker.email) ?? { ...speaker, proposals: 0 }
    entry.proposals++
    byEmail.set(speaker.email, entry)
  }
  return [...byEmail.values()]
}
