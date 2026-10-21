// Development check for the bakery page: it renders cleanly and carries the brief's real facts.
import { checkPage } from './visual-page.mjs'
await checkPage(process.argv[2], 'index.html', {
  mustShow: [
    '14 Harbour Street',
    /4[.,]80/,
    /5[.,]20/,
    /5[.,]50/,
    /1[.,]40/,
    /2[.,]20/,
    '912 000 414',
    /Wed/i,
    /Sun/i,
    /20[.:]00/,
  ],
})
