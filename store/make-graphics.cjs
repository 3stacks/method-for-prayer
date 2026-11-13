// Draws the app icon, the Android icons, the splash icon, the favicon, the
// Play icon and the Play feature graphic from one SVG motif: an open book
// under a cross, on deep green.
//
//   NODE_PATH=<a node_modules with sharp> node store/make-graphics.cjs
const sharp = require('sharp')
const path = require('path')

const root = path.join(__dirname, '..')
const GREEN = '#1f4d3a'
const CREAM = '#f3ecd6'
const GOLD = '#d4b467'

/** The motif, drawn in a 1024 box. `ink` colours the book, `mark` the cross. */
function motif(ink, mark, page = GREEN) {
  const lines = [0, 1, 2, 3, 4]
    .map((i) => {
      const y = 470 + i * 38
      return `<path d="M290 ${y - 6 + i * 2} C 360 ${y - 16}, 430 ${y - 10}, 480 ${y + 8}" stroke="${page}" stroke-opacity="0.35" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M734 ${y - 6 + i * 2} C 664 ${y - 16}, 594 ${y - 10}, 544 ${y + 8}" stroke="${page}" stroke-opacity="0.35" stroke-width="9" fill="none" stroke-linecap="round"/>`
    })
    .join('\n')
  return `
<path d="M512 760 C 430 712, 330 700, 220 718 L 220 420 C 330 402, 430 414, 512 462 Z" fill="${ink}"/>
<path d="M512 760 C 594 712, 694 700, 804 718 L 804 420 C 694 402, 594 414, 512 462 Z" fill="${ink}"/>
${lines}
<rect x="496" y="200" width="32" height="200" rx="4" fill="${mark}"/>
<rect x="444" y="250" width="136" height="30" rx="4" fill="${mark}"/>`
}

const svg = (body, { size = 1024, bg = null, scale = 1 } = {}) => {
  const off = (1024 - 1024 * scale) / 2
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}
<g transform="translate(${off} ${off}) scale(${scale})">${body}</g></svg>`)
}

const out = (p) => path.join(root, p)
const flat = (img) => img.flatten({ background: GREEN }).removeAlpha()

async function main() {
  // The iOS icon must have no transparency.
  await flat(sharp(svg(motif(CREAM, GOLD), { bg: GREEN }))).png().toFile(out('assets/icon.png'))
  // Android: the motif in the safe zone, on a transparent ground. app.json gives the green.
  await sharp(svg(motif(CREAM, GOLD), { scale: 0.62 })).png().toFile(out('assets/android-icon-foreground.png'))
  await sharp(svg(motif('#ffffff', '#ffffff', '#000000'), { scale: 0.62 })).png().toFile(out('assets/android-icon-monochrome.png'))
  // The splash icon: a rounded green tile, so it shows on light and dark grounds.
  const tile = `<rect x="32" y="32" width="960" height="960" rx="220" fill="${GREEN}"/>`
  await sharp(svg(tile + motif(CREAM, GOLD), { size: 512 })).png().toFile(out('assets/splash-icon.png'))
  await sharp(svg(tile + motif(CREAM, GOLD), { size: 48 })).png().toFile(out('assets/favicon.png'))
  await flat(sharp(svg(motif(CREAM, GOLD), { bg: GREEN, size: 512 }))).png().toFile(out('store/play-icon.png'))

  // The Play feature graphic, 1024 × 500.
  const feature = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
<rect width="1024" height="500" fill="${GREEN}"/>
<g transform="translate(30 20) scale(0.45)">${motif(CREAM, GOLD)}</g>
<text x="510" y="190" font-family="Source Serif 4" font-weight="600" font-size="76" fill="${CREAM}">A Method</text>
<text x="510" y="276" font-family="Source Serif 4" font-weight="600" font-size="76" fill="${CREAM}">for Prayer</text>
<text x="512" y="340" font-family="Source Serif 4" font-style="italic" font-size="29" fill="${GOLD}">Pray in the words of Scripture</text>
<text x="512" y="386" font-family="Inter" font-size="24" fill="${CREAM}" fill-opacity="0.8">Matthew Henry, 1710</text>
</svg>`)
  await flat(sharp(feature)).png().toFile(out('store/feature-graphic.png'))
  console.log('graphics written')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
