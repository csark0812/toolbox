// Surcharges are switched on per job by a field of the same name, and priced from the shop config.
export const SURCHARGES = ['urgent', 'weekend']

const title = (word) => word[0].toUpperCase() + word.slice(1)

export function invoiceLines(job, config) {
  const lines = [{ label: `Repair: ${job.item}`, pence: job.estimatePence }]
  for (const kind of SURCHARGES)
    if (job[kind])
      lines.push({ label: `${title(kind)} surcharge`, pence: config[`${kind}SurchargePence`] })
  const net = lines.reduce((sum, line) => sum + line.pence, 0)
  const vat = Math.round(net * config.vatRate)
  return { lines, net, vat, total: net + vat }
}
