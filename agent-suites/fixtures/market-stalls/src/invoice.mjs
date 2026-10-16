import { formatPrice } from './money.mjs'

export const totalOf = (stall) => stall.fees.reduce((sum, fee) => sum + fee.pence, 0)

/** The lines of one trader's invoice. */
export function invoiceLines(stall) {
  return [
    `${stall.trader} (pitch ${stall.pitch})`,
    ...stall.fees.map((fee) => `  ${fee.item.padEnd(22)}${formatPrice(fee.pence).padStart(10)}`),
    `  ${'Total'.padEnd(22)}${formatPrice(totalOf(stall)).padStart(10)}`,
  ]
}
