/* global document */
const toggle = document.querySelector('.theme-toggle')
toggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark'
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  toggle.setAttribute('aria-pressed', String(dark))
})

for (const slot of document.querySelectorAll('.slot:not([disabled])')) {
  slot.addEventListener('click', () => {
    for (const other of document.querySelectorAll('.slot[aria-pressed="true"]'))
      other.setAttribute('aria-pressed', 'false')
    slot.setAttribute('aria-pressed', 'true')
  })
}
