import { kjvFiles } from '../../data/kjv/files.ts'
import method from '../../data/method.json'
import { BOOKS } from './books.ts'

// The text of the book and of the KJV is in the bundle, so the app works with
// no connection. scripts/build-data.mjs writes data/method.json.

/** A part of a paragraph: plain text, or [reference id] or [reference id, 1] when the reference is uncertain. */
export type Seg = string | [string] | [string, 1]
export type Segs = Seg[]

export interface Head {
  id: string
  /** The printed number of the head. */
  label?: number
  /** 1 is the top level. */
  level: number
  /** Henry's heading. Empty for the prayer before the first heading of a part. */
  title: Segs
  /** The id of the head above this one. */
  parent?: string
  /** The paragraphs of prayer. */
  paras: Segs[]
}

export interface Part {
  n: number
  id: string
  name: string
  /** The place of the part in the guided prayer, 1 to 6. */
  pray?: number
  /** Henry's title of the chapter. */
  title: string
  intro: Segs[]
  heads: Head[]
}

export interface Source {
  title: string
  author: string
  firstPublished: string
  edition: string
  scan: string
  scanNote: string
  licence: string
  spelling: string
  references: string
}

const book = method as unknown as { source: Source; preface: string[]; parts: Part[] }

export const SOURCE = book.source
export const PREFACE = book.preface
export const PARTS = book.parts
/** The six parts of the guided prayer, in order. */
export const PRAY_PARTS = PARTS.filter((p) => p.pray).sort((a, b) => (a.pray ?? 0) - (b.pray ?? 0))

const PART_BY_ID = new Map(PARTS.map((p) => [p.id, p]))
const HEAD_BY_ID = new Map(PARTS.flatMap((p) => p.heads.map((h) => [h.id, { head: h, part: p }] as const)))

export const partById = (id: string | undefined) => (id ? PART_BY_ID.get(id) : undefined)
export const headById = (id: string | undefined) => (id ? HEAD_BY_ID.get(id) : undefined)

/** The heads of a part that have prayer, for the guided prayer. */
export const prayerHeads = (p: Part) => p.heads.filter((h) => h.paras.length)

/** The heads above a head, from the top. */
export function ancestors(h: Head): Head[] {
  const out: Head[] = []
  let cur = headById(h.parent)?.head
  while (cur) {
    out.unshift(cur)
    cur = headById(cur.parent)?.head
  }
  return out
}

/** The plain text of a paragraph, without its references. */
export const plain = (segs: Segs) =>
  segs
    .filter((s): s is string => typeof s === 'string')
    .join('')
    .replace(/\s+([,.;:?!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

/** The title of a head, for a list: Henry's heading, or "Opening words". */
export const headTitle = (h: Head) => plain(h.title) || 'Opening words'

// ---------------------------------------------------------------- references

const BOOK_BY_CODE = new Map(BOOKS.map(([code, name, short]) => [code, { code, name, short }]))
export type BookInfo = { code: string; name: string; short: string }

export interface Ref {
  book: BookInfo
  chapter: number
  ranges: [number, number][] | null
}

export function parseRef(id: string): Ref | undefined {
  const [code, ch, vv] = id.split('.')
  const b = BOOK_BY_CODE.get(code)
  if (!b || !+ch) return undefined
  const ranges = vv
    ? vv.split(',').map((p): [number, number] => {
        const [a, x] = p.split('-').map(Number)
        return [a, x || a]
      })
    : null
  return { book: b, chapter: +ch, ranges }
}

const verseText = (r: Ref) => r.ranges?.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(', ')

/** The short label of a reference in the text: "Ps 118:27". */
export function refShort(r: Ref) {
  const v = verseText(r)
  return `${r.book.short} ${r.chapter}${v ? `:${v}` : ''}`
}

/** The full label of a reference: "Psalm 118:27". */
export function refLabel(r: Ref) {
  const name = r.book.code === 'Ps' ? 'Psalm' : r.book.name
  const v = verseText(r)
  return `${name} ${r.chapter}${v ? `:${v}` : ''}`
}

/** The KJV text of a chapter. */
export function chapterVerses(code: string, chapter: number): string[] {
  const file = kjvFiles[code]
  return file ? (file()[chapter - 1] ?? []) : []
}

/** True when the verse is one that the reference cites. */
export const cites = (r: Ref, v: number) => !r.ranges || r.ranges.some(([a, b]) => v >= a && v <= b)
