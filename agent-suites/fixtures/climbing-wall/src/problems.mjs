/** One line of the problem list. */
export function problemLine(problem) {
  return `${problem.id.padEnd(5)}${problem.name.padEnd(14)}${problem.grade.padEnd(6)}${problem.setter}`
}
