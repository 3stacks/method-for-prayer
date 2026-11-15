// Pages for search engines and AI answer engines, after "expo export --platform web".
//
//   node scripts/seo.mjs [dist]
//
// The web app is one page: JavaScript draws each screen. A crawler that does
// not run JavaScript sees an empty page. This script writes:
//
// The web app is at /app/ (experiments.baseUrl in app.json). The homepage at /
// is the Next.js site in site/. `npm run site` puts dist/ in site/out/app/.
//
// 1. head/<id>.html for each head of the book, and book/<part>.html for each
//    chapter. Cloudflare Pages serves them for /app/head/<id> and /app/book/<part>.
//    Each has a title, a description, a canonical link, Open Graph tags,
//    JSON-LD, and the text as plain HTML inside #root. The app replaces that
//    HTML when it starts.
// 2. index.html, book.html, occasions.html, about.html and privacy.html. The
//    canonical link of privacy.html is the privacy page of the homepage.
// 3. pray.html, intercession.html, preface.html and settings.html: the app
//    shell with a title. The site has a 404.html, so Cloudflare Pages does not
//    send an unknown path to index.html. Each screen of the app needs a file.
// 4. sitemap.xml, robots.txt and llms.txt, for the whole site. scripts/merge-site.mjs
//    moves them to the root of site/out/.
//
// SITE_URL sets the domain of the links. The default is https://methodforprayer.app
// (not registered yet).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(new URL('.', import.meta.url).pathname, '..')
export const SITE = (process.env.SITE_URL ?? 'https://methodforprayer.app').replace(/\/+$/, '')
const NAME = 'A Method for Prayer'
/** The path of the web app. app.json has the same value in experiments.baseUrl. */
export const APP = '/app'
const SCAN = 'https://archive.org/details/methodforprayerw0000henr'
const PDM = 'https://creativecommons.org/publicdomain/mark/1.0/'
const DESCRIPTION =
  'Pray in the words of Scripture with Matthew Henry’s A Method for Prayer (1710). A guided prayer in six parts, the whole book, and prayers for occasions.'
const STYLE = 'overflow:auto;height:100%;width:100%;box-sizing:border-box;padding:16px;max-width:760px;margin:0 auto;font:18px/1.6 Georgia,serif'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`

/** [code, name, short] for each book, from src/lib/books.ts. */
const BOOKS = new Map(
  [...readFileSync(join(ROOT, 'src/lib/books.ts'), 'utf8').matchAll(/^\s*(\[".*?\]),$/gm)].map((m) => {
    const row = JSON.parse(m[1])
    return [row[0], row]
  }),
)

/** "Ps.118.27" → "Ps 118:27". */
export function refShort(id) {
  const [code, ch, vv] = id.split('.')
  const short = BOOKS.get(code)?.[2] ?? code
  return `${short} ${ch}${vv ? `:${vv.replace(/-/g, '–').replace(/,/g, ', ')}` : ''}`
}

/** A paragraph as HTML: the text, and each reference in brackets. */
export const segsHtml = (segs) =>
  segs.map((s) => (typeof s === 'string' ? esc(s) : `<cite>${esc(refShort(s[0]))}</cite>`)).join('')

/** A paragraph as plain text. */
export const segsText = (segs) =>
  segs
    .map((s) => (typeof s === 'string' ? s : refShort(s[0])))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

const titleText = (h) => segsText(h.title.filter((s) => typeof s === 'string')).replace(/[\s,;:]+$/, '') || 'Opening words'
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…')

/**
 * The page: the template with this head and this body.
 * @param {string} template
 * @param {{ path: string, title: string, description: string, jsonld?: object, body?: string, canonical?: string }} p
 */
export function page(template, { path, title, description, jsonld, body, canonical }) {
  const url = canonical ?? SITE + path
  const head = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(SITE + APP + '/apple-touch-icon.png')}" />`,
    `<meta name="twitter:card" content="summary" />`,
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace('</head>', `    ${head}\n  </head>`)
  if (body) html = html.replace('<div id="root"></div>', `<div id="root"><main id="seo" style="${STYLE}">${body}</main></div>`)
  return html
}

const bookLd = (source) => ({
  '@type': 'Book',
  '@id': `${SITE}${APP}/book#book`,
  name: 'A Method for Prayer',
  alternateName: source.title,
  author: { '@type': 'Person', name: 'Matthew Henry', birthDate: '1662', deathDate: '1714' },
  datePublished: '1710',
  inLanguage: 'en',
  license: PDM,
  url: `${SITE}${APP}/book`,
})

