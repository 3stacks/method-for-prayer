// Prints the text of the app for some pages of the printed book, so that a
// person can compare it with the page images of the scan.
//
//   node scripts/proof-dump.mjs <page> [last page] [options]
//
// A page is a printed page number (15 to 273) or a roman preface page (v to xiii).
// Options:
//   --raw              print the paragraphs after source/corrections.txt, before
//                      the parse. Write a new correction against this text.
//   --extra <file>     use more corrections after source/corrections.txt (can repeat)
//   --words <file>     use more words after source/words.txt (can repeat)
//
// Each reference shows as ‹Ps cxviii. 27›: the book, the chapter in the roman
// numerals of the print, and the verses. "‹?" marks a reference that the build is
// not sure of. "!" lines are the items of source/proofing.txt for the paragraph.
// The page image of a leaf is
// https://archive.org/download/methodforprayerw0000henr/page/n{leaf-1}_w800.jpg
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from './build-data.mjs'
import { parseRefId } from './refs.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** The leaves of the scan: { leaf, page, line }, in order. */
export function loadPages() {
  return readFileSync(join(ROOT, 'source/pages.txt'), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const [leaf, page, line] = l.split(/\s+/)
      return { leaf: +leaf, page, line: +line }
    })
}

/** The leaf for a line of the OCR text. */
export function leafOf(pages, line) {
  let cur = pages[0]
  for (const p of pages) {
    if (p.line > line) break
    cur = p
  }
  return cur
}

const ROMAN = [[100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]
const toRoman = (n) => {
  let s = ''
  for (const [v, r] of ROMAN) while (n >= v) { s += r; n -= v }
  return s
}

/** "Ps.118.27" → "Ps cxviii. 27", the form of the print. */
export function printedRef(id) {
  const { code, ch, verses } = parseRefId(id)
  const vv = verses ? ' ' + verses.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(', ') : ''
  return `${code} ${toRoman(ch)}.${vv}`
}

export const segText = (segs) => segs.map((s) => (typeof s === 'string' ? s : `‹${s[1] ? '?' : ''}${printedRef(s[0])}›`)).join('')

function main() {
  const args = process.argv.slice(2)
  const extra = { corrections: [], words: [] }
  const pos = []
  let raw = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--raw') raw = true
    else if (args[i] === '--extra') extra.corrections.push(args[++i])
    else if (args[i] === '--words') extra.words.push(args[++i])
    else pos.push(args[i])
  }
  if (!pos.length) {
    console.error('Usage: node scripts/proof-dump.mjs <page> [last page] [--raw] [--extra file] [--words file]')
    process.exit(2)
  }
  const pages = loadPages()
  const find = (pg) => {
    const p = pages.find((x) => x.page === String(pg))
    if (!p) throw new Error(`No page ${pg} in source/pages.txt`)
    return p
  }
  const first = find(pos[0])
  const last = find(pos[1] ?? pos[0])
  const from = first.line
  const to = pages[pages.indexOf(last) + 1]?.line ?? Infinity

  const { book, paras } = build(extra)

  // Every item in order: { line, text }. An item that starts before the first page
  // shows too when the next item starts inside the range, because it runs on.
  const items = []
  const issues = new Map()
  for (const it of book.proofing) {
    const m = /^line (\d+): (.*)$/.exec(it)
    if (!m) continue
    if (!issues.has(+m[1])) issues.set(+m[1], [])
    issues.get(+m[1]).push(m[2])
  }
  if (raw) {
    for (const p of paras) items.push({ line: p.line, text: p.text })
  } else {
    book.preface.forEach((t, i) => items.push({ line: book.prefaceLines[i], text: `[preface] ${t}` }))
    for (const pt of book.parts) {
      const introLines = pt.introLines
      // The chapter title sits just before the first line of the chapter.
      const firstLine = Math.min(...introLines, ...pt.heads.map((h) => h.line))
      items.push({ line: firstLine - 0.5, text: `[chapter ${pt.n}] ${pt.title}` })
      pt.intro.forEach((segs, i) => items.push({ line: introLines[i], text: `[intro] ${segText(segs)}` }))
      for (const h of pt.heads) {
        const label = h.label ? `${h.label}.` : '-'
        items.push({ line: h.line, text: `[${h.id} L${h.level} ${label}] HEAD: ${segText(h.title)}` })
        h.paras.forEach((segs, i) => items.push({ line: h.lines[i], text: `    ${segText(segs)}` }))
      }
    }
  }
  items.sort((a, b) => a.line - b.line)
  items.forEach((it, i) => {
    const next = items[i + 1]?.line ?? Infinity
    const inside = it.line >= from && it.line < to
    const runsIn = it.line < from && next > from
    if (!inside && !runsIn) return
    const leaf = leafOf(pages, Math.floor(it.line))
    console.log(`p.${leaf.page} n${leaf.leaf - 1} L${Math.floor(it.line)}${runsIn ? ' (from the page before)' : ''}`)
    console.log(it.text)
    for (const x of issues.get(it.line) ?? []) console.log(`  ! ${x}`)
    console.log()
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
