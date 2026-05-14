import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = join(__dirname, '../public/favicon.svg')
const svg = readFileSync(svgPath)

const sizes = [
  { size: 16,  name: 'favicon-16x16.png' },
  { size: 32,  name: 'favicon-32x32.png' },
  { size: 48,  name: 'favicon-48x48.png' },
  { size: 64,  name: 'favicon-64x64.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
]

mkdirSync(join(__dirname, '../public/icons'), { recursive: true })

for (const { size, name } of sizes) {
  const dest = size >= 120
    ? join(__dirname, '../public/icons', name)
    : join(__dirname, '../public', name)

  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(dest)

  console.log(`✓ Generated ${name} (${size}x${size})`)
}

console.log('All favicons generated.')
