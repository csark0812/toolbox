/** Mean of the marked marks; null (not marked yet) is left out. */
export function mean(marks) {
  const marked = marks.filter((mark) => mark !== null)
  return marked.length ? marked.reduce((sum, mark) => sum + mark, 0) / marked.length : null
}

/** The overall percentage: the mean of every marked mark across categories. */
export function overall(student) {
  return mean(Object.values(student.marks).flat())
}

export function letter(percent) {
  if (percent >= 90) return 'A'
  if (percent >= 80) return 'B'
  if (percent >= 70) return 'C'
  if (percent >= 60) return 'D'
  return 'F'
}
