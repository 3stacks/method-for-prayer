// Finds the Scripture references in a paragraph of the OCR text and resolves
// them against the KJV.
//
// The book prints references as "Psa. cxviii. 27" or "Job vii. 3, 4, 13; xiii. 3".
// The OCR often misreads them ("Psa. exviil. 27", "Rey. iv. 8", "Job vii. 8, 4, 18").
// So each reference has several possible readings. The resolver scores each
// reading by the words that the verse shares with the words of the prayer just
// before the reference, and keeps the best. When the OCR lost a reference, the
// resolver searches the whole KJV for the words of the prayer.
import { BOOKS } from './books.mjs'

/** Misreadings of book names in the OCR, mapped to the printed form. */
export const OCR_BOOKS = {
  Heel: 'Eccl', Keel: 'Eccl', Kecl: 'Eccl', Hecl: 'Eccl', Kiel: 'Eccl', Leccl: 'Eccl', Becl: 'Eccl',
  Rey: 'Rev', Ley: 'Lev', Proy: 'Prov', Pov: 'Prov', Hph: 'Eph', Pea: 'Psa', Ppa: 'Psa', Tsa: 'Isa',
  Hzek: 'Ezek', Hsth: 'Esth', Mie: 'Mic', Ool: 'Col', Hxod: 'Exod', Geil: 'Gen', Hos: 'Hos',
  Jam: 'Jam', Pamn: 'Tim', Bph: 'Eph', Kph: 'Eph', Isa: 'Isa', Iss: 'Isa', Psal: 'Psa', Pss: 'Psa',
  Bzek: 'Ezek', Kzek: 'Ezek', Hzra: 'Ezra', Hxod: 'Exod', Kxod: 'Exod', Mal: 'Mal', Lake: 'Luke',
  Jolin: 'John', Jobn: 'John', Joln: 'John', Rom: 'Rom', Kom: 'Rom', Hom: 'Rom', Deat: 'Deut',
  Dent: 'Deut', Gal: 'Gal', Matt: 'Matt', Mati: 'Matt', Maitt: 'Matt', Heb: 'Heb', Hob: 'Heb',
}

// Every printed form of a book, without the number of a numbered book.
const FORM_CODES = new Map()
for (const [code, , abbrs] of BOOKS) {
  const num = code.match(/^([123])/)?.[1] ?? ''
  for (const a of abbrs) {
    const key = `${num}|${a.toLowerCase()}`
    if (!FORM_CODES.has(key)) FORM_CODES.set(key, new Set())
    FORM_CODES.get(key).add(code)
  }
}
// "Jam." is James in this edition, but the OCR also reads "Lam." as "Jam.".
FORM_CODES.set('|jam', new Set(['Jas', 'Lam']))

/** The possible book codes for a printed (or misread) book name and number. */
export function bookCodes(num, name) {
  const n = num ? String(num).replace(/I/g, '1').replace(/l/g, '1') : ''
  const clean = name.replace(/[^A-Za-z]/g, '')
  const forms = [clean]
  if (OCR_BOOKS[clean]) forms.push(OCR_BOOKS[clean])
  const out = new Set()
  for (const f of forms) {
    for (const c of FORM_CODES.get(`${n}|${f.toLowerCase()}`) ?? []) out.add(c)
  }
  // "2 Cor" with the number lost: try each numbered book.
  if (!out.size && !n) {
    for (const k of ['1', '2', '3']) for (const c of FORM_CODES.get(`${k}|${clean.toLowerCase()}`) ?? []) out.add(c)
  }
  return [...out]
}

// ---------------------------------------------------------------- numerals

