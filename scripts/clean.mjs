// Turns the OCR text of the scanned book into paragraphs.
//
// The OCR text has one printed line per line. A blank line separates paragraphs.
// Each page adds a running head ("16 ADORATION OF GOD,"), sometimes a page
// number in brackets ("(15 )"), and some noise from the page edge. This module
// removes those lines, joins the paragraphs that run across a page, and joins
// the words that a line break splits ("pro- / fessions").

/** The running heads of the book, without spaces. */
export const RUNNING_HEADS = [
  'ADORATIONOFGOD', 'ANDADDRESSTOHIM', 'CONFESSIONOFSIN', 'PETITIONSANDREQUESTS',
  'THANKSGIVINGSFORMERCY', 'INTERCESSIONFOROTHERS', 'OCCASIONALADDRESSES',
  'THECONCLUSIONOFPRAYER', 'APARAPHRASEON', 'THELORDSPRAYER', 'SHORTFORMSOFPRAYER', 'TOTHEREADER',
]

function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}

/**
 * A running head: a page number and a title in capitals, in either order,
 * often with noise ("16 ADORATION OF GOD,", "bil 96: PETITIONS AND REQUESTS.").
 */
export function isRunningHead(line) {
  const t = line.trim()
  if (!t) return false
  // "(15 )", "( 171 )": a page number in brackets.
  if (/^[(\[{]\s*[\dIlSO]{1,3}\s*[)\]}]\W*$/.test(t)) return true
  const letters = t.replace(/[^A-Za-z]/g, '')
  const upper = letters.replace(/[^A-Z]/g, '').length
  if (letters.length < 8 || upper / letters.length < 0.75) return false
  const L = letters.toUpperCase()
  for (const T of RUNNING_HEADS) {
    for (let pre = 0; pre <= 5 && pre < L.length; pre++) {
      const body = L.slice(pre, pre + T.length)
      if (L.length - pre - T.length > 6) continue
      if (lev(body, T) <= Math.min(2, Math.floor(T.length / 6))) return true
    }
  }
  return false
}

/** A heading in capitals inside the text ("A MORNING PRAYER FOR A FAMILY."). */
export function isCapsHeading(line) {
  const t = line.trim()
  if (t.length < 6) return false
  const letters = t.replace(/[^A-Za-z]/g, '')
  if (letters.length < 5) return false
  const upper = letters.replace(/[^A-Z]/g, '').length
  return upper / letters.length > 0.9 && (!/\d/.test(t) || letters.length > 30)
}

/** Noise from the page edge: very short lines that are not words of the text. */
export function isNoise(line) {
  const t = line.trim()
  if (!t) return false
  if (t.length <= 2) return !/^\d+\.?$/.test(t)
  const letters = t.replace(/[^A-Za-z]/g, '').length
  if (letters === 0) return !/\d/.test(t)
  // Symbols and stray capitals ("<3", "BS v", "% we") with few letters.
  return t.length <= 6 && letters / t.length < 0.6
}

/**
 * Splits the OCR text into paragraphs. Each paragraph is { text, line }, where
 * line is the first line number (from 1) in the OCR file.
 */
export function paragraphs(raw) {
  const lines = raw.replace(/\r/g, '').split('\n')
  const blocks = []
  let cur = null
  let pageBreak = false
  const flush = () => {
    if (cur && cur.lines.length) blocks.push(cur)
    cur = null
  }
  lines.forEach((l, i) => {
    const line = l.replace(/\s+$/, '')
    if (!line.trim()) return flush()
    if (isRunningHead(line)) {
      // A new page. Noise at the foot of the last page goes.
      flush()
      while (blocks.length && blocks[blocks.length - 1].lines.join(' ').length < 12 &&
        !/\d/.test(blocks[blocks.length - 1].lines.join(' ')) && !blocks[blocks.length - 1].pageBreak) {
        blocks.pop()
      }
      const last = blocks[blocks.length - 1]
      if (last && last.lines.length > 1) {
        const tail = last.lines[last.lines.length - 1]
        if (tail.length <= 5 && !/^\d/.test(tail) && !/[.?!;:,]$/.test(tail)) last.lines.pop()
      }
      pageBreak = true
      return
    }
    if (isNoise(line)) return
    if (!cur) {
      cur = { lines: [], line: i + 1, pageBreak }
      pageBreak = false
    }
    cur.lines.push(line.trim())
  })
  flush()

  // Join a paragraph that a page break splits. The first part does not end a
  // sentence, or the next part starts with a small letter. Inside a page, a
  // blank line always ends a paragraph.
  const out = []
  for (const b of blocks) {
    const text = joinLines(b.lines)
    const prev = out[out.length - 1]
    if (prev && continues(prev.text, text, b.pageBreak)) {
      prev.text = joinLines([prev.text, text])
    } else {
      out.push({ text, line: b.line })
    }
  }
  return out
}

/** A numbered head starts a paragraph: "1. We must", "(3.) That we may". */
export const HEAD_RE = /^(?:\(\d{1,2}\.?\)|\[\d{1,2}\.?\]|\d{1,2}\.)\.?\s+[A-Z][a-z]/

function continues(prev, next, pageBreak) {
  if (isCapsHeading(prev) || isCapsHeading(next)) return false
  if (/^CHAPTER/i.test(next) || /^CHAPTER/i.test(prev)) return false
  if (HEAD_RE.test(next)) return false
  // A paragraph never starts with a small letter or with the verses of a reference.
  if (/^[a-z]/.test(next)) return true
  if (/^\d{1,3}[.,;:]?(\s|$)/.test(next)) return true
  // The chapter and verses of a reference that the line break split: "Heb. / xiii. 20."
  if (/^[-–—.\s]*[ivxlc]{1,7}\.\s*\d/.test(next)) return true
  if (!pageBreak) return false
  // A word split across the page break.
  if (/[a-z]-$/.test(prev)) return true
  return !/[.?!:;)"”’]\s*\d*$/.test(prev) && !/\d$/.test(prev)
}

/** Joins printed lines into one string, and joins words split by a hyphen at a line end. */
export function joinLines(lines) {
  let s = ''
  for (const raw of lines) {
    const l = raw.trim()
    if (!s) {
      s = l
      continue
    }
    const m = /([A-Za-z]+)[-¬]$/.exec(s)
    if (m && /^[a-z]/.test(l)) {
      // "pro-" + "fessions" → "professions". Keep the hyphen of a compound
      // that this edition prints with one ("day-spring", "handy-work").
      const next = /^[a-z]+/.exec(l)[0]
      s = KEEP_HYPHEN.has(`${m[1].toLowerCase()}-${next}`) ? s + l : s.slice(0, -1) + l
    } else {
      s += ' ' + l
    }
  }
  return s.replace(/\s+/g, ' ').trim()
}

/** Compounds that the book prints with a hyphen, so the hyphen at a line end stays. */
export const KEEP_HYPHEN = new Set([
  'day-spring', 'handy-work', 'self-existent', 'self-sufficient', 'well-grounded', 'first-born',
  'first-fruits', 'free-will', 'heart-searching', 'loving-kindness', 'loving-kindnesses',
  'long-suffering', 'mercy-seat', 'self-denial', 'fellow-creatures', 'fellow-servants',
  'right-hand', 'to-day', 'to-morrow', 'yester-day', 'evil-doers', 'well-doing', 'ill-will',
  'god-head', 'heaven-born', 'high-priest', 'fellow-citizens', 'free-grace',
])
