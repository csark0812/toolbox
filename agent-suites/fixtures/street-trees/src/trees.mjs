const rows = (text) => {
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])),
  )
}

export const parseTrees = rows
export const parseSurveys = rows

// The most recent of one tree's surveys.
export function latestSurvey(surveys) {
  return [...surveys].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0]
}

export function fencingList(trees, surveys) {
  return trees.map((tree) => {
    const latest = latestSurvey(surveys.filter((survey) => survey.tree === tree.tree))
    return { ...tree, latest, fence: latest?.condition === 'DANGER' }
  })
}
