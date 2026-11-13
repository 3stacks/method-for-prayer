import { StyleSheet, Text, type TextStyle } from 'react-native'
import { parseRef, refShort, type Segs } from '../lib/data.ts'
import { usePrefs } from '../lib/prefs.tsx'
import { serif, TEXT_SIZES, useColors } from '../lib/theme.ts'
import { useRefSheet } from './RefSheet.tsx'

/** A paragraph of Henry's text, with each reference as a link that opens the KJV. */
export function Prayer({ segs, size = 18, style, italic }: { segs: Segs; size?: number; style?: TextStyle; italic?: boolean }) {
  const c = useColors()
  const [prefs] = usePrefs()
  const showRef = useRefSheet()
  const scale = TEXT_SIZES[prefs.textSize]?.scale ?? 1
  const fs = size * scale
  return (
    <Text style={[st.p, { color: c.ink, fontSize: fs, lineHeight: fs * 1.5, fontFamily: italic ? serif.italic : serif.regular }, style]}>
      {segs.map((s, i) => {
        if (typeof s === 'string') return s
        const r = parseRef(s[0])
        if (!r) return null
        return (
          <Text
            key={i}
            onPress={() => showRef(s[0])}
            accessibilityRole="link"
            accessibilityLabel={`${refShort(r)}, read the verse`}
            style={[st.ref, { color: c.accent, fontSize: fs * 0.78 }]}>
            {refShort(r)}
          </Text>
        )
      })}
    </Text>
  )
}

const st = StyleSheet.create({
  p: { marginBottom: 12 },
  ref: { fontFamily: undefined, fontWeight: '600' },
})
