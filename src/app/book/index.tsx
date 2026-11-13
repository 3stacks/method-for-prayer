import { StyleSheet, Text } from 'react-native'
import { P, Page } from '../../components/Prose.tsx'
import { Row } from '../../components/Row.tsx'
import { PARTS } from '../../lib/data.ts'
import { useColors } from '../../lib/theme.ts'

export default function Contents() {
  const c = useColors()
  return (
    <Page>
      <P muted>
        A Method for Prayer, with Scripture expressions proper to be used under each head. By Matthew Henry, 1710.
      </P>
      <Row href="/preface" title="To the reader" hint="Henry’s preface." />
      <Text style={[st.h, { color: c.muted }]}>The chapters</Text>
      {PARTS.map((p) => (
        <Row key={p.id} href={{ pathname: '/book/[part]', params: { part: p.id } }} number={p.n} title={p.name} hint={p.title} />
      ))}
    </Page>
  )
}

const st = StyleSheet.create({
  h: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 20, marginBottom: 4 },
})
