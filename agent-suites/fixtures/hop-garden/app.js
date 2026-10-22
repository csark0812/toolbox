// The Print button and the day filter in the sidebar.
document.querySelector('.print-btn').addEventListener('click', () => window.print())

for (const input of document.querySelectorAll('input[name="day"]'))
  input.addEventListener('change', () => {
    for (const day of document.querySelectorAll('.day'))
      day.hidden = input.value !== 'all' && day.id !== input.value
  })
