/* global document, localStorage */
/* eslint-disable no-empty -- storage can be unavailable; the page falls back to the system theme */
// Shared with the box office pages. Sets data-theme on <html>, or removes it to follow the system.
const select = document.querySelector('#theme')
const apply = (choice) => {
  if (choice === 'light' || choice === 'dark') document.documentElement.dataset.theme = choice
  else delete document.documentElement.dataset.theme
}
let saved = null
try {
  saved = localStorage.getItem('theme')
} catch {}
apply(saved)
if (select) {
  select.value = saved ?? 'system'
  select.addEventListener('change', () => {
    apply(select.value)
    try {
      localStorage.setItem('theme', select.value)
    } catch {}
  })
}
