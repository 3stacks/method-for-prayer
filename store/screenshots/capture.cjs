// Capture the raw screens from the web export of the app, at the size of an iPhone or an iPad.
// node capture.cjs <outDir> [baseUrl] [--ipad]
const { chromium } = require('playwright')
const args = process.argv.slice(2)
const ipad = args.includes('--ipad')
const [OUT, B = 'http://127.0.0.1:5191'] = args.filter((a) => a !== '--ipad')
// The iPhone 6.9-inch display, or the iPad 13-inch display in portrait.
const DEVICE = ipad
  ? { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2 }
  : { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 }
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ ...DEVICE, isMobile: true, hasTouch: true, serviceWorkers: 'block' })
  const p = await ctx.newPage()
  const shot = async (n) => {
    await p.waitForTimeout(900)
    await p.screenshot({ path: `${OUT}/${n}.png` })
    console.log(n)
  }
  // The intercession list, so that the guided prayer shows it.
  await p.goto(B + '/intercession', { waitUntil: 'networkidle' })
  for (const name of ['Our minister and elders', 'The persecuted church', 'Grandmother, in hospital']) {
    await p.getByPlaceholder('A name or a need').fill(name)
    await p.getByRole('button', { name: 'Add' }).click()
  }
  await p.goto(B + '/pray', { waitUntil: 'networkidle' })
  await shot('pray')
  await p.getByRole('link', { name: /read the verse/ }).nth(1).click()
  await shot('verse')
  await p.goto(B + '/book/petition', { waitUntil: 'networkidle' })
  await shot('book')
  await p.goto(B + '/occasions', { waitUntil: 'networkidle' })
  await shot('occasions')
  await p.goto(B + '/pray?step=5', { waitUntil: 'networkidle' })
  await shot('intercession')
  await b.close()
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
