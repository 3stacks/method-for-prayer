import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { HeadView } from '../../components/HeadView.tsx'
import { P, Page } from '../../components/Prose.tsx'
import { Row } from '../../components/Row.tsx'
import { headById, headTitle } from '../../lib/data.ts'
import { useColors } from '../../lib/theme.ts'

export default function HeadScreen() {
  const c = useColors()
  const { id } = useLocalSearchParams<{ id: string }>()
  const found = headById(id)
  if (!found) {
    return (
      <Page>
        <Stack.Screen options={{ title: 'Not found' }} />
        <P>The book has no head with this number.</P>
      </Page>
    )
  }
  const { head, part } = found
  const i = part.heads.indexOf(head)
  const prev = part.heads[i - 1]
  const next = part.heads[i + 1]
  const children = part.heads.filter((h) => h.parent === head.id)
  return (
    <Page>
      <Stack.Screen options={{ title: part.name }} />
      <Link href={{ pathname: '/book/[part]', params: { part: part.id } }} style={[st.crumb, { color: c.accent }]}>
        Chapter {part.n}: {part.name}
      </Link>
      <HeadView head={head} />
      {children.length > 0 && (
        <>
          <Text style={[st.h, { color: c.muted }]}>Under this head</Text>
          {children.map((h) => (
            <Row key={h.id} href={{ pathname: '/head/[id]', params: { id: h.id } }} number={h.label} title={headTitle(h)} />
          ))}
        </>
      )}
      <View style={st.nav}>
        {prev ? (
          <Link href={{ pathname: '/head/[id]', params: { id: prev.id } }} style={[st.navLink, { color: c.accent }]} numberOfLines={2}>
            ‹ {headTitle(prev)}
          </Link>
        ) : (
          <View style={st.flex} />
        )}
        {next ? (
          <Link href={{ pathname: '/head/[id]', params: { id: next.id } }} style={[st.navLink, st.right, { color: c.accent }]} numberOfLines={2}>
            {headTitle(next)} ›
          </Link>
        ) : (
          <View style={st.flex} />
        )}
      </View>
    </Page>
  )
}

const st = StyleSheet.create({
  crumb: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  h: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 8, marginBottom: 4 },
  nav: { flexDirection: 'row', gap: 16, marginTop: 16 },
  navLink: { flex: 1, fontSize: 15, lineHeight: 21 },
  right: { textAlign: 'right' },
  flex: { flex: 1 },
})
