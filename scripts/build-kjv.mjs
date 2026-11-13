// Writes data/kjv/<code>.json, one file for each book of the KJV: an array of
// chapters, and each chapter an array of verses.
//
// Source: thiagobodruk/bible, en_kjv.json (the King James Version, public
// domain). The script reads source/kjv-src.json, or downloads it when it is
// not there.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOKS } from './books.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'source/kjv-src.json')
const URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'

/** Tidies the spacing of the source: "the LORD ; and" → "the LORD; and". */
export function tidyVerse(v) {
  return v.replace(/\s+([;:,.?!])/g, '$1').replace(/\s+/g, ' ').trim()
}

async function main() {
  if (!existsSync(SRC)) {
    const res = await fetch(URL)
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    writeFileSync(SRC, (await res.text()).replace(/^﻿/, ''))
  }
  const src = JSON.parse(readFileSync(SRC, 'utf8').replace(/^﻿/, ''))
  if (src.length !== 66) throw new Error(`Expected 66 books, found ${src.length}`)
  const out = join(ROOT, 'data/kjv')
  mkdirSync(out, { recursive: true })
  src.forEach((book, i) => {
    const code = BOOKS[i][0]
    const chapters = book.chapters.map((ch) => ch.map(tidyVerse))
    writeFileSync(join(out, `${code}.json`), JSON.stringify(chapters))
  })
  // A require for each book, so that Metro puts each book in the bundle and the app loads it when it needs it.
  const lines = BOOKS.map(([code]) => `  ${JSON.stringify(code)}: () => require('./${code}.json'),`)
  writeFileSync(
    join(out, 'files.ts'),
    `// Written by scripts/build-kjv.mjs. Do not edit.\n/* eslint-disable */\nexport const kjvFiles: Record<string, () => string[][]> = {\n${lines.join('\n')}\n}\n`,
  )
  console.log(`Wrote ${src.length} books to data/kjv/`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
