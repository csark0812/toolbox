/** How each piece is shown on the cut list, by its label. */
export const FORMAT = {
  backing: (yards) => `${yards.toFixed(2)} yd`,
  batting: (yards) => `${yards.toFixed(2)} yd`,
  binding: (inches) => `${inches} in, ${Math.ceil(inches / 40)} strips`,
}
