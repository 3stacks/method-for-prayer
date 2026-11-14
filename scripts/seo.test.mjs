// Run: node --test scripts/seo.test.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { ANALYTICS_LOADER } from '../shared/analytics-loader.ts'
import { APP, SITE, homePage, llms, page, robots, sitemap } from './seo.mjs'

const root = new URL('..', import.meta.url).pathname
const template = '<html><head><title>x</title>\n<meta name="description" content="x" />\n</head><body><div id="root"></div></body></html>'
const book = { source: { title: 'A Method for Prayer' }, parts: [{ id: 'adoration', n: 1, name: 'Adoration', title: 'Of the first part', heads: [{}] }] }

test('the app path matches experiments.baseUrl in app.json', () => {
  const app = JSON.parse(readFileSync(`${root}/app.json`, 'utf8'))
  assert.equal(app.expo.experiments.baseUrl, APP)
})

test('a crawler page of the app has its canonical link under /app', () => {
  const html = page(template, homePage(book))
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE}/app/" />`))
  assert.match(html, /href="\/app\/book\/adoration"/)
  assert.match(html, new RegExp(`og:image" content="${SITE}/app/apple-touch-icon.png"`))
})

test('a page can give its canonical link to the homepage', () => {
  const html = page(template, { path: '/app/privacy', canonical: `${SITE}/privacy/`, title: 'Privacy', description: 'd' })
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE}/privacy/" />`))
})

test('the sitemap, robots.txt and llms.txt use the paths of the whole site', () => {
  const xml = sitemap(['/', '/privacy/', '/app/book'], '2026-11-14')
  assert.match(xml, new RegExp(`<loc>${SITE}/app/book</loc>`))
  assert.match(robots(), new RegExp(`Sitemap: ${SITE}/sitemap.xml`))
  const txt = llms(book)
  assert.match(txt, new RegExp(`\\(${SITE}/app/book/adoration\\)`))
  assert.match(txt, new RegExp(`\\[Privacy\\]\\(${SITE}/privacy/\\)`))
})

test('public/index.html has the same analytics loader as the website', () => {
  const html = readFileSync(`${root}/public/index.html`, 'utf8')
  assert.ok(html.includes(ANALYTICS_LOADER))
})

test('public/index.html and the manifest point into /app', () => {
  const html = readFileSync(`${root}/public/index.html`, 'utf8')
  assert.match(html, /href="\/app\/manifest.webmanifest"/)
  const manifest = JSON.parse(readFileSync(`${root}/public/manifest.webmanifest`, 'utf8'))
  assert.equal(manifest.start_url, '/app/')
})
