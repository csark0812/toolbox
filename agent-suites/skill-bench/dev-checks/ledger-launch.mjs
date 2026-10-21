// Development check for the restyled marketing page: same content, renders cleanly.
import { checkPage } from './visual-page.mjs'
await checkPage(process.argv[2], 'index.html', {
  mustShow: [
    /fewest transfers/i,
    /four housemates/i,
    /€\s?2/,
    /move money/i,
    /moves out/i,
    /unevenly/i,
  ],
})