const footer = (source) =>
  `<p><small>Henry’s text is in the public domain. ${esc(source.edition)} From the ${link(SCAN, 'Internet Archive scan')}. The KJV text is in the public domain.</small></p>`

/** The page of one head. */
export function headPage(book, part, head, i) {
  const path = `${APP}/head/${head.id}`
  const prev = part.heads[i - 1]
  const next = part.heads[i + 1]
  const parents = []
  for (let p = head.parent; p; ) {
    const h = part.heads.find((x) => x.id === p)
    if (!h) break
    parents.unshift(h)
    p = h.parent
  }
  const name = titleText(head)
  const first = head.paras[0] ? segsText(head.paras[0]) : ''
  const title = `${clip(name, 70)} · ${part.name} · ${NAME}`
  const description = clip(`Matthew Henry, A Method for Prayer, chapter ${part.n} (${part.name}). ${name}. ${first}`, 300)
  const children = part.heads.filter((h) => h.parent === head.id)
  const body = [
    `<nav>${link('/', NAME)} › ${link(`${APP}/book`, 'The book')} › ${link(`${APP}/book/${part.id}`, `Chapter ${part.n}: ${part.name}`)}</nav>`,
    parents.length ? `<p><small>${parents.map((p) => esc(titleText(p))).join(' › ')}</small></p>` : '',
    `<h1>${head.label !== undefined ? `${head.label}. ` : ''}${head.title.length ? segsHtml(head.title) : 'Opening words'}</h1>`,
    ...head.paras.map((p) => `<p>${segsHtml(p)}</p>`),
    children.length ? `<h2>Under this head</h2><ul>${children.map((h) => `<li>${link(`${APP}/head/${h.id}`, titleText(h))}</li>`).join('')}</ul>` : '',
    `<p>${prev ? link(`${APP}/head/${prev.id}`, `‹ ${clip(titleText(prev), 60)}`) : ''}${prev && next ? ' · ' : ''}${next ? link(`${APP}/head/${next.id}`, `${clip(titleText(next), 60)} ›`) : ''}</p>`,
    `<p>${link(`${APP}/pray`, 'Pray now')}: a guided prayer in six parts, with the next heads each day.</p>`,
    footer(book.source),
  ]
    .filter(Boolean)
    .join('\n')
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${SITE}${path}#head`,
        name,
        url: SITE + path,
        inLanguage: 'en',
        genre: 'Prayer',
        author: { '@type': 'Person', name: 'Matthew Henry' },
        isPartOf: bookLd(book.source),
        license: PDM,
        text: head.paras.map(segsText).join('\n\n'),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: NAME, item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: `${part.name}`, item: `${SITE}${APP}/book/${part.id}` },
          { '@type': 'ListItem', position: 3, name: clip(name, 80), item: SITE + path },
        ],
      },
    ],
  }
  return { path, title, description, jsonld, body }
}

/** The page of one chapter: Henry's title and opening, and the list of heads. */
export function partPage(book, part) {
  const path = `${APP}/book/${part.id}`
  const title = `Chapter ${part.n}: ${part.name} · ${NAME}`
  const description = clip(`Matthew Henry, A Method for Prayer, chapter ${part.n}. ${part.title} ${part.heads.length} heads, each with the words of Scripture.`, 300)
  const list = part.heads
    .map((h) => `<li style="margin-left:${(h.level - 1) * 1.2}em">${h.label !== undefined ? `${h.label}. ` : ''}${link(`${APP}/head/${h.id}`, titleText(h))}</li>`)
    .join('\n')
  const body = [
    `<nav>${link('/', NAME)} › ${link(`${APP}/book`, 'The book')}</nav>`,
    `<h1>Chapter ${part.n}: ${esc(part.name)}</h1>`,
    `<p><em>${esc(part.title)}</em></p>`,
    ...part.intro.map((p) => `<p>${segsHtml(p)}</p>`),
    `<h2>The heads</h2>`,
    `<ul style="list-style:none;padding:0">\n${list}\n</ul>`,
    footer(book.source),
  ].join('\n')
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: `Chapter ${part.n}: ${part.name}`,
    headline: part.title,
    url: SITE + path,
    position: part.n,
    isPartOf: bookLd(book.source),
    license: PDM,
  }
  return { path, title, description, jsonld, body }
}

const partsList = (book) => `<ol>${book.parts.map((p) => `<li>${link(`${APP}/book/${p.id}`, p.name)}: <small>${esc(p.title)}</small></li>`).join('\n')}</ol>`

