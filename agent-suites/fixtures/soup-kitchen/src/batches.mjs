/** One line of the batches list. */
export function batchLine(batch) {
  const pots = batch.pots.join(', ')
  return `${batch.id}  ${batch.date}  ${batch.soup.padEnd(21)} ${batch.status === 'burnt' ? '(burnt) ' : ''}${pots}`
}
