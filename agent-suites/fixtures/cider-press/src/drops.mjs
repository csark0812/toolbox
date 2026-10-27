/** One line of the drop-off list, with the weight as it was written on the tag. */
export function dropLine(drop) {
  return `${drop.id}  ${drop.date}  ${drop.grower.trim()}  ${drop.variety}  ${drop.weight}`
}