export function homePage(book) {
  const body = [
    `<h1>${NAME}: pray in the words of Scripture</h1>`,
    `<p>${esc(DESCRIPTION)}</p>`,
    `<p>Matthew Henry (1662 to 1714) divides prayer into six parts: adoration, confession, petition, thanksgiving, intercession and the conclusion. Under each head he gives the words of the Bible that are proper to it. ${link(`${APP}/pray`, 'Pray now')} takes you through the six parts, with the next heads of each part each day. Tap a reference to read the verse in the King James Version.</p>`,
    `<p>The app is free, with no account and no advertisements. It works on the web. The apps for iPhone and Android come later.</p>`,
    `<p>${link(`${APP}/book`, 'The book')} · ${link(`${APP}/occasions`, 'Occasions')} · ${link(`${APP}/about`, 'About')} · ${link('/privacy/', 'Privacy')}</p>`,
    `<h2>The chapters</h2>`,
    partsList(book),
  ].join('\n')
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE}/#website`, name: NAME, url: `${SITE}/`, description: DESCRIPTION, inLanguage: 'en' },
      {
        '@type': 'WebApplication',
        name: NAME,
        url: `${SITE}${APP}/`,
        description: DESCRIPTION,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
      },
      bookLd(book.source),
    ],
  }
  return { path: `${APP}/`, title: `${NAME}: pray in the words of Scripture`, description: DESCRIPTION, jsonld, body }
}

export function contentsPage(book) {
  const body = [
    `<nav>${link('/', NAME)}</nav>`,
    `<h1>A Method for Prayer, by Matthew Henry</h1>`,
    `<p><em>${esc(book.source.title)}</em>. First published at London in 1710.</p>`,
    `<h2>To the reader</h2>`,
    ...book.preface.map((p) => `<p>${esc(p)}</p>`),
    `<h2>The chapters</h2>`,
    partsList(book),
    footer(book.source),
  ].join('\n')
  return {
    path: `${APP}/book`,
    title: `The book · ${NAME}`,
    description: 'The whole of Matthew Henry’s A Method for Prayer (1710): the preface, nine chapters and each head, with the words of Scripture.',
    jsonld: { '@context': 'https://schema.org', ...bookLd(book.source) },
    body,
  }
}

export function occasionsPage(book) {
  const occ = book.parts.find((p) => p.id === 'occasions')
  const forms = book.parts.find((p) => p.id === 'forms')
  const items = (p) => p.heads.map((h) => `<li>${link(`${APP}/head/${h.id}`, titleText(h))}</li>`).join('\n')
  const body = [
    `<nav>${link('/', NAME)}</nav>`,
    `<h1>Prayers for occasions</h1>`,
    `<p>Matthew Henry gives words for prayer at particular times: morning and evening, meals, the Lord’s Day, the Lord’s Supper, journeys, sickness, the family and children.</p>`,
    `<h2>Times and occasions</h2><ul>${items(occ)}</ul>`,
    `<h2>Forms of prayer</h2><ul>${items(forms)}</ul>`,
    footer(book.source),
  ].join('\n')
  return {
    path: `${APP}/occasions`,
    title: `Occasions · ${NAME}`,
    description: 'Matthew Henry’s prayers for occasions: morning and evening, the Lord’s Day, the Lord’s Supper, meals, the family and children.',
    body,
  }
}

const PRIVACY = [
  'A Method for Prayer collects no personal data. It has no account, no advertisements and no tracking. The app has no analytics.',
  'The app keeps your settings and your intercession list on your device. It does not send them to us or to another company. When you delete the app, you delete them.',
  'The text of the book and of the Bible is in the app, so the app works with no connection. The app connects to the internet only when you open a link, for example to Hearers or to Haddington Bible. Those sites have their own privacy policies.',
  'The website counts visits with Umami. Umami uses no cookies and does not identify you. It records the page, the site that sent you, the type of browser and device, and the country. It does not keep your IP address. Analytics counts only the public site, methodforprayer.app.',
  'Cloudflare hosts the website. Cloudflare processes each visit, as each web host does, to deliver the page and to protect the site.',
]

/** The screens of the app with no crawler text: [file, title, description]. */
export const SHELLS = [
  ['pray', 'Pray now', 'A guided prayer in six parts, in the words of Scripture, with the next heads of each part each day.'],
  ['intercession', 'Intercession list', 'Your list of names and needs for prayer. It stays on your device.'],
  ['preface', 'To the reader', 'The preface of Matthew Henry to A Method for Prayer (1710).'],
  ['settings', 'Settings', 'The settings of A Method for Prayer.'],
]

