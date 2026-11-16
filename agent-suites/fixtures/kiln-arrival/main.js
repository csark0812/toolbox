/* global document, requestAnimationFrame */
const canvas = document.getElementById('glazes')
const ctx = canvas.getContext('2d')
const glazes = ['#7d8f7a', '#b5542c', '#d9c7a7', '#3d4f63', '#a39a8f']
const tiles = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 97) % 1200,
  y: (i * 53) % 700,
  c: glazes[i % glazes.length],
}))
const start = performance.now()
function draw(now) {
  const t = (now - start) / 1000
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const tile of tiles) {
    ctx.globalAlpha = Math.min(1, t) * 0.35
    ctx.fillStyle = tile.c
    ctx.fillRect(tile.x + Math.sin(t + tile.y) * 6, tile.y, 18, 18)
  }
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
// The opening-hours notice arrives after the page has drawn.
setTimeout(() => {
  document.getElementById('notice').textContent = 'Open studio this Saturday, 10 till 4.'
  document.getElementById('notice').style.padding = '12px 48px'
}, 600)
