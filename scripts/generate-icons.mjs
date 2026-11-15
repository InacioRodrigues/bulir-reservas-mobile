/**
 * Gera o ícone, o splash e o favicon da app a partir da marca (o "B" da app web),
 * sem dependências: rasteriza o traço por distância (anti-aliasing) e codifica PNG com zlib.
 * Uso: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const TEAL = [45, 212, 191] // #2DD4BF
const NAVY = [15, 29, 58] // #0F1D3A
const WHITE = [255, 255, 255]

/* ---- geometria do "B" no viewBox 32x32 (mesmo traço do logótipo da web) ---- */
const STROKE = 2.6 / 2
const deg = (a) => (a * Math.PI) / 180
const segments = [
  [10, 8, 10, 26],
  [10, 8, 17, 8],
  [17.5, 26, 10, 26],
]
const arcs = [
  // Centros calculados a partir dos comandos "a"/"A" do SVG (raio + pontos inicial/final).
  { cx: 17.05, cy: 13.0, r: 5, from: deg(-90.6), to: deg(59.3) },
  { cx: 15.44, cy: 20.9, r: 5.5, from: deg(-40.9), to: deg(68) },
]

function distSegment(px, py, [x1, y1, x2, y2]) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function distArc(px, py, { cx, cy, r, from, to }) {
  const angle = Math.atan2(py - cy, px - cx)
  if (angle >= from && angle <= to) return Math.abs(Math.hypot(px - cx, py - cy) - r)
  const end = (a) => Math.hypot(px - (cx + r * Math.cos(a)), py - (cy + r * Math.sin(a)))
  return Math.min(end(from), end(to))
}

/** Cobertura (0..1) do traço do "B" no ponto (x, y) do viewBox; `px` = tamanho de um pixel. */
function letterCoverage(x, y, px) {
  const d = Math.min(
    ...segments.map((s) => distSegment(x, y, s)),
    ...arcs.map((a) => distArc(x, y, a)),
  )
  return Math.max(0, Math.min(1, (STROKE - d) / px + 0.5))
}

/** Cobertura de um quadrado arredondado (lado 32, raio 8) no viewBox. */
function squareCoverage(x, y, px) {
  const r = 8
  const qx = Math.abs(x - 16) - (16 - r)
  const qy = Math.abs(y - 16) - (16 - r)
  const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  return Math.max(0, Math.min(1, -d / px + 0.5))
}

/**
 * Desenha a marca numa imagem `size`x`size`.
 * scale: fração da imagem ocupada pelo viewBox (o "B" fica centrado).
 */
function render(size, { background, square = false, letter = NAVY, scale = 1 }) {
  const pixels = Buffer.alloc(size * size * 4)
  const view = 32 / (size * scale)
  const offset = (size - size * scale) / 2
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = (i + 0.5 - offset) * view
      const y = (j + 0.5 - offset) * view
      let [r, g, b, a] = background ? [...background, 1] : [0, 0, 0, 0]
      if (square) {
        const c = squareCoverage(x, y, view)
        ;[r, g, b] = [
          r * (1 - c) + TEAL[0] * c,
          g * (1 - c) + TEAL[1] * c,
          b * (1 - c) + TEAL[2] * c,
        ]
        a = Math.max(a, c)
      }
      // Ligeiro deslocamento para centrar opticamente o "B" (bbox ≈ 8.7..23.8 × 6.7..27.3).
      const c = letterCoverage(x + 0.25, y - 0.0, view)
      if (c > 0) {
        if (a === 0) [r, g, b] = letter
        else
          [r, g, b] = [
            r * (1 - c) + letter[0] * c,
            g * (1 - c) + letter[1] * c,
            b * (1 - c) + letter[2] * c,
          ]
        a = Math.max(a, c)
      }
      const k = (j * size + i) * 4
      pixels[k] = Math.round(r)
      pixels[k + 1] = Math.round(g)
      pixels[k + 2] = Math.round(b)
      pixels[k + 3] = Math.round(a * 255)
    }
  }
  return encodePng(size, size, pixels)
}

/* ---- codificador PNG mínimo (RGBA 8 bits) ---- */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}
function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bits
  header[9] = 6 // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const out = (name, png) => {
  writeFileSync(new URL(`../assets/images/${name}`, import.meta.url), png)
  console.log(`assets/images/${name}`)
}

// iOS/Expo Go: ícone quadrado cheio (o sistema arredonda os cantos).
out('icon.png', render(1024, { background: TEAL, scale: 0.92 }))
// Android adaptive icon: fundo liso + "B" dentro da zona segura (66%).
out('android-icon-background.png', render(512, { background: TEAL, letter: TEAL }))
out('android-icon-foreground.png', render(1024, { scale: 0.5 }))
out('android-icon-monochrome.png', render(1024, { scale: 0.5, letter: WHITE }))
// Splash: marca (quadrado arredondado + "B") sobre o fundo definido no app.json.
out('splash-icon.png', render(512, { square: true, scale: 1 }))
out('favicon.png', render(48, { square: true, scale: 1 }))
