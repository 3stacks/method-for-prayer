// Tests for the parser. Run: node --test scripts/
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { applyCorrections, headLabel, headLevels, loadCorrections, loadKjv, loadLexicon, resolveParagraph } from './build-data.mjs'
import { isCapsHeading, isRunningHead, joinLines, paragraphs } from './clean.mjs'
import { bookCodes, chapterReadings, findRefs, makeBible, parseRefId, refId, verseReadings } from './refs.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const kjv = loadKjv()
const bible = makeBible(kjv)
const lex = loadLexicon(kjv)

test('running heads are found, with OCR noise', () => {
  assert.ok(isRunningHead('16 ADORATION OF GOD,'))
  assert.ok(isRunningHead('AND ADDRESS TO HIM. PATE'))
  assert.ok(isRunningHead('bil 96: PETITIONS AND REQUESTS.'))
  assert.ok(isRunningHead('THANKSGIVINGS FOR MEBOY. 121'))
  assert.ok(isRunningHead('(15 )'))
  assert.ok(!isRunningHead('A MORNING PRAYER FOR A FAMILY.'))
  assert.ok(!isRunningHead('Let us now lift up our hearts,'))
  assert.ok(isCapsHeading('A MORNING PRAYER FOR A FAMILY.'))
})

test('lines join, and a hyphen at a line end joins the word', () => {
  assert.equal(joinLines(['with suitable acknowledgments, pro-', 'fessions, and requests']), 'with suitable acknowledgments, professions, and requests')
  assert.equal(joinLines(['the day-', 'spring']), 'the day-spring')
  assert.equal(joinLines(['the won--', 'drous things']), 'the wondrous things')
})

test('paragraphs join across a page break, and running heads go', () => {
  const raw = 'O thou who art the true God, who\n\n22 ADORATION OF GOD,\n\nis one Lord. Deut. vi. 4.\n\nAnd we may thus distinguish ourselves.\n'
  const ps = paragraphs(raw)
  assert.equal(ps.length, 2)
  assert.equal(ps[0].text, 'O thou who art the true God, who is one Lord. Deut. vi. 4.')
})

test('corrections must match once, and can split a paragraph', () => {
  const cs = loadCorrections('# note\nWeare => We are\nA, 1. B => A,\\n\\n1. B\n')
  const out = applyCorrections([{ text: 'Weare dust. A, 1. B c', line: 1 }], cs)
  assert.deepEqual(out.map((p) => p.text), ['We are dust. A,', '1. B c'])
  assert.throws(() => applyCorrections([{ text: 'none', line: 1 }], cs))
})

test('misread numerals have several readings', () => {
  assert.ok(chapterReadings('exviil').some((r) => r.n === 118))
  assert.ok(chapterReadings('Ixxxix').some((r) => r.n === 89))
  assert.ok(chapterReadings('xxvil').some((r) => r.n === 27))
  assert.ok(chapterReadings('1').some((r) => r.n === 50))
  assert.equal(chapterReadings('cxlv')[0].n, 145)
  assert.ok(verseReadings('8, 4, 18').some((r) => JSON.stringify(r.v) === '[[3,3],[4,4],[13,13]]'))
})

test('book names, with OCR misreadings', () => {
  assert.deepEqual(bookCodes(null, 'Psa'), ['Ps'])
  assert.deepEqual(bookCodes(null, 'Rey'), ['Rev'])
  assert.deepEqual(bookCodes(null, 'Heel'), ['Eccl'])
  assert.deepEqual(bookCodes('2', 'Cor'), ['2Cor'])
  assert.deepEqual(bookCodes(null, 'Then'), [])
})

test('references are found and chained', () => {
  const spans = findRefs('for thou hast been our defence. Psa. v. 3; cxxx. 6; lix. 16.')
  assert.equal(spans.length, 3)
  assert.equal(spans[1].chapter, 'cxxx')
  const one = findRefs('The grace of the Lord be with you. Philem. 25.')
  assert.equal(one[0].codes[0], 'Phlm')
})

test('references resolve against the KJV, and misread ones are mended', () => {
  const r = resolveParagraph('Let us now lift up our hearts, Lam. iii. 41, with our eyes and hands. John xvii. 1.', bible, lex)
  assert.deepEqual(r.refs, ['Lam.3.41', 'John.17.1'])
  // "exviil" is cxviii.
  const r2 = resolveParagraph('bind these sacrifices with cords to the horns of the altar, Psa. exviil. 27, in such thoughts', bible, lex)
  assert.deepEqual(r2.refs, ['Ps.118.27'])
  // "Rey." is Rev.
  const r3 = resolveParagraph('Holy, holy, holy, Lord God almighty, which art, and wast, and art to come. Rey. iv. 8.', bible, lex)
  assert.deepEqual(r3.refs, ['Rev.4.8'])
  // A reference the OCR broke ("Job Bite ©") is found by a search of the book.
  const r4 = resolveParagraph('We cannot by searching find out God, we cannot find out the Almighty unto perfection. Job Bite ©', bible, lex)
  assert.deepEqual(r4.refs, ['Job.11.7'])
  assert.equal(typeof r4.segs[r4.segs.length - 1], 'object')
})

test('reference ids round-trip', () => {
  const id = 'Job.7.3-4,13'
  assert.equal(refId(parseRefId(id)), id)
})

