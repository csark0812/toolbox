/* global document */
const pay = document.getElementById('pay-modal')
const where = document.getElementById('pay-where')
const search = document.getElementById('q')
const suggestions = document.getElementById('suggestions')

function closePopups() {
  for (const marker of document.querySelectorAll('.marker.is-open')) {
    marker.classList.remove('is-open')
    marker.querySelector('.popup').hidden = true
    marker.querySelector('.marker__pin').setAttribute('aria-expanded', 'false')
  }
}

for (const pin of document.querySelectorAll('.marker__pin')) {
  pin.addEventListener('click', () => {
    const marker = pin.closest('.marker')
    const wasOpen = marker.classList.contains('is-open')
    closePopups()
    if (wasOpen) return
    marker.classList.add('is-open')
    marker.querySelector('.popup').hidden = false
    pin.setAttribute('aria-expanded', 'true')
  })
}

for (const button of document.querySelectorAll('.pay-btn')) {
  button.addEventListener('click', () => {
    where.textContent = button.dataset.carPark
    pay.hidden = false
    pay.querySelector('input').focus()
  })
}

for (const button of pay.querySelectorAll('[data-close]')) {
  button.addEventListener('click', () => {
    pay.hidden = true
  })
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  pay.hidden = true
  suggestions.hidden = true
})

function showSuggestions() {
  const term = search.value.trim().toLowerCase()
  let shown = 0
  for (const item of suggestions.children) {
    const match = item.textContent.toLowerCase().includes(term)
    item.hidden = !match
    if (match) shown += 1
  }
  suggestions.hidden = shown === 0
}

search.addEventListener('focus', showSuggestions)
search.addEventListener('input', showSuggestions)
document.addEventListener('click', (event) => {
  if (!event.target.closest('.search')) suggestions.hidden = true
})
