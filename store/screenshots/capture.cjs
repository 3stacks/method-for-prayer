// Capture the raw screens from the web export of the app, at the size of an iPhone.
// node capture.cjs <outDir> [baseUrl]
const { chromium } = require('playwright')
const OUT = process.argv[2]
const B = process.argv[3] ?? 'http://127.0.0.1:5191'
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, serviceWorkers: 'block' })
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
