import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { chapterVerses, cites, parseRef, refLabel } from '../lib/data.ts'
import { brownsNotes, memoriseInHearers } from '../lib/links.ts'
import { open } from '../lib/open.ts'
import { usePrefs } from '../lib/prefs.tsx'
import { serif, TEXT_SIZES, useColors } from '../lib/theme.ts'
import { Sheet, SheetButton } from './Sheet.tsx'

const RefContext = createContext<(id: string) => void>(() => {})

/** Use the function that opens the KJV text of a reference id, such as "Ps.118.27". */
export const useRefSheet = () => useContext(RefContext)

/** The verses around the cited verses that the sheet shows first. */
const CONTEXT = 2

export function RefSheetProvider({ children }: { children: ReactNode }) {
  const c = useColors()
  const [prefs] = usePrefs()
  const scale = TEXT_SIZES[prefs.textSize]?.scale ?? 1
  const [id, setId] = useState<string | null>(null)
  const [whole, setWhole] = useState(false)
  const ref = useMemo(() => (id ? parseRef(id) : undefined), [id])
  const verses = useMemo(() => (ref ? chapterVerses(ref.book.code, ref.chapter) : []), [ref])
  const show = useCallback((next: string) => {
    setWhole(false)
    setId(next)
  }, [])
  const close = () => setId(null)

  // The cited verses, with two verses before and after them.
  const first = ref?.ranges ? Math.min(...ref.ranges.map(([a]) => a)) : 1
  const last = ref?.ranges ? Math.max(...ref.ranges.map(([, b]) => b)) : verses.length
  const from = whole ? 1 : Math.max(1, first - CONTEXT)
  const to = whole ? verses.length : Math.min(verses.length, last + CONTEXT)
  const shown = verses.slice(from - 1, to).map((t, i) => [from + i, t] as const)

  return (
    <RefContext.Provider value={show}>
      {children}
      <Sheet
        visible={!!ref}
        title={ref ? `${refLabel(ref)} · KJV` : ''}
        onClose={close}
        actions={
          ref && (
            <>
              <SheetButton primary label="Memorise in Hearers" onPress={() => open(memoriseInHearers(ref.book.code, ref.chapter, first))} />
              <SheetButton label="Brown’s notes in Haddington Bible" onPress={() => open(brownsNotes(ref.book.name, ref.chapter, first))} />
            </>
          )
        }>
        {shown.map(([v, t]) => {
          const cited = ref ? cites(ref, v) : true
          return (
            <Text
              key={v}
              style={[
                st.verse,
                { color: cited ? c.ink : c.muted, fontSize: 17 * scale, lineHeight: 26 * scale },
                cited && ref?.ranges ? { backgroundColor: c.highlight } : null,
              ]}>
              <Text style={[st.num, { color: c.gold, fontSize: 12 * scale }]}>{v} </Text>
              {t}
            </Text>
          )
        })}
        {!whole && verses.length > shown.length && (
          <Pressable onPress={() => setWhole(true)} accessibilityRole="button" hitSlop={8}>
            <Text style={[st.more, { color: c.accent }]}>Show the whole chapter</Text>
          </Pressable>
        )}
      </Sheet>
    </RefContext.Provider>
  )
}

const st = StyleSheet.create({
  verse: { fontFamily: serif.regular, marginBottom: 8, paddingHorizontal: 4, borderRadius: 4 },
  num: { fontFamily: undefined, fontWeight: '600' },
  more: { fontSize: 15, paddingVertical: 8 },
})
