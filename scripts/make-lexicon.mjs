// Writes source/lexicon.txt: the words of a second, independent scan of the
// book that the KJV does not have. The build uses the KJV and this list to
// find words that the OCR misread. Run it once; the list is in git.
//
// Second scan: Internet Archive "a587258300henruoft", A Method for Prayer,
// Glasgow, D. Mackenzie, 1834 (University of Toronto, not in copyright). A word
// goes in the list when it occurs at least twice in that scan, so a misreading
// of that scan does not go in.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const URL = 'https://archive.org/download/a587258300henruoft/a587258300henruoft_djvu.txt'

const res = await fetch(URL)
if (!res.ok) throw new Error(`Download failed: ${res.status}`)
const text = (await res.text()).replace(/-\s*\n\s*/g, '')
const kjv = new Set()
for (const f of (await import('node:fs')).readdirSync(join(ROOT, 'data/kjv')).filter((x) => x.endsWith('.json'))) {
  for (const ch of JSON.parse(readFileSync(join(ROOT, 'data/kjv', f), 'utf8'))) {
    for (const v of ch) for (const w of v.toLowerCase().match(/[a-z]+/g) ?? []) kjv.add(w)
  }
}
const counts = new Map()
for (const w of text.toLowerCase().replace(/[’']/g, "'").match(/[a-z]+/g) ?? []) {
  counts.set(w, (counts.get(w) ?? 0) + 1)
}
const words = [...counts].filter(([w, n]) => n >= 2 && w.length > 1 && !kjv.has(w)).map(([w]) => w).sort()
writeFileSync(join(ROOT, 'source/lexicon.txt'), words.join('\n') + '\n')
console.log(`Wrote ${words.length} words to source/lexicon.txt`)
