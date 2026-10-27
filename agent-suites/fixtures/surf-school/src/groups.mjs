export const LEVELS = ['beginner', 'improver', 'advanced']

/** The day's lesson groups: one line per level with the pupils in it. */
export function groups(pupils) {
  return LEVELS.map((level) => {
    const names = pupils.filter((pupil) => pupil.level === level).map((pupil) => pupil.name)
    return `${level}: ${names.join(', ') || 'nobody'}`
  })
}
