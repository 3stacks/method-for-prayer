import { Link, type Href } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useColors } from '../lib/theme.ts'

/** A row of a list that opens a screen. */
export function Row({ href, title, hint, indent = 0, number }: { href: Href; title: string; hint?: string; indent?: number; number?: number | string }) {
  const c = useColors()
  return (
    <Link href={href} asChild>
      <Pressable style={StyleSheet.flatten([st.row, { borderBottomColor: c.line, paddingLeft: 4 + indent * 18 }])}>
        <View style={st.inner}>
        {number !== undefined && <Text style={[st.num, { color: c.gold }]}>{number}</Text>}
        <View style={st.flex}>
          <Text style={[st.title, { color: c.ink }]}>{title}</Text>
          {hint ? <Text style={[st.hint, { color: c.muted }]}>{hint}</Text> : null}
        </View>
        <Text style={[st.chev, { color: c.muted }]}>›</Text>
        </View>
      </Pressable>
    </Link>
  )
}

const st = StyleSheet.create({
  row: { paddingVertical: 12, paddingRight: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  inner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '100%' },
  num: { fontSize: 15, lineHeight: 22, fontWeight: '600', minWidth: 22 },
  flex: { flex: 1 },
  title: { fontSize: 16, lineHeight: 22 },
  hint: { fontSize: 14, lineHeight: 19, marginTop: 2 },
  chev: { fontSize: 22, lineHeight: 22, alignSelf: 'center' },
})
