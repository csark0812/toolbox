// Development check for the feed question: the answer must leave every project file unchanged.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const expected = {
  'package.json': '1bf3e7c8c2669d96b89edbd03f5f522c1a4824472fa039ef63e98147cbffeaad',
  'README.md': '6511601b45243e141969d0ef5b9d25255369513d768f4447b5bcbf7ba41a0e75',
  'src/cache.mjs': 'af281c6633945d734c0a6d3c9f6b9879c329877f439873c38ceceed9670f7c66',
  'src/view.mjs': 'eca43b3a7fda15ea98cdd7a17318009ae35ec94c27b8a054db6ae83bf5c38c4e',
  'src/source.mjs': '814901b5f04c583c2e5a711e33664c4e9c546323217a9f4e8adf7a47082a6ae7',
  'tests/cache.test.mjs': 'edf07a588eeb66425db3109d19d05912241fbfdda40b4d622764fa41d49e8d01',
}
for (const [file, sha] of Object.entries(expected))
  assert.equal(
    createHash('sha256')
      .update(readFileSync(join(dir, file)))
      .digest('hex'),
    sha,
    `${file} changed`,
  )
