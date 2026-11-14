// Put the built app (dist/) under the built homepage (site/out/app/), so one
// folder holds the public site. Run by `npm run site`.
//
// scripts/seo.mjs writes sitemap.xml, robots.txt and llms.txt into dist/.
// They cover the whole site, so they move to the root of site/out/.
import { cpSync, existsSync, renameSync, rmSync } from 'node:fs'

if (!existsSync('dist/index.html')) throw new Error('dist/ is missing: run `npm run build` first')
if (!existsSync('site/out/index.html')) throw new Error('site/out/ is missing: run `npm --prefix site run build` first')
rmSync('site/out/app', { recursive: true, force: true })
cpSync('dist', 'site/out/app', { recursive: true })
for (const file of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!existsSync(`site/out/app/${file}`)) throw new Error(`dist/${file} is missing: run scripts/seo.mjs`)
  renameSync(`site/out/app/${file}`, `site/out/${file}`)
}
console.log('site/out/ holds the homepage, and site/out/app/ holds the app')
