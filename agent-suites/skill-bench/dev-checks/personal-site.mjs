// Development check for the personal site: it renders cleanly and carries the notes' real facts.
import { checkPage } from './visual-page.mjs'
await checkPage(process.argv[2], 'index.html', {
  mustShow: [
    'Tomás',
    /weight/i,
    'Tidepool',
    'Spring Lab',
    'Lumen',
    /Interfaces with weight/i,
    'tomas@reyes.studio',
  ],
})
