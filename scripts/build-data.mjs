// Builds data/method.json from the OCR text of the book.
//
//   node scripts/build-data.mjs
//
// Steps:
// 1. clean.mjs splits the OCR text into paragraphs.
// 2. source/corrections.txt fixes misread words that the steps below cannot fix.
// 3. The paragraphs go into chapters (parts), heads and paragraphs of prayer.
// 4. refs.mjs resolves each Scripture reference against the KJV.
// 5. A misread word next to a resolved reference is matched to the verse text.
// 6. source/proofing.txt lists what is still uncertain.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HEAD_RE, isCapsHeading, paragraphs } from './clean.mjs'
import { bookCodes, findRefs, makeBible, refId, resolveSpan } from './refs.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** The parts of the book. "pray" is the order of the parts in a guided prayer. */
export const PARTS = [
  { n: 1, id: 'adoration', name: 'Adoration', pray: 1 },
  { n: 2, id: 'confession', name: 'Confession', pray: 2 },
  { n: 3, id: 'petition', name: 'Petition', pray: 3 },
  { n: 4, id: 'thanksgiving', name: 'Thanksgiving', pray: 4 },
  { n: 5, id: 'intercession', name: 'Intercession', pray: 5 },
  { n: 6, id: 'occasions', name: 'Occasions' },
  { n: 7, id: 'conclusion', name: 'Conclusion', pray: 6 },
  { n: 8, id: 'lords-prayer', name: 'The Lord’s Prayer' },
  { n: 9, id: 'forms', name: 'Forms of prayer' },
]

export const SOURCE = {
  title: 'A Method for Prayer, with Scripture Expressions Proper to be Used under Each Head',
  author: 'Matthew Henry (1662–1714)',
  firstPublished: 'London, 1710',
  edition:
    'Philadelphia: Presbyterian Board of Publication, No. 265 Chestnut Street. Undated, about 1840 to 1860. The preface is dated Chester, March 25, 1710.',
  scan: 'https://archive.org/details/methodforprayerw0000henr',
  scanNote:
    'Internet Archive scan of a copy in the library of the Claremont School of Theology, with the OCR text of the Internet Archive.',
  licence:
    'Public domain. Henry died in 1714 and this printing is from the 19th century. The KJV text is also public domain.',
  spelling:
    'This printing already uses modern spelling (for example "show", "honour", no long s). The app keeps the spelling and the wording of this printing.',
  references:
    'The app shows each reference in modern form ("Ps 118:27"). The printing uses the old form ("Psa. cxviii. 27").',
}

// ---------------------------------------------------------------- inputs

export function loadKjv(dir = join(ROOT, 'data/kjv')) {
  const kjv = {}
  for (const f of readdirSync(dir)) kjv[f.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  return kjv
}

export function loadLexicon(kjv) {
  const lex = new Set()
  for (const chapters of Object.values(kjv)) {
    for (const ch of chapters) for (const v of ch) for (const w of v.toLowerCase().match(/[a-z]+/g) ?? []) lex.add(w)
  }
  for (const w of readFileSync(join(ROOT, 'source/lexicon.txt'), 'utf8').split('\n')) if (w) lex.add(w)
  return lex
}

/**
 * Reads source/corrections.txt. Each line is "old => new". The old text must
 * occur exactly once in the paragraphs. A line that starts with "*" replaces
 * every occurrence. A line that starts with "#" is a comment.
 */
export function loadCorrections(text) {
  return text
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const all = l.startsWith('*')
      const [from, to] = (all ? l.slice(1) : l).split(' => ')
      if (to === undefined) throw new Error(`Bad correction line: ${l}`)
      return { from, to: to.replace(/\\n/g, '\n'), all }
    })
}

