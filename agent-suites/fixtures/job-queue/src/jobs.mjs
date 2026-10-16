const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const JOBS = {
  'rebuild-thumbnails': async () => {
    await wait(20)
    return 'rebuilt 128 thumbnails'
  },
  'reindex-search': async () => {
    await wait(40)
    return 'reindexed 2,048 documents'
  },
  'send-digests': async () => {
    await wait(10)
    return 'sent 37 digests'
  },
}
