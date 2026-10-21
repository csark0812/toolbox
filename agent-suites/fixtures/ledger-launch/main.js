document.querySelectorAll('.card').forEach((card, index) => {
  card.style.opacity = 0
  setTimeout(() => {
    card.style.transition = 'opacity 0.6s'
    card.style.opacity = 1
  }, 200 * index)
})
