/** One line of the episode list. */
export function formatEpisode(ep) {
  return `${ep.number}. ${ep.title} (${Math.round(ep.seconds / 60)} min)`
}

export function episodeList(episodes) {
  return episodes.map(formatEpisode).join('\n')
}
