// Gathers a feed's runs into an array once it ends. Rejects on the feed's 'error'.
export function collect(feed, keep = () => true) {
  return new Promise((resolve, reject) => {
    const runs = []
    feed.on('run', (run) => {
      if (keep(run)) runs.push(run)
    })
    feed.on('error', reject)
    feed.on('end', () => resolve(runs))
  })
}