export function applyCorrections(paras, corrections) {
  for (const c of corrections) {
    const hits = paras.filter((p) => p.text.includes(c.from))
    const count = hits.reduce((n, p) => n + p.text.split(c.from).length - 1, 0)
    if (!c.all && count !== 1) throw new Error(`Correction "${c.from}" matches ${count} times`)
    if (c.all && count === 0) throw new Error(`Correction "${c.from}" matches nothing`)
    for (const p of hits) p.text = p.text.split(c.from).join(c.to)
  }
  // A correction can split a paragraph with a blank line ("\n\n").
  return paras.flatMap((p) => p.text.split(/\n\n/).map((text) => ({ ...p, text: text.trim() }))).filter((p) => p.text)
}

// ---------------------------------------------------------------- references

const LEAD = /^[\s,;:.)—–-]*/
/** Junk after a reference: symbols and bits of letters that the OCR made from marks on the page. */
const isJunkToken = (t, lex) => {
  const w = t.replace(/[^A-Za-z]/g, '')
  if (!w) return true
  if (/[^A-Za-z.,;:'’)(\-—]/.test(t)) return true
  return w.length <= 3 && !lex.has(w.toLowerCase())
}

/**
 * Resolves the references in one paragraph. Returns { segs, refs, issues }:
 * segs is the text with each reference replaced by [id] (or [id, 1] when the
 * reference is uncertain); refs is the list of ids.
 */
export function resolveParagraph(text, bible, lex, { search = true, whole = false } = {}) {
  const issues = []
  let spans = findRefs(text)

  // A reference that the OCR broke: a book name after the end of a clause, then
  // a few bits of junk ("perfection. Job Bite © Great is"). Mark it so that the
  // search below can find the verse.
  const broken = []
  const BROKEN_RE = /([.?!;:,])\s+((?:[123]\s*)?([A-Z][a-z]{1,6})[.,:]?((?:\s+[^\s]{1,8}){0,3}?))(?=\s+(?:[A-Z]|\(|\d)|\s*$)/g
  let m
  while ((m = BROKEN_RE.exec(text))) {
    const start = m.index + m[1].length + (m[0].length - m[1].length - m[2].length)
    const end = start + m[2].length
    if (spans.some((s) => s.start < end && s.end > start)) continue
    let codes = bookCodes(null, m[3])
    const rest = m[4].trim().split(/\s+/).filter(Boolean)
    // Not a book, but a misread word with a number after it ("Pint 17:"): search the whole Bible.
    if (!codes.length && !lex.has(m[3].toLowerCase()) && rest.some((t) => /\d/.test(t))) codes = Object.keys(bible.kjv)
    if (!codes.length) continue
    if (!rest.every((t) => isJunkToken(t, lex) || /\d|^[ivxlc]+\.?$/i.test(t))) continue
    // Take in the junk after the book name: "Job Bite ©" where "Bite ©" is the misread "xi. 7.".
    let stop = end
    const after = text.slice(end).split(/(?=\s)/)
    for (let k = 0; k < Math.min(3, after.length); k++) {
      const tok = after[k].trim()
      const next = after[k + 1]?.trim()
      if (isJunkToken(tok, lex) || /\d/.test(tok) || (next !== undefined && k < 2 && (isJunkToken(next, lex) || /\d/.test(next)))) stop += after[k].length
      else if (k === 0 && next === undefined && /^[A-Z]/.test(tok)) stop += after[k].length
      else break
    }
    broken.push({ start, end: stop, codes, broken: true })
  }
  spans = [...spans, ...broken].sort((a, b) => a.start - b.start)

  // Group references that stand together ("Psa. v. 3; cxxx. 6; lix. 16.").
  const groups = []
  for (const s of spans) {
    const g = groups[groups.length - 1]
    const gap = g ? text.slice(g[g.length - 1].end, s.start) : null
    if (g && /^[\s.,;:]*(and\s*)?$/.test(gap)) g.push(s)
    else groups.push([s])
  }

  const segs = []
  const refs = []
  let pos = 0
  let prevClause = ''
  let lastCode = null
  for (const g of groups) {
    const own = text.slice(pos, g[0].start)
    segs.push(own)
    // A clause of a word or two belongs with the clause before it.
    const clause = (own.match(/[A-Za-z]{3,}/g) ?? []).length < 4 ? prevClause + ' ' + own : own
    prevClause = clause
    g.forEach((s, i) => {
      if (s.bare) {
        if (!lastCode) return issues.push(`unresolved "${text.slice(s.start, s.end)}" (no book)`)
        s = { ...s, codes: [lastCode] }
      }
      if (i > 0) segs.push(text.slice(g[i - 1].end, s.start))
      let r = null
      let unsure = false
      if (!s.broken) {
        const best = resolveSpan(bible, s, clause)
        if (best && (best.score >= 1.5 || (best.cost === 0 && best.score >= 0.5))) r = best
      }
      if (!r && search) {
        // Search the books that the reference names, with the words of the clause.
        const all = s.codes.length > 5
        const hits = all ? bible.search(lastSentences(clause)) : s.codes.map((code) => bible.search(lastSentences(clause), code)[0])
        for (const hit of hits) {
          if (hit && hit.pairs >= (all ? 3 : 2) && (!r || hit.pairs > r.pairs)) r = { code: hit.code, ch: hit.ch, verses: [[hit.v, hit.v]], pairs: hit.pairs }
        }
        if (r) {
          r = widen(bible, r, clause)
          unsure = r.pairs < 3
        }
      }
      if (!r && !s.broken) {
        // Keep the reading that changes the print least, and mark it.
        const best = resolveSpan(bible, s, clause)
        if (best) {
          r = best
          unsure = true
        }
      }
      if (r) {
        lastCode = r.code
        const id = refId(r)
        refs.push(id)
        segs.push(unsure ? [id, 1] : [id])
        if (unsure) issues.push(`unsure ${id}: "${text.slice(s.start, s.end)}" after "${tail(clause)}"`)
      } else {
        issues.push(`unresolved "${text.slice(s.start, s.end)}" after "${tail(clause)}"`)
      }
    })
    pos = g[g.length - 1].end
  }
  segs.push(text.slice(pos))
  if (whole && !refs.length && search && (text.match(/[A-Za-z]{3,}/g) ?? []).length >= 6) {
    // A paragraph of prayer whose references the OCR lost entirely.
    const hit = bible.search(text)[0]
    if (hit && hit.pairs >= 3) {
      const id = refId(widen(bible, { code: hit.code, ch: hit.ch, verses: [[hit.v, hit.v]] }, text))
      refs.push(id)
      segs[segs.length - 1] = segs[segs.length - 1].replace(/([.?!;:])[^.?!;:]*$/, '$1') + ' '
      segs.push([id, 1])
      issues.push(`added ${id} after "${tail(text)}"`)
    }
  }
  return { segs: tidySegs(segs, lex), refs, issues }
}

/** The last two sentences of a clause, for a search. */
function lastSentences(clause) {
  const parts = clause.split(/(?<=[.?!])\s+/)
  return parts.slice(-2).join(' ')
}
const tail = (s) => s.trim().slice(-50)

/** Adds the next verses to a found verse while they match the clause too. */
function widen(bible, r, clause) {
  let [a, b] = r.verses[0]
  const ok = (v) => {
    const t = bible.verseText(r.code, r.ch, [[v, v]])
    return t && bible.search(clause, r.code).some((h) => h.ch === r.ch && h.v === v && h.pairs >= 2)
  }
  while (b - a < 6 && ok(b + 1)) b++
  while (b - a < 6 && a > 1 && ok(a - 1)) a--
  return { ...r, verses: [[a, b]] }
}

/** Removes junk that the OCR left next to references, and tidies spaces. */
function tidySegs(segs, lex) {
  const out = []
  segs.forEach((s, i) => {
    if (typeof s !== 'string') return out.push(s)
    let t = s.replace(/\s+/g, ' ')
    // After a reference: drop junk tokens up to the next real word.
    if (i > 0 && typeof segs[i - 1] !== 'string') {
      const lead = LEAD.exec(t)[0]
      const toks = t.slice(lead.length).split(' ')
      let k = 0
      while (k < toks.length && toks[k] && isJunkToken(toks[k], lex) && !/^[A-Z]/.test(toks[k])) k++
      t = lead.replace(/\s+/g, ' ') + toks.slice(k).join(' ')
      if (k === toks.length) t = lead.trimEnd()
    }
    if (i === segs.length - 1) t = t.replace(/(\s+[^\sA-Za-z]{1,4})+\s*$/, '').replace(/([.?!:;])\s+[A-Za-z]$/, '$1').trimEnd()
    if (i === 0) t = t.replace(/^[^A-Za-z“‘"'(\[]+/, '')
    out.push(t)
  })
  // Merge strings and drop empty ones.
  const merged = []
  for (const s of out) {
    if (typeof s === 'string' && typeof merged[merged.length - 1] === 'string') merged[merged.length - 1] += s
    else if (s !== '') merged.push(s)
  }
  return merged
}

// ---------------------------------------------------------------- words

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}

/**
 * Replaces a misread word with the nearest word of the verses that the
 * paragraph cites ("ean" → "can", "tilings" → "things"). Returns the new
 * segs and a list of the changes.
 */
export function repairWords(segs, bible, lex) {
  const ids = segs.filter((s) => typeof s !== 'string').map((s) => s[0])
  const vocab = new Set()
  for (const id of ids) {
    const [code, ch, vv] = id.split('.')
    for (const p of (vv ?? '').split(',')) {
      const [a, b] = p.split('-').map(Number)
      const t = bible.verseText(code, +ch, [[a, b ?? a]])
      for (const w of t?.match(/[A-Za-z]+/g) ?? []) vocab.add(w)
    }
  }
  const changes = []
  const fix = (s) =>
    s.replace(/[A-Za-z]+/g, (w) => {
      if (lex.has(w.toLowerCase()) || w.length < 3) return w
      let best = null
      let bd = 3
      for (const v of vocab) {
        if (Math.abs(v.length - w.length) > 2) continue
        const d = lev(w.toLowerCase(), v.toLowerCase())
        if (d < bd || (d === bd && best && v.length === w.length)) {
          bd = d
          best = v
        }
      }
      if (best && bd <= Math.max(1, Math.floor(w.length / 3))) {
        const out = /^[A-Z]/.test(w) ? best[0].toUpperCase() + best.slice(1) : best[0].toLowerCase() + best.slice(1)
        changes.push(`${w} → ${out}`)
        return out
      }
      return w
    })
  return { segs: segs.map((s) => (typeof s === 'string' ? fix(s) : s)), changes }
}

/** The words of a text that are in neither the KJV nor the second scan. */
export function unknownWords(text, lex) {
  return (text.match(/[A-Za-z]+/g) ?? []).filter((w) => !lex.has(w.toLowerCase()))
}

// ---------------------------------------------------------------- structure

const CHAPTER_RE = /^CHAPTER[,.]?\s+([IVXLl1]+)[.,]?\s*/i
const romanUpper = (s) => {
  const t = s.toUpperCase().replace(/L$/, 'I').replace(/1/g, 'I')
  return { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9 }[t] ?? null
}

/** Splits a numbered head into its label and text: "(3.) That he hath" → ["(3.)", "That he hath"]. */
export function headLabel(text) {
  const m = /^([(\[]?)(\d{1,2})[.,]?([)\]]?)\.?\s+/.exec(text)
  if (!m || !HEAD_RE.test(text)) return null
  const paren = !!(m[1] || m[3])
  return { n: +m[2], paren, text: text.slice(m[0].length) }
}

/**
 * Works out the level of each numbered head. The book numbers heads "1.",
 * "(1.)" and again "1." for a third level, and the OCR often loses the
 * brackets. So a number that continues the list at a level goes at that level,
 * and a "1." starts a list one level down.
 */
export function headLevels() {
  const counters = [0, 0, 0, 0]
  let cur = 0
  const set = (L, k) => {
    counters[L] = k
    for (let j = L + 1; j < counters.length; j++) counters[j] = 0
    cur = L
    return L
  }
  return {
    number(k, paren) {
      for (let L = Math.max(cur, 1); L >= (paren ? 2 : 1); L--) if (counters[L] + 1 === k) return set(L, k)
      if (k === 1) return set(Math.min(Math.max(cur + 1, paren ? 2 : 1), 3), k)
      return set(paren ? 2 : 1, k)
    },
    /** A head with no number sits under the numbered head before it. */
    plain: () => Math.min(cur + 1, 4),
  }
}

/** Sentence case for a heading in capitals: "A MORNING PRAYER FOR A FAMILY." */
export function capsTitle(s) {
  const lower = s.toLowerCase().replace(/\s+/g, ' ').trim().replace(/[.,]$/, '')
  const out = lower.replace(/\b(god|lord|lord’s|jesus|christ|christ’s|assembly’s|shorter|catechism|supper|father|day)\b/g, (w) => w[0].toUpperCase() + w.slice(1))
  return out[0].toUpperCase() + out.slice(1)
}

/**
 * Builds the book from the paragraphs. Returns { preface, parts, proofing }.
 */
export function buildBook(paras, bible, lex) {
  const proofing = []
  // The body starts at the first "CHAPTER I." after the contents and preface.
  // The contents end with the title of chapter 9 ("...the foregoing materials"). The preface follows.
  const prefaceStart = paras.findIndex((p) => /foregoing materials/.test(p.text))
  const firstChapter = paras.findIndex((p, i) => i > prefaceStart && CHAPTER_RE.test(p.text) && romanUpper(CHAPTER_RE.exec(p.text)[1]) === 1)
  const preface = paras
    .slice(prefaceStart + 1, firstChapter)
    .map((p) => p.text)
    .filter((t) => t.length > 3 && !isCapsHeading(t))

  const parts = []
  let part = null
  let head = null
  let levels = headLevels()
  const resolve = (p, opts) => {
    const r = resolveParagraph(p.text, bible, lex, opts)
    const w = repairWords(r.segs, bible, lex)
    for (const i of r.issues) proofing.push(`line ${p.line}: ${i}`)
    for (const c of w.changes) proofing.push(`line ${p.line}: word ${c}`)
    const plain = w.segs.filter((s) => typeof s === 'string').join('')
    const unknown = unknownWords(plain, lex)
    if (unknown.length) proofing.push(`line ${p.line}: unknown ${unknown.join(', ')}`)
    return { segs: w.segs, refs: r.refs }
  }
  const newHead = (title, label, level, line) => {
    label = label ?? null
    head = { id: `${part.id}-${part.heads.length + 1}`, label, level, title, line, paras: [] }
    part.heads.push(head)
    return head
  }

  for (let i = firstChapter; i < paras.length; i++) {
    const p = paras[i]
    if (/^THE END/.test(p.text)) break
    const cm = CHAPTER_RE.exec(p.text)
    if (cm) {
      const n = romanUpper(cm[1])
      const meta = PARTS.find((x) => x.n === n)
      if (!meta) throw new Error(`Unknown chapter: ${p.text}`)
      part = { ...meta, title: '', intro: [], heads: [] }
      parts.push(part)
      head = null
      levels = headLevels()
      // The title is the rest of the paragraph, or the next paragraph.
      const rest = p.text.slice(cm[0].length).trim()
      if (rest) part.title = rest
      else part.title = paras[++i].text
      continue
    }
    if (!part) continue

    // Chapters 8 and 9: the heads are headings in capitals.
    if (part.n >= 8) {
      if (isCapsHeading(p.text)) {
        newHead([capsTitle(p.text)], null, 1, p.line)
        continue
      }
      const r = resolve(p, { search: part.n === 8 })
      if (!head) {
        part.intro.push(r.segs)
        continue
      }
      head.paras.push(r.segs)
      continue
    }

    const numbered = headLabel(p.text)
    if (numbered) {
      const t = resolve({ ...p, text: numbered.text })
      const level = levels.number(numbered.n, numbered.paren)
      newHead(t.segs, numbered.n, level, p.line)
      continue
    }
    const r = resolve(p, { whole: !!head })
    if (!r.refs.length) {
      // A paragraph of Henry's own words with no reference.
      if (!head && !part.heads.length) {
        part.intro.push(r.segs)
        continue
      }
      if (p.text.length < 400) {
        newHead(r.segs, null, levels.plain(), p.line)
        continue
      }
    }
    if (!head && !part.intro.length) {
      // Henry opens each chapter with a paragraph of his own, even when it cites Scripture.
      part.intro.push(r.segs)
      continue
    }
    if (!head) {
      // Prayer before the first numbered head: a head with no title ("Opening words" in the app).
      newHead([], null, 1, p.line)
    }
    head.paras.push(r.segs)
  }

  // Drop heads that the OCR left empty.
  for (const pt of parts) {
    pt.heads = pt.heads.filter((h) => h.paras.length || h.title.some((s) => typeof s !== 'string' || s.trim()))
    pt.heads.forEach((h, i) => (h.id = `${pt.id}-${i + 1}`))
  }
  // Each head knows the head above it, for the guided prayer.
  for (const pt of parts) {
    pt.heads.forEach((h, i) => {
      for (let j = i - 1; j >= 0; j--) {
        if (pt.heads[j].level < h.level) {
          h.parent = pt.heads[j].id
          break
        }
      }
    })
  }
  return { preface, parts, proofing }
}

// ---------------------------------------------------------------- main

export function build() {
  const raw = readFileSync(join(ROOT, 'source/methodforprayerw0000henr_djvu.txt'), 'utf8')
  const kjv = loadKjv()
  const bible = makeBible(kjv)
  const lex = loadLexicon(kjv)
  let paras = paragraphs(raw)
  paras = applyCorrections(paras, loadCorrections(readFileSync(join(ROOT, 'source/corrections.txt'), 'utf8')))
  const book = buildBook(paras, bible, lex)
  return { book, kjv }
}

function stats(book) {
  let heads = 0
  let ps = 0
  let refs = 0
  let unsure = 0
  const count = (segs) => {
    for (const s of segs) if (typeof s !== 'string') {
      refs++
      if (s[1]) unsure++
    }
  }
  for (const p of book.parts) {
    heads += p.heads.length
    for (const h of p.heads) {
      count(h.title)
      for (const para of h.paras) {
        ps++
        count(para)
      }
    }
  }
  return { parts: book.parts.length, heads, paragraphs: ps, refs, unsure }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { book } = build()
  const s = stats(book)
  const out = {
    source: SOURCE,
    preface: book.preface,
    parts: book.parts.map(({ n, id, name, pray, title, intro, heads }) => ({
      n,
      id,
      name,
      ...(pray ? { pray } : {}),
      title,
      intro,
      heads: heads.map(({ id: hid, label, level, title: t, parent, paras }) => ({
        id: hid,
        ...(label ? { label } : {}),
        level,
        title: t,
        ...(parent ? { parent } : {}),
        paras,
      })),
    })),
  }
  writeFileSync(join(ROOT, 'data/method.json'), JSON.stringify(out))
  writeFileSync(
    join(ROOT, 'source/proofing.txt'),
    `# Written by scripts/build-data.mjs. Items to check against the scan.\n# ${JSON.stringify(s)}\n` + book.proofing.join('\n') + '\n',
  )
  console.log(s, `${book.proofing.length} proofing items`)
}