test('head numbers and levels', () => {
  assert.deepEqual(headLabel('(3.) That he hath a perfect knowledge'), { n: 3, paren: true, text: 'That he hath a perfect knowledge' })
  assert.equal(headLabel('18. 4 O God'), null)
  const lv = headLevels()
  assert.equal(lv.number(1, false), 1)
  assert.equal(lv.number(2, false), 1)
  assert.equal(lv.number(1, false), 2) // a new list one level down
  assert.equal(lv.number(2, false), 2) // the OCR lost the brackets of "(2.)"
  assert.equal(lv.number(3, true), 2)
  assert.equal(lv.number(3, false), 1) // continues the first list
  assert.equal(lv.plain(), 2)
})

test('the built data is complete and every reference is in the KJV', () => {
  const book = JSON.parse(readFileSync(join(ROOT, 'data/method.json'), 'utf8'))
  assert.deepEqual(book.parts.map((p) => p.id), ['adoration', 'confession', 'petition', 'thanksgiving', 'intercession', 'occasions', 'conclusion', 'lords-prayer', 'forms'])
  assert.deepEqual(book.parts.filter((p) => p.pray).map((p) => p.pray), [1, 2, 3, 4, 5, 6])
  let refs = 0
  for (const p of book.parts) {
    assert.ok(p.heads.length > 5, p.id)
    for (const h of p.heads) {
      for (const segs of [h.title, ...h.paras]) {
        for (const s of segs) {
          if (typeof s === 'string') continue
          refs++
          const { code, ch, verses } = parseRefId(s[0])
          assert.ok(bible.verseText(code, ch, verses), s[0])
        }
      }
    }
  }
  assert.ok(refs > 2000)
  assert.ok(book.source.licence.includes('Public domain'))
})

/** Each paragraph of the built book as plain text, with "‹REF›" for each reference. */
function allText(book) {
  const out = []
  const flat = (segs) => segs.map((s) => (typeof s === 'string' ? s : '‹REF›')).join('')
  book.preface.forEach((t, i) => out.push({ where: `preface ${i + 1}`, text: t }))
  for (const p of book.parts) {
    out.push({ where: `${p.id} title`, text: p.title })
    p.intro.forEach((segs, i) => out.push({ where: `${p.id} intro ${i + 1}`, text: flat(segs) }))
    for (const h of p.heads) {
      out.push({ where: `${h.id} title`, text: flat(h.title) })
      h.paras.forEach((segs, i) => out.push({ where: `${h.id} para ${i + 1}`, text: flat(segs) }))
    }
  }
  return out
}

/** Words that the book prints twice in a row. */
const DOUBLED_OK = new Set(['that that', 'had had'])

/**
 * The OCR leaves marks that are not in the print. Each check finds one kind.
 * A paragraph that the print really has in that form goes in the list of
 * exceptions of the check, with the reason.
 */
export const ARTEFACT_CHECKS = [
  ['a stray mark', (t) => /[~|¬©®°§¥£¢{}<>\\_*#@^=+%$]/.test(t)],
  ['a space before punctuation', (t) => /\s[,;:.?!]/.test(t)],
  ['punctuation twice', (t) => /[,;:][,;:.]|\.[,;:]|\.\.(?!\.)/.test(t)],
  ['a doubled word', (t) => [...t.matchAll(/\b([A-Za-z]+)\s+\1\b/gi)].some((m) => !DOUBLED_OK.has(m[0].toLowerCase()))],
  ['a digit inside a word', (t) => /[A-Za-z]\d|\d(?!(st|nd|rd|th|dly|ly)\b)[A-Za-z]/.test(t)],
  ['unbalanced brackets', (t) => (t.match(/\(/g) ?? []).length !== (t.match(/\)/g) ?? []).length || (t.match(/\[/g) ?? []).length !== (t.match(/\]/g) ?? []).length],
  ['unbalanced double quotes', (t) => (t.match(/“/g) ?? []).length !== (t.match(/”/g) ?? []).length || (t.match(/"/g) ?? []).length % 2 === 1],
  ['the text of a reference', (t) => /\b[ivxlc]{1,7}\.\s*\d/.test(t) || /\b[A-Z][a-z]{1,5}\.\s+[ivxlc]{1,7}\b/.test(t)],
  ['a word broken by a space or a hyphen', (t) => /\b[a-z]+- [a-z]+/.test(t)],
]

/** Forms that the print really has, checked against the scan. Each is a piece of the paragraph text. */
const ARTEFACT_EXCEPTIONS = {
  'punctuation twice': [
    'lusts;, that walking', // p.79
  ],
}

test('the text has no OCR artefacts', () => {
  const book = JSON.parse(readFileSync(join(ROOT, 'data/method.json'), 'utf8'))
  const found = []
  for (const { where, text } of allText(book)) {
    for (const [name, bad] of ARTEFACT_CHECKS) {
      // The preface is plain text: its references stay as printed.
      if (where.startsWith('preface') && name === 'the text of a reference') continue
      if ((ARTEFACT_EXCEPTIONS[name] ?? []).some((x) => text.includes(x))) continue
      if (bad(text)) found.push(`${where}: ${name}: ${text.slice(0, 160)}`)
    }
  }
  assert.deepEqual(found, [])
})

test('no reference is marked unsure', () => {
  const book = JSON.parse(readFileSync(join(ROOT, 'data/method.json'), 'utf8'))
  const unsure = []
  for (const p of book.parts) for (const h of p.heads) for (const segs of [h.title, ...h.paras]) for (const s of segs) if (typeof s !== 'string' && s[1]) unsure.push(`${h.id} ${s[0]}`)
  assert.deepEqual(unsure, [])
})
