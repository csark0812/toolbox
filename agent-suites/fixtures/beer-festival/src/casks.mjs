const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/** Lines of the list pinned up behind the bars. */
export function barList(casks) {
  return [...casks]
    .sort((a, b) => byText(a.beer, b.beer))
    .map((cask) => `${cask.beer.padEnd(22)}${cask.brewery.padEnd(18)}${cask.abv.toFixed(1)}%`)
}

/** One programme line per beer, by brewery. */
export function programme(casks) {
  return [...casks]
    .sort((a, b) => byText(a.brewery, b.brewery) || byText(a.beer, b.beer))
    .map(
      (cask) =>
        `${cask.brewery}: ${cask.beer}, ${cask.style.toLowerCase()}, ${cask.abv.toFixed(1)}%`,
    )
}