const ROMAN = { i: 1, v: 5, x: 10, l: 50, c: 100 }
export function roman(s) {
  let n = 0
  for (let i = 0; i < s.length; i++) {
    const a = ROMAN[s[i]]
    const b = ROMAN[s[i + 1]] || 0
    if (!a) return null
    n += a < b ? -a : a
  }
  return n > 0 && toRoman(n) === s ? n : null
}
function toRoman(n) {
  const t = [[100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]
  let s = ''
  for (const [v, r] of t) while (n >= v) { s += r; n -= v }
  return s
}

// What each OCR character in a chapter numeral can stand for.
const ROMAN_OCR = {
  i: ['i', 'l'], l: ['l', 'i'], I: ['l', 'i'], '1': ['i', 'l'], '|': ['i', 'l'], '!': ['i'], j: ['i'],
  v: ['v'], V: ['v'], y: ['v'], w: ['v'], u: ['ii'], n: ['ii'], Y: ['v'], x: ['x'], X: ['x'], c: ['c'], C: ['c'], e: ['c'], L: ['l'],
}

/**
 * The possible chapter numbers of a misread numeral, with a cost: 0 for the
 * numeral as printed, plus 1 for each character that the reading changes.
 */
export function chapterReadings(s) {
  if (/^\d{1,3}$/.test(s)) {
    // "1" and "11" are often the numerals "l" (50) and "ii" (2).
    if (!/^1+$/.test(s)) return [{ n: +s, cost: 0 }]
    return [{ n: +s, cost: 0 }, ...chapterReadings(s.replace(/1/g, '|')).map((r) => ({ ...r, cost: r.cost + 1 }))]
  }
  const chars = [...s]
  if (chars.length > 9 || chars.some((c) => !ROMAN_OCR[c])) return []
  const out = new Map()
  const walk = (i, acc, cost) => {
    if (i === chars.length) {
      // Drop a stray last letter: "xxvil" → "xxvi", "lxxxiil" → "lxxxii".
      for (const [str, extra] of [[acc, 0], [acc.slice(0, -1), 1]]) {
        const n = roman(str)
        if (n && n <= 150 && (!out.has(n) || out.get(n) > cost + extra)) out.set(n, cost + extra)
      }
      return
    }
    const c = chars[i]
    ROMAN_OCR[c].forEach((r, k) => walk(i + 1, acc + r, cost + (k > 0 ? 1 : 0)))
  }
  walk(0, '', 0)
  return [...out].map(([n, cost]) => ({ n, cost })).sort((a, b) => a.cost - b.cost)
}

/** Verse lists, with OCR digit swaps (3 and 8 look alike). Cost as above. */
export function verseReadings(vv) {
  if (!vv) return [{ v: null, cost: 0 }]
  const base = vv.replace(/\s+/g, '')
  const variants = new Map([[base, 0]])
  const swaps = [...base].map((c, i) => [c, i]).filter(([c]) => c === '3' || c === '8')
  if (swaps.length <= 3) {
    for (let mask = 1; mask < 1 << swaps.length; mask++) {
      const a = [...base]
      let cost = 0
      swaps.forEach(([c, i], k) => {
        if (mask & (1 << k)) { a[i] = c === '3' ? '8' : '3'; cost++ }
      })
      variants.set(a.join(''), cost)
    }
  }
  // A mark on the page read as a digit: "182" for "18".
  for (const [s, cost] of [...variants]) {
    const t = s.replace(/(\d{2})\d(?=$|,)/, '$1')
    if (t !== s && !variants.has(t)) variants.set(t, cost + 1)
  }
  const out = []
  for (const [s, cost] of variants) {
    const parts = s.split(',').filter(Boolean).map((p) => {
      const [a, b] = p.split(/[-–—]+/).map((x) => +x)
      return b ? [a, b] : [a, a]
    })
    if (parts.every(([a, b]) => a > 0 && b >= a && b - a < 40)) out.push({ v: parts, cost })
  }
  return out
}

// ---------------------------------------------------------------- words

const STOP = new Set(
  ('a an and are as at be but by for from had has have hath he her him his i if in into is it ' +
    'its me my mine nor not o of on or our ours shall so that the thee their them then there these ' +
    'they thine this thou thy to unto upon us was we were which who whom will with ye you your all ' +
    'also art do doth let may no one out up what when shalt wilt dost hast').split(' '),
)
const PRONOUN = new Set('i me my mine we us our ours thou thee thy thine ye you your yours he him his she her they them their'.split(' '))

/** Lower-case words, with pronouns and number made the same, so "our souls" meets "my soul". */
export function words(text) {
  return (text.toLowerCase().replace(/[’']s\b/g, '').match(/[a-z]+/g) ?? []).map((w) => {
    if (PRONOUN.has(w)) return '~'
    if (w.length > 4 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
    return w
  })
}
const content = (ws) => ws.filter((w) => w !== '~' && w.length > 2 && !STOP.has(w))
const bigrams = (ws) => {
  const out = new Set()
  for (let i = 0; i + 1 < ws.length; i++) out.add(ws[i] + ' ' + ws[i + 1])
  return out
}

/**
 * How well a verse text matches the words of the prayer: the number of word
 * pairs they share, plus half the number of content words they share.
 */
export function similarity(prayer, verse) {
  const pw = words(prayer)
  const vw = words(verse)
  const pb = bigrams(pw)
  let shared = 0
  for (const b of bigrams(vw)) if (pb.has(b) && !b.split(' ').every((w) => STOP.has(w) || w === '~')) shared++
  const pc = new Set(content(pw))
  const vc = new Set(content(vw))
  let common = 0
  for (const w of vc) if (pc.has(w)) common++
  return shared + common / 2
}

// ---------------------------------------------------------------- KJV

/** The KJV as { code: chapters[][] }, with a search index of word pairs. */
export function makeBible(kjv) {
  let index = null
  const verseText = (code, ch, verses) => {
    const chapter = kjv[code]?.[ch - 1]
    if (!chapter) return null
    if (!verses) return chapter.join(' ')
    const out = []
    for (const [a, b] of verses) {
      if (a < 1 || b > chapter.length) return null
      for (let v = a; v <= b; v++) out.push(chapter[v - 1])
    }
    return out.join(' ')
  }
  const buildIndex = () => {
    index = new Map()
    for (const [code, chapters] of Object.entries(kjv)) {
      chapters.forEach((vs, ci) => vs.forEach((t, vi) => {
        const ws = words(t)
        for (const b of bigrams(ws)) {
          if (b.split(' ').every((w) => STOP.has(w) || w === '~')) continue
          if (!index.has(b)) index.set(b, [])
          index.get(b).push(`${code}.${ci + 1}.${vi + 1}`)
        }
      }))
    }
  }
  /** The verses that share the most word pairs with the text, best first. */
  const search = (text, code = null) => {
    if (!index) buildIndex()
    const counts = new Map()
    for (const b of bigrams(words(text))) {
      const ids = index.get(b)
      if (!ids || ids.length > 400) continue
      for (const id of ids) {
        if (code && !id.startsWith(code + '.')) continue
        counts.set(id, (counts.get(id) ?? 0) + 1)
      }
    }
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, n]) => {
      const [c, ch, v] = id.split('.')
      return { code: c, ch: +ch, v: +v, pairs: n }
    })
  }
  return { kjv, verseText, search }
}

