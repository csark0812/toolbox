const BOUNDARIES = [
  ['A', 70],
  ['B', 60],
  ['C', 50],
  ['D', 40],
]

export function parseMarks(text) {
  const [, ...rows] = text.trim().split('\n')
  return rows.map((row) => {
    const [candidate, name, paper1, paper2] = row.split(',')
    return { candidate, name, papers: [Number(paper1), Number(paper2)] }
  })
}

/** A candidate's percentage over both papers. */
export const percentage = (candidate) => (candidate.papers[0] + candidate.papers[1]) / 2

/** The grade for a percentage. */
export function gradeFor(percent) {
  for (const [grade, from] of BOUNDARIES) if (percent >= from) return grade
  return 'U'
}
