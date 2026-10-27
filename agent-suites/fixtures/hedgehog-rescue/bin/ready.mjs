import { readFileSync } from 'node:fs'
import { releaseStatus } from '../src/release.mjs'

const hogs = JSON.parse(readFileSync(new URL('../data/hogs.json', import.meta.url), 'utf8'))
for (const hog of hogs) {
  const { grams, ready } = releaseStatus(hog)
  console.log(
    `${hog.name.padEnd(8)}  ${String(grams).padStart(3)} g  ${ready ? 'ready' : 'not ready'}`,
  )
}