// ---------------------------------------------------------------- finding

const NUM = '(?:([123I])\\s*[\'’.]?\\s*)'
const BOOK = '([A-Z][a-zA-Z]{1,9})'
const CH = '([ivxlcIVXLyYe1|!j]{1,9}|\\d{1,3})'
const VV = '(\\d{1,3}(?:\\s*[-–—]+\\s*\\d{1,3})?(?:\\s*,\\s*\\d{1,3}(?:\\s*[-–—]+\\s*\\d{1,3})?(?!\\s*[A-Z]))*)'
/** A reference: optional number, book, chapter, verses. */
export const REF_RE = new RegExp(`(?<![A-Za-z])${NUM}?${BOOK}[.,:;]?\\s*${CH}(?:[.,:;]\\s*|(?<=[a-z]))${VV}`, 'g')
const BARE_RE = new RegExp(`([.;,]\\s+)([ivxlcIy]{1,7})[.,]\\s*${VV}(?=[.;,]|\\s|$)`, 'g')
const ONE_RE = new RegExp(`(?<![A-Za-z])(?:([23])\\s*)?(Philem|Phile|Jude|Obad|John|Jno)\\.?\\s+${VV}(?![\\d.]*\\s*[ivxlc]+\\.)`, 'g')
/** A further chapter of the same book: "; xiii. 3" or ", xxix. 2". */
const CONT_RE = new RegExp(`^(\\s*[;,]\\s*(?:and\\s+)?)${CH}[.,:]\\s*${VV}`)

