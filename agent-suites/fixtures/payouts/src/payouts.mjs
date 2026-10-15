// Seller payouts in integer cents.

/** What the seller receives after the platform fee. */
export function net(grossCents, feeRate) {
  return grossCents - Math.round(grossCents * feeRate)
}
