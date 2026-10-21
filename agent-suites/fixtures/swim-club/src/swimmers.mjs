/** One line of the squad list. */
export function swimmerLine(swimmer) {
  return `${swimmer.name.padEnd(12)} ${swimmer.born}`
}
