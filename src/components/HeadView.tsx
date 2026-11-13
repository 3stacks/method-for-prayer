import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ancestors, headTitle, plain, type Head } from '../lib/data.ts'
import { usePrefs } from '../lib/prefs.tsx'
import { serif, TEXT_SIZES, useColors } from '../lib/theme.ts'
import { Prayer } from './Prayer.tsx'

/**
 * A head of the book: the heads above it, Henry's heading, and the paragraphs
 * of prayer. With `limit`, it shows that many paragraphs and a button for the rest.
 */
export function HeadView({ head, limit, link }: { head: Head; limit?: number; link?: boolean }) {
  const c = useColors()
  const [prefs] = usePrefs()
  const scale = TEXT_SIZES[prefs.textSize]?.scale ?? 1
  const [all, setAll] = useState(false)
  const above = ancestors(head)
  const shown = all || !limit ? head.paras : head.paras.slice(0, limit)
  const hidden = head.paras.length - shown.length
  return (
    <View style={[st.card, { backgroundColor: c.card, borderColor: c.line }]}>
      {above.length > 0 && (
        <Text style={[st.above, { color: c.muted, fontSize: 13.5 * scale, lineHeight: 19 * scale }]} numberOfLines={3}>
          {above.map((h) => plain(h.title)).join(' › ')}
        </Text>
      )}
      <View style={st.titleRow}>
        {head.label !== undefined && (
          <Text style={[st.label, { color: c.gold, fontSize: 17 * scale, lineHeight: 24 * scale }]}>{head.label}.</Text>
        )}
        {link ? (
          <Link href={{ pathname: '/head/[id]', params: { id: head.id } }} style={[st.title, st.flex, { color: c.ink, fontSize: 17 * scale, lineHeight: 24 * scale }]}>
            {headTitle(head)}
          </Link>
        ) : head.title.length ? (
          <View style={st.flex}>
            <Prayer segs={head.title} size={17} style={{ fontFamily: serif.semibold, marginBottom: 0 }} />
          </View>
        ) : (
          <Text style={[st.title, st.flex, { color: c.ink, fontSize: 17 * scale }]}>Opening words</Text>
        )}
      </View>
      <View style={[st.rule, { backgroundColor: c.line }]} />
      {shown.map((p, i) => (
        <Prayer key={i} segs={p} />
      ))}
      {hidden > 0 && (
        <Pressable onPress={() => setAll(true)} accessibilityRole="button" hitSlop={8} style={st.morePress}>
          <Text style={[st.more, { color: c.accent }]}>
            More: {hidden} {hidden === 1 ? 'paragraph' : 'paragraphs'}
          </Text>
        </Pressable>
      )}
    </View>
  )
}

const st = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 16, marginBottom: 16 },
  above: { marginBottom: 6 },
  titleRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  label: { fontFamily: serif.semibold },
  title: { fontFamily: serif.semibold },
  flex: { flex: 1 },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  morePress: { alignSelf: 'flex-start' },
  more: { fontSize: 15, fontWeight: '600', paddingVertical: 4 },
})
