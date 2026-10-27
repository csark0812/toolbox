import { writeFileSync } from 'node:fs'
import { renderWeb } from '../src/web.mjs'

writeFileSync(new URL('../web/index.html', import.meta.url), renderWeb())
console.log('wrote web/index.html')
