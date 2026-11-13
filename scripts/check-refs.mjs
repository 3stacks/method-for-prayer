// Prints a random sample of references with the words of the prayer before
// each one and the KJV text, so that a person can check them by eye.
//   node scripts/check-refs.mjs [count] [seed]
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadKjv } from './build-data.mjs'
import { makeBible, parseRefId, similarity } from './refs.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const book = JSON.parse(readFileSync(join(ROOT, 'data/method.json'), 'utf8'))
const bible = makeBible(loadKjv())
const count = +(process.argv[2] ?? 30)
let seed = +(process.argv[3] ?? 1)
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

const items = []
for (const p of book.parts) {
  for (const h of p.heads) {
    for (const segs of [h.title, ...h.paras]) {
      segs.forEach((s, i) => {
        if (typeof s === 'string') return
        const before = segs.slice(0, i).filter((x) => typeof x === 'string').join('').slice(-160)
        items.push({ id: s[0], unsure: !!s[1], before })
      })
    }
  }
}
let low = 0
for (const it of items) {
  const { code, ch, verses } = parseRefId(it.id)
  it.score = similarity(it.before, bible.verseText(code, ch, verses) ?? '')
  if (it.score < 1) low++
}
console.log(`${items.length} references; ${items.filter((i) => i.unsure).length} marked unsure; ${low} share less than one word with the prayer before them.\n`)
for (let k = 0; k < count; k++) {
  const it = items[Math.floor(rand() * items.length)]
  const { code, ch, verses } = parseRefId(it.id)
  console.log(`${it.id}${it.unsure ? ' (unsure)' : ''}  score ${it.score}\n  prayer: …${it.before.trim()}\n  KJV:    ${bible.verseText(code, ch, verses)?.slice(0, 220)}\n`)
}
