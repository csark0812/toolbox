// The Classes dropdown and the entry form's dialog.
const menuButton = document.querySelector('.menu-btn')
const menu = document.querySelector('.menu')
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open')
  menuButton.setAttribute('aria-expanded', String(open))
})

const modal = document.querySelector('.modal')
document.querySelector('.open-entry').addEventListener('click', () => {
  modal.classList.add('is-open')
  modal.querySelector('input').focus()
})
modal
  .querySelector('.modal__close')
  .addEventListener('click', () => modal.classList.remove('is-open'))
modal.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault()
  modal.classList.remove('is-open')
})
