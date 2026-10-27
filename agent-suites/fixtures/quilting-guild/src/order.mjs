import { calc_backing } from './fabric.mjs'

/** Total backing yards for the shop order. */
export function backingOrder(patterns) {
  return patterns.reduce((total, quilt) => total + calc_backing(quilt), 0)
}
