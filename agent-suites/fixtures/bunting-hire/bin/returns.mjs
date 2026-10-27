import { loadHires, returnLine } from '../src/returns.mjs'

for (const hire of loadHires().filter((entry) => entry.returned)) console.log(returnLine(hire))
