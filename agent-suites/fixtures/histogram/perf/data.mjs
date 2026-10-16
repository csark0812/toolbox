// A deterministic synthetic panorama: gradients, noise, clipped highlights and a transparent border.
export function makeImage(width, height) {
  const rgba = new Uint8Array(width * height * 4)
  let seed = 99991
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const i = (y * width + x) * 4
      const base = (x * 255) / width
      const noise = (seed >> 16) % 40
      rgba[i] = Math.min(255, base + noise)
      rgba[i + 1] = Math.min(255, (y * 255) / height + noise)
      rgba[i + 2] = (base + y) % 256
      rgba[i + 3] = x < 8 || y < 8 ? 0 : 255
    }
  return rgba
}
