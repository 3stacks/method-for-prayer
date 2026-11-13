import { StyleSheet, Text } from 'react-native'
import { P, Page } from '../components/Prose.tsx'
import { Row } from '../components/Row.tsx'
import { headTitle, partById } from '../lib/data.ts'
import { useColors } from '../lib/theme.ts'

export default function Occasions() {
  const c = useColors()
  const occasions = partById('occasions')
  const forms = partById('forms')
  return (
    <Page>
      <P muted>
        Henry gives words for prayer at particular times. Chapter 6 gives them for occasions in the home and in the church.
        Chapter 9 gives whole prayers for families, for children and for the Lord’s Supper.
      </P>
      <Text style={[st.h, { color: c.muted }]}>Times and occasions</Text>
      {occasions?.heads
        .filter((h) => h.paras.length || h.level === 1)
        .map((h) => (
          <Row
            key={h.id}
            href={{ pathname: '/head/[id]', params: { id: h.id } }}
            indent={Math.max(0, h.level - 1)}
            number={h.label}
            title={headTitle(h)}
          />
        ))}
      <Text style={[st.h, { color: c.muted }]}>Forms of prayer</Text>
      {forms?.heads.map((h) => (
        <Row key={h.id} href={{ pathname: '/head/[id]', params: { id: h.id } }} title={headTitle(h)} />
      ))}
      <Text style={[st.h, { color: c.muted }]}>The Lord’s Prayer</Text>
      <Row href={{ pathname: '/book/[part]', params: { part: 'lords-prayer' } }} title="A paraphrase on the Lord’s Prayer" hint="Each petition, in the words of Scripture." />
    </Page>
  )
}

const st = StyleSheet.create({
  h: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 20, marginBottom: 4 },
})
