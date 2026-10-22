/** One line of the hire sheet. */
export function hireLine(hire) {
  const when = hire.back === null ? `${hire.out} still out` : `${hire.out} to ${hire.back}`
  return `${hire.id}  ${hire.date}  ${hire.boat}  ${when}`
}
