import { Stack, useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text } from 'react-native'
import { Prayer } from '../../components/Prayer.tsx'
import { P, Page } from '../../components/Prose.tsx'
import { Row } from '../../components/Row.tsx'
import { headTitle, partById } from '../../lib/data.ts'
import { serif, useColors } from '../../lib/theme.ts'

export default function PartScreen() {
  const c = useColors()
  const { part: id } = useLocalSearchParams<{ part: string }>()
  const part = partById(id)
  if (!part) {
    return (
      <Page>
        <Stack.Screen options={{ title: 'Not found' }} />
        <P>The book has no part with this name.</P>
      </Page>
    )
  }
  return (
    <Page>
      <Stack.Screen options={{ title: part.name }} />
      <Text style={[st.chapter, { color: c.gold }]}>Chapter {part.n}</Text>
      <Text style={[st.title, { color: c.ink }]} accessibilityRole="header">
        {part.title}
      </Text>
      {part.intro.map((p, i) => (
        <Prayer key={i} segs={p} size={17} />
      ))}
      <Text style={[st.h, { color: c.muted }]}>The heads</Text>
      {part.heads.map((h) => (
        <Row
          key={h.id}
          href={{ pathname: '/head/[id]', params: { id: h.id } }}
          indent={Math.max(0, h.level - 1)}
          number={h.label}
          title={headTitle(h)}
          hint={h.paras.length ? `${h.paras.length} ${h.paras.length === 1 ? 'paragraph' : 'paragraphs'}` : undefined}
        />
      ))}
    </Page>
  )
}

const st = StyleSheet.create({
  chapter: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 },
  title: { fontFamily: serif.semibold, fontSize: 21, lineHeight: 28, marginTop: 4, marginBottom: 12 },
  h: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 16, marginBottom: 4 },
})