/**
 * Finds the reference-like spans in a text. Each has { start, end, codes,
 * chapter, verses }, where codes are the possible books (empty when the book
 * is not known), and chapter and verses are the raw printed strings.
 */
export function findRefs(text) {
  const out = []
  REF_RE.lastIndex = 0
  let m
  while ((m = REF_RE.exec(text))) {
    const [whole, num, name, ch, vv] = m
    const codes = [...new Set([...bookCodes(num, name), ...(num ? bookCodes(null, name).filter((c) => !/^\d/.test(c)) : [])])]
    if (!codes.length) {
      // Not a book: step past the name only, so a real reference inside the match is found.
      REF_RE.lastIndex = m.index + 1
      continue
    }
    const span = { start: m.index, end: m.index + whole.length, codes, chapter: ch, verses: vv }
    out.push(span)
    let end = span.end
    let c
    while ((c = CONT_RE.exec(text.slice(end)))) {
      const s = { start: end + c[1].length, end: end + c[0].length, codes, chapter: c[2], verses: c[3], cont: true }
      out.push(s)
      end = s.end
    }
    REF_RE.lastIndex = end
  }
  // A chapter with no book takes the book of the reference before it: ". xv. 38".
  BARE_RE.lastIndex = 0
  while ((m = BARE_RE.exec(text))) {
    const start = m.index + m[1].length
    if (out.some((s) => s.start < start + m[0].length - m[1].length && s.end > start)) continue
    if (!out.some((s) => s.end <= start)) continue
    out.push({ start, end: m.index + m[0].length, codes: null, chapter: m[2], verses: m[3], bare: true })
  }
  // Books of one chapter are cited by verse alone: "Philem. 25", "Jude 24, 25".
  ONE_RE.lastIndex = 0
  while ((m = ONE_RE.exec(text))) {
    const start = m.index
    if (out.some((s) => s.start <= start && s.end > start)) continue
    const codes = bookCodes(m[1], m[2])
    if (codes.length) out.push({ start, end: start + m[0].length, codes, chapter: '1', verses: m[3] })
  }
  return out.sort((a, b) => a.start - b.start)
}

/**
 * Resolves one reference span against the prayer text before it. Returns
 * { code, ch, verses, score, cost } for the best reading, or null.
 */
export function resolveSpan(bible, span, prayer) {
  let best = null
  const size = (v) => (v ? v.reduce((n, [a, b]) => n + b - a + 1, 0) : 0)
  const base = verseReadings(span.verses)[0]?.v
  for (const code of span.codes) {
    for (const { n: ch, cost: cc } of chapterReadings(span.chapter)) {
      for (const { v, cost: vc } of verseReadings(span.verses)) {
        const t = bible.verseText(code, ch, v)
        if (!t) continue
        const score = similarity(prayer, t)
        const cost = cc + vc
        // A better match wins. On a tie, the reading that changes less wins.
        // A changed verse number must earn its place: it can add verses, and so words.
        const key = score - cc * 0.6 - vc * 2 - 0.5 * Math.max(0, size(v) - size(base))
        if (!best || key > best.key) best = { code, ch, verses: v, score, cost, key }
      }
    }
  }
  return best
}

/** Formats a reference id as Hearers does: "Ps.118.27", "Job.7.3-4,13". */
export function refId({ code, ch, verses }) {
  if (!verses) return `${code}.${ch}`
  return `${code}.${ch}.` + verses.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(',')
}

/** Parses a reference id back into { code, ch, verses }. */
export function parseRefId(id) {
  const [code, ch, vv] = id.split('.')
  const verses = vv
    ? vv.split(',').map((p) => {
      const [a, b] = p.split('-').map(Number)
      return [a, b ?? a]
    })
    : null
  return { code, ch: +ch, verses }
}