export function sitemap(paths, date) {
  const urls = paths.map((p) => `  <url><loc>${esc(SITE + p)}</loc><lastmod>${date}</lastmod></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const robots = () => `# Every crawler may read the site, AI answer engines too.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`

export function llms(book) {
  const parts = book.parts
    .map((p) => `- [Chapter ${p.n}: ${p.name}](${SITE}${APP}/book/${p.id}): ${p.title} ${p.heads.length} heads.`)
    .join('\n')
  return `# ${NAME}

> ${NAME} is a free app to pray in the words of Scripture with Matthew Henry's A Method for Prayer (1710). It has a guided prayer in six parts (adoration, confession, petition, thanksgiving, intercession and the conclusion), the whole book, and Henry's prayers for occasions. It works on the web. The apps for iPhone and Android come later.

- The text is Henry's, from the Presbyterian Board of Publication printing (19th century), from the Internet Archive scan (${SCAN}). It is in the public domain.
- Each head page has Henry's heading and his paragraphs of prayer. Each reference is to the King James Version.
- The guided prayer shows the next heads of each part each day. It goes through each part in 30 days or fewer.
- ${NAME} is one of five free Reformed apps: Hearers (https://hearers.app), Precentor (https://precentor.app), Covenant Household (https://covenanthousehold.app) and Haddington Bible (https://haddingtonbible.org).

## Pages

- [Home](${SITE}/): what the app is, its features, and where to get it.
- [The web app](${SITE}${APP}/): the app in the browser.
- [The book](${SITE}${APP}/book): the preface and the chapters.
- [Occasions](${SITE}${APP}/occasions): prayers for times and occasions.
- [About](${SITE}${APP}/about)
- [Privacy](${SITE}/privacy/): ${NAME} collects no personal data.

## Chapters

${parts}
`
}

function main() {
  const dist = process.argv[2] ?? join(ROOT, 'dist')
  const template = readFileSync(join(dist, 'index.html'), 'utf8')
  if (!template.includes('<div id="root"></div>')) throw new Error('seo: index.html has no empty <div id="root">')
  const book = JSON.parse(readFileSync(join(ROOT, 'data/method.json'), 'utf8'))

  // The homepage and the privacy page come from site/. The rest is the app.
  const paths = ['/', '/privacy/', `${APP}/`, `${APP}/book`, `${APP}/occasions`, `${APP}/about`]
  mkdirSync(join(dist, 'book'), { recursive: true })
  mkdirSync(join(dist, 'head'), { recursive: true })
  for (const part of book.parts) {
    writeFileSync(join(dist, 'book', `${part.id}.html`), page(template, partPage(book, part)))
    paths.push(`${APP}/book/${part.id}`)
    part.heads.forEach((h, i) => {
      writeFileSync(join(dist, 'head', `${h.id}.html`), page(template, headPage(book, part, h, i)))
      paths.push(`${APP}/head/${h.id}`)
    })
  }
  writeFileSync(join(dist, 'book.html'), page(template, contentsPage(book)))
  writeFileSync(join(dist, 'occasions.html'), page(template, occasionsPage(book)))
  writeFileSync(
    join(dist, 'about.html'),
    page(template, {
      path: `${APP}/about`,
      title: `About · ${NAME}`,
      description: 'About Matthew Henry, A Method for Prayer (1710), this app, and the sources of the text.',
      body: `<nav>${link('/', NAME)}</nav><h1>About</h1><p>${esc(DESCRIPTION)}</p><p>Matthew Henry (1662 to 1714) was an English Presbyterian minister at Chester and Hackney. He first published A Method for Prayer at London in 1710.</p>${footer(book.source)}`,
    }),
  )
  writeFileSync(
    join(dist, 'privacy.html'),
    page(template, {
      path: `${APP}/privacy`,
      canonical: `${SITE}/privacy/`,
      title: `Privacy · ${NAME}`,
      description: `${NAME} collects no personal data. It has no account, no advertisements and no tracking.`,
      body: `<nav>${link('/', NAME)}</nav><h1>Privacy</h1>${PRIVACY.map((p) => `<p>${esc(p)}</p>`).join('')}`,
    }),
  )
  for (const [name, title, description] of SHELLS) {
    writeFileSync(join(dist, `${name}.html`), page(template, { path: `${APP}/${name}`, title: `${title} · ${NAME}`, description }))
  }
  writeFileSync(join(dist, 'index.html'), page(template, homePage(book)))

  const date = new Date().toISOString().slice(0, 10)
  writeFileSync(join(dist, 'sitemap.xml'), sitemap(paths, date))
  writeFileSync(join(dist, 'robots.txt'), robots())
  writeFileSync(join(dist, 'llms.txt'), llms(book))
  console.log(`seo: ${paths.length} pages in sitemap.xml, for ${SITE}`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
